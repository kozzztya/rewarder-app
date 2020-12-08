import React, { useCallback, ChangeEvent, useMemo, useState, useEffect } from 'react';
import { Calendar as MaterialCalendar, useStaticState } from '@material-ui/pickers';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useApolloError } from '../../hooks/useApolloError';
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { PageWrapper } from '../../components/PageWrapper';
import { CalendarLegends } from './CalendarLegends';
import { useActivities } from '../../hooks/useActivities';
import {
  useGetActivitiesExtremesQuery,
  ActivityType,
  useUpdateActivityMutation,
  refetchGetActivitiesQuery,
  refetchGetActivitiesExtremesQuery
} from '../../generated/apollo';
import { ValueGradient } from './ValueGradient';
import { useDatePickerRenderDayExtremes } from '../../hooks/useDatePickerRenderDayExtremes';
import { useReactiveVar } from '@apollo/client';
import { calendarActivityIdVar } from '../../reactiveState';
import { useOnEntryUpdate } from '../../hooks/useOnEntryUpdate';
import { useOnActivityUpdate } from '../../hooks/useOnActivityUpdate';

const CalendarWrapper = styled.div`
  overflow: hidden;
`;

const CalendarLegendsWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
`;

const FormControlWrapper = styled(FormControl)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FormControlStyled = styled(FormControl)`
  width: 200px;
`;

const Calendar = () => {
  const history = useHistory();
  const { errorMessage, errorTime, onError } = useApolloError();
  const selectedActivityId = useReactiveVar(calendarActivityIdVar);

  const onActivitySelect = useCallback((e: ChangeEvent<{ name?: string; value: any }>) => {
    calendarActivityIdVar(e.target?.value);
  }, []);

  const { activities } = useActivities({ onError });
  const { data, refetch: refetchExtremes } = useGetActivitiesExtremesQuery({ onError });
  const activitiesExtremes = data?.activitiesExtremes;

  useOnEntryUpdate([refetchExtremes]);
  useOnActivityUpdate([refetchExtremes]);

  const selectedActivity = useMemo(() => {
    return activities?.find(({ _id }) => _id === selectedActivityId);
  }, [activities, selectedActivityId]);

  const selectedActivityExtremes = useMemo(() => {
    return activitiesExtremes?.find(({ _id }) => _id === selectedActivityId);
  }, [activitiesExtremes, selectedActivityId]);

  const [isReverseColors, setIsReverseColors] = useState(!!selectedActivity?.isReverseColors);

  useEffect(() => {
    setIsReverseColors(!!selectedActivity?.isReverseColors);
  }, [selectedActivity]);

  const [updateActivity] = useUpdateActivityMutation({
    onError,
    refetchQueries: [refetchGetActivitiesQuery(), refetchGetActivitiesExtremesQuery()]
  });

  const reverseColors = useCallback(
    (newValue) => {
      setIsReverseColors(newValue);

      if (selectedActivity) {
        updateActivity({
          variables: { _id: selectedActivity?._id, data: { isReverseColors: newValue } }
        }).then();
      }
    },
    [selectedActivity, updateActivity]
  );

  const { renderDay, daysData } = useDatePickerRenderDayExtremes({
    onError,
    selectedActivityExtremes,
    isReverseColors
  });

  const onDateChange = useCallback(
    (date) => {
      if (!date) return;
      history.push(`/entries/${date.toISO()}`);
    },
    [history]
  );

  const [date] = useState(new Date());

  const { pickerProps } = useStaticState({
    value: date,
    onChange: onDateChange
  });

  return (
    <PageWrapper
      errorMessage={errorMessage}
      errorTime={errorTime}
      isLoading={!activities || !daysData}
    >
      <CalendarWrapper>
        <FormControlWrapper>
          <FormControlStyled margin="dense">
            <InputLabel shrink>Activity</InputLabel>
            <Select value={selectedActivityId} onChange={onActivitySelect} displayEmpty>
              <MenuItem value="">All</MenuItem>
              {activities?.map((activity) => (
                <MenuItem key={activity._id} value={activity._id}>
                  {activity.emoji} {activity.name}
                </MenuItem>
              ))}
            </Select>
          </FormControlStyled>
        </FormControlWrapper>

        <MaterialCalendar {...pickerProps} renderDay={renderDay} />

        <CalendarLegendsWrapper>
          {!selectedActivity ||
          selectedActivity.isWidget ||
          selectedActivity?.valueType === ActivityType.Simple ? (
            <CalendarLegends />
          ) : (
            <ValueGradient
              isReverseColors={isReverseColors}
              onReverseColors={reverseColors}
              min={selectedActivityExtremes?.min!}
              max={selectedActivityExtremes?.max!}
            />
          )}
        </CalendarLegendsWrapper>
      </CalendarWrapper>
    </PageWrapper>
  );
};

export default Calendar;
