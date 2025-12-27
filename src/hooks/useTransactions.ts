import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionFormData } from '@/types/transaction';

const STORAGE_KEY = 'finance-transactions';

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

const serializeTransactions = (transactions: Transaction[]): string => {
  return JSON.stringify(transactions.map(t => ({
    ...t,
    date: t.date.toISOString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  })));
};

const deserializeTransactions = (data: string): Transaction[] => {
  try {
    const parsed = JSON.parse(data);
    return parsed.map((t: any) => ({
      ...t,
      date: new Date(t.date),
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));
  } catch {
    return [];
  }
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load transactions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTransactions(deserializeTransactions(stored));
    }
    setIsLoading(false);
  }, []);

  // Save transactions to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, serializeTransactions(transactions));
    }
  }, [transactions, isLoading]);

  const addTransaction = useCallback((data: TransactionFormData) => {
    const now = new Date();
    const newTransaction: Transaction = {
      id: generateId(),
      date: data.date,
      personName: data.personName,
      amount: data.amount,
      type: data.type,
      notes: data.notes,
      attachment: data.attachment ? {
        name: data.attachment.name,
        url: URL.createObjectURL(data.attachment),
        type: data.attachment.type,
      } : undefined,
      createdAt: now,
      updatedAt: now,
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  }, []);

  const updateTransaction = useCallback((id: string, data: Partial<TransactionFormData>) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          ...data,
          attachment: data.attachment ? {
            name: data.attachment.name,
            url: URL.createObjectURL(data.attachment),
            type: data.attachment.type,
          } : t.attachment,
          updatedAt: new Date(),
        };
      }
      return t;
    }));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const getStats = useCallback(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'received')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'sent')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;

    // Get today's transactions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTransactions = transactions.filter(t => {
      const transDate = new Date(t.date);
      transDate.setHours(0, 0, 0, 0);
      return transDate.getTime() === today.getTime();
    });

    const dailyIncome = todayTransactions
      .filter(t => t.type === 'received')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const dailyExpense = todayTransactions
      .filter(t => t.type === 'sent')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance,
      dailyIncome,
      dailyExpense,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  return {
    transactions,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getStats,
  };
};
