import React from 'react';
import PropTypes from 'prop-types';
import {
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Tooltip,
} from '@mui/material';
import { useConfig } from 'src/contexts/config-context';

export function MethodDropdown(props) {
  const {
    row,
    onUpdate,
    rowMethod,
    setRowMethod,
    tableSchema,
  } = props;

  const { ruleFakers: fakers } = useConfig();

  const columnType = (() => {
    const type = tableSchema?.[row.name]?.type;
    if (!type) return null;
    return type.endsWith('[]') ? `_${type.slice(0, -2)}` : type;
  })();

  const fakeAvailable = !columnType || (fakers ?? []).some(
    (f) => f.field_types.includes(columnType)
  );

  const methods = [
    { label: 'Update', value: 'update' },
    { label: 'Fake', value: 'fake', disabled: !fakeAvailable },
  ];

  const updateMethod = (event) => {
    onUpdate('method', event.target.value, row);
    setRowMethod(event.target.value);
  };

  return (
    <FormControl
      variant="standard"
      className="select-0 w-full max-w-[33%]"
    >
      <InputLabel>Method</InputLabel>

      <Select
        label="Method"
        displayEmpty
        value={rowMethod}
        onChange={updateMethod}
      >
        <MenuItem
          value=""
          key="empty_column"
        >
          Select method
        </MenuItem>
        {methods.map((method) => (
            <MenuItem
              value={method.value}
              disabled={method.disabled}

            >
              {method.label}
            </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

MethodDropdown.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  row: PropTypes.object,
  onUpdate: PropTypes.func,
  rowMethod: PropTypes.string,
  setRowMethod: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  tableSchema: PropTypes.object,
};
