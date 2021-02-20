import React, { Fragment, useCallback } from 'react';
import { useApolloError } from '../../hooks/useApolloError';
import { useOnEntryUpdate } from '../../hooks/useOnEntryUpdate';
import { Typography } from '@material-ui/core';
import { EmptyState } from '../../components/EmptyState';
import InfiniteScroll from 'react-infinite-scroll-component';
import styled from 'styled-components';
import { useActivities } from '../../hooks/useActivities';
import { Spinner } from '../../components/Spinner';
import { DatePickerButton } from '../EntriesByDay/DatePickerButton';
import { FabButton } from '../../components/FabButton';
import { useNavigationHelpers } from '../../hooks/useNavigationHelpers';
import { useInfiniteQuery } from '../../hooks/useInfiniteQuery';
import {
  GetJournalQuery,
  GetJournalQueryVariables,
  GetJournalDocument
} from '../../generated/apollo';
import { getEntryLabel } from '../../helpers/entryLabel';
import { DayCard } from '../../components/DayCard';
import { Emoji } from '../../components/Emoji';
import _ from 'lodash';
import { getDayQueryVariables } from '../../helpers/getDayQueryVariables';
import { toLuxon } from '../../helpers/date';
import { PageWrapper } from '../../components/PageWrapper';

const ActivityTitle = styled(Typography)`
  font-size: 15px;
  margin-bottom: 8px;
`;

const Description = styled(Typography)`
  margin-bottom: 16px;
  white-space: pre-line;

  :last-child {
    margin-bottom: 0;
  }
`;

const DatePickerButtonWrapper = styled.div`
  position: fixed;
  bottom: 140px;
  right: 26px;
`;

const DayContent = styled.div`
  padding: 16px;
`;

const scrollTargetId = 'journal-wrapper';

const Journal = () => {
  const { goForwardTo } = useNavigationHelpers();
  const { errorMessage, onError, errorTime } = useApolloError();

  const { getActivityById, todoistActivity, allActivities } = useActivities({ onError });

  const { data, isHasMore, loadMore, refetch } = useInfiniteQuery<
    GetJournalQuery,
    GetJournalQueryVariables
  >(GetJournalDocument, {
    onError,
    field: 'journal',
    scrollTargetId,
    variables: {
      activities: allActivities
        ?.filter((activity) => activity._id !== todoistActivity?._id)
        .map((activity) => activity._id)
    },
    fetchMoreVariables: (data) => getDayQueryVariables(_.last(data.journal)?.date)
  });

  const journal = data?.journal;

  useOnEntryUpdate([refetch]);

  const onDayClick = useCallback(
    (date = new Date()) => {
      goForwardTo('JournalEntries', { date: toLuxon(date).toISODate() });
    },
    [goForwardTo]
  );

  const isLoading = !journal || !allActivities;

  return (
    <PageWrapper
      id={scrollTargetId}
      errorMessage={errorMessage}
      errorTime={errorTime}
      isLoading={isLoading}
    >
      {journal?.length === 0 ? (
        <EmptyState text="So far no entries with description..." />
      ) : (
        <InfiniteScroll
          dataLength={journal?.length ?? 0}
          next={loadMore}
          loader={<Spinner />}
          hasMore={isHasMore}
          scrollableTarget={scrollTargetId}
        >
          {journal?.map((day) => {
            return (
              <DayCard key={day.date} day={day} onClick={onDayClick}>
                <DayContent>
                  {day.entries.map((entry) => {
                    const activity = getActivityById(entry.activityId);

                    return (
                      <Fragment key={entry._id}>
                        <ActivityTitle>
                          <Emoji>{activity?.emoji}</Emoji>
                          {getEntryLabel({ entry, activity })}
                        </ActivityTitle>
                        <Description variant="body2">{entry.description}</Description>
                      </Fragment>
                    );
                  })}
                </DayContent>
              </DayCard>
            );
          })}
        </InfiniteScroll>
      )}

      <DatePickerButtonWrapper>
        <DatePickerButton onChange={onDayClick} />
      </DatePickerButtonWrapper>

      <FabButton onClick={() => onDayClick()} />
    </PageWrapper>
  );
};

export default Journal;
