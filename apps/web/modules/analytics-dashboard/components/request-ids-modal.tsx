'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { RequestIdWithLink } from '@/modules/analytics-dashboard/types';

interface RequestIdsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  requestIds: RequestIdWithLink[];
}

export function RequestIdsModal({ open, onOpenChange, title, requestIds }: RequestIdsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Request IDs - {title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 max-h-[400px] overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {requestIds.map((item) => (
              <span
                key={item.requestId}
                className="px-2 py-1 rounded-md bg-muted/50 text-sm font-mono"
              >
                {item.requestIdLink ? (
                  <a
                    href={item.requestIdLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-jpc-vibrant-cyan-500 hover:text-jpc-vibrant-cyan-400 underline decoration-jpc-vibrant-cyan-500/30 hover:decoration-jpc-vibrant-cyan-400 transition-colors"
                  >
                    {item.requestId}
                  </a>
                ) : (
                  <span>{item.requestId}</span>
                )}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Total: {requestIds.length} request(s)
        </div>
      </DialogContent>
    </Dialog>
  );
}
