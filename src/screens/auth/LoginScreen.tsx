import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { validateEmail, validatePassword } from '../../utils/validators';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';

export default function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);

  useEffect(() => {
    checkBiometrics();
    checkSavedCredentials();
  }, []);

  async function checkBiometrics() {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsBiometricSupported(compatible);
  }

  async function checkSavedCredentials() {
    if (Platform.OS === 'web') return;
    
    const savedEmail = await SecureStore.getItemAsync('user_email');
    const savedPassword = await SecureStore.getItemAsync('user_password');
    if (savedEmail && savedPassword) {
      setHasSavedCredentials(true);
      setEmail(savedEmail);
    }
  }

  async function handleBiometricLogin() {
    if (Platform.OS === 'web') {
      Toast.show({ type: 'info', text1: 'Web', text2: 'Biometria disponível apenas no celular.' });
      return;
    }

    const savedEmail = await SecureStore.getItemAsync('user_email');
    const savedPassword = await SecureStore.getItemAsync('user_password');

    if (!savedEmail || !savedPassword) {
      Toast.show({ 
        type: 'info', 
        text1: 'Biometria', 
        text2: 'Faça o primeiro login com senha para ativar a biometria.' 
      });
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Login com Biometria',
      fallbackLabel: 'Usar senha',
    });

    if (result.success) {
      setIsLoading(true);
      const { success, message } = await signIn(savedEmail, savedPassword);
      setIsLoading(false);
      if (!success) {
        Toast.show({ type: 'error', text1: 'Erro', text2: message });
      }
    }
  }

  function validate() {
    const e = {
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
    };
    setErrors(e);
    return !e.email && !e.password;
  }

  async function handleLogin() {
    if (!validate()) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Preencha os campos corretamente.' });
      return;
    }
    setIsLoading(true);
    const { success, message } = await signIn(email.trim(), password);
    setIsLoading(false);
    if (!success) {
      Toast.show({ type: 'error', text1: 'Erro no Login', text2: message });
    } else {
      // Save credentials for biometrics (Mobile Only)
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync('user_email', email.trim());
        await SecureStore.setItemAsync('user_password', password);
      }
      Toast.show({ type: 'success', text1: 'Bem-vindo(a)!', text2: message });
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LoadingOverlay visible={isLoading} message="Autenticando..." />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Feather name="dollar-sign" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>Controle Financeiro</Text>
          <Text style={styles.subtitle}>Controle seus gastos com inteligência</Text>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <Text style={styles.title}>Bem-vindo de volta 👋</Text>
          <Text style={styles.desc}>Faça login na sua conta</Text>

          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail"
            error={errors.email}
            placeholder="seu@email.com"
          />
          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="lock"
            error={errors.password}
            placeholder="Mínimo 6 caracteres"
          />

          <View style={styles.loginActions}>
            <Button
              title="Entrar"
              onPress={handleLogin}
              isLoading={isLoading}
              style={[styles.btn, isBiometricSupported && { flex: 1, marginRight: SPACING.sm }]}
            />
            {isBiometricSupported && Platform.OS !== 'web' && (
              <TouchableOpacity 
                onPress={handleBiometricLogin} 
                style={styles.biometricBtn}
              >
                <MaterialCommunityIcons name="face-recognition" size={28} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
            <Text style={styles.linkText}>
              Não tem conta?{' '}
              <Text style={styles.linkHighlight}>Cadastre-se grátis</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: SPACING.xxl },
  logoWrapper: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  appName: { color: COLORS.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4 },
  form: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  desc: { color: COLORS.textSecondary, fontSize: 14, marginBottom: SPACING.lg },
  loginActions: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm },
  biometricBtn: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  btn: { flex: 1 },
  link: { marginTop: SPACING.lg, alignItems: 'center' },
  linkText: { color: COLORS.textSecondary, fontSize: 14 },
  linkHighlight: { color: COLORS.primary, fontWeight: '700' },
});
