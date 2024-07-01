import { DataSourcePlugin } from '@grafana/data';
import { QueryEditor } from 'Component/QueryEditor';
import { ConfigEditor } from './Component/ConfigEditor';
import { DataSource } from './DataSource';
import { GenericOptions, GrafanaQuery } from './types';

export const plugin = new DataSourcePlugin<DataSource, GrafanaQuery, GenericOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
