import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NameDialogProps {
  open: boolean;
  mode: 'text' | 'voice';
  inviterName?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => void;
}

const NameDialog = ({ open, mode, inviterName, onOpenChange, onSubmit }: NameDialogProps) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (open) setName('');
  }, [open]);

  const trimmed = name.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (trimmed) onSubmit(trimmed);
          }}
          className="space-y-6"
        >
          <DialogHeader>
            <p className="eyebrow">{mode === 'voice' ? 'Voice assessment' : 'Written assessment'}</p>
            <DialogTitle className="font-display text-3xl font-semibold">Before we begin</DialogTitle>
            <DialogDescription className="leading-relaxed">
              {inviterName
                ? `${inviterName} has already answered. Their responses stay hidden until you finish yours.`
                : 'Your name appears on the invite you send your partner and on your joint report.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="partner-name">Your first name</Label>
            <Input
              id="partner-name"
              autoFocus
              autoComplete="given-name"
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aisha"
              className="h-11"
            />
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Answer honestly rather than how you think your partner would like. Plan for about 15 to 20 minutes; your
            progress is saved on this device.
          </p>

          <DialogFooter>
            <Button type="submit" size="lg" disabled={!trimmed} className="w-full sm:w-auto">
              Begin assessment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NameDialog;
