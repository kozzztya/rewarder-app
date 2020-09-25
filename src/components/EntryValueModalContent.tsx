import React, { useState, useEffect, useCallback, SyntheticEvent } from 'react';
import { CardContent, CardActions, Button } from '@material-ui/core';
import { TextField } from './TextField';
import { Entry, ActivityType } from '../generated/apollo';
import { ActivityResult } from '../types';
import styled from 'styled-components';

export interface EntryValueModalContentProps {
  onSave: (value: number) => void;
  onDelete: () => void;
  value: Entry['value'];
  activity?: ActivityResult;
}

const TextFieldStyled = styled(TextField)`
  width: 200px;
`;

export const EntryValueModalContent: React.FC<EntryValueModalContentProps> = ({
  onSave,
  onDelete,
  activity,
  value: valueProp
}) => {
  const [value, setValue] = useState<string>('');

  const onSubmit = useCallback(
    (e: SyntheticEvent) => {
      const resultValue = Number(value);

      if (!Number.isNaN(resultValue)) {
        onSave(resultValue);
      }

      e.preventDefault();
    },
    [value, onSave]
  );

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

  useEffect(() => {
    setValue(valueProp ? String(valueProp) : '');
  }, [valueProp]);

  const inputProps =
    activity?.valueType === ActivityType.Range
      ? {
          min: activity.rangeMeta?.from,
          max: activity.rangeMeta?.to
        }
      : {};

  return (
    <form onSubmit={onSubmit}>
      <CardContent>
        <TextFieldStyled
          required
          fullWidth
          autoFocus={true}
          label="Value"
          type="number"
          value={value}
          InputProps={{ inputProps }}
          onChange={onChange}
        />
      </CardContent>
      <CardActions>
        <Button type="submit">Save</Button>
        <Button onClick={onDelete}>Delete</Button>
      </CardActions>
    </form>
  );
};
