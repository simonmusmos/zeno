import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { AddAccountScreen }    from '../screens/onboarding/AddAccountScreen';
import { BaseCurrencyScreen }  from '../screens/onboarding/BaseCurrencyScreen';
import { HookScreen }          from '../screens/onboarding/HookScreen';
import { NetWorthResultScreen } from '../screens/onboarding/NetWorthResultScreen';
import { GoogleSignInScreen }  from '../screens/auth/GoogleSignInScreen';
import { colors } from '../theme';
import type { OnboardingStackParamList } from '../types/navigation.types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Hook"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
        gestureEnabled: false, // intentional — forward-only flow
      }}
    >
      <Stack.Screen name="Hook"           component={HookScreen} />
      <Stack.Screen name="BaseCurrency"   component={BaseCurrencyScreen} />
      <Stack.Screen name="AddAccount"     component={AddAccountScreen} />
      <Stack.Screen name="NetWorthResult" component={NetWorthResultScreen} />
      <Stack.Screen
        name="GoogleSignIn"
        component={GoogleSignInScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
