import { ActivityResult, EntryResult } from '../common/types';
import { useMemo, useCallback } from 'react';
import { ActivityType, ActivityCategory } from '../generated/apollo';
import _ from 'lodash';

export interface HookParams {
  activities?: ActivityResult[];
  entries?: EntryResult[];
}

export const TODOIST_CATEGORY = 'Todoist tasks';

export const ActivityCategoryOrder: {
  [key: string]: number;
} = {
  [ActivityCategory.Neutral]: 1,
  [ActivityCategory.Positive]: 2,
  [ActivityCategory.Negative]: 3,
  [TODOIST_CATEGORY]: 4
};

export type ActivityByCategory = {
  category: string;
  activities: ActivityResult[];
};

export const useActivitiesByCategory = ({ activities = [], entries = [] }: HookParams) => {
  const getIsWithEntries = useCallback(
    (activityId) => {
      return !_.isEmpty(_.filter(entries, { activityId }));
    },
    [entries]
  );

  const activitiesByCategory: ActivityByCategory[] = useMemo(
    () =>
      _.chain(activities)
        .filter((activity) => {
          const isWidgetWithoutEntries = activity.isWidget && !getIsWithEntries(activity._id);

          return !isWidgetWithoutEntries;
        })
        .groupBy((activity) =>
          activity.valueType === ActivityType.Todoist ? TODOIST_CATEGORY : activity.category
        )
        .map((activities, category) => ({ category, activities }))
        .sortBy(({ category }) => ActivityCategoryOrder[category])
        .value(),
    [activities, getIsWithEntries]
  );

  return { activitiesByCategory };
};
