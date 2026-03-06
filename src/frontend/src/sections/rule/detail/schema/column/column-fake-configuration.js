import React from 'react';
import PropTypes from 'prop-types';
import {
  MenuItem,
  FormControl,
  Select,
  InputLabel,
} from '@mui/material';
import { useConfig } from 'src/contexts/config-context';
import { ColumnFakeRowProcessor } from './column-fake-row-processor';

export function ColumnFakeConfiguration(props) {
  const {
    row,
    onUpdate,
    tableSchema
  } = props;

  const { ruleFakers: patterns } = useConfig();

  // Normalize SQL array notation (text[]) to PostgreSQL internal notation (_text)
  const normalizeType = (type) => {
    if (type && type.endsWith('[]')) return `_${type.slice(0, -2)}`;
    return type;
  };

  const getPatterns = () => {
    if (row.name) {
      const type = normalizeType(tableSchema[row.name]?.type);
      if (!type) {
        return patterns;
      }

      return patterns.filter((pattern) => pattern.field_types.includes(type));
    }
    return patterns;
  };

  return (
    <div className="w-full max-w-[33%]">
      <FormControl
        variant="standard"
        className="select-0 w-full"
      >
        <InputLabel>Pattern</InputLabel>

        <Select
          displayEmpty
          label="Pattern"
          value={row.value ?? ''}
          onChange={(event) => onUpdate('value', event.target.value, row)}
        >
          <MenuItem
            value=""
          >
            Select pattern
          </MenuItem>

          {getPatterns().map((pattern) => (
            <MenuItem
              value={pattern.value}
              key={pattern.value}
            >
              {pattern.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ColumnFakeRowProcessor
        key={`${row.name + row.value}_processor`}
        row={row}
        onUpdate={onUpdate}
      />
    </div>
  );
}

ColumnFakeConfiguration.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  row: PropTypes.object,
  onUpdate: PropTypes.func,
};
