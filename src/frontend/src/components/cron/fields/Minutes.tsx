import React from 'react'

import { MinutesProps } from '../types'
import {
  SelectChangeEvent,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from '@mui/material';

export default function Minutes(props: MinutesProps) {
  const {
    value,
    setValue,
    locale
  } = props

  return (
    <FormControl
      variant="standard"
      className="select-0 w-full"
      sx={{
        maxWidth: 150
      }}
    >
      <InputLabel id="database-select-label">Minute</InputLabel>
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
            return <em>{locale.emptyMinutes}</em>;
          }

          return selected.join(', ');
        }}
        onChange={(event: SelectChangeEvent<typeof value>) => setValue(event.target.value as number[])}
      >
        {[...Array(60)].map((e: undefined, index: number) => index)
                       .map((option: number) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
      </Select>
    </FormControl>
  )
}
