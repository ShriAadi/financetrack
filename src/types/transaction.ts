export type TransactionType = 'received' | 'sent';

export interface Transaction {
  id: string;
  date: Date;
  personName: string;
  amount: number;
  type: TransactionType;
  notes: string;
  attachment?: {
    name: string;
    url: string;
    type: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionFormData {
  date: Date;
  personName: string;
  amount: number;
  type: TransactionType;
  notes: string;
  attachment?: File;
}
