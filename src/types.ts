import { DataQueryRequest, DataSourceJsonData, MetricFindValue, SelectableValue } from '@grafana/data';
import { DataQuery } from '@grafana/schema';
import _ from 'lodash';

export interface QueryRequest extends DataQueryRequest<GrafanaQuery> {}

export interface GrafanaQuery extends DataQuery {
  alias?: string;
  target?: string;
  type?: string;
}

export interface GenericOptions extends DataSourceJsonData {}

export interface VariableQuery {
  query: string;
}

export interface MetricFindTagKeys extends MetricFindValue {
  key: string;
  type: string;
  text: string;
}

export interface MetricFindTagValues extends MetricFindValue {
  key: string;
  text: string;
}

export const QueryEditorTargetType = {
  TimeSerie: 'timeserie',
  Table: 'table',
};

export const GetQueryEditorTargetTypeOptions = (): Array<SelectableValue<string>> => {
  let options: Array<SelectableValue<string>> = [];
  _.values(QueryEditorTargetType).forEach((val) => {
    options.push({
      label: val,
      value: val,
    });
  });
  return options;
};
