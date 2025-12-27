import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface LocalTransaction {
  id: string;
  date: string;
  personName: string;
  amount: number;
  type: 'received' | 'sent';
  notes: string;
  attachmentName?: string;
  attachmentUrl?: string;
  attachmentType?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
  syncedToCloud: boolean;
  cloudId?: string;
}

interface FinanceDB extends DBSchema {
  transactions: {
    key: string;
    value: LocalTransaction;
    indexes: {
      'by-date': string;
      'by-deleted': number;
      'by-synced': number;
    };
  };
  settings: {
    key: string;
    value: {
      key: string;
      value: any;
    };
  };
}

const DB_NAME = 'finance-tracker-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<FinanceDB> | null = null;

export const getDB = async (): Promise<IDBPDatabase<FinanceDB>> => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<FinanceDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Transactions store
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('by-date', 'date');
        txStore.createIndex('by-deleted', 'isDeleted');
        txStore.createIndex('by-synced', 'syncedToCloud');
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
};

// Transaction operations
export const getAllTransactions = async (): Promise<LocalTransaction[]> => {
  const db = await getDB();
  return db.getAll('transactions');
};

export const getActiveTransactions = async (): Promise<LocalTransaction[]> => {
  const db = await getDB();
  const all = await db.getAll('transactions');
  return all.filter(t => !t.isDeleted).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

export const getTrashedTransactions = async (): Promise<LocalTransaction[]> => {
  const db = await getDB();
  const all = await db.getAll('transactions');
  return all.filter(t => t.isDeleted).sort((a, b) => 
    new Date(b.deletedAt || b.date).getTime() - new Date(a.deletedAt || a.date).getTime()
  );
};

export const getTransaction = async (id: string): Promise<LocalTransaction | undefined> => {
  const db = await getDB();
  return db.get('transactions', id);
};

export const addTransaction = async (transaction: LocalTransaction): Promise<void> => {
  const db = await getDB();
  await db.put('transactions', transaction);
};

export const updateTransaction = async (id: string, updates: Partial<LocalTransaction>): Promise<void> => {
  const db = await getDB();
  const existing = await db.get('transactions', id);
  if (existing) {
    await db.put('transactions', { ...existing, ...updates, updatedAt: new Date().toISOString() });
  }
};

export const softDeleteTransaction = async (id: string): Promise<void> => {
  const db = await getDB();
  const existing = await db.get('transactions', id);
  if (existing) {
    await db.put('transactions', {
      ...existing,
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
};

export const getUnsyncedTransactions = async (): Promise<LocalTransaction[]> => {
  const db = await getDB();
  const all = await db.getAll('transactions');
  return all.filter(t => !t.syncedToCloud);
};

export const markAsSynced = async (id: string, cloudId: string): Promise<void> => {
  const db = await getDB();
  const existing = await db.get('transactions', id);
  if (existing) {
    await db.put('transactions', { ...existing, syncedToCloud: true, cloudId });
  }
};

export const bulkAddTransactions = async (transactions: LocalTransaction[]): Promise<void> => {
  const db = await getDB();
  const tx = db.transaction('transactions', 'readwrite');
  await Promise.all([
    ...transactions.map(t => tx.store.put(t)),
    tx.done,
  ]);
};

// Settings operations
export const getSetting = async <T>(key: string): Promise<T | undefined> => {
  const db = await getDB();
  const setting = await db.get('settings', key);
  return setting?.value as T | undefined;
};

export const setSetting = async (key: string, value: any): Promise<void> => {
  const db = await getDB();
  await db.put('settings', { key, value });
};

export const generateId = (): string => {
  return crypto.randomUUID ? crypto.randomUUID() : 
    Math.random().toString(36).substring(2) + Date.now().toString(36);
};
