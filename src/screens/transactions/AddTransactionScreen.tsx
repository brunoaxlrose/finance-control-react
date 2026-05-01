import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useFinance } from '../../contexts/FinanceContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { TransactionType, Category } from '../../types';
import { validateAmount, validateDescription } from '../../utils/validators';
import { COLORS, SPACING, RADIUS } from '../../utils/theme';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';

import { LoadingOverlay } from '../../components/common/LoadingOverlay';

interface Props {
  navigation: any;
  route: { params?: { type?: TransactionType; transaction?: any } };
}

export default function AddTransactionScreen({ navigation, route }: Props) {
  const { addTransaction, updateTransaction, removeTransaction, categories } = useFinance();
  const existingTransaction = route.params?.transaction;
  const defaultType = existingTransaction?.type ?? route.params?.type ?? 'expense';

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState(
    existingTransaction ? existingTransaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''
  );
  const [description, setDescription] = useState(existingTransaction?.description ?? '');
  const [selectedCategory, setSelectedCategory] = useState<string>(existingTransaction?.categoryId ?? '');
  const [date, setDate] = useState(
    existingTransaction 
      ? new Date(`${existingTransaction.date.substring(0, 10)}T12:00:00`) 
      : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(existingTransaction?.isPaid ?? true);
  const [isFixed, setIsFixed] = useState(existingTransaction?.isFixed ?? false);
  const [isRepeated, setIsRepeated] = useState(existingTransaction?.isRepeated ?? false);
  const [totalInstallments, setTotalInstallments] = useState('1');

  const availableCategories = categories.filter(c => (c.type === type || c.type === 'both') && c.isActive !== false);

  function validate() {
    const e: Record<string, string | undefined> = {
      amount: validateAmount(amount) ?? undefined,
      description: validateDescription(description) ?? undefined,
      category: !selectedCategory ? 'Selecione uma categoria.' : undefined,
    };
    setErrors(e);
    return !Object.values(e).some(Boolean);
  }

  function handleAmountChange(text: string) {
    const numericOnly = text.replace(/\D/g, '');
    if (!numericOnly) {
      setAmount('');
      return;
    }
    // Limit to 11 digits to prevent overflow (up to 999,999,999.99)
    if (numericOnly.length > 11) return;
    
    const floatValue = parseInt(numericOnly, 10) / 100;
    const formatted = floatValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    setAmount(formatted);
  }

  function handleDateChange(event: any, selectedDate?: Date) {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  }

  async function handleSave() {
    if (!validate()) return;
    setIsLoading(true);
    
    try {
      const parsedAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
      const formattedDate = format(date, 'yyyy-MM-dd');
      const isFuture = new Date(`${formattedDate}T12:00:00`) > new Date();

      const data = {
        type,
        amount: parsedAmount,
        description: description.trim(),
        categoryId: selectedCategory,
        date: formattedDate,
        isPaid: isFuture ? false : isPaid,
        isFixed,
        totalInstallments: isRepeated ? parseInt(totalInstallments, 10) || 1 : 1,
      };

      if (existingTransaction) {
        await updateTransaction({ ...existingTransaction, ...data });
        Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Lançamento atualizado.' });
      } else {
        await addTransaction(data);
        Toast.show({ type: 'success', text1: 'Sucesso!', text2: 'Lançamento salvo com sucesso.' });
      }
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao salvar lançamento.' });
    } finally {
      setIsLoading(false);
    }
  }

  function handleDelete() {
    if (!existingTransaction) return;
    Toast.show({
      type: 'confirm',
      text1: 'Excluir lançamento',
      text2: 'Tem certeza que deseja excluir este lançamento?',
      position: 'bottom',
      bottomOffset: 40,
      autoHide: false,
      props: {
        cancelText: 'Cancelar',
        confirmText: 'Excluir',
        danger: true,
        onCancel: () => Toast.hide(),
        onConfirm: async () => {
          Toast.hide();
          setIsLoading(true);
          try {
            await removeTransaction(existingTransaction.id);
            Toast.show({ type: 'success', text1: 'Excluído', text2: 'Lançamento apagado.' });
            navigation.goBack();
          } catch (err) {
            Toast.show({ type: 'error', text1: 'Erro', text2: 'Falha ao excluir.' });
          } finally {
            setIsLoading(false);
          }
        }
      }
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LoadingOverlay visible={isLoading} message={existingTransaction ? 'Atualizando...' : 'Salvando...'} />
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{existingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}</Text>
          {existingTransaction ? (
            <TouchableOpacity onPress={handleDelete} style={styles.backBtn}>
              <Feather name="trash-2" size={20} color={COLORS.danger} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 38 }} />
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* TYPE TOGGLE */}
          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'income' && styles.typeBtnIncomeActive]}
              onPress={() => { setType('income'); setSelectedCategory(''); }}
              activeOpacity={0.8}
            >
              <Feather name="arrow-down-circle" size={18} color={type === 'income' ? COLORS.success : COLORS.textMuted} />
              <Text style={[styles.typeBtnText, type === 'income' && { color: COLORS.success }]}>Receita</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeBtn, type === 'expense' && styles.typeBtnExpenseActive]}
              onPress={() => { setType('expense'); setSelectedCategory(''); }}
              activeOpacity={0.8}
            >
              <Feather name="arrow-up-circle" size={18} color={type === 'expense' ? COLORS.danger : COLORS.textMuted} />
              <Text style={[styles.typeBtnText, type === 'expense' && { color: COLORS.danger }]}>Despesa</Text>
            </TouchableOpacity>
          </View>

          {/* AMOUNT */}
          <View style={styles.amountWrapper}>
            <Text style={styles.currencySymbol}>R$</Text>
            <Input
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholder="0,00"
              error={errors.amount}
              containerStyle={styles.amountInput}
            />
          </View>

          {/* DESCRIPTION */}
          <Input
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            leftIcon="edit-2"
            error={errors.description}
            placeholder="Ex: Aluguel, Supermercado..."
          />

          {/* DATE */}
          <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
            <View pointerEvents="none">
              <Input
                label="Data"
                value={format(date, 'dd/MM/yyyy')}
                leftIcon="calendar"
                editable={false}
              />
            </View>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* TOGGLES / OPTIONS */}
          <View style={styles.optionsWrapper}>
            <View style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <Feather name="check-circle" size={18} color={COLORS.textSecondary} />
                <Text style={styles.optionLabel}>{type === 'income' ? 'Recebido' : 'Pago'}</Text>
              </View>
              <Switch 
                value={new Date(`${format(date, 'yyyy-MM-dd')}T12:00:00`) > new Date() ? false : isPaid} 
                onValueChange={setIsPaid} 
                disabled={new Date(`${format(date, 'yyyy-MM-dd')}T12:00:00`) > new Date()}
                trackColor={{ true: COLORS.success, false: COLORS.border }} 
                thumbColor={COLORS.white} 
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <Feather name="paperclip" size={18} color={COLORS.textSecondary} />
                <Text style={styles.optionLabel}>{type === 'income' ? 'Receita fixa' : 'Despesa fixa'}</Text>
              </View>
              <Switch value={isFixed} onValueChange={setIsFixed} trackColor={{ true: COLORS.primary, false: COLORS.border }} thumbColor={COLORS.white} />
            </View>
            <View style={styles.divider} />
            <View style={styles.optionRow}>
              <View style={styles.optionLeft}>
                <Feather name="repeat" size={18} color={COLORS.textSecondary} />
                <Text style={styles.optionLabel}>Repetir</Text>
              </View>
              <Switch value={isRepeated} onValueChange={setIsRepeated} trackColor={{ true: COLORS.primary, false: COLORS.border }} thumbColor={COLORS.white} />
            </View>
            {isRepeated && (
              <View style={styles.installmentInput}>
                <Input
                  label="Número de Parcelas"
                  value={totalInstallments}
                  onChangeText={setTotalInstallments}
                  keyboardType="numeric"
                  leftIcon="layers"
                  placeholder="Ex: 12"
                />
              </View>
            )}
          </View>

          {/* CATEGORIES */}
          <View style={styles.catHeader}>
            <Text style={styles.catLabel}>Categoria</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile', { screen: 'Categories', params: { openModal: true } })}
              style={styles.addCatBtn}
            >
              <Feather name="plus" size={16} color={COLORS.primary} />
              <Text style={styles.addCatText}>Nova</Text>
            </TouchableOpacity>
          </View>
          {errors.category && <Text style={styles.catError}>{errors.category}</Text>}
          <View style={styles.categories}>
            {availableCategories.map((cat: Category) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catItem,
                    isSelected && { borderColor: cat.color, backgroundColor: cat.color + '20' },
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={cat.icon as any}
                    size={20}
                    color={isSelected ? cat.color : COLORS.textMuted}
                  />
                  <Text style={[styles.catName, isSelected && { color: cat.color }]}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Button
            title={existingTransaction ? 'Atualizar Lançamento' : 'Salvar Lançamento'}
            onPress={handleSave}
            isLoading={isLoading}
            style={styles.saveBtn}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.md,
  },
  backBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xxl },
  typeToggle: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 12, borderRadius: RADIUS.sm,
  },
  typeBtnIncomeActive: { backgroundColor: COLORS.success + '15' },
  typeBtnExpenseActive: { backgroundColor: COLORS.danger + '15' },
  typeBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 14 },
  amountWrapper: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
  currencySymbol: { color: COLORS.textSecondary, fontSize: 22, fontWeight: '700', marginRight: SPACING.sm, marginTop: 12 },
  amountInput: { flex: 1, marginBottom: 0 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  catLabel: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  addCatBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: RADIUS.sm, backgroundColor: COLORS.primary + '15' },
  addCatText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  catError: { color: COLORS.danger, fontSize: 12, marginBottom: SPACING.sm },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  catItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  catName: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  optionsWrapper: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.lg },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionLabel: { color: COLORS.text, fontSize: 15, fontWeight: '500' },
  divider: { height: 1, backgroundColor: COLORS.border },
  installmentInput: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  saveBtn: {},
});
