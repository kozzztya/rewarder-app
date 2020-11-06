import React, { useState, useCallback } from 'react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import styled from 'styled-components';
import { Route, Switch, useHistory } from 'react-router-dom';
import { HeaderRightContent } from './HeaderRightContent';
import { Auth } from './Auth';
import { useAuth } from '../hooks/useAuth';
import { Persist } from '../components/Persist';
import { useDeviceDetect } from '../hooks/useDeviceDetect';
import { useSwipeable } from 'react-swipeable';
import { ActivityForm } from './ActivityForm';
import { Activities } from './Activities';
import { Entries } from './Entries';
import { EntriesForm } from './EntriesForm';
import { Calendar } from './Calendar';
import { TodoistAuth } from './TodoistAuth';
import { Reminders } from './Reminders';
import { usePushTokenSave } from '../hooks/usePushTokenSave';
import { useApolloError } from '../hooks/useApolloError';
import { Loadable } from '../components/Loadable';
import { isSwipeHandlersEnabledVar } from '../reactiveState';
import { ErrorCatcher } from './ErrorCatcher';
import { AppUpdateDialog } from './AppUpdateDialog';

export interface IPage {
  name: string;
  icon: string;
  path: string;
  component: React.ComponentType<any>;
}

const pages: IPage[] = [
  {
    name: 'Entries',
    icon: 'receipt_long',
    path: '/',
    component: Entries
  },
  {
    name: 'Calendar',
    icon: 'date_range',
    path: '/calendar',
    component: Calendar
  },
  {
    name: 'Activities',
    icon: 'assignment_turned_in',
    path: '/activities',
    component: Activities
  },
  {
    name: 'Reminders',
    icon: 'notifications',
    path: '/reminders',
    component: Reminders
  }
];

const AppWrapper = styled.div`
  height: 100vh;
`;

const ContentWrapper = styled.div`
  display: flex;
`;

const PageWrapper = styled.div`
  flex-grow: 1;
  margin: 10px;
  position: relative;
`;

export interface IAppState {
  isExpandedMenu: boolean;
}

export interface IAppProps {
  history: History;
}

export const App: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const history = useHistory();
  const { isDesktop } = useDeviceDetect();
  const [isExpandedMenu, setIsExpandedMenu] = useState(isDesktop);
  const { onError, errorTime, errorMessage } = useApolloError();

  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (isSwipeHandlersEnabledVar()) {
        setIsExpandedMenu(true);
      }
    },
    onSwipedLeft: () => {
      if (isSwipeHandlersEnabledVar()) {
        setIsExpandedMenu(false);
      }
    }
  });

  const onMenuClick = useCallback(() => {
    setIsExpandedMenu((prevValue) => !prevValue);
  }, [setIsExpandedMenu]);

  const onNavigationItemClick = useCallback(
    (path: string) => {
      history.replace(path);
    },
    [history]
  );

  const onBackClick = useCallback(() => {
    history.goBack();
  }, [history]);

  if (!isAuthenticated) return <Auth />;

  return (
    <AppWrapper {...swipeHandlers}>
      <Loadable errorMessage={errorMessage} errorTime={errorTime}>
        {isDesktop && (
          <Persist
            name="app"
            data={{ isExpandedMenu }}
            onMount={({ isExpandedMenu }) => {
              setIsExpandedMenu(!!isExpandedMenu);
            }}
          />
        )}

        <AppUpdateDialog />

        <Header
          title="Rewarder"
          onMenuClick={onMenuClick}
          onBackClick={onBackClick}
          rightContent={<HeaderRightContent />}
        />

        <ContentWrapper>
          <Navigation
            isExpanded={isExpandedMenu}
            items={pages}
            onClose={onMenuClick}
            onItemClick={onNavigationItemClick}
            user={user && { name: user?.given_name, email: user.email, avatar: user.picture }}
          />

          <PageWrapper>
            <ErrorCatcher userEmail={user?.email} userName={user?.name}>
              <Switch>
                {pages.map((page) => {
                  return (
                    <Route key={page.path} path={page.path} exact component={page.component} />
                  );
                })}
                <Route path="/activities/create" exact component={ActivityForm} />
                <Route path="/activities/edit/:_id" exact component={ActivityForm} />
                <Route path="/entries/:date" exact component={EntriesForm} />
                <Route path="/todoist/auth" exact component={TodoistAuth} />
              </Switch>
            </ErrorCatcher>
          </PageWrapper>
        </ContentWrapper>
      </Loadable>
    </AppWrapper>
  );
};
