'use client';

import { Badge } from '@/components/ui/badge';
import {
  formatDate,
  getErrorTypeColor,
  getMethodColor,
} from '@/lib/utils/error-logs';
import type { ErrorLog } from '@repo/reports/frontend';

interface ErrorLogDetailModalProps {
  error: ErrorLog | null;
  onClose: () => void;
}

export function ErrorLogDetailModal({
  error,
  onClose,
}: ErrorLogDetailModalProps) {
  if (!error) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-jpc-vibrant-orange-500/30 rounded-xl shadow-[0_0_30px_5px] shadow-jpc-vibrant-orange-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-card/80 border-b border-jpc-vibrant-orange-500/30 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground/80">
              Error Details #{error.id}
            </h3>
            <p className="text-sm text-muted-foreground/80 mt-1">
              {formatDate(error.timestamp)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground/80 hover:text-orange-300 text-2xl leading-none transition-colors"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
          {/* Error Type and Method */}
          <div className="flex gap-4">
            <div>
              <div className="text-sm text-muted-foreground/80 mb-2">
                Error Type
              </div>
              <Badge
                variant="outline"
                className={`${getErrorTypeColor(error.errorType)} border font-medium transition-all duration-300`}
              >
                {error.errorType}
              </Badge>
            </div>
            {error.method && (
              <div>
                <div className="text-sm text-muted-foreground/80 mb-2">
                  Method
                </div>
                <Badge
                  variant="outline"
                  className={`${getMethodColor(error.method)} border font-medium transition-all duration-300`}
                >
                  {error.method}
                </Badge>
              </div>
            )}
          </div>

          {/* Endpoint */}
          {error.endpoint && (
            <div>
              <div className="text-sm font-semibold text-foreground mb-2">
                Endpoint
              </div>
              <div className="bg-background border border-border/60 p-3 rounded font-mono text-sm text-foreground/80">
                {error.endpoint}
              </div>
            </div>
          )}

          {/* Error Message */}
          <div>
            <div className="text-sm font-semibold text-foreground mb-2">
              Error Message
            </div>
            <div className="bg-jpc-vibrant-orange-500/10 border border-jpc-vibrant-orange-500/50 p-4 rounded text-sm text-jpc-vibrant-orange-400">
              {error.errorMessage}
            </div>
          </div>

          {/* Stack Trace */}
          {error.stackTrace && (
            <div>
              <div className="text-sm font-semibold text-foreground mb-2">
                Stack Trace
              </div>
              <div className="bg-black/50 border border-border/60 text-foreground/70 p-4 rounded overflow-x-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {error.stackTrace}
                </pre>
              </div>
            </div>
          )}

          {/* Metadata */}
          {error.metadata && (
            <div>
              <div className="text-sm font-semibold text-foreground mb-2">
                Request Metadata
              </div>
              <div className="bg-background border border-border/60 p-4 rounded overflow-x-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap text-foreground/70">
                  {JSON.stringify(error.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
