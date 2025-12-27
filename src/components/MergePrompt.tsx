import { Cloud, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MergePromptProps {
  onMerge: () => void;
  onDismiss: () => void;
}

export const MergePrompt = ({ onMerge, onDismiss }: MergePromptProps) => {
  return (
    <div className="glass rounded-xl p-4 border-l-4 border-primary animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/20 shrink-0">
          <Cloud className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-sm">Backup Your Data</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You have local transactions that aren't backed up yet. 
            Would you like to sync them to your account?
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" onClick={onMerge} className="gap-2">
              <Upload className="w-4 h-4" />
              Backup Now
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Later
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 -mt-1 -mr-1"
          onClick={onDismiss}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
