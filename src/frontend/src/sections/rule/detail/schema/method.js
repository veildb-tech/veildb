import React from 'react';
import PropTypes from 'prop-types';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { useRulesDispatch, useRules } from 'src/contexts/rule/rule-context';

const methods = [
  {
    label: 'Truncate',
    value: 'truncate',
  },
  {
    label: 'Anonymize/Mask Data',
    value: 'custom',
  },
];

export function RuleMethod(props) {
  const { selectedTable } = props;

  const dispatch = useRulesDispatch();
  const rules = useRules();
  const rule = rules.find((_rule) => _rule.table === selectedTable) ?? {};

  return (
    <FormControl
      variant="standard"
      className="select-0 w-full"
    >
      <InputLabel id="table-method-label">Method</InputLabel>

      <Select
        labelId="table-method-label"
        label="Method"
        value={rule.method ? rule.method : ''}
        displayEmpty
        onChange={(event) =>
          dispatch({
            type: 'setMethod',
            method: event.target.value,
            table: selectedTable,
          })}
      >
        <MenuItem
          value=""
        >
          Select method
        </MenuItem>

        {methods.map((method) => (
          <MenuItem
            value={method.value}
            key={method.value}
          >
            {method.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

RuleMethod.propTypes = {
  selectedTable: PropTypes.string,
};
