import React from 'react'
import {
  SelectChangeEvent,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  MenuList
} from '@mui/material';

import { MonthDaysProps } from '../types'

export default function MonthDays(props: MonthDaysProps) {
  const {
    value,
    setValue,
    weekDays,
    locale,
    readOnly,
  } = props
  const noWeekDays = !weekDays || weekDays.length === 0

  const displayMonthDays =
    !readOnly ||
    (value && value.length > 0) ||
    ((!value || value.length === 0) && (!weekDays || weekDays.length === 0))

  const onChange = (event: SelectChangeEvent<typeof value>) => {
    setValue(event.target.value as number[]);
  }

  return displayMonthDays ? (
    <FormControl
      variant="standard"
      sx={{
        maxWidth: 220
      }}
      className="select-0 w-full"
    >
      <InputLabel id="database-select-label">Day</InputLabel>
      <Select
        label="Minutes"
        multiple
        displayEmpty
        value={value}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 400,
            },
          },
        }}
        renderValue={(selected: number[]) => {
          if (selected.length === 0) {
            return <em>{locale.emptyMonthDays}</em>;
          }

          return selected.join(', ');
        }}
        onChange={onChange}
      >
        {[...Array(31)].map((e: undefined, index: number) => index + 1)
                       .map((option: number) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
      </Select>
    </FormControl>
  ) : null
}
