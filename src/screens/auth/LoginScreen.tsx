import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
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

          <Button
            title="Entrar"
            onPress={handleLogin}
            isLoading={isLoading}
            style={styles.btn}
          />

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
  btn: { marginTop: SPACING.sm },
  link: { marginTop: SPACING.lg, alignItems: 'center' },
  linkText: { color: COLORS.textSecondary, fontSize: 14 },
  linkHighlight: { color: COLORS.primary, fontWeight: '700' },
});
