import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { View, Text, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING } from './src/utils/theme';
import { NetworkStatus } from './src/components/common/NetworkStatus';

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: COLORS.success, backgroundColor: COLORS.card, borderRadius: RADIUS.md }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '700', color: COLORS.text }}
      text2Style={{ fontSize: 13, color: COLORS.textSecondary }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ borderLeftColor: COLORS.danger, backgroundColor: COLORS.card, borderRadius: RADIUS.md }}
      text1Style={{ fontSize: 15, fontWeight: '700', color: COLORS.text }}
      text2Style={{ fontSize: 13, color: COLORS.textSecondary }}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: COLORS.primary, backgroundColor: COLORS.card, borderRadius: RADIUS.md }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{ fontSize: 15, fontWeight: '700', color: COLORS.text }}
      text2Style={{ fontSize: 13, color: COLORS.textSecondary }}
    />
  ),
  confirm: ({ text1, text2, props }: any) => (
    <View style={{
      width: '90%', backgroundColor: COLORS.card, padding: SPACING.lg,
      borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border,
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
    }}>
      <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '700' }}>{text1}</Text>
      <Text style={{ color: COLORS.textSecondary, fontSize: 14, marginTop: SPACING.xs, marginBottom: SPACING.lg }}>{text2}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm }}>
        <TouchableOpacity onPress={props.onCancel} style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm }}>
          <Text style={{ color: COLORS.textMuted, fontWeight: '600' }}>{props.cancelText || 'Cancelar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={props.onConfirm} style={{ paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, backgroundColor: props.danger ? COLORS.danger : COLORS.primary, borderRadius: RADIUS.md }}>
          <Text style={{ color: COLORS.white, fontWeight: '700' }}>{props.confirmText || 'Confirmar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  ),
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0F0F1A" />
      <NetworkStatus />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}
