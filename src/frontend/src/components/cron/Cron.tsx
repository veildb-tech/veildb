import {
  SelectChangeEvent,
  Select,
  MenuItem,
  InputLabel,
  FormControl, Button
} from '@mui/material';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { getCronStringFromValues, setValuesFromCronString } from './converter'
import Hours from './fields/Hours'
import Minutes from './fields/Minutes'
import MonthDays from './fields/MonthDays'
import Months from './fields/Months'
import WeekDays from './fields/WeekDays'
import { DEFAULT_LOCALE_EN } from './locale'
import { CronProps, PeriodType } from './types'
import { setError, usePrevious } from './utils'

export default function Cron(props: CronProps) {
  const {
    locale = DEFAULT_LOCALE_EN,
    value = '',
    setValue,
    onError,
    className,
    defaultPeriod = 'day',
    allowEmpty = 'for-default-value',
    clearButtonAction = 'fill-with-every',
    humanizeValue = false,
    readOnly = false,
    shortcuts = [
      '@yearly',
      '@annually',
      '@monthly',
      '@weekly',
      '@daily',
      '@midnight',
      '@hourly',
    ],
    allowedDropdowns = [
      'period',
      'months',
      'month-days',
      'week-days',
      'hours',
      'minutes',
    ],
    allowedPeriods = [
      'year',
      'month',
      'week',
      'day',
      'hour',
      'minute',
      'reboot',
    ],
    allowClear,
    dropdownsConfig,
  } = props
  const internalValueRef = useRef<string>(value)
  const defaultPeriodRef = useRef<PeriodType>(defaultPeriod)
  const [period, setPeriod] = useState<PeriodType | undefined>()
  const [monthDays, setMonthDays] = useState<number[] | undefined>()
  const [months, setMonths] = useState<number[] | undefined>()
  const [weekDays, setWeekDays] = useState<number[] | undefined>([])
  const [hours, setHours] = useState<number[] | undefined>([])
  const [minutes, setMinutes] = useState<number[] | undefined>([])
  const [error, setInternalError] = useState<boolean>(false)
  const [valueCleared, setValueCleared] = useState<boolean>(false)
  const previousValueCleared = usePrevious(valueCleared)
  const localeJSON = JSON.stringify(locale)

  useEffect(
    () => {
      setValuesFromCronString(
        value,
        setInternalError,
        onError,
        allowEmpty,
        internalValueRef,
        true,
        locale,
        shortcuts,
        setMinutes,
        setHours,
        setMonthDays,
        setMonths,
        setWeekDays,
        setPeriod
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(
    () => {
      if (value !== internalValueRef.current) {
        setValuesFromCronString(
          value,
          setInternalError,
          onError,
          allowEmpty,
          internalValueRef,
          false,
          locale,
          shortcuts,
          setMinutes,
          setHours,
          setMonthDays,
          setMonths,
          setWeekDays,
          setPeriod
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, internalValueRef, localeJSON, allowEmpty, shortcuts]
  )

  useEffect(
    () => {
      // Only change the value if a user touched a field
      // and if the user didn't use the clear button
      if (
        (period || minutes || months || monthDays || weekDays || hours) &&
        !valueCleared &&
        !previousValueCleared
      ) {
        const selectedPeriod = period || defaultPeriodRef.current
        const cron = getCronStringFromValues(
          selectedPeriod,
          months,
          monthDays,
          weekDays,
          hours,
          minutes,
          humanizeValue,
          dropdownsConfig
        )

        setValue(cron, { selectedPeriod })
        internalValueRef.current = cron

        onError && onError(undefined)
        setInternalError(false)
      } else if (valueCleared) {
        setValueCleared(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      period,
      monthDays,
      months,
      weekDays,
      hours,
      minutes,
      humanizeValue,
      valueCleared,
      dropdownsConfig,
    ]
  )

  const periodForRender = period || defaultPeriodRef.current

  const handleClear = useCallback(
    () => {
      setMonthDays([])
      setMonths([])
      setWeekDays([])
      setHours([8])
      setMinutes([0])

      // When clearButtonAction is 'empty'
      let newValue = ''

      const newPeriod =
        period !== 'reboot' && period ? period : defaultPeriodRef.current

      setPeriod('day')


      // When clearButtonAction is 'fill-with-every'
      if (clearButtonAction === 'fill-with-every') {
        const cron = getCronStringFromValues(
          newPeriod,
          [],
          [],
          [],
          [8],
          [0],
          undefined,
          undefined
        )

        newValue = cron
      }

      setValue(newValue, { selectedPeriod: newPeriod })
      internalValueRef.current = newValue

      setValueCleared(true)

      if (allowEmpty === 'never' && clearButtonAction === 'empty') {
        setInternalError(true)
        setError(onError, locale)
      } else {
        onError && onError(undefined)
        setInternalError(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [period, setValue, onError, clearButtonAction]
  )


  return (
    <div className="flex w-full gap-5 mb-3">
      {allowedDropdowns.includes('period') && (
        <FormControl
          variant="standard"
          className="select-0 w-full"
          sx={{
            maxWidth: 150
          }}
        >
          <InputLabel id="database-select-label">Every</InputLabel>
          <Select
            label="Minutes"
            value={periodForRender}
            onChange={(event: SelectChangeEvent) => setPeriod(event.target.value as PeriodType)}
          >
            <MenuItem value="hour">Hour</MenuItem>
            <MenuItem value="day">Day</MenuItem>
            <MenuItem value="week">Week</MenuItem>
            <MenuItem value="month">Month</MenuItem>
            <MenuItem value="year">Year</MenuItem>
          </Select>
        </FormControl>
      )}
      <>
        {periodForRender === 'year' &&
          allowedDropdowns.includes('months') && (
            <Months
              value={months}
              setValue={setMonths}
              locale={locale}
              className={className}
              period={periodForRender}
            />
          )}

        {(periodForRender === 'year' || periodForRender === 'month') &&
          allowedDropdowns.includes('month-days') && (
            <MonthDays
              value={monthDays}
              setValue={setMonthDays}
              locale={locale}
              className={className}
              weekDays={weekDays}
              readOnly={dropdownsConfig?.['month-days']?.readOnly ?? readOnly}
              period={periodForRender}
            />
          )}

        {(periodForRender === 'year' ||
            periodForRender === 'month' ||
            periodForRender === 'week') &&
          allowedDropdowns.includes('week-days') && (
            <WeekDays
              value={weekDays}
              setValue={setWeekDays}
              locale={locale}
              className={className}
              monthDays={monthDays}
              period={periodForRender}
            />
          )}
        {periodForRender !== 'minute' &&
          periodForRender !== 'hour' &&
          allowedDropdowns.includes('hours') && (
            <Hours
              value={hours}
              setValue={setHours}
              locale={locale}
              className={className}
              period={periodForRender}
            />
          )}

        {periodForRender !== 'minute' &&
          allowedDropdowns.includes('minutes') && (
            <Minutes
              value={minutes}
              setValue={setMinutes}
              locale={locale}
              className={className}
              period={periodForRender}
            />
          )}

        <Button onClick={handleClear}>Reset</Button>
      </>
    </div>
  )
}
