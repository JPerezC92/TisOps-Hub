'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { UnmappedRequest } from '@/modules/analytics-dashboard/types';

interface UnmappedRequestsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationName: string;
  requests: UnmappedRequest[];
}

export function UnmappedRequestsModal({ open, onOpenChange, applicationName, requests }: UnmappedRequestsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-amber-400">
            Unmapped Requests - {applicationName}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-amber-500/20">
                <TableHead className="font-semibold text-foreground/90">Request ID</TableHead>
                <TableHead className="font-semibold text-foreground/90">Raw Status</TableHead>
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
                    {item.rawStatus}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          Total: {requests.length} unmapped request(s)
        </div>
      </DialogContent>
    </Dialog>
  );
}
