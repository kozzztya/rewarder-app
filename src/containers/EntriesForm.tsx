import React, { useState, useCallback, useEffect, useMemo } from "react";
import ObjectId from "bson-objectid";
import {
  ActivityType,
  useCreateEntryMutation,
  useDeleteEntryMutation,
  refetchGetBalanceQuery,
  Entry,
  refetchGetEntriesByDayQuery,
  useGetEntriesByOneDayQuery,
  useUpdateEntryMutation,
  refetchGetEntriesByOneDayQuery,
  refetchGetDaysStatisticQuery
} from "../generated/apollo";
import { useApolloError } from "../hooks/useApolloError";
import { Spinner } from "../components/Spinner";
import { ErrorMessage } from "../components/ErrorMessage";
import * as R from "remeda";
import _ from "lodash";
import { Card, CardContent, Typography, Button } from "@material-ui/core";
import { useParams, useHistory } from "react-router-dom";
import styled, { css } from "styled-components";
import { CardModal } from "../components/CardModal";
import { ActivityResult, SelectedEntry, EntriesResult } from "../common/types";
import { ActivityCategoryOrder } from "../common/mappers";
import { EntryPickButton } from "../components/EntryPickButton";
import { groupTodoistEntries } from "../helpers/groupTodoistEntries";
import { useActivities } from "../hooks/useActivities";
import { DateTime } from "luxon";
import { useDeviceDetect } from "../hooks/useDeviceDetect";
import { EntryValueModalContent } from "../components/EntryValueModalContent/EntryValueModalContent";
import { isSwipeHandlersEnabledVar } from "../reactiveState";

const CardStyled = styled(Card)`
  margin-bottom: 10px;
`;

const DoneButton = styled(Button)`
  width: 100%;
`;

const DateTitleWrapper = styled.div<{ isCenter: boolean }>`
  ${(props) =>
    props.isCenter
      ? css`
          display: flex;
          justify-content: center;
          align-items: center;
        `
      : ''}
`;

export const EntriesForm = () => {
  const { isMobile } = useDeviceDetect();
  const [modalEntry, setModalEntry] = useState<SelectedEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showDelay = 300;

  const closeModal = useCallback(() => {
    isSwipeHandlersEnabledVar(true);
    setIsModalOpen(false);
    setTimeout(() => setModalEntry(null), showDelay);
  }, []);

  const openModal = useCallback((entry: SelectedEntry) => {
    isSwipeHandlersEnabledVar(false);
    setModalEntry(entry);
    setIsModalOpen(true);
  }, []);

  const history = useHistory();

  const params = useParams<{ date: string }>();
  const dayDate = params.date || DateTime.local().toISODate();

  const { errorMessage, errorTime, onError } = useApolloError();

  const { data: entriesData } = useGetEntriesByOneDayQuery({
    variables: { date: dayDate },
    onError
  });
  const entriesByDay = entriesData?.entriesByOneDay?.entries;

  const [selectedEntries, setSelectedEntries] = useState<EntriesResult>(entriesByDay || []);

  useEffect(() => {
    if (!_.isEmpty(entriesByDay)) setSelectedEntries(entriesByDay!);
  }, [entriesByDay]);

  const { activities, todoistActivity, getActivityById } = useActivities({
    onError
  });

  const getEntriesByActivityId = useCallback(
    (activityId: string) => {
      return selectedEntries?.filter((entry) => entry.activityId === activityId);
    },
    [selectedEntries]
  );

  const getEntryById = useCallback(
    (_id: string) => {
      return selectedEntries?.find((entry) => entry._id === _id);
    },
    [selectedEntries]
  );

  const mutationOptions = {
    onError,
    refetchQueries: [
      refetchGetDaysStatisticQuery(),
      refetchGetEntriesByDayQuery(),
      refetchGetEntriesByOneDayQuery({ date: dayDate }),
      refetchGetBalanceQuery()
    ]
  };
  const [createEntryMutation] = useCreateEntryMutation(mutationOptions);
  const [deleteEntryMutation] = useDeleteEntryMutation(mutationOptions);
  const [updateEntryMutation] = useUpdateEntryMutation(mutationOptions);

  const createEntry = useCallback(
    async (activityId: string, value?: Entry['value']) => {
      if (!_.isEmpty(getEntriesByActivityId(activityId))) return;

      const entry: SelectedEntry = {
        _id: new ObjectId().toString(),
        activityId,
        completedAt: new Date().toISOString(),
        value
      };

      setSelectedEntries((prev) => [...prev, entry]);
      await createEntryMutation({ variables: { data: entry } });
    },
    [getEntriesByActivityId, createEntryMutation]
  );

  const updateEntry = useCallback(
    async (entryId: string, toUpdate: Partial<Entry>) => {
      if (!getEntryById(entryId)) return;

      setSelectedEntries((prev) =>
        prev.map((entry) => {
          if (entry._id !== entryId) return entry;

          return { ...entry, ...toUpdate };
        })
      );
      await updateEntryMutation({ variables: { _id: entryId, data: toUpdate } });
    },
    [updateEntryMutation, getEntryById]
  );

  const deleteEntry = useCallback(
    async (entryId: string) => {
      if (!getEntryById(entryId)) return;

      setSelectedEntries((prev) => {
        return prev.filter((entry) => entry._id !== entryId);
      });
      await deleteEntryMutation({ variables: { _id: entryId } });
    },
    [deleteEntryMutation, getEntryById]
  );

  const selectEntry = useCallback(
    async (activity: ActivityResult) => {
      switch (activity.valueType) {
        case ActivityType.Range:
        case ActivityType.Value: {
          return openModal({
            _id: new ObjectId().toString(),
            completedAt: new Date().toISOString(),
            activityId: activity._id
          });
        }
        default: {
          await createEntry(activity._id);
        }
      }
    },
    [createEntry, openModal]
  );

  const unselectEntry = useCallback(
    async (entry: SelectedEntry) => {
      const activity = getActivityById(entry.activityId);

      switch (activity.valueType) {
        case ActivityType.Range:
        case ActivityType.Value: {
          return openModal(entry);
        }
        default: {
          return deleteEntry(entry._id);
        }
      }
    },
    [deleteEntry, getActivityById, openModal]
  );

  const onValueSave = useCallback(
    async (value: number) => {
      if (!modalEntry) return;

      const existingEntry = getEntryById(modalEntry._id);

      closeModal();

      return existingEntry
        ? updateEntry(existingEntry._id, { value })
        : createEntry(modalEntry.activityId, value);
    },
    [updateEntry, closeModal, getEntryById, createEntry, modalEntry]
  );

  const onDeleteFromModal = useCallback(() => {
    if (!modalEntry) return;
    const existingEntry = getEntryById(modalEntry._id);

    closeModal();

    if (existingEntry) {
      return deleteEntry(existingEntry._id);
    }
  }, [getEntryById, deleteEntry, modalEntry, closeModal]);

  const onDoneClick = useCallback(async () => {
    history.replace('/');
  }, [history]);

  const activitiesByCategory = useMemo(
    () =>
      R.pipe(
        activities || [],
        R.sortBy((activity) => ActivityCategoryOrder[activity.category]),
        R.groupBy((activity) => activity.category)
      ),
    [activities]
  );
  const modalActivity = useMemo(
    () => R.find(activities || [], (activity) => activity._id === modalEntry?.activityId),
    [activities, modalEntry]
  );

  if (!activities) return <Spinner />;

  return (
    <div>
      <ErrorMessage errorMessage={errorMessage} errorTime={errorTime} />

      <DateTitleWrapper isCenter={isMobile}>
        <Typography color="textSecondary" gutterBottom>
          {DateTime.fromISO(dayDate).toLocaleString(DateTime.DATE_HUGE)}
        </Typography>
      </DateTitleWrapper>

      <CardModal isShow={isModalOpen} onClose={closeModal} showDelay={showDelay}>
        <EntryValueModalContent
          onDelete={onDeleteFromModal}
          onSave={onValueSave}
          value={modalEntry?.value}
          activity={modalActivity!}
        />
      </CardModal>

      {Object.entries(activitiesByCategory).map(([category, activities]) => {
        return (
          <CardStyled key={category}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {category}
              </Typography>

              {activities.map((activity) => {
                const entries = getEntriesByActivityId(activity._id);

                if (_.isEmpty(entries)) {
                  return (
                    <EntryPickButton
                      key={activity._id}
                      activity={activity}
                      selectEntry={selectEntry}
                    />
                  );
                }

                let finalEntries = entries;
                if (activity.valueType === ActivityType.Todoist) {
                  const { entriesWithTodoistGroup } = groupTodoistEntries({
                    entries: entries!,
                    todoistActivityId: todoistActivity?._id
                  });
                  finalEntries = entriesWithTodoistGroup;
                }

                return finalEntries?.map((entry) => {
                  return (
                    <EntryPickButton
                      key={entry._id}
                      entry={entry}
                      activity={activity}
                      selectEntry={selectEntry}
                      unselectEntry={unselectEntry}
                    />
                  );
                });
              })}
            </CardContent>
          </CardStyled>
        );
      })}

      <DoneButton variant="contained" color="primary" onClick={onDoneClick}>
        Done
      </DoneButton>
    </div>
  );
};
