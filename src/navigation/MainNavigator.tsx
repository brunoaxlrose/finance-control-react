import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

import HomeScreen from '../screens/home/HomeScreen';
import TransactionsScreen from '../screens/transactions/TransactionsScreen';
import AddTransactionScreen from '../screens/transactions/AddTransactionScreen';
import TransactionDetailScreen from '../screens/transactions/TransactionDetailScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AccountDetailsScreen from '../screens/profile/AccountDetailsScreen';
import SecurityScreen from '../screens/profile/SecurityScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import CategoriesScreen from '../screens/profile/CategoriesScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TransactionsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TransactionsList" component={TransactionsScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Transactions" component={TransactionsStack} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="AccountDetails" component={AccountDetailsScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const [showFabMenu, setShowFabMenu] = useState(false);
  const navigation = useNavigation<any>();

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: COLORS.bgSecondary,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginBottom: 4 },
          tabBarIcon: ({ color, size }) => {
            const icons: Record<string, any> = {
              Home: 'home',
              Transactions: 'list',
              AddNew: 'plus-circle',
              Reports: 'pie-chart',
              Profile: 'user',
            };
            return <Feather name={icons[route.name] ?? 'circle'} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Início' }} />
        <Tab.Screen name="Transactions" component={TransactionsStack} options={{ title: 'Lançamentos' }} />
        <Tab.Screen
          name="AddNew"
          component={View} // Dummy component, we intercept navigation
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              setShowFabMenu(true);
            },
          })}
          options={{
            title: 'Novo',
            tabBarIcon: ({ color }) => (
              <View style={{
                width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
                justifyContent: 'center', alignItems: 'center', top: -5,
              }}>
                <Feather name="plus" size={24} color={COLORS.white} />
              </View>
            ),
            tabBarLabel: 'Novo',
          }}
        />
        <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'Relatórios' }} />
        <Tab.Screen name="Profile" component={ProfileStack} options={{ title: 'Perfil' }} />
      </Tab.Navigator>

      {/* FAB Modal */}
      <Modal visible={showFabMenu} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFabMenu(false)}>
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Novo Lançamento</Text>
            
            <TouchableOpacity 
              style={[styles.menuBtn, { backgroundColor: COLORS.success + '20' }]}
              onPress={() => {
                setShowFabMenu(false);
                navigation.navigate('Home', { 
                  screen: 'AddTransaction',
                  params: { type: 'income' }
                });
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: COLORS.success }]}>
                <Feather name="arrow-down" size={20} color={COLORS.white} />
              </View>
              <Text style={[styles.menuBtnText, { color: COLORS.success }]}>Receita</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuBtn, { backgroundColor: COLORS.danger + '20' }]}
              onPress={() => {
                setShowFabMenu(false);
                navigation.navigate('Home', { 
                  screen: 'AddTransaction',
                  params: { type: 'expense' }
                });
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: COLORS.danger }]}>
                <Feather name="arrow-up" size={20} color={COLORS.white} />
              </View>
              <Text style={[styles.menuBtnText, { color: COLORS.danger }]}>Despesa</Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  menuContainer: { 
    backgroundColor: COLORS.card, padding: SPACING.xl, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
    paddingBottom: 40,
  },
  menuTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: SPACING.lg, textAlign: 'center' },
  menuBtn: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.md },
  menuIcon: { width: 40, height: 40, borderRadius: RADIUS.full, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  menuBtnText: { fontSize: 16, fontWeight: '700' },
});
