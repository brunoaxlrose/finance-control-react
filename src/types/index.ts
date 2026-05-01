export type TransactionType = 'income' | 'expense';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  ts_cancelamento?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType | 'both';
  color: string;
  isActive?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  categoryId: string;
  date: string;
  createdAt: string;
  isPaid?: boolean;
  isFixed?: boolean;
  isRepeated?: boolean;
}

export interface MonthSummary {
  month: string;
  year: number;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const CATEGORIES: Category[] = [
  { id: 'salary',       name: 'Salário',        icon: 'briefcase',      type: 'income',   color: '#00D4AA' },
  { id: 'freelance',    name: 'Freelance',       icon: 'monitor',         type: 'income',   color: '#6C63FF' },
  { id: 'investment',   name: 'Investimentos',   icon: 'trending-up',    type: 'income',   color: '#FFD700' },
  { id: 'other-income', name: 'Outras Receitas', icon: 'plus-circle',    type: 'income',   color: '#4CAF50' },
  { id: 'food',         name: 'Alimentação',     icon: 'coffee',         type: 'expense',  color: '#FF6B6B' },
  { id: 'transport',    name: 'Transporte',      icon: 'truck',          type: 'expense',  color: '#FF9F43' },
  { id: 'health',       name: 'Saúde',           icon: 'heart',          type: 'expense',  color: '#EE5A24' },
  { id: 'leisure',      name: 'Lazer',           icon: 'film',           type: 'expense',  color: '#A29BFE' },
  { id: 'education',    name: 'Educação',        icon: 'book',           type: 'expense',  color: '#74B9FF' },
  { id: 'housing',      name: 'Moradia',         icon: 'home',           type: 'expense',  color: '#FD79A8' },
  { id: 'shopping',     name: 'Compras',         icon: 'shopping-bag',   type: 'expense',  color: '#FDCB6E' },
  { id: 'other-exp',    name: 'Outros Gastos',   icon: 'more-horizontal', type: 'expense', color: '#B2BEC3' },
];
