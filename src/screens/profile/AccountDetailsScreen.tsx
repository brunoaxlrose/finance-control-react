import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

import { LoadingOverlay } from '../../components/common/LoadingOverlay';

export default function AccountDetailsScreen({ navigation }: any) {
  const { user, updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSave() {
    if (newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'A nova senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    setIsLoading(true);
    const result = await updatePassword(newPassword);
    setIsLoading(false);

    if (result.success) {
      Toast.show({ type: 'success', text1: 'Sucesso', text2: result.message });
      setCurrentPassword('');
      setNewPassword('');
      navigation.goBack();
    } else {
      Toast.show({ type: 'error', text1: 'Erro', text2: result.message });
    }
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isLoading} message="Atualizando senha..." />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dados da Conta</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() ?? 'U'}</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.changePhotoText}>Alterar foto</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Informações Pessoais</Text>
        <Input label="Nome Completo" value={user?.name ?? ''} editable={false} leftIcon="user" />
        <Input label="E-mail" value={user?.email ?? ''} editable={false} leftIcon="mail" />

        <Text style={styles.sectionTitle}>Alterar Senha</Text>
        <Input 
          label="Senha Atual" 
          value={currentPassword} 
          onChangeText={setCurrentPassword} 
          leftIcon="lock" 
          isPassword
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Digite a senha atual"
        />
        <Input 
          label="Nova Senha" 
          value={newPassword} 
          onChangeText={setNewPassword} 
          leftIcon="key" 
          isPassword
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Digite a nova senha"
        />

        <Button 
          title="Salvar Nova Senha" 
          onPress={handleSave} 
          isLoading={isLoading}
          style={{ marginTop: SPACING.md }} 
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md,
  },
  backBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl, paddingTop: SPACING.md },
  avatarSection: { alignItems: 'center', marginBottom: SPACING.xl },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.primary + '30',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  avatarText: { color: COLORS.primary, fontSize: 34, fontWeight: '800' },
  changePhotoText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: SPACING.md, marginTop: SPACING.sm },
});
