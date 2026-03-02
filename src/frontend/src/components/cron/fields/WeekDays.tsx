import React, { useMemo } from 'react'
import {
  SelectChangeEvent,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';

import { DEFAULT_LOCALE_EN } from '../locale'
import { WeekDaysProps } from '../types'
import { classNames } from '../utils'

export default function WeekDays(props: WeekDaysProps) {
  const {
    value,
    setValue,
    locale,
    className,
    monthDays,
    readOnly,
    period,
  } = props
  const optionsList = locale.weekDays || DEFAULT_LOCALE_EN.weekDays
  const noMonthDays = period === 'week' || !monthDays || monthDays.length === 0

  const internalClassName = useMemo(
    () =>
      classNames({
        'react-js-cron-field': true,
        'react-js-cron-week-days': true,
        'react-js-cron-week-days-placeholder': !noMonthDays,
        [`${className}-field`]: !!className,
        [`${className}-week-days`]: !!className,
      }),
    [className, noMonthDays]
  )

  const displayWeekDays =
    period === 'week' ||
    !readOnly ||
    (value && value.length > 0) ||
    ((!value || value.length === 0) && (!monthDays || monthDays.length === 0))

  const onChange = (event: SelectChangeEvent<typeof value>) => {
    setValue(event.target.value as number[]);
  }

  return displayWeekDays ? (
    <div>
      <FormControl
        variant="standard"
        className="select-0 w-full"
        sx={{
          maxWidth: 250,
          minWidth: 150
        }}
      >
        <InputLabel id="database-select-label">Week Day</InputLabel>
        <Select
          label="Minutes"
          multiple
          displayEmpty
          value={value}
          renderValue={(selected: number[]) => {
            if (!selected || selected.length === 0) {
              return <em>{locale.emptyWeekDays}</em>;
            }

            return selected.map((sel) => locale.altWeekDays[sel]).join(', ');
          }}
          onChange={onChange}
        >
          {optionsList.map((option: string, index: number) => <MenuItem key={index} value={index}>{option}</MenuItem>)}
        </Select>
      </FormControl>
    </div>
  ) : null
}
