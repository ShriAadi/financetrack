import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, Trash2, Clock } from 'lucide-react';
import { Transaction } from '@/hooks/useTransactionsDB';

interface TrashListProps {
  transactions: Transaction[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const TrashList = ({ transactions }: TrashListProps) => {
  if (transactions.length === 0) {
    return (
      <div className="glass-strong rounded-2xl p-12 text-center shadow-elevated animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent mb-4">
          <Trash2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Trash is empty</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Deleted transactions will appear here for record keeping and audit purposes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => {
        const isIncome = transaction.type === 'received';
        
        return (
          <div
            key={transaction.id}
            style={{ animationDelay: `${index * 0.05}s` }}
            className="glass rounded-xl p-4 opacity-60 animate-fade-in"
          >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`p-2.5 rounded-xl shrink-0 ${isIncome ? 'bg-income/20' : 'bg-expense/20'}`}>
                {isIncome ? (
                  <ArrowDownLeft className="w-4 h-4 text-income/60" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-expense/60" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground/70 truncate">{transaction.personName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </p>
                    {transaction.notes && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{transaction.notes}</p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`text-lg font-bold ${isIncome ? 'text-income/60' : 'text-expense/60'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      isIncome ? 'bg-income/10 text-income/60' : 'bg-expense/10 text-expense/60'
                    }`}>
                      {isIncome ? 'Received' : 'Sent'}
                    </span>
                  </div>
                </div>

                {/* Deleted Info */}
                {transaction.deletedAt && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Deleted {format(new Date(transaction.deletedAt), 'MMM d, yyyy \'at\' h:mm a')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
