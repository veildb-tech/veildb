import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { FakePatternPicker } from './fake-pattern-picker';

const TEXT_TYPES = new Set([
  'varchar', 'longtext', 'tinytext', 'string', 'text', 'bpchar',
  '_text', '_varchar', '_bpchar',
]);
const JSON_TYPES = new Set(['json', 'jsonb']);

function isTextOrJsonType(type) {
  return TEXT_TYPES.has(type) || JSON_TYPES.has(type);
}

export function ColumnConfiguration(props) {
  const { row, onUpdate, tableSchema } = props;

  const [value, setValue] = useState(row.value ?? '');
  const [expandOpen, setExpandOpen] = useState(false);
  const [pickerAnchor, setPickerAnchor] = useState(null);
  const [expandPickerAnchor, setExpandPickerAnchor] = useState(null);

  const inputRef = useRef(null);
  const expandInputRef = useRef(null);

  const columnType = tableSchema?.[row.name]?.type;
  const showPatternTools = isTextOrJsonType(columnType);

  const insertPattern = (pattern, ref, currentValue, setCurrentValue) => {
    const input = ref.current;
    if (input) {
      const start = input.selectionStart ?? currentValue.length;
      const end = input.selectionEnd ?? currentValue.length;
      const newValue = currentValue.slice(0, start) + pattern + currentValue.slice(end);
      setCurrentValue(newValue);
      onUpdate('value', newValue, row);
      setTimeout(() => {
        input.focus();
        const pos = start + pattern.length;
        input.setSelectionRange(pos, pos);
      }, 0);
    } else {
      const newValue = currentValue + pattern;
      setCurrentValue(newValue);
      onUpdate('value', newValue, row);
    }
  };

  return (
    <div className="w-full max-w-[33%]">
      <TextField
        inputRef={inputRef}
        className="input-0 w-full"
        helperText={showPatternTools ? 'Supports {faker.name} patterns' : 'Please specify the value'}
        label="Value"
        placeholder={showPatternTools ? 'e.g. His name is {faker.firstName}' : 'Select Value'}
        name="value"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => onUpdate('value', value, row)}
        InputProps={showPatternTools ? {
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Expand editor">
                <IconButton
                  size="small"
                  onClick={() => setExpandOpen(true)}
                  edge="end"
                >
                  <OpenInFullIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
        } : undefined}
      />

      {showPatternTools && (
        <>
          <Button
            size="small"
            onClick={(e) => setPickerAnchor(e.currentTarget)}
            className="!mt-1 !p-0 !min-w-0"
          >
            + Insert faker
          </Button>
          <FakePatternPicker
            anchorEl={pickerAnchor}
            onClose={() => setPickerAnchor(null)}
            onSelect={(pattern) => insertPattern(pattern, inputRef, value, setValue)}
          />
        </>
      )}

      <Dialog
        open={expandOpen}
        onClose={() => setExpandOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Value</DialogTitle>
        <DialogContent>
          <TextField
            inputRef={expandInputRef}
            className="input-0 w-full !mt-2"
            label="Value"
            placeholder={showPatternTools ? 'e.g. His name is {faker.firstName}' : 'Enter value'}
            multiline
            rows={10}
            value={value}
            onChange={(event) => setValue(event.target.value)}
          />
          {showPatternTools && (
            <>
              <Button
                size="small"
                onClick={(e) => setExpandPickerAnchor(e.currentTarget)}
                className="!mt-2 !p-0 !min-w-0"
              >
                + Insert faker
              </Button>
              <FakePatternPicker
                anchorEl={expandPickerAnchor}
                onClose={() => setExpandPickerAnchor(null)}
                onSelect={(pattern) => insertPattern(pattern, expandInputRef, value, setValue)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpandOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              onUpdate('value', value, row);
              setExpandOpen(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

ColumnConfiguration.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  row: PropTypes.object,
  onUpdate: PropTypes.func,
  // eslint-disable-next-line react/forbid-prop-types
  tableSchema: PropTypes.object,
};
