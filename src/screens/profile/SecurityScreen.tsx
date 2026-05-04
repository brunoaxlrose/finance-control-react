import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import Toast from 'react-native-toast-message';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';

export default function SecurityScreen({ navigation }: any) {
  const { requestPasswordOTP, confirmPasswordOTP } = useAuth();
  const [biometrics, setBiometrics] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function handleRequestOTP() {
    setIsLoading(true);
    const result = await requestPasswordOTP();
    setIsLoading(false);
    
    if (result.success) {
      setStep('verify');
      Toast.show({ type: 'success', text1: 'Sucesso', text2: result.message });
    } else {
      Toast.show({ type: 'error', text1: 'Erro', text2: result.message });
    }
  }

  async function handleConfirmChange() {
    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'As senhas não coincidem.' });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    if (!otp) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Informe o código enviado por e-mail.' });
      return;
    }

    setIsLoading(true);
    const result = await confirmPasswordOTP(otp, newPassword);
    setIsLoading(false);

    if (result.success) {
      Toast.show({ type: 'success', text1: 'Sucesso', text2: result.message });
      setShowForm(false);
      setStep('request');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      Toast.show({ type: 'error', text1: 'Erro', text2: result.message });
    }
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isLoading} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Segurança</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        <Text style={styles.sectionTitle}>Senha e Acesso</Text>
        <Card style={styles.card}>
          {!showForm ? (
            <TouchableOpacity style={styles.row} onPress={() => setShowForm(true)}>
              <View style={styles.rowLeft}>
                <Feather name="key" size={20} color={COLORS.primary} />
                <Text style={styles.rowText}>Alterar Senha da Conta</Text>
              </View>
              <Feather name="chevron-right" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.form}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>Alterar Senha</Text>
                <TouchableOpacity onPress={() => { setShowForm(false); setStep('request'); }}>
                  <Feather name="x" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {step === 'request' ? (
                <View>
                  <Text style={styles.formDesc}>
                    Para sua segurança, enviaremos um código de 6 dígitos para o seu e-mail.
                  </Text>
                  <Button title="Enviar Código" onPress={handleRequestOTP} />
                </View>
              ) : (
                <View>
                  <Text style={styles.label}>Código do E-mail</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="Digite o código"
                    placeholderTextColor={COLORS.textSecondary + '60'}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                  />

                  <Text style={styles.label}>Nova Senha</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={COLORS.textSecondary + '60'}
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />

                  <Text style={styles.label}>Confirmar Nova Senha</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="Repita a nova senha"
                    placeholderTextColor={COLORS.textSecondary + '60'}
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />

                  <Button title="Confirmar Alteração" onPress={handleConfirmChange} style={{ marginTop: SPACING.md }} />
                  <TouchableOpacity onPress={() => setStep('request')} style={styles.resendBtn}>
                    <Text style={styles.resendText}>Não recebeu? Enviar novamente</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Biometria</Text>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Feather name="lock" size={20} color={COLORS.primary} />
              <Text style={styles.rowText}>Login com Digital/FaceID</Text>
            </View>
            <Switch
              value={biometrics}
              onValueChange={setBiometrics}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.bg}
            />
          </View>
        </Card>

        <View style={styles.infoBox}>
          <Feather name="info" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>
            A alteração de senha desconectará todos os seus dispositivos ativos por segurança.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: 60, paddingBottom: SPACING.md,
  },
  backBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, paddingTop: SPACING.md },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', marginBottom: SPACING.sm, marginTop: SPACING.md },
  card: { padding: SPACING.md, borderRadius: RADIUS.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  rowText: { color: COLORS.text, fontSize: 15, fontWeight: '500' },
  
  form: { gap: SPACING.sm },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  formTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  formDesc: { color: COLORS.textSecondary, fontSize: 14, marginBottom: SPACING.md, lineHeight: 20 },
  label: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
  input: { 
    backgroundColor: COLORS.bgSecondary, 
    borderRadius: RADIUS.md, 
    padding: SPACING.md, 
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md
  },
  resendBtn: { marginTop: SPACING.sm, alignItems: 'center' },
  resendText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  infoBox: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xl, paddingHorizontal: SPACING.sm },
  infoText: { color: COLORS.textSecondary, fontSize: 13, flex: 1, lineHeight: 18 }
});
