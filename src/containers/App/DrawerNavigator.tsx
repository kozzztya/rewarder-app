import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  EntriesScreen,
  CalendarScreen,
  JournalScreen,
  StatisticScreen,
  ActivitiesScreen,
  AboutScreen,
  ReminderScreen,
  GoalsScreen
} from './Navigation';
import { TodoistAuth } from '../Activities/TodoistAuth';
import { PremiumPlan } from '../PremiumPlan/PremiumPlan';
import { AppBar } from './AppBar';

const DrawerStack = createStackNavigator();

export const DrawerNavigator: React.FC = () => {
  return (
    <DrawerStack.Navigator screenOptions={{ headerShown: false }}>
      <DrawerStack.Screen name="EntriesStack" component={EntriesScreen} />
      <DrawerStack.Screen name="CalendarStack" component={CalendarScreen} />
      <DrawerStack.Screen name="JournalStack" component={JournalScreen} />
      <DrawerStack.Screen name="StatisticStack" component={StatisticScreen} />
      <DrawerStack.Screen name="ActivitiesStack" component={ActivitiesScreen} />
      <DrawerStack.Screen name="GoalsStack" component={GoalsScreen} />
      <DrawerStack.Screen name="AboutStack" component={AboutScreen} />
      <DrawerStack.Screen name="RemindersStack" component={ReminderScreen} />
      <DrawerStack.Screen name="TodoistAuth" component={TodoistAuth} />
      <DrawerStack.Screen
        name="PremiumPlan"
        component={PremiumPlan}
        options={{ header: () => <AppBar />, headerShown: true }}
      />
    </DrawerStack.Navigator>
  );
};
