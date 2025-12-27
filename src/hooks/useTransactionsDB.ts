import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
}

export interface TransactionFormData {
  date: Date;
  personName: string;
  amount: number;
  type: 'received' | 'sent';
  notes: string;
  attachment?: File;
}

export const useTransactionsDB = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trashedTransactions, setTrashedTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const mapDbToTransaction = (row: any): Transaction => ({
    id: row.id,
    date: new Date(row.date),
    personName: row.person_name,
    amount: Number(row.amount),
    type: row.type as 'received' | 'sent',
    notes: row.notes || '',
    attachment: row.attachment_name ? {
      name: row.attachment_name,
      url: row.attachment_url,
      type: row.attachment_type,
    } : undefined,
    isDeleted: row.is_deleted,
    deletedAt: row.deleted_at ? new Date(row.deleted_at) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      setTrashedTransactions([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const allTransactions = (data || []).map(mapDbToTransaction);
      setTransactions(allTransactions.filter(t => !t.isDeleted));
      setTrashedTransactions(allTransactions.filter(t => t.isDeleted));
    } catch (error: any) {
      toast({
        title: 'Error loading transactions',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(async (data: TransactionFormData) => {
    if (!user) return null;

    try {
      const { data: newRow, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          date: data.date.toISOString(),
          person_name: data.personName,
          amount: data.amount,
          type: data.type,
          notes: data.notes,
          attachment_name: data.attachment?.name,
          attachment_url: data.attachment ? URL.createObjectURL(data.attachment) : null,
          attachment_type: data.attachment?.type,
        })
        .select()
        .single();

      if (error) throw error;

      const transaction = mapDbToTransaction(newRow);
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
  }, [user, toast]);

  const updateTransaction = useCallback(async (id: string, data: Partial<TransactionFormData>) => {
    if (!user) return;

    try {
      const updateData: any = {};
      if (data.date) updateData.date = data.date.toISOString();
      if (data.personName) updateData.person_name = data.personName;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.type) updateData.type = data.type;
      if (data.notes !== undefined) updateData.notes = data.notes;
      if (data.attachment) {
        updateData.attachment_name = data.attachment.name;
        updateData.attachment_url = URL.createObjectURL(data.attachment);
        updateData.attachment_type = data.attachment.type;
      }

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

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
  }, [user, fetchTransactions, toast]);

  const softDeleteTransaction = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          is_deleted: true, 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

      // Move to trash locally
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        const trashedTransaction = { 
          ...transaction, 
          isDeleted: true, 
          deletedAt: new Date() 
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
  }, [user, transactions, toast]);

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
