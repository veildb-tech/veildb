import PropTypes from 'prop-types';
import React from 'react';
import Cron from 'src/components/cron';
import cronstrue from 'cronstrue';
import {
  Divider,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormHelperText,
  FormControl
} from '@mui/material';
import { useConfig } from 'src/contexts/config-context';

export function Schedule(props) {
  const {
    schedule,
    setSchedule,
    scheduleType,
    setScheduleType
  } = props;
  const { scheduleTypes } = useConfig();

  return (
    <div>
      <Divider />
      <div className="mt-5">
        <div className="mb-4">
          <Typography
            variant="subtitle1"
          >
            Schedule configuration
          </Typography>
        </div>
        <div className="flex w-full gap-5 mb-10">
          <div>
            <FormControl
              variant="standard"
              className="select-0 w-full"
              sx={{
                minWidth: 250
              }}
            >
              <InputLabel id="template-select-label">Schedule type</InputLabel>
              <Select
                value={scheduleType}
                onChange={(event) => setScheduleType(event.target.value)}
              >
                <MenuItem value={0}>Please select schedule type</MenuItem>
                { scheduleTypes.map((scheduleTypeConfig) =>
                  <MenuItem key={scheduleTypeConfig.value} value={scheduleTypeConfig.value}>{scheduleTypeConfig.label}</MenuItem>)}
              </Select>
            </FormControl>
            <FormHelperText>
              You can select how database will be proceed.
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              If selected "manually" you need to configure webhooks and execute it through webhook.
            </FormHelperText>
          </div>
          <div className="w-full" />
        </div>
        { scheduleType === 2 && (
          <>
            <Cron
              value={schedule}
              setValue={(newValue) => {
                setSchedule(newValue);
              }}
            />
            <div className="ml-2">
              <Typography color="text.secondary" variant="subtitle2">
                { cronstrue.toString(schedule) }
              </Typography>
              <Typography variant="caption">
                (
                {schedule}
                )
              </Typography>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Schedule.propTypes = {
  schedule: PropTypes.string,
  setSchedule: PropTypes.func,
  scheduleType: PropTypes.number,
  setScheduleType: PropTypes.func
};
