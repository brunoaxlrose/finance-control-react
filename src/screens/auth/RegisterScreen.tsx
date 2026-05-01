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
import { validateEmail, validatePassword, validateName } from '../../utils/validators';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';

import { LoadingOverlay } from '../../components/common/LoadingOverlay';

export default function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const e: Record<string, string | undefined> = {
      name: validateName(name) ?? undefined,
      email: validateEmail(email) ?? undefined,
      password: validatePassword(password) ?? undefined,
      confirm: password !== confirm ? 'As senhas não coincidem.' : undefined,
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  }

  async function handleRegister() {
    if (!validate()) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Preencha os campos corretamente.' });
      return;
    }
    setIsLoading(true);
    const { success, message } = await signUp(name.trim(), email.trim(), password);
    setIsLoading(false);

    if (success) {
      Toast.show({ type: 'success', text1: 'Conta Criada!', text2: message });
    } else {
      if (message.includes('E-mail já cadastrado')) {
        setErrors(prev => ({ ...prev, email: message }));
      }
      Toast.show({ type: 'error', text1: 'Erro no Cadastro', text2: message });
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LoadingOverlay visible={isLoading} message="Criando conta..." />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* BACK */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Feather name="arrow-left" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <Text style={styles.title}>Criar conta 🚀</Text>
          <Text style={styles.desc}>Comece a controlar suas finanças hoje</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nome completo"
            value={name}
            onChangeText={setName}
            leftIcon="user"
            error={errors.name}
            placeholder="Seu nome"
            autoCapitalize="words"
          />
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
          <Input
            label="Confirmar senha"
            value={confirm}
            onChangeText={setConfirm}
            isPassword
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon="check-circle"
            error={errors.confirm}
            placeholder="Repita a senha"
          />

          {/* PASSWORD STRENGTH */}
          {password.length > 0 && (
            <View style={styles.strength}>
              <View style={[styles.strengthBar, { backgroundColor: password.length >= 6 ? COLORS.success : COLORS.danger }]} />
              <Text style={[styles.strengthText, { color: password.length >= 6 ? COLORS.success : COLORS.danger }]}>
                {password.length >= 10 ? 'Senha forte 💪' : password.length >= 6 ? 'Senha média' : 'Senha fraca'}
              </Text>
            </View>
          )}

          <Button
            title="Criar conta"
            onPress={handleRegister}
            isLoading={isLoading}
            style={styles.btn}
          />

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.link}>
            <Text style={styles.linkText}>
              Já tem conta?{' '}
              <Text style={styles.linkHighlight}>Faça login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, paddingTop: SPACING.lg },
  back: { alignSelf: 'flex-start', padding: 8, marginBottom: SPACING.md },
  headerText: { marginBottom: SPACING.lg },
  title: { color: COLORS.text, fontSize: 26, fontWeight: '800' },
  desc: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4 },
  form: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  strength: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md, gap: SPACING.sm },
  strengthBar: { height: 4, flex: 1, borderRadius: 2 },
  strengthText: { fontSize: 12, fontWeight: '600' },
  btn: { marginTop: SPACING.sm },
  link: { marginTop: SPACING.lg, alignItems: 'center' },
  linkText: { color: COLORS.textSecondary, fontSize: 14 },
  linkHighlight: { color: COLORS.primary, fontWeight: '700' },
});
