import React from 'react'

import { HoursProps } from '../types'
import {
  SelectChangeEvent,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';

export default function Hours(props: HoursProps) {
  const {
    value,
    setValue,
    locale
  } = props

  return (
    <FormControl
      variant="standard"
      sx={{
        maxWidth: 150
      }}
      className="select-0 w-full"
    >
      <InputLabel id="database-select-label">Hour</InputLabel>
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
          if (!selected || selected.length === 0) {
            return <em>{locale.emptyHours}</em>;
          }

          return selected.join(', ');
        }}
        onChange={(event: SelectChangeEvent<typeof value>) => setValue(event.target.value as number[])}
      >
        {[...Array(24)].map((e: undefined, index: number) => index)
                       .map((option: number) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
      </Select>
    </FormControl>
  )
}
