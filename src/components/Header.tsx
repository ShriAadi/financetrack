import { Wallet2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onAddClick: () => void;
  showForm: boolean;
}

export const Header = ({ onAddClick, showForm }: HeaderProps) => {
  return (
    <header className="glass-strong sticky top-0 z-50 border-b border-border/50">
      <div className="container py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-income glow-income">
              <Wallet2 className="w-6 h-6 text-income-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">FinanceTrack</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Personal Finance Manager</p>
            </div>
          </div>

          <Button
            onClick={onAddClick}
            variant={showForm ? "secondary" : "default"}
            size="lg"
            className="gap-2"
          >
            <Plus className={`w-5 h-5 transition-transform ${showForm ? 'rotate-45' : ''}`} />
            <span className="hidden sm:inline">{showForm ? 'Cancel' : 'Add Finance'}</span>
            <span className="sm:hidden">{showForm ? 'Cancel' : 'Add'}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
