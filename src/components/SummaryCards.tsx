import { ArrowDownLeft, ArrowUpRight, Wallet, TrendingUp } from 'lucide-react';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const SummaryCards = ({ totalIncome, totalExpense, balance, transactionCount }: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {/* Balance Card */}
      <div className="glass-strong rounded-2xl p-5 md:p-6 shadow-elevated animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Balance</span>
        </div>
        <div className="space-y-1">
          <p className={`text-2xl md:text-3xl font-bold ${balance >= 0 ? 'text-primary' : 'text-expense'}`}>
            {formatCurrency(balance)}
          </p>
          <p className="text-sm text-muted-foreground">{transactionCount} transactions</p>
        </div>
      </div>

      {/* Income Card */}
      <div className="glass-strong rounded-2xl p-5 md:p-6 shadow-elevated animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl gradient-income">
            <ArrowDownLeft className="w-5 h-5 text-income-foreground" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Income</span>
        </div>
        <div className="space-y-1">
          <p className="text-2xl md:text-3xl font-bold text-income">
            {formatCurrency(totalIncome)}
          </p>
          <p className="text-sm text-muted-foreground">Total received</p>
        </div>
      </div>

      {/* Expense Card */}
      <div className="glass-strong rounded-2xl p-5 md:p-6 shadow-elevated animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl gradient-expense">
            <ArrowUpRight className="w-5 h-5 text-expense-foreground" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Expenses</span>
        </div>
        <div className="space-y-1">
          <p className="text-2xl md:text-3xl font-bold text-expense">
            {formatCurrency(totalExpense)}
          </p>
          <p className="text-sm text-muted-foreground">Total sent</p>
        </div>
      </div>

      {/* Savings Rate Card */}
      <div className="glass-strong rounded-2xl p-5 md:p-6 shadow-elevated animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-accent">
            <TrendingUp className="w-5 h-5 text-foreground" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Savings</span>
        </div>
        <div className="space-y-1">
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            {totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}%
          </p>
          <p className="text-sm text-muted-foreground">Savings rate</p>
        </div>
      </div>
    </div>
  );
};
