import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFinance } from '../../contexts/FinanceContext';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../utils/theme';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import Toast from 'react-native-toast-message';

const ICONS = ['coffee', 'shopping-bag', 'home', 'truck', 'briefcase', 'monitor', 'plus-circle', 'heart', 'tool', 'book'];
const COLORS_LIST = ['#FF6B6B', '#6C63FF', '#00D4AA', '#FFD700', '#FF8C42', '#4D96FF', '#6BCB77', '#9D4EDD'];

import { LoadingOverlay } from '../../components/common/LoadingOverlay';

export default function CategoriesScreen({ navigation }: any) {
  const { categories, addCategory, updateCategory, removeCategory } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS_LIST[0]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleAdd() {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Nome da categoria é obrigatório.' });
      return;
    }

    setIsLoading(true);
    try {
      await addCategory({
        name: name.trim(),
        type,
        icon: selectedIcon,
        color: selectedColor,
        isActive: true,
      });
      setName('');
      setShowModal(false);
      Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Categoria adicionada!' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível salvar a categoria.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isLoading} message="Salvando categoria..." />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categorias</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addBtn}>
          <Feather name="plus" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={[styles.categoryCard, item.isActive === false && { opacity: 0.5 }]}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                <Feather name={item.icon as any} size={20} color={COLORS.white} />
              </View>
              <View>
                <Text style={styles.catName}>{item.name}</Text>
                <Text style={styles.catType}>{item.type === 'income' ? 'Receita' : 'Despesa'}</Text>
              </View>
            </View>
            <View style={styles.cardRight}>
              <Switch 
                value={item.isActive !== false} 
                onValueChange={() => updateCategory({ ...item, isActive: !item.isActive })}
                trackColor={{ true: COLORS.primary, false: COLORS.border }}
                thumbColor={COLORS.white}
              />
              <TouchableOpacity onPress={() => removeCategory(item.id)} style={{ marginLeft: SPACING.md }}>
                <Feather name="trash-2" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Categoria</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Input label="Nome" value={name} onChangeText={setName} placeholder="Ex: Academia, Lazer..." />
            
            <Text style={styles.label}>Tipo</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity 
                style={[styles.typeBtn, type === 'expense' && { backgroundColor: COLORS.danger + '20', borderColor: COLORS.danger }]} 
                onPress={() => setType('expense')}
              >
                <Text style={[styles.typeText, type === 'expense' && { color: COLORS.danger }]}>Despesa</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.typeBtn, type === 'income' && { backgroundColor: COLORS.success + '20', borderColor: COLORS.success }]} 
                onPress={() => setType('income')}
              >
                <Text style={[styles.typeText, type === 'income' && { color: COLORS.success }]}>Receita</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Ícone</Text>
            <FlatList
              data={ICONS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={i => i}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => setSelectedIcon(item)}
                  style={[styles.iconSelect, selectedIcon === item && { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' }]}
                >
                  <Feather name={item as any} size={20} color={selectedIcon === item ? COLORS.primary : COLORS.textSecondary} />
                </TouchableOpacity>
              )}
            />

            <Text style={[styles.label, { marginTop: SPACING.md }]}>Cor</Text>
            <View style={styles.colorRow}>
              {COLORS_LIST.map(c => (
                <TouchableOpacity 
                  key={c} 
                  onPress={() => setSelectedColor(c)}
                  style={[styles.colorSelect, { backgroundColor: c }, selectedColor === c && styles.selectedColorCircle]} 
                />
              ))}
            </View>

            <Button title="Salvar Categoria" onPress={handleAdd} style={{ marginTop: SPACING.xl }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: SPACING.lg, paddingTop: 60, paddingBottom: SPACING.md 
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  addBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  list: { padding: SPACING.lg },
  categoryCard: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.sm 
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  iconBox: { width: 44, height: 44, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  catName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  catType: { fontSize: 12, color: COLORS.textSecondary, textTransform: 'uppercase' },
  cardRight: { flexDirection: 'row', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { 
    backgroundColor: COLORS.bgSecondary, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, 
    padding: SPACING.xl, paddingBottom: 60,
    borderWidth: 1, borderColor: COLORS.border, borderBottomWidth: 0
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', marginBottom: SPACING.sm, marginTop: SPACING.md },
  typeRow: { flexDirection: 'row', gap: SPACING.md },
  typeBtn: { flex: 1, height: 44, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center' },
  typeText: { fontWeight: '700', color: COLORS.textSecondary },
  iconSelect: { width: 44, height: 44, borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.sm },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  colorSelect: { width: 34, height: 34, borderRadius: 17 },
  selectedColorCircle: { borderWidth: 3, borderColor: COLORS.bg, elevation: 3, shadowOpacity: 0.3 },
});
