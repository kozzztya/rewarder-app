import * as React from 'react';
import { Fragment, RefObject } from 'react';
import { NavigationContainer, DarkTheme, NavigationContainerRef } from '@react-navigation/native';
import { MainColors } from '../../common/colors';
import { useAuth } from '../../hooks/useAuth';
import { ErrorCatcher } from '../ErrorCatcher';
import { BottomTabsNavigator } from './BottomTabsNavigator';
import { createStackNavigator } from '@react-navigation/stack';
import { Auth } from '../Auth/Auth';
import { useMount } from 'react-use';
import Loadable from 'react-loadable';
import { AppUpdateDialog } from '../AppUpdateDialog';

export type NavigationParams = {
  Auth: { error_description: string };
  EntriesForm: { date: string };
  ActivityStatistic: { id: string };
  ActivityEdit: { id: string };
  TodoistAuth: { code: string; error: string };
};

export const navigationRef: RefObject<NavigationContainerRef> | null = React.createRef();

const RootStack = createStackNavigator();

export default function App() {
  const { user, isAuthenticated } = useAuth();

  useMount(() => {
    Loadable.preloadAll().then();
  });

  return (
    <NavigationContainer
      ref={navigationRef}
      documentTitle={{ formatter: () => 'Life Balancer' }}
      theme={{
        ...DarkTheme,
        dark: true,
        colors: {
          ...DarkTheme.colors,
          background: MainColors.Background,
          primary: MainColors.Primary
        }
      }}
      linking={{
        prefixes: ['https://*.lifebalancer.app', 'http://localhost:3000'],
        config: {
          screens: {
            Auth: 'auth',
            Callback: 'auth/callback',
            Home: {
              screens: {
                EntriesTab: {
                  initialRouteName: 'EntriesByDay',
                  screens: {
                    EntriesByDay: '',
                    EntriesForm: 'entries/:date'
                  }
                },
                CalendarTab: {
                  initialRouteName: 'Calendar',
                  screens: {
                    Calendar: 'calendar',
                    CalendarEntries: 'calendar/:date'
                  }
                },
                JournalTab: {
                  initialRouteName: 'Journal',
                  screens: {
                    Journal: 'journal',
                    JournalEntries: 'journal/:date'
                  }
                },
                StatisticTab: {
                  initialRouteName: 'ActivitiesStatistic',
                  screens: {
                    ActivitiesStatistic: 'statistic/activities',
                    ActivityStatistic: 'statistic/activities/:id'
                  }
                },
                OtherTab: {
                  initialRouteName: 'Other',
                  screens: {
                    Other: 'other',
                    Activities: 'activities',
                    ActivityEdit: 'activities/:id',
                    ActivityCreate: 'activities/create',
                    TodoistAuth: 'todoist/auth',
                    Reminders: 'reminders',
                    About: 'about',
                    PrivacyPolicy: 'about/privacy-policy',
                    TermsAndConditions: 'about/terms-conditions',
                    DevTools: 'other/dev-tools'
                  }
                }
              }
            }
          }
        }
      }}
    >
      <ErrorCatcher userEmail={user?.email} userName={user?.name}>
        <AppUpdateDialog />

        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <RootStack.Screen name="Home" component={BottomTabsNavigator} />
          ) : (
            <Fragment>
              <RootStack.Screen name="Auth" component={Auth} />
            </Fragment>
          )}
        </RootStack.Navigator>
      </ErrorCatcher>
    </NavigationContainer>
  );
}
