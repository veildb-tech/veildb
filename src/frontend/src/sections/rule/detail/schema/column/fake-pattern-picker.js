import React from 'react';
import PropTypes from 'prop-types';
import {
  Popover,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { useConfig } from 'src/contexts/config-context';

// Fakers that require arguments: maps faker value → placeholder args string
const FAKER_ARGS = {
  numberBetween: '0,100',
  dateTimeBetween: '2020-01-01,2023-12-31',
};

function getPattern(fakerValue) {
  const args = FAKER_ARGS[fakerValue];
  return args ? `{faker.${fakerValue}(${args})}` : `{faker.${fakerValue}}`;
}

export function FakePatternPicker(props) {
  const { anchorEl, onClose, onSelect } = props;
  const { ruleFakers: fakers } = useConfig();

  if (!fakers) return null;

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
    >
      <div className="p-2 max-h-80 overflow-y-auto w-72">
        <Typography
          variant="caption"
          color="text.secondary"
          className="!px-2 !pt-1 !pb-0 block"
        >
          Click a pattern to insert at cursor
        </Typography>
        <List dense disablePadding>
          {fakers.map((faker) => {
            const pattern = getPattern(faker.value);
            return (
              <ListItemButton
                key={faker.value}
                onClick={() => {
                  onSelect(pattern);
                  onClose();
                }}
              >
                <ListItemText
                  primary={faker.label}
                  secondary={<code>{pattern}</code>}
                />
              </ListItemButton>
            );
          })}
        </List>
      </div>
    </Popover>
  );
}

FakePatternPicker.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  anchorEl: PropTypes.object,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
};
