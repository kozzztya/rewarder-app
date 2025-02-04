import React, { useMemo, useState, useCallback } from 'react';
import { WeekdayStatistic } from '../../../generated/apollo';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { MenuItem, SelectProps } from '@material-ui/core';
import { ChartData } from '../../../common/types';
import { SelectInline } from '../../../components/SelectInline';
import _ from 'lodash';
import BarChart, { BarChartProps } from '../../../components/chart/BarChart';
// @ts-ignore
import generateGradient from 'gradient-color';
import { teal } from '@material-ui/core/colors';
import { EmptyStateWrapper } from '../../../components/EmptyStateWrapper';
import { weekdaysChartDataStub } from '../../../stub/chartStub';
import { LockedFeature } from './LockedFeature';
import { LockedFeatureWrapper } from './LockedFeatureWrapper';

type WeekdayChartType = keyof WeekdayStatistic;

export interface WeekdayChartProps {
  data?: WeekdayStatistic[];
  isWithValue: boolean;
  isLocked: boolean;
}

const weekdaysLabelMapper = {
  Mon: '2',
  Tue: '3',
  Wed: '4',
  Thu: '5',
  Fri: '6',
  Sat: '7',
  San: '1'
};

const TitleWrapper = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: center;
`;

const fallbackColor = teal[500];
const gradientColors = [teal[500], teal[700], teal[800]];

export const WeekdayChart: React.FC<WeekdayChartProps> = ({ data, isWithValue, isLocked }) => {
  const [valueField, setValueField] = useState<WeekdayChartType>(
    isWithValue ? 'valueSum' : 'count'
  );

  const onValueFieldChange: SelectProps['onChange'] = useCallback((e) => {
    setValueField(e.target.value);
  }, []);

  const finalData = useMemo(() => {
    if (isLocked || !data) return weekdaysChartDataStub;

    const normalizedData: { [key: string]: WeekdayStatistic } = data.reduce((acc, item) => {
      return { ...acc, [String(item.weekday)]: item };
    }, {});

    return Object.entries(weekdaysLabelMapper).reduce((acc, [weekdayLabel, weekdayNum]) => {
      const data = normalizedData[weekdayNum];
      if (!data) return acc;

      const yValue = data[valueField];
      if (!yValue) return acc;

      return [...acc, { xValue: weekdayLabel, yValue: _.round(Number(yValue), 1) }];
    }, [] as ChartData[]);
  }, [data, isLocked, valueField]);

  const sortedYValues = useMemo(() => {
    return finalData.map(({ yValue }) => yValue).sort((a, b) => Number(a) - Number(b));
  }, [finalData]);

  const colors = useMemo(() => {
    if (sortedYValues.length < 3) return [fallbackColor];
    if (sortedYValues.length === 3) return gradientColors;

    return generateGradient(gradientColors, sortedYValues.length);
  }, [sortedYValues]);

  const customizePoint: BarChartProps['customizePoint'] = useCallback(
    (point) => {
      const index = sortedYValues.findIndex((value) => value === point.data.yValue);

      if (index === -1 || !colors[index]) return { color: fallbackColor };

      return { color: colors[index] };
    },
    [colors, sortedYValues]
  );

  return (
    <EmptyStateWrapper isEmpty={data?.length === 0}>
      {isLocked && (
        <LockedFeatureWrapper>
          <LockedFeature size="small" />
        </LockedFeatureWrapper>
      )}

      <TitleWrapper>
        {isWithValue ? (
          <SelectInline value={valueField} onChange={onValueFieldChange}>
            <MenuItem value="valueSum" disabled={isLocked}>
              Value sum
            </MenuItem>
            <MenuItem value="averageValue" disabled={isLocked}>
              Average value
            </MenuItem>
            <MenuItem value="count" disabled={isLocked}>
              Count
            </MenuItem>
          </SelectInline>
        ) : (
          <Typography variant="body1" gutterBottom>
            Count
          </Typography>
        )}

        <Typography variant="body1">&nbsp;per weekday</Typography>
      </TitleWrapper>

      <BarChart data={finalData} customizePoint={customizePoint} />
    </EmptyStateWrapper>
  );
};
