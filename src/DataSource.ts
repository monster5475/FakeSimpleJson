import {
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  LegacyMetricFindQueryOptions,
  MetricFindValue,
  toDataFrame,
  VariableOption,
  VariableWithMultiSupport,
} from '@grafana/data';
import { BackendDataSourceResponse, FetchResponse, getTemplateSrv } from '@grafana/runtime';
import { isObject } from 'lodash';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { match, P } from 'ts-pattern';
import { doFetch } from './doFetch';
import {
  GenericOptions,
  GrafanaQuery,
  MetricFindTagKeys,
  MetricFindTagValues,
  QueryRequest,
  VariableQuery,
} from './types';
import { valueFromVariableWithMultiSupport } from './variable/valueFromVariableWithMultiSupport';

export class DataSource extends DataSourceApi<GrafanaQuery, GenericOptions> {
  url: string;
  withCredentials: boolean;
  headers: any;
  constructor(instanceSettings: DataSourceInstanceSettings<GenericOptions>) {
    super(instanceSettings);

    this.url = instanceSettings.url === undefined ? '' : instanceSettings.url;
    this.withCredentials = instanceSettings.withCredentials !== undefined;
    this.headers = { 'Content-Type': 'application/json' };
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

  query(options: QueryRequest): Promise<DataQueryResponse> {
    const request = this.processTargets(options);

    request.targets = request.targets.filter((t) => !t.hide);

    if (request.targets.length === 0) {
      return Promise.resolve({ data: [] });
    }

    // todo: 疑似无用
    options.scopedVars = { ...this.getVariables(), ...options.scopedVars };

    return lastValueFrom(
      doFetch<any[]>(this, {
        url: `${this.url}/query`,
        data: request,
        method: 'POST',
      }).pipe(
        map((response) => {
          response.data = response.data.map(toDataFrame);

          return response;
        })
      )
    );
  }

  annotations = {};

  async testDatasource() {
    const errorMessageBase = 'Data source is not working';

    try {
      const response = await lastValueFrom(
        doFetch(this, {
          url: this.url,
          method: 'GET',
        }).pipe(map((response) => response))
      );

      if (response.status === 200) {
        return { status: 'success', message: 'Data source is working', title: 'Success' };
      }

      return {
        message: `status code ${response.status}` + response.statusText ? response.statusText : errorMessageBase,
        status: 'error',
        title: 'Error',
      };
    } catch (err) {
      if (typeof err === 'string') {
        return {
          status: 'error',
          message: err,
        };
      }

      let error = err as FetchResponse;
      let message = error.statusText ?? errorMessageBase;
      if (error.data?.error?.code !== undefined) {
        message += `: ${error.data.error.code}. ${error.data.error.message}`;
      }

      return { status: 'error', message, title: 'Error', Error: err };
    }
  }

  metricFindQuery(variableQuery: VariableQuery, options?: LegacyMetricFindQueryOptions): Promise<MetricFindValue[]> {
    const interpolated = getTemplateSrv().replace(variableQuery.query, undefined, 'regex');

    const variableQueryData = {
      target: interpolated,
      range: options?.range,
    };

    return lastValueFrom(
      doFetch<BackendDataSourceResponse>(this, {
        url: `${this.url}/search`,
        data: variableQueryData,
        method: 'POST',
      }).pipe(map((response) => this.mapToTextValue(response)))
    );
  }

  mapToTextValue(result: any) {
    return result.data.map((d: any, i: any) => {
      if (d && d.text && d.value) {
        return { text: d.text, value: d.value };
      }

      if (isObject(d)) {
        return { text: d, value: i };
      }
      return { text: d, value: d };
    });
  }

  getTagKeys(options?: any): Promise<MetricFindTagKeys[]> {
    return lastValueFrom(
      doFetch<MetricFindTagKeys[]>(this, {
        url: `${this.url}/tag-keys`,
        method: 'POST',
        data: options,
      }).pipe(map((result) => result.data))
    );
  }

  getTagValues(options: any): Promise<MetricFindTagValues[]> {
    return lastValueFrom(
      doFetch<MetricFindTagValues[]>(this, {
        url: `${this.url}/tag-values`,
        method: 'POST',
        data: options,
      }).pipe(map((result) => result.data))
    );
  }

  processTargets(options: QueryRequest) {
    options.targets = options.targets
      .filter((target) => {
        // remove placeholder targets
        return target.target !== undefined;
      })
      .map((query) => {
        if (typeof query.target === 'string') {
          query.target = getTemplateSrv().replace(query.target.toString(), options.scopedVars, 'regex');
        }
        return query;
      });

    return options;
  }

  getVariables() {
    const variableOptions: Record<VariableWithMultiSupport['id'], VariableOption> = {};

    Object.values(getTemplateSrv().getVariables()).forEach((variable) => {
      if (variable.type === 'adhoc') {
        // These belong to request.filters
        return;
      }

      if (variable.type === 'system') {
        return;
      }

      const value = match(variable)
        .with({ type: P.union('custom', 'query') }, (v) => valueFromVariableWithMultiSupport(v))
        .with({ type: P.union('constant', 'datasource', 'groupby', 'interval', 'textbox') }, (v) => v.current.value)
        .exhaustive();

      if (value === undefined) {
        return;
      }

      variableOptions[variable.id] = {
        selected: false,
        text: variable.current.text,
        value: value,
      };
    });

    return variableOptions;
  }
}
