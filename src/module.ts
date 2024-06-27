import { DataSourcePlugin } from '@grafana/data';
import { QueryEditor } from 'Component/QueryEditor';
import { ConfigEditor } from './Component/ConfigEditor';
import { VariableQueryEditor } from './Component/VariableQueryEditor';
import { DataSource } from './DataSource';
import { GenericOptions, GrafanaQuery } from './types';

export const plugin = new DataSourcePlugin<DataSource, GrafanaQuery, GenericOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor)
  .setVariableQueryEditor(VariableQueryEditor);
