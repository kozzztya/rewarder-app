import React, { Fragment, useCallback, useState } from 'react';
import ListItem from '@material-ui/core/ListItem';
import { Menu, MenuItem } from '@material-ui/core';
import { UserListItemContent } from './UserListItemContent';

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface UserListItemProps {
  user?: User;
  onLogout: () => void;
}

export const UserListItem: React.FC<UserListItemProps> = ({ user, onLogout }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleClick = useCallback((event) => {
    setMenuAnchor(event.currentTarget);
  }, []);

  const handleClose = () => {
    setMenuAnchor(null);
  };

  const logout = useCallback(() => {
    onLogout();
    setMenuAnchor(null);
  }, [onLogout]);

  if (!user) return <Fragment />;

  return (
    <Fragment>
      <ListItem onClick={handleClick} button>
        <UserListItemContent user={user} />
      </ListItem>

      <Menu anchorEl={menuAnchor} keepMounted open={Boolean(menuAnchor)} onClose={handleClose}>
        <MenuItem onClick={logout}>Logout</MenuItem>
      </Menu>
    </Fragment>
  );
};
