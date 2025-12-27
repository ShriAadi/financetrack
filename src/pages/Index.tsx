import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { SummaryCards } from '@/components/SummaryCards';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { useTransactionsUnified, TransactionFormData } from '@/hooks/useTransactionsUnified';
import { MergePrompt } from '@/components/MergePrompt';
import { Toaster } from '@/components/ui/toaster';

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const [showMergePrompt, setShowMergePrompt] = useState(false);
  const { 
    transactions, 
    softDeleteTransaction, 
    addTransaction, 
    getStats, 
    isLoading,
    isSignedIn,
    mergeGuestDataToCloud,
    getUnsyncedCount,
  } = useTransactionsUnified();
  const stats = getStats();

  // Check if we need to show merge prompt after sign in
  useEffect(() => {
    if (isSignedIn) {
      getUnsyncedCount().then(count => {
        if (count > 0) {
          setShowMergePrompt(true);
        }
      });
    }
  }, [isSignedIn, getUnsyncedCount]);

  const handleAddTransaction = async (data: TransactionFormData) => {
    await addTransaction(data);
    setShowForm(false);
  };

  const handleMerge = async () => {
    const success = await mergeGuestDataToCloud();
    if (success) {
      setShowMergePrompt(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl gradient-income animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onAddClick={() => setShowForm(!showForm)} 
        showForm={showForm} 
        trashedCount={stats.trashedCount}
      />

      <main className="container py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Merge Prompt */}
        {showMergePrompt && (
          <MergePrompt
            onMerge={handleMerge}
            onDismiss={() => setShowMergePrompt(false)}
          />
        )}

        {/* Summary Cards */}
        <section>
          <SummaryCards
            totalIncome={stats.totalIncome}
            totalExpense={stats.totalExpense}
            balance={stats.balance}
            transactionCount={stats.transactionCount}
          />
        </section>

        {/* Add Transaction Form */}
        {showForm && (
          <section>
            <TransactionForm
              onSubmit={handleAddTransaction}
              onCancel={() => setShowForm(false)}
            />
          </section>
        )}

        {/* Transactions List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
            <span className="text-sm text-muted-foreground">{transactions.length} total</span>
          </div>
          <TransactionList
            transactions={transactions}
            onDelete={softDeleteTransaction}
          />
        </section>
      </main>

      <Toaster />
    </div>
  );
};

export default Index;
