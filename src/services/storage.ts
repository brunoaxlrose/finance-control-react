import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Transaction } from '../types';
import redis from './redis';

const KEYS = {
  USERS: '@finance:users',
  TRANSACTIONS: '@finance:transactions',
  CURRENT_USER: '@finance:current_user',
  CATEGORIES: '@finance:categories',
};

// ─── USERS ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  try {
    const data = await redis.get<User[]>(KEYS.USERS);
    return data || [];
  } catch (error) {
    console.error('Error getting users from Redis:', error);
    return [];
  }
}

export async function saveUser(user: User): Promise<void> {
  const users = await getUsers();
  const updated = [...users.filter(u => u.id !== user.id), user];
  await redis.set(KEYS.USERS, updated);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

// ─── SESSION ──────────────────────────────────────────────────────────────────

export async function saveCurrentUser(user: User): Promise<void> {
  await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
}

export async function getCurrentUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(KEYS.CURRENT_USER);
  return raw ? JSON.parse(raw) : null;
}

export async function clearCurrentUser(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.CURRENT_USER);
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

export async function getTransactions(userId: string): Promise<Transaction[]> {
  try {
    const data = await redis.get<Transaction[]>(`${KEYS.TRANSACTIONS}:${userId}`);
    return data || [];
  } catch (error) {
    console.error('Error getting transactions from Redis:', error);
    return [];
  }
}

export async function saveTransaction(transaction: Transaction): Promise<void> {
  const list = await getTransactions(transaction.userId);
  const updated = [...list.filter(t => t.id !== transaction.id), transaction];
  await redis.set(`${KEYS.TRANSACTIONS}:${transaction.userId}`, updated);
}

export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
  const list = await getTransactions(userId);
  const updated = list.filter(t => t.id !== transactionId);
  await redis.set(`${KEYS.TRANSACTIONS}:${userId}`, updated);
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

export async function getCategories(userId: string): Promise<Category[]> {
  try {
    const data = await redis.get<Category[]>(`${KEYS.CATEGORIES}:${userId}`);
    return data || [];
  } catch (error) {
    console.error('Error getting categories from Redis:', error);
    return [];
  }
}

export async function saveCategory(userId: string, category: Category): Promise<void> {
  const list = await getCategories(userId);
  const updated = [...list.filter(c => c.id !== category.id), category];
  await redis.set(`${KEYS.CATEGORIES}:${userId}`, updated);
}

export async function deleteCategory(userId: string, categoryId: string): Promise<void> {
  const list = await getCategories(userId);
  const updated = list.filter(c => c.id !== categoryId);
  await redis.set(`${KEYS.CATEGORIES}:${userId}`, updated);
}
