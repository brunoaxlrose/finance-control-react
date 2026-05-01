import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { FinanceProvider } from '../contexts/FinanceContext';

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner message="Carregando..." />;

  return (
    <NavigationContainer>
      {user ? (
        <FinanceProvider>
          <MainNavigator />
        </FinanceProvider>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}
