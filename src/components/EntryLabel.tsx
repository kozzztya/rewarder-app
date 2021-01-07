import React from 'react';
import styled from 'styled-components';
import { Emoji } from './Emoji';
import _ from 'lodash';
import { Activity, Entry } from '../generated/apollo';
import { DescriptionIcon } from './DescriptionIcon';

export interface EntryLabelProps {
  activity?: Pick<Activity, 'name' | 'emoji' | 'valueType' | 'isWithDescription' | 'isWidget'>;
  entry?: Pick<Entry, 'description' | 'value'>;
  isAddComa?: boolean;
}

const Label = styled.div`
  white-space: nowrap;
`;

const TextWrapper = styled.div`
  display: inline-block;
`;

const Coma = styled.span`
  margin-right: 5px;
`;

export const EntryLabel = ({ entry, activity, isAddComa = false }: EntryLabelProps) => {
  const text = activity?.isWidget && entry?.description ? entry.description : activity?.name;
  const value = _.isNumber(entry?.value) ? `: ${entry?.value}` : '';

  return (
    <Label>
      <Emoji>{activity?.emoji}</Emoji>
      <TextWrapper>{text}</TextWrapper>
      {value}
      <DescriptionIcon entry={entry} activity={activity} />
      {isAddComa && <Coma>, </Coma>}
    </Label>
  );
};
