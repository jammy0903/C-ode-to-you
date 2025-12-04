/**
 * @file RootNavigator.tsx
 * @description Root navigation component - handles authentication-based routing
 * 
 * @principles
 * - SRP: ✅ Single responsibility: navigation routing based on auth state
 * - Conditional Rendering: ✅ Shows different navigators based on authentication status
 * - User Experience: ✅ Displays loading screen during auth state initialization
 * 
 * @components
 * - RootNavigator(): React.FC - Root navigator that routes based on auth state
 * - LoadingScreen(): React.FC - Loading indicator shown during auth initialization
 * 
 * @navigation
 * - AuthNavigator: Shown when user is not authenticated (login screen)
 * - MainNavigator: Shown when user is authenticated (main app screens)
 * 
 * @state
 * - isAuthenticated: boolean - Determines which navigator to show
 * - isLoading: boolean - Shows loading screen during auth state check
 * 
 * @notes
 * - Uses React Navigation for navigation management
 * - Automatically switches between Auth and Main navigators based on auth state
 * - Loading screen prevents blank screen during initial auth check
 */
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#4CAF50" />
    <Text style={styles.loadingText}>로딩 중...</Text>
  </View>
);

export const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    marginTop: 16,
    color: '#ffffff',
    fontSize: 16,
  },
});

