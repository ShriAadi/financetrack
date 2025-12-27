import { Wallet2, Plus, Trash2, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  onAddClick: () => void;
  showForm: boolean;
  trashedCount?: number;
}

export const Header = ({ onAddClick, showForm, trashedCount = 0 }: HeaderProps) => {
  const { signOut, user } = useAuth();

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
              <p className="text-xs text-muted-foreground hidden sm:block">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Trash Link */}
            <Link to="/trash">
              <Button variant="ghost" size="icon" className="relative">
                <Trash2 className="w-5 h-5" />
                {trashedCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                    {trashedCount > 9 ? '9+' : trashedCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Sign Out */}
            <Button variant="ghost" size="icon" onClick={signOut} title="Sign out">
              <LogOut className="w-5 h-5" />
            </Button>

            {/* Add Button */}
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
      </div>
    </header>
  );
};
