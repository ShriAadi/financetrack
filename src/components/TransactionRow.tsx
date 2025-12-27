import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, Paperclip, Trash2, ExternalLink } from 'lucide-react';
import { Transaction } from '@/types/transaction';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TransactionRowProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const TransactionRow = ({ transaction, onDelete }: TransactionRowProps) => {
  const isIncome = transaction.type === 'received';

  return (
    <div className="glass rounded-xl p-4 hover:bg-accent/30 transition-all duration-200 animate-fade-in group">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`p-2.5 rounded-xl shrink-0 ${isIncome ? 'gradient-income' : 'gradient-expense'}`}>
          {isIncome ? (
            <ArrowDownLeft className="w-4 h-4 text-income-foreground" />
          ) : (
            <ArrowUpRight className="w-4 h-4 text-expense-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">{transaction.personName}</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(transaction.date), 'MMM d, yyyy')}
              </p>
              {transaction.notes && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{transaction.notes}</p>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className={`text-lg font-bold ${isIncome ? 'text-income' : 'text-expense'}`}>
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
              </p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                isIncome ? 'bg-income/20 text-income' : 'bg-expense/20 text-expense'
              }`}>
                {isIncome ? 'Received' : 'Sent'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {transaction.attachment && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => window.open(transaction.attachment?.url, '_blank')}
              >
                <Paperclip className="w-3 h-3 mr-1" />
                {transaction.attachment.name.length > 15
                  ? transaction.attachment.name.substring(0, 15) + '...'
                  : transaction.attachment.name}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive hover:text-destructive">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this transaction? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(transaction.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
};
