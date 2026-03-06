import React, { useMemo, useState } from 'react';
import { Button, Typography } from '@mui/material';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import { RuleConditions } from 'src/components/rule/conditions';
import { ColumnConfiguration } from './column/column-configuration';
import { ColumnFakeConfiguration } from './column/column-fake-configuration';
import { ColumnDropdown } from './column/column-dropdown';
import { MethodDropdown } from './column/method-dropdown';

function ConfigurationComponent({ rowMethod, row, ...rest }) {
  if (!rowMethod || !row.name) {
    return (
      <div className="w-full">
        <Typography className="font-medium p-4" variant="caption">Select name and method</Typography>
      </div>
    );
  }

  return rowMethod === 'fake' ? (
    <ColumnFakeConfiguration row={row} {...rest} />
  ) : (
    <ColumnConfiguration row={row} {...rest} />
  );
}

function Row(props) {
  const {
    tableSchema,
    row,
    updateRow,
    deleteRow,
    selectedTable
  } = props;

  const [rowMethod, setRowMethod] = useState(row.method ?? '');

  return useMemo(() => (
    <div
      key={`${row.index}_value`}
      className="card !p-0"
    >
      <div className="flex gap-3 justify-between items-center bg-dbm-color-primary-light px-4 py-2 rounded-t-lg">
        <Typography className="!text-dbm-color-white" variant="h5">Rule</Typography>

        <Button
          onClick={() => deleteRow(row)}
          className="!p-0 !min-w-max"
        >
          <DeleteOutlinedIcon className="text-dbm-color-white" sx={{ fontSize: 25 }} />
        </Button>
      </div>

      <div className="p-4">
        <div className="flex flex-col">
          <div className="flex items-start gap-6">
            <ColumnDropdown
              row={row}
              tableSchema={tableSchema}
              onUpdate={updateRow}
            />
            <MethodDropdown
              row={row}
              onUpdate={updateRow}
              rowMethod={rowMethod}
              setRowMethod={setRowMethod}
              tableSchema={tableSchema}
            />
            <ConfigurationComponent
              rowMethod={rowMethod}
              row={row}
              onDelete={deleteRow}
              onUpdate={updateRow}
              tableSchema={tableSchema}
              selectedTable={selectedTable}
            />
          </div>
        </div>
        {row.name && (
          <RuleConditions
            onConditionUpdate={(rules) => updateRow('conditions', rules, row)}
            onConditionOperatorUpdate={(rules) => updateRow('conditionOperator', rules, row)}
            conditionOperator={row.conditionOperator}
            initial={row.conditions ?? []}
            key={`${updateRow.index}_conditions`}
            columns={Object.keys(tableSchema)}
            selectedTable={selectedTable}
            row={row}
          />
        )}
      </div>
    </div>
  ), [row, tableSchema, updateRow, rowMethod, deleteRow, selectedTable]);
}

export default Row;
