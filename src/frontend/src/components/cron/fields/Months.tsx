import React from 'react'
import {
  SelectChangeEvent,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';

import { DEFAULT_LOCALE_EN } from '../locale'
import { MonthsProps } from '../types'

export default function Months(props: MonthsProps) {
  const {
    value,
    setValue,
    locale,
  } = props
  const optionsList = locale.months || DEFAULT_LOCALE_EN.months

  const onChange = (event: SelectChangeEvent<typeof value>) => {
    setValue(event.target.value as number[]);
  }
  return (
    <FormControl
      variant="standard"
      className="select-0 w-full"
    >
      <InputLabel id="database-select-label">Month</InputLabel>
      <Select
        label="Minutes"
        multiple
        displayEmpty
        sx={{
          maxWidth: 200
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 400,
            },
          },
        }}
        value={value}
        renderValue={(selected: number[]) => {
          if (!selected || selected.length === 0) {
            return <em>{locale.emptyMonths}</em>;
          }

          return selected.map((sel) => locale.altMonths[sel - 1]).join(', ');
        }}
        onChange={onChange}
      >
        { optionsList.map((option: string, index: number) => <MenuItem key={index} value={index + 1}>{option}</MenuItem>)}
      </Select>
    </FormControl>
  )
}
