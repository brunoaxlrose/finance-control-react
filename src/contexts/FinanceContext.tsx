import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Transaction, MonthSummary, CATEGORIES } from '../types';
import * as Storage from '../services/storage';
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
    
    // Load transactions
    const data = await Storage.getTransactions(user.id);
    const sorted = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(sorted);

    // Load custom categories if any
    const customCats = await Storage.getCategories(user.id);
    const categoryMap = new Map();
    // Default categories
    CATEGORIES.forEach(c => categoryMap.set(c.id, { ...c, isActive: true }));
    // Custom categories override defaults if ID matches
    if (customCats) {
      customCats.forEach(c => categoryMap.set(c.id, c));
    }
    setCategories(Array.from(categoryMap.values()));

    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  async function addTransaction(data: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) {
    if (!user) return;
    
    const instances = (data.isFixed || data.isRepeated) ? 12 : 1;
    const baseDate = new Date(data.date);

    const baseTimestamp = Date.now();
    for (let i = 0; i < instances; i++) {
      const date = new Date(baseDate);
      date.setMonth(baseDate.getMonth() + i);
      
      const t: Transaction = {
        ...data,
        id: `${baseTimestamp}_${i}`, // Unique ID for each instance
        userId: user.id,
        date: date.toISOString(),
        createdAt: new Date().toISOString(),
        // For future instances of fixed expenses, mark as not paid yet
        isPaid: i === 0 ? data.isPaid : false,
      };
      await Storage.saveTransaction(t);
    }
    
    await refreshTransactions();
  }

  async function updateTransaction(t: Transaction) {
    await Storage.saveTransaction(t);
    await refreshTransactions();
  }

  async function removeTransaction(id: string) {
    if (!user) return;
    await Storage.deleteTransaction(user.id, id);
    await refreshTransactions();
  }

  function getBalance(): number {
    return transactions
      .filter(t => t.isPaid !== false) // Only count if paid/received
      .reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
      }, 0);
  }

  function getMonthSummary(month: number, year: number): MonthSummary {
    const filtered = transactions.filter(t => {
      const d = new Date(t.date);
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
      const d = new Date(t.date);
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
    const newCat: Category = {
      ...data,
      id: Date.now().toString(),
    };
    await Storage.saveCategory(user.id, newCat);
    await refreshTransactions();
  }

  async function updateCategory(cat: Category) {
    if (!user) return;
    await Storage.saveCategory(user.id, cat);
    await refreshTransactions();
  }

  async function removeCategory(id: string) {
    if (!user) return;
    await Storage.deleteCategory(user.id, id);
    await refreshTransactions();
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
