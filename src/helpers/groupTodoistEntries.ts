import { EntryResult } from '../common/types';
import * as R from 'remeda';
import _ from 'lodash';

export interface HookProps {
  entries: EntryResult[];
  todoistActivityId?: string;
}

export const groupTodoistEntries = ({ entries, todoistActivityId }: HookProps) => {
  const { todoistEntries = [], regularEntries = [] } = R.groupBy(entries, (entry) => {
    return entry.activityId === todoistActivityId ? 'todoistEntries' : 'regularEntries';
  });

  const todoistGroup = _.isEmpty(todoistEntries)
    ? null
    : todoistEntries?.reduce<EntryResult>((acc, item) => {
        return {
          ...acc,
          ...item,
          value: (acc.value ?? 0) + (item.value ?? 0),
          name: 'Todoist tasks'
        };
      }, {} as EntryResult);

  return {
    regularEntries,
    todoistEntries,
    todoistGroup,
    entriesWithTodoistGroup: todoistGroup ? [...regularEntries, todoistGroup] : regularEntries
  };
};
