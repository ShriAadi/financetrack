import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalTransactions, Transaction, TransactionFormData } from './useLocalTransactions';
import { 
  getUnsyncedTransactions, 
  markAsSynced, 
  bulkAddTransactions,
  getAllTransactions,
  LocalTransaction,
  generateId,
} from '@/lib/indexedDB';
import { useToast } from '@/hooks/use-toast';

export type { Transaction, TransactionFormData } from './useLocalTransactions';

export const useTransactionsUnified = () => {
  const { user } = useAuth();
  const localHook = useLocalTransactions();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasMerged, setHasMerged] = useState(false);

  // Sync local transactions to cloud when user is signed in
  const syncToCloud = useCallback(async () => {
    if (!user || isSyncing) return;

    setIsSyncing(true);
    try {
      const unsynced = await getUnsyncedTransactions();
      
      for (const local of unsynced) {
        const { data, error } = await supabase
          .from('transactions')
          .upsert({
            id: local.cloudId || local.id,
            user_id: user.id,
            date: local.date,
            person_name: local.personName,
            amount: local.amount,
            type: local.type,
            notes: local.notes,
            attachment_name: local.attachmentName,
            attachment_url: local.attachmentUrl,
            attachment_type: local.attachmentType,
            is_deleted: local.isDeleted,
            deleted_at: local.deletedAt,
          })
          .select()
          .single();

        if (!error && data) {
          await markAsSynced(local.id, data.id);
        }
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [user, isSyncing]);

  // Import cloud data to local on first sign-in
  const importFromCloud = useCallback(async () => {
    if (!user) return;

    try {
      const { data: cloudData, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (cloudData && cloudData.length > 0) {
        const localTransactions: LocalTransaction[] = cloudData.map(row => ({
          id: generateId(),
          cloudId: row.id,
          date: row.date,
          personName: row.person_name,
          amount: Number(row.amount),
          type: row.type as 'received' | 'sent',
          notes: row.notes || '',
          attachmentName: row.attachment_name || undefined,
          attachmentUrl: row.attachment_url || undefined,
          attachmentType: row.attachment_type || undefined,
          isDeleted: row.is_deleted,
          deletedAt: row.deleted_at || undefined,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          syncedToCloud: true,
        }));

        await bulkAddTransactions(localTransactions);
        await localHook.refetch();
      }
    } catch (error) {
      console.error('Import error:', error);
    }
  }, [user, localHook]);

  // Merge guest data to cloud account
  const mergeGuestDataToCloud = useCallback(async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const allLocal = await getAllTransactions();
      const unsyncedLocal = allLocal.filter(t => !t.syncedToCloud);

      if (unsyncedLocal.length === 0) {
        setHasMerged(true);
        return true;
      }

      for (const local of unsyncedLocal) {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            date: local.date,
            person_name: local.personName,
            amount: local.amount,
            type: local.type,
            notes: local.notes,
            attachment_name: local.attachmentName,
            attachment_url: local.attachmentUrl,
            attachment_type: local.attachmentType,
            is_deleted: local.isDeleted,
            deleted_at: local.deletedAt,
          })
          .select()
          .single();

        if (!error && data) {
          await markAsSynced(local.id, data.id);
        }
      }

      toast({
        title: 'Data synced',
        description: `${unsyncedLocal.length} transaction(s) have been backed up to your account.`,
      });

      setHasMerged(true);
      await localHook.refetch();
      return true;
    } catch (error: any) {
      toast({
        title: 'Sync failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast, localHook]);

  // Check for unsynced data count
  const getUnsyncedCount = useCallback(async (): Promise<number> => {
    const unsynced = await getUnsyncedTransactions();
    return unsynced.length;
  }, []);

  // Auto-sync when online and user is signed in
  useEffect(() => {
    if (user && navigator.onLine) {
      syncToCloud();
    }
  }, [user, localHook.transactions, syncToCloud]);

  // Listen for online events
  useEffect(() => {
    const handleOnline = () => {
      if (user) {
        syncToCloud();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [user, syncToCloud]);

  return {
    ...localHook,
    isSignedIn: !!user,
    isSyncing,
    hasMerged,
    syncToCloud,
    importFromCloud,
    mergeGuestDataToCloud,
    getUnsyncedCount,
  };
};
