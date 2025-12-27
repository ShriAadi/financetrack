import { useState, useEffect, useCallback } from 'react';
import {
  getAllTransactions,
  getActiveTransactions,
  getTrashedTransactions,
  addTransaction as addToDB,
  updateTransaction as updateInDB,
  softDeleteTransaction as softDeleteInDB,
  generateId,
  LocalTransaction,
} from '@/lib/indexedDB';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  date: Date;
  personName: string;
  amount: number;
  type: 'received' | 'sent';
  notes: string;
  attachment?: {
    name: string;
    url: string;
    type: string;
  };
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  syncedToCloud: boolean;
}

export interface TransactionFormData {
  date: Date;
  personName: string;
  amount: number;
  type: 'received' | 'sent';
  notes: string;
  attachment?: File;
}

const mapLocalToTransaction = (local: LocalTransaction): Transaction => ({
  id: local.id,
  date: new Date(local.date),
  personName: local.personName,
  amount: local.amount,
  type: local.type,
  notes: local.notes,
  attachment: local.attachmentName ? {
    name: local.attachmentName,
    url: local.attachmentUrl || '',
    type: local.attachmentType || '',
  } : undefined,
  isDeleted: local.isDeleted,
  deletedAt: local.deletedAt ? new Date(local.deletedAt) : undefined,
  createdAt: new Date(local.createdAt),
  updatedAt: new Date(local.updatedAt),
  syncedToCloud: local.syncedToCloud,
});

export const useLocalTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trashedTransactions, setTrashedTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = useCallback(async () => {
    try {
      const [active, trashed] = await Promise.all([
        getActiveTransactions(),
        getTrashedTransactions(),
      ]);
      setTransactions(active.map(mapLocalToTransaction));
      setTrashedTransactions(trashed.map(mapLocalToTransaction));
    } catch (error: any) {
      toast({
        title: 'Error loading transactions',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(async (data: TransactionFormData): Promise<Transaction | null> => {
    try {
      const now = new Date().toISOString();
      const id = generateId();

      let attachmentUrl: string | undefined;
      if (data.attachment) {
        // Store attachment as base64 for local persistence
        const reader = new FileReader();
        attachmentUrl = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(data.attachment!);
        });
      }

      const localTransaction: LocalTransaction = {
        id,
        date: data.date.toISOString(),
        personName: data.personName,
        amount: data.amount,
        type: data.type,
        notes: data.notes,
        attachmentName: data.attachment?.name,
        attachmentUrl,
        attachmentType: data.attachment?.type,
        isDeleted: false,
        createdAt: now,
        updatedAt: now,
        syncedToCloud: false,
      };

      await addToDB(localTransaction);
      const transaction = mapLocalToTransaction(localTransaction);
      setTransactions(prev => [transaction, ...prev]);

      toast({
        title: 'Transaction added',
        description: `${data.type === 'received' ? 'Income' : 'Expense'} of $${data.amount.toFixed(2)} recorded.`,
      });

      return transaction;
    } catch (error: any) {
      toast({
        title: 'Error adding transaction',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  const updateTransaction = useCallback(async (id: string, data: Partial<TransactionFormData>) => {
    try {
      const updates: Partial<LocalTransaction> = {};
      if (data.date) updates.date = data.date.toISOString();
      if (data.personName) updates.personName = data.personName;
      if (data.amount !== undefined) updates.amount = data.amount;
      if (data.type) updates.type = data.type;
      if (data.notes !== undefined) updates.notes = data.notes;
      if (data.attachment) {
        updates.attachmentName = data.attachment.name;
        updates.attachmentType = data.attachment.type;
        const reader = new FileReader();
        updates.attachmentUrl = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(data.attachment!);
        });
      }
      updates.syncedToCloud = false; // Mark as needing sync

      await updateInDB(id, updates);
      await fetchTransactions();

      toast({
        title: 'Transaction updated',
        description: 'Your changes have been saved.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating transaction',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [fetchTransactions, toast]);

  const softDeleteTransaction = useCallback(async (id: string) => {
    try {
      await softDeleteInDB(id);

      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        const now = new Date();
        const trashedTransaction = {
          ...transaction,
          isDeleted: true,
          deletedAt: now,
          updatedAt: now,
          syncedToCloud: false,
        };
        setTransactions(prev => prev.filter(t => t.id !== id));
        setTrashedTransactions(prev => [trashedTransaction, ...prev]);
      }

      toast({
        title: 'Moved to Trash',
        description: 'Transaction has been moved to trash for record keeping.',
      });
    } catch (error: any) {
      toast({
        title: 'Error deleting transaction',
        description: error.message,
        variant: 'destructive',
      });
    }
  }, [transactions, toast]);

  const getStats = useCallback(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'received')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'sent')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

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
      trashedCount: trashedTransactions.length,
    };
  }, [transactions, trashedTransactions]);

  return {
    transactions,
    trashedTransactions,
    isLoading,
    addTransaction,
    updateTransaction,
    softDeleteTransaction,
    getStats,
    refetch: fetchTransactions,
  };
};
