'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { UnassignedRecurrencyRequest } from '@/modules/analytics-dashboard/types';

interface UnassignedRecurrencyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  requests: UnassignedRecurrencyRequest[];
}

export function UnassignedRecurrencyModal({ open, onOpenChange, categoryName, requests }: UnassignedRecurrencyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-amber-400">
            Unassigned Recurrency - {categoryName}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-amber-500/20">
                <TableHead className="font-semibold text-foreground/90">Request ID</TableHead>
                <TableHead className="font-semibold text-foreground/90">Raw Recurrency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((item) => (
                <TableRow key={item.requestId} className="border-b border-amber-500/10 hover:bg-amber-500/5">
                  <TableCell className="font-mono text-sm">
                    {item.requestIdLink ? (
                      <a
                        href={item.requestIdLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:text-amber-300 underline decoration-amber-400/30 hover:decoration-amber-300 transition-colors"
                      >
                        {item.requestId}
                      </a>
                    ) : (
                      <span className="text-foreground/80">{item.requestId}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-foreground/70">
                    {item.rawRecurrency}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Total: {requests.length} unassigned request(s)
        </div>
      </DialogContent>
    </Dialog>
  );
}
