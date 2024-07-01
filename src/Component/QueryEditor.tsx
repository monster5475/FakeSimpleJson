import { QueryEditorProps } from '@grafana/data';
import { CodeEditor, InlineFieldRow, InlineLabel, Select } from '@grafana/ui';

import React, { ComponentType } from 'react';
import { DataSource } from '../DataSource';

import AutoSizer from 'react-virtualized-auto-sizer';
import { GenericOptions, GetQueryEditorTargetTypeOptions, GrafanaQuery, QueryEditorTargetType } from '../types';

type IProps = QueryEditorProps<DataSource, GrafanaQuery, GenericOptions>;

interface LastQuery {
  target: string;
  typ: string;
}

export const QueryEditor: ComponentType<IProps> = ({ datasource, onChange, onRunQuery, query }) => {
  const [lastQuery, setLastQuery] = React.useState<LastQuery | null>(null);

  const [target, setTarget] = React.useState<string>(query.target ?? '');
  const [typ, setTyp] = React.useState<string>(query.type ?? QueryEditorTargetType.TimeSerie);

  const typOptions = GetQueryEditorTargetTypeOptions();

  React.useEffect(() => {
    if (target === '') {
      return;
    }

    if (lastQuery !== null && target === lastQuery.target && typ === lastQuery.typ) {
      return;
    }

    setLastQuery({ target, typ });

    onChange({ ...query, target: target, type: typ });

    onRunQuery();
  }, [target, typ]);

  return (
    <>
      <InlineFieldRow>
        <div style={{ width: '15%', marginBottom: '2vh' }}>
          <Select
            defaultValue={QueryEditorTargetType.TimeSerie}
            options={typOptions}
            value={typ}
            onChange={(v) => setTyp(v.value || QueryEditorTargetType.TimeSerie)}
          />
        </div>
      </InlineFieldRow>
      <InlineFieldRow>
        <AutoSizer disableHeight>
          {({ width }) => (
            <div style={{ width: width + 'px' }}>
              <InlineLabel>Target</InlineLabel>
              <CodeEditor
                width="100%"
                height="200px"
                language="text"
                showLineNumbers={true}
                showMiniMap={target.length > 100}
                value={target}
                onBlur={(v) => setTarget(v)}
              />
            </div>
          )}
        </AutoSizer>
      </InlineFieldRow>
    </>
  );
};
