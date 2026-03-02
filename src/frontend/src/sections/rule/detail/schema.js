import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Divider, CircularProgress, Alert, Typography
} from '@mui/material';
import constants from 'src/sections/rule/step-navigator/constants';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { useStepNavigator } from 'src/hooks/use-step-navigator';
import StepNavigatorItem from 'src/sections/rule/step-navigator/item';
import { SchemaTables } from 'src/sections/rule/detail/schema/tables';
import { TableConfiguration } from 'src/sections/rule/detail/schema/table-configuration';
import Toolbar from 'src/sections/rule/detail/schema/toolbar';
import { RuleTemplate } from './general/template';
import { RuleSuggestion } from './general/suggestion';

export function SchemaSetting(props) {
  const {
    schema,
    loading,
    urlParamName,
    selectedDb,
    database,
    stepNumber,
    steps,
    selectedTemplate,
    setSelectedTemplate,
  } = props;

  const [selectedTable, setSelectedTable] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOptions, setSortOptions] = useState([
    { value: 'alphabet', label: 'alphabet', isSelected: true },
    { value: 'status', label: 'status' },
  ]);
  const {
    isActive,
    isInactive,
    isCompleted,
    stepPlus
  } = useStepNavigator(urlParamName, stepNumber);

  if (!schema) {
    return (
      <Alert severity="warning">
        Something went wrong. Schema is missed. Please analyze database first!
      </Alert>
    );
  }

  const save = () => {};
  const getSelectedSortOption = () => sortOptions.find((sortOption) => sortOption.isSelected);

  return (
    <>
      <div className={`card ${isInactive ? 'hidden' : ''}`}>
        <div className="card-content flex justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Typography
              className="mb-1"
              variant="h5"
            >
              {stepPlus}
              .
              {' '}
              {steps[stepNumber].title}
            </Typography>

            <div className="sub-heading-0 font-medium">There you could configure conditions for database</div>
          </div>
          <div className="ml-10 inline-flex">
            {selectedDb && (
              <RuleTemplate
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
                selectedDb={database}
              />
            )}
          </div>
          {isCompleted && (
            <StepNavigatorItem
              stepNumber={stepNumber}
              urlParamName={urlParamName}
              editLink
            >
              <span>Edit</span>
            </StepNavigatorItem>
          )}
        </div>

        <Divider className={`!my-5 ${isActive ? '' : 'hidden'}`} />

        <div className={`card-content ${isActive ? '' : 'hidden'}`}>
          {loading && <CircularProgress />}

          <Toolbar
            setSearchQuery={setSearchQuery}
            sortOptions={sortOptions}
            setSortOptions={setSortOptions}
            getSelectedSortOption={getSelectedSortOption}
          />

          {!loading && schema && (
          <div className="flex gap-8 border-2 border-dbm-color-17 rounded-lg overflow-hidden">
            <SchemaTables
              schema={schema}
              selectedTable={selectedTable}
              onChangeTable={(event) => setSelectedTable(event.target.value)}
              searchQuery={searchQuery}
              selectedSortOption={getSelectedSortOption().value}
            />

            {selectedTable && (
            <TableConfiguration
              onSave={save}
              selectedTable={selectedTable}
              tableSchema={schema[selectedTable]}
              fullSchema={schema}
            />
            )}
            {!selectedTable && (
              <div className="flex items-center w-full justify-center flex-col">
                <div>
                  <RuleSuggestion
                    selectedDb={database}
                    asAlert
                  />
                </div>
                <div>
                  <Typography variant="caption">Select the table to start configuring rules</Typography>
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {isActive && stepPlus !== steps.length && (
        <StepNavigatorItem
          className="button-8 self-start"
          stepNumber={stepPlus}
          urlParamName={urlParamName}
        >
          <span>
            {`Next to ${constants.stepTitles[stepPlus]}`}
          </span>

          <ArrowForwardRoundedIcon style={{ fontSize: 21 }} />
        </StepNavigatorItem>
      )}
    </>
  );
}

SchemaSetting.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  schema: PropTypes.object,
  loading: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types,react/no-unused-prop-types
  error: PropTypes.object,
};
