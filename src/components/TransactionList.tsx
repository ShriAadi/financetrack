import { Transaction } from '@/types/transaction';
import { TransactionRow } from './TransactionRow';
import { Receipt } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const TransactionList = ({ transactions, onDelete }: TransactionListProps) => {
  if (transactions.length === 0) {
    return (
      <div className="glass-strong rounded-2xl p-12 text-center shadow-elevated animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
          <Receipt className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No transactions yet</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Start tracking your finances by adding your first transaction using the button above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => (
        <div
          key={transaction.id}
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <TransactionRow transaction={transaction} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
};
