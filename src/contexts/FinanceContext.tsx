import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Transaction, MonthSummary, CATEGORIES, Category } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { format, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinanceContextData {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (t: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  removeTransaction: (id: string) => Promise<void>;
  getBalance: () => number;
  getMonthSummary: (month: number, year: number) => MonthSummary;
  getAllMonthSummaries: () => MonthSummary[];
  refreshTransactions: () => Promise<void>;
  // Categories
  categories: Category[];
  addCategory: (c: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (c: Category) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextData>({} as FinanceContextData);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);

  const refreshTransactions = useCallback(async () => {
    if (!user) { setTransactions([]); return; }
    setIsLoading(true);
    
    try {
      // Load transactions from API
      const rawTransactions = await api.get('/transactions');
      const mappedTransactions = rawTransactions.map((t: any) => ({
        ...t,
        amount: Number(t.amount), // Garante que é um número
        categoryId: t.category_id,
        isPaid: t.is_paid,
        createdAt: t.created_at
      }));
      setTransactions(mappedTransactions);

      // Load categories from API
      const rawCategories = await api.get('/categories');
      const mappedCategories = rawCategories.map((c: any) => ({
        ...c,
        isActive: c.is_active,
        createdAt: c.created_at
      }));

      const categoryMap = new Map();
      
      // Default categories
      CATEGORIES.forEach(c => categoryMap.set(c.id, { ...c, isActive: true }));
      
      // Custom categories override defaults if name/id matches
      if (mappedCategories) {
        mappedCategories.forEach((c: Category) => categoryMap.set(c.id, c));
      }
      setCategories(Array.from(categoryMap.values()));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  async function addTransaction(data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) {
    if (!user) return;
    
    try {
      await api.post('/transactions', {
        ...data,
        categoryId: data.categoryId, // Já vai mapeado do formulário
        isPaid: data.isPaid
      });
      await refreshTransactions();
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  }

  async function updateTransaction(t: Transaction) {
    if (!user) return;
    try {
      await api.put(`/transactions/${t.id}`, {
        amount: t.amount,
        description: t.description,
        categoryId: t.categoryId,
        type: t.type,
        date: t.date,
        isPaid: t.isPaid
      });
      await refreshTransactions();
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
    }
  }

  async function removeTransaction(id: string) {
    if (!user) return;
    try {
      await api.delete(`/transactions/${id}`);
      await refreshTransactions();
    } catch (error) {
      console.error('Erro ao remover transação:', error);
    }
  }

  function getBalance(): number {
    return transactions
      .filter(t => t.isPaid !== false)
      .reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
      }, 0);
  }

  function getMonthSummary(month: number, year: number): MonthSummary {
    const filtered = transactions.filter(t => {
      const d = new Date(`${t.date.substring(0,10)}T12:00:00`);
      return getMonth(d) === month && getYear(d) === year && t.isPaid !== false;
    });
    const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return {
      month: format(new Date(year, month), 'MMMM', { locale: ptBR }),
      year,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }

  function getAllMonthSummaries(): MonthSummary[] {
    if (transactions.length === 0) return [];
    const months = new Set(transactions.map(t => {
      const d = new Date(`${t.date.substring(0,10)}T12:00:00`);
      return `${getYear(d)}-${getMonth(d)}`;
    }));
    return Array.from(months).map(key => {
      const [year, month] = key.split('-').map(Number);
      return getMonthSummary(month, year);
    }).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month > a.month ? 1 : -1;
    });
  }

  async function addCategory(data: Omit<Category, 'id'>) {
    if (!user) return;
    try {
      await api.post('/categories', data);
      await refreshTransactions();
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
    }
  }

  async function updateCategory(cat: Category) {
    if (!user) return;
    try {
      await api.put(`/categories/${cat.id}`, {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type,
        isActive: cat.isActive
      });
      await refreshTransactions();
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
    }
  }

  async function removeCategory(id: string) {
    if (!user) return;
    try {
      await api.delete(`/categories/${id}`);
      await refreshTransactions();
    } catch (error) {
      console.error('Erro ao remover categoria:', error);
    }
  }

  return (
    <FinanceContext.Provider value={{
      transactions, categories, isLoading, addTransaction, updateTransaction,
      removeTransaction, getBalance, getMonthSummary, getAllMonthSummaries,
      refreshTransactions, addCategory, updateCategory, removeCategory
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  return useContext(FinanceContext);
}
