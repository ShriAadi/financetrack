import { Trash2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { TrashList } from '@/components/TrashList';
import { useTransactionsDB } from '@/hooks/useTransactionsDB';
import { Toaster } from '@/components/ui/toaster';

const TrashPage = () => {
  const { trashedTransactions, isLoading, getStats } = useTransactionsDB();
  const stats = getStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-destructive/20 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50 border-b border-border/50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-destructive/20">
                  <Trash2 className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Trash</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {stats.trashedCount} deleted transaction{stats.trashedCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 md:py-8 space-y-6">
        {/* Info Banner */}
        <div className="glass rounded-xl p-4 border-l-4 border-amber-500">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground text-sm">View-Only Mode</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Deleted transactions are preserved for record keeping and audit purposes. 
                They cannot be edited or permanently removed.
              </p>
            </div>
          </div>
        </div>

        {/* Trash List */}
        <section>
          <TrashList transactions={trashedTransactions} />
        </section>
      </main>

      <Toaster />
    </div>
  );
};

export default TrashPage;
