import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import TaskListScreen from '../screens/TaskListScreen';
import FormScreen from '../screens/FormScreen';

export type RootStackParamList = {
  Login: undefined;
  TaskList: undefined;
  Form: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="TaskList" component={TaskListScreen} options={{ title: 'Data List' }} />
      <Stack.Screen name="Form" component={FormScreen} options={{ title: 'Submit Form' }} />
    </Stack.Navigator>
  );
}
