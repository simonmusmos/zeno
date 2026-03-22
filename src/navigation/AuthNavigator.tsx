import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import {
  ForgotPasswordScreen,
  LoginScreen,
  RegisterScreen,
} from '../screens/auth';
import { colors } from '../theme';
import type { AuthStackParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Auth flow: Login → Register | ForgotPassword
 * No header shown — screens manage their own headers or none.
 */
export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
