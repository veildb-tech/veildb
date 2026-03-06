import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TextField } from '@mui/material';

export function ColumnFakeDateBetween(props) {
  const { row, onUpdate } = props;

  const parseDate = (value) => (value ? new Date(value) : null);

  const [options, setOptions] = useState(
    row.options ?? {
      date1: '',
      date2: '',
    },
  );

  const updateOptions = (field, date) => {
    const value = date ? date.toISOString().split('T')[0] : '';
    const updated = { ...options, [field]: value };
    setOptions(updated);
    onUpdate('options', updated, row);
  };

  return (
    <div className="flex items-start gap-4 mt-3">
      <DatePicker
        label="From"
        value={parseDate(options.date1)}
        onChange={(date) => updateOptions('date1', date)}
        renderInput={(params) => (
          <TextField
            {...params}
            className="input-0 w-full"
          />
        )}
      />

      <DatePicker
        label="To"
        value={parseDate(options.date2)}
        onChange={(date) => updateOptions('date2', date)}
        renderInput={(params) => (
          <TextField
            {...params}
            className="input-0 w-full"
          />
        )}
      />
    </div>
  );
}

ColumnFakeDateBetween.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  row: PropTypes.object,
  onUpdate: PropTypes.func,
};