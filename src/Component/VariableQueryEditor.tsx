import { InlineField, InlineFieldRow, TextArea } from '@grafana/ui';
import React, { useState } from 'react';
import { VariableQuery } from '../types';

interface Props {
  query: VariableQuery;
  onChange: (query: VariableQuery, definition: string) => void;
}

export const VariableQueryEditor: React.FC<Props> = ({ onChange, query }) => {
  const [variableQuery, setVariableQuery] = useState(query);
  const saveQuery = () => {
    onChange(variableQuery, `${variableQuery.query}`);
  };

  const handleChange = (event: React.FormEvent<HTMLTextAreaElement>) =>
    setVariableQuery({
      ...variableQuery,
      query: event.currentTarget.value,
    });

  return (
    <>
      <InlineFieldRow>
        <InlineField label="Query" grow>
          <TextArea name="query" onBlur={saveQuery} onChange={handleChange} value={variableQuery.query} />
        </InlineField>
      </InlineFieldRow>
    </>
  );
};
