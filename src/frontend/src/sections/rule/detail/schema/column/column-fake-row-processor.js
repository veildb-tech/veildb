import React from 'react';
import PropTypes from 'prop-types';
import { ColumnFakeRandomNumber } from './fake-processors/random-number';
import { ColumnFakeDateBetween } from './fake-processors/date-between';

export function ColumnFakeRowProcessor(props) {
  const { row, onUpdate } = props;

  if (row.value === 'numberBetween') {
    return (
      <ColumnFakeRandomNumber
        key={`${row.name + row.value}_processor`}
        row={row}
        onUpdate={onUpdate}
      />
    );
  }

  if (row.value === 'dateTimeBetween') {
    return (
      <ColumnFakeDateBetween
        key={`${row.name + row.value}_processor`}
        row={row}
        onUpdate={onUpdate}
      />
    );
  }

  return null;
}

ColumnFakeRowProcessor.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  row: PropTypes.object,
  onUpdate: PropTypes.func,
};
