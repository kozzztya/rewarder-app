import React, { useState, useCallback } from 'react';
import { Header } from '../components/Header';
import { Navigation } from '../components/Navigation';
import styled from 'styled-components';
import { Balance } from './Balance/Balance';
import { useAuth } from '../hooks/useAuth';
import { Persist } from '../components/Persist';
import { useDeviceDetect } from '../hooks/useDeviceDetect';
import { useSwipeable } from 'react-swipeable';
import { isSwipeHandlersEnabledVar } from '../reactiveState';
import { ErrorCatcher } from './ErrorCatcher';
import { AppUpdateDialog } from './AppUpdateDialog';
// @ts-ignore
import ScrollRestoration from 'react-scroll-restoration';
import { Button } from '@material-ui/core';
import { useHistoryNavigation } from '../hooks/useHistoryNavigation';
import { Router, routes } from './Router';

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
  const { isAuthenticated, user, login, logout } = useAuth();
  const { goBackCb, switchTo, isNested } = useHistoryNavigation();
  const { isDesktop } = useDeviceDetect();
  const [isExpandedMenu, setIsExpandedMenu] = useState(isDesktop);

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
    },
    delta: 80
  });

  const onMenuClick = useCallback(() => {
    setIsExpandedMenu((prevValue) => !prevValue);
  }, [setIsExpandedMenu]);

  return (
    <AppWrapper {...swipeHandlers}>
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
        title="Life Balancer"
        onMenuClick={onMenuClick}
        onBackClick={goBackCb('/')}
        isShowBack={isNested}
        rightContent={
          isAuthenticated ? <Balance /> : <Button onClick={() => login()}>Login</Button>
        }
      />

      <ContentWrapper>
        <Navigation
          isExpanded={isExpandedMenu}
          items={isAuthenticated ? routes : routes.filter(({ isPublic }) => isPublic)}
          onClose={onMenuClick}
          onItemClick={switchTo}
          onLogout={logout}
          user={user && { name: user?.username, email: user.email, avatar: user.picture }}
        />

        <PageWrapper>
          <ErrorCatcher userEmail={user?.email} userName={user?.name}>
            <ScrollRestoration />
            <Router />
          </ErrorCatcher>
        </PageWrapper>
      </ContentWrapper>
    </AppWrapper>
  );
};
