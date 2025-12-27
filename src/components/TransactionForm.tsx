import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Upload, Camera, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TransactionFormData } from '@/hooks/useTransactionsDB';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type TransactionType = 'received' | 'sent';

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  onCancel?: () => void;
}

export const TransactionForm = ({ onSubmit, onCancel }: TransactionFormProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('received');
  const [notes, setNotes] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!personName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter the person or party name",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      date,
      personName: personName.trim(),
      amount: parseFloat(amount),
      type,
      notes: notes.trim(),
      attachment: attachment || undefined,
    });

    // Reset form
    setDate(new Date());
    setPersonName('');
    setAmount('');
    setType('received');
    setNotes('');
    setAttachment(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select a file under 10MB",
          variant: "destructive",
        });
        return;
      }
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-6 shadow-elevated animate-scale-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Add Transaction</h2>
        {onCancel && (
          <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-10",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Type</label>
          <Select value={type} onValueChange={(v) => setType(v as TransactionType)}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="received">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-income" />
                  Received (Income)
                </span>
              </SelectItem>
              <SelectItem value="sent">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-expense" />
                  Sent (Expense)
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Person Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Person / Party Name</label>
          <Input
            placeholder="e.g., John Doe, Amazon"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Amount</label>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-muted-foreground">Notes (Optional)</label>
          <Textarea
            placeholder="Add any additional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="resize-none h-20"
          />
        </div>

        {/* Attachment */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-muted-foreground">Attachment (Optional)</label>
          
          {attachment ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{attachment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(attachment.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={removeAttachment}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              <Button
                type="button"
                variant="outline"
                className="md:hidden"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1 md:flex-none">
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant={type === 'received' ? 'income' : 'expense'}
          className="flex-1"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {type === 'received' ? 'Income' : 'Expense'}
        </Button>
      </div>
    </form>
  );
};
