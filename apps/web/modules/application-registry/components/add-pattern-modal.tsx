'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface AddPatternModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationName: string;
  onSubmit: (data: { pattern: string; priority: number }) => void;
  isPending: boolean;
}

export function AddPatternModal({
  open,
  onOpenChange,
  applicationName,
  onSubmit,
  isPending,
}: AddPatternModalProps) {
  const [pattern, setPattern] = useState('');
  const [priority, setPriority] = useState(100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ pattern, priority });
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setPattern('');
      setPriority(100);
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Pattern</DialogTitle>
          <DialogDescription>
            Adding pattern to: <span className="font-semibold text-cyan-100">{applicationName}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Pattern <span className="text-red-400">*</span>
            </label>
            <Input
              type="text"
              required
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g., Somos Belcorp"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground/60 mt-1">
              This pattern will be matched using case-insensitive contains logic
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Priority <span className="text-red-400">*</span>
            </label>
            <Input
              type="number"
              required
              min="1"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
              placeholder="100"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground/60 mt-1">Lower number = higher priority</p>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => handleOpenChange(false)}
              variant="outline"
              className="flex-1 border-border/60 text-foreground hover:bg-background/80"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-jpc-vibrant-purple-500/20 text-purple-100 hover:bg-jpc-vibrant-purple-500/30 border border-jpc-vibrant-purple-500/40"
            >
              {isPending ? 'Adding...' : 'Add Pattern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
