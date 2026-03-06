import React from 'react';
import PropTypes from 'prop-types';
import {
  MenuItem,
  FormControl,
  Select,
  InputLabel
} from '@mui/material';

function getColumnDisabledReason(columnMeta) {
  if (columnMeta?.primary_key) return 'Primary key column';
  if (columnMeta?.foreign_key) return `Foreign key → ${columnMeta.foreign_key.foreign_table}.${columnMeta.foreign_key.foreign_column}`;
  return null;
}

export function ColumnDropdown(props) {
  const {
    row,
    onUpdate,
    tableSchema
  } = props;

  return (
    <div className="flex flex-col max-w-[33%] w-full">
    <FormControl
      variant="standard"
      className="select-0 w-full"
    >
      <InputLabel>Column</InputLabel>

      <Select
        label="Method"
        displayEmpty
        value={row.name ?? ''}
        onChange={(event) => onUpdate('name', event.target.value, row)}
      >
        <MenuItem
          value=""
          key="empty_column"
        >
          Select column
        </MenuItem>
        {/* eslint-disable-next-line array-callback-return */}
        {Object.keys(tableSchema).map((column) => {
          if (column) {
            const disabledReason = getColumnDisabledReason(tableSchema[column]);
            const isDisabled = !!disabledReason;
            return (
              <MenuItem
                value={column}
                key={column}
                disabled={isDisabled}
                title={disabledReason ?? undefined}
              >
                {column}
                {isDisabled && (
                  <span className="ml-2 text-xs text-gray-400">
                    ({disabledReason})
                  </span>
                )}
              </MenuItem>
            );
          }
        })}
      </Select>
    </FormControl>
    {row.name && tableSchema[row.name]?.type && (
      <p className="text-xs text-gray-400 mt-1 ml-2">
        <strong>Type: </strong>
        {tableSchema[row.name].type.startsWith('_')
          ? `${tableSchema[row.name].type.slice(1)}[] (array)`
          : tableSchema[row.name].type}
      </p>
    )}
    </div>
  );
}

ColumnDropdown.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  row: PropTypes.object,
  onUpdate: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  tableSchema: PropTypes.object,
};

