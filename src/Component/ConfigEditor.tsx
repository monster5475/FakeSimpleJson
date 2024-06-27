import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { DataSourceHttpSettings } from '@grafana/ui';
import React, { ComponentType } from 'react';
import { GenericOptions } from '../types';

type IProps = DataSourcePluginOptionsEditorProps<GenericOptions>;

export const ConfigEditor: ComponentType<IProps> = ({ options, onOptionsChange }) => (
  <>
    <DataSourceHttpSettings
      defaultUrl={'http://localhost:8080'}
      dataSourceConfig={options}
      showAccessOptions={true}
      onChange={onOptionsChange}
    />
  </>
);
