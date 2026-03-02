import React from 'react';
import PropTypes from 'prop-types';
import { Button, Typography, Alert } from '@mui/material';
import { RuleConditions } from 'src/components/rule/conditions';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useRules, useRulesDispatch } from 'src/contexts/rule/rule-context';
import { RuleMethod } from './method';
import { UpdateColumn } from './update-column';

function getTablesReferencingTable(fullSchema, tableName) {
  if (!fullSchema) return [];
  return Object.keys(fullSchema).filter((table) => {
    if (table === tableName) return false;
    const columns = fullSchema[table];
    return Object.values(columns).some(
      (col) => col?.foreign_key?.foreign_table === tableName
    );
  });
}

export function TableConfiguration(props) {
  const { tableSchema, selectedTable, fullSchema } = props;

  const rules = useRules();
  const ruleForTable = rules.find((rule) => rule.table === selectedTable) ?? {};
  const dispatch = useRulesDispatch();
  const method = ruleForTable.method ?? '';
  const isReady = !!rules && !!rules.length && rules.find((rule) => rule.table === selectedTable)?.status === 'ready';

  const updateConditions = (conditions) => {
    if (conditions.length) {
      dispatch({
        type: 'updateConditions',
        conditions,
        table: selectedTable,
      });
    }
  };

  const updateConditionOperator = (conditionOperator, table, column) => {
    dispatch({
      type: 'updateConditionOperator',
      conditionOperator,
      table,
      column
    });
  };

  return (
    <div className="flex flex-col w-full py-8 pr-8">
      <div className="self-start gap-4 !mb-6 flex items-center justify-between w-full">
        <Button
          className={`button-6  ${isReady ? 'pointer-events-none' : ''}`}
          onClick={() =>
            dispatch({
              type: 'updateStatus',
              status: 'ready',
              table: selectedTable,
            })}
        >
          <span className="min-w-max">
            {isReady ? 'Ready' : 'Set ready'}
          </span>

          {isReady && <CheckRoundedIcon sx={{ fontSize: 20 }} />}
        </Button>
        <div className="flex flex-col">
          <Typography variant="caption" sx={{ textAlign: 'right' }}>Selected table:</Typography>
          <Typography variant="overline">{selectedTable}</Typography>
        </div>
      </div>

      <div className="card mb-8">
        <div className="card-content">
          <Typography
            className="!mb-6"
            variant="h5"
          >
            Select method
          </Typography>

          <RuleMethod
            key={`${selectedTable}_method`}
            selectedTable={selectedTable}
          />
        </div>
      </div>

      {(method === 'custom') && (
        <UpdateColumn
          method={method}
          key={selectedTable}
          tableSchema={tableSchema}
          selectedTable={selectedTable}
        />
      )}

      {method === 'truncate' && (() => {
        const affectedTables = getTablesReferencingTable(fullSchema, selectedTable);
        return affectedTables.length > 0 ? (
          <Alert severity="warning" className="!mb-4">
            Truncating
            {' '}
            <strong>{selectedTable}</strong>
            {' '}
            will also affect the following tables that reference it via foreign key:
            {' '}
            <strong>{affectedTables.join(', ')}</strong>
          </Alert>
        ) : null;
      })()}

      {method === 'truncate' && (
        <RuleConditions
          onConditionUpdate={updateConditions}
          conditionOperator={ruleForTable.conditionOperator}
          key={`${selectedTable}_conditions`}
          onConditionOperatorUpdate={updateConditionOperator}
          initial={ruleForTable && ruleForTable.conditions ? ruleForTable.conditions : []}
          columns={Object.keys(tableSchema)}
          selectedTable={selectedTable}
        />
      )}
    </div>
  );
}

TableConfiguration.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  tableSchema: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  fullSchema: PropTypes.object,
  selectedTable: PropTypes.string,
  // eslint-disable-next-line react/no-unused-prop-types
  onSave: PropTypes.func,
};
