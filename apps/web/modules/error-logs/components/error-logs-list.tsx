'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  formatDate,
  getErrorTypeColor,
  getMethodColor,
} from '@/lib/utils/error-logs';
import { useErrorLogs } from '../hooks/use-error-logs';
import type { ErrorLog } from '@repo/reports/frontend';
import { ErrorLogDetailModal } from './error-log-detail-modal';

export function ErrorLogsList() {
  const [limit, setLimit] = useState(50);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const { data, isLoading } = useErrorLogs(limit);
  const errorLogs = data?.logs ?? [];

  return (
    <>
      {/* Limit Selector */}
      <div className="mb-8 bg-card border border-border/60 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            Records per page:
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>
      </div>

      {/* Error Logs Table */}
      <div className="rounded-2xl border border-jpc-vibrant-orange-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-orange-500/10 backdrop-blur-sm hover:border-jpc-vibrant-orange-500/30 transition-all duration-300">
        <div className="px-6 py-6 border-b border-jpc-vibrant-orange-500/20 bg-gradient-to-r from-jpc-vibrant-orange-500/10 to-jpc-vibrant-purple-500/5">
          <h3 className="text-sm font-bold text-foreground">
            Error Log Entries
            <span className="ml-3 text-xs font-normal text-muted-foreground/70">
              Showing {errorLogs.length} errors
            </span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-foreground">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4">Loading error logs...</p>
            </div>
          ) : errorLogs.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border/60 rounded-xl shadow-xl">
              <div className="text-6xl mb-4">✅</div>
              <p className="text-foreground text-lg mb-2 mt-4">
                No Errors Logged
              </p>
              <p className="text-muted-foreground/70 text-sm">
                Your system is running smoothly!
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-jpc-vibrant-orange-500/10 hover:bg-transparent">
                  <th className="h-12 text-xs font-bold text-jpc-vibrant-orange-400 bg-jpc-vibrant-orange-500/5 uppercase tracking-wider text-left py-4 px-6">
                    ID
                  </th>
                  <th className="h-12 text-xs font-bold text-jpc-vibrant-orange-400 bg-jpc-vibrant-orange-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Timestamp
                  </th>
                  <th className="h-12 text-xs font-bold text-jpc-vibrant-orange-400 bg-jpc-vibrant-orange-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Type
                  </th>
                  <th className="h-12 text-xs font-bold text-jpc-vibrant-orange-400 bg-jpc-vibrant-orange-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Method
                  </th>
                  <th className="h-12 text-xs font-bold text-jpc-vibrant-orange-400 bg-jpc-vibrant-orange-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Endpoint
                  </th>
                  <th className="h-12 text-xs font-bold text-jpc-vibrant-orange-400 bg-jpc-vibrant-orange-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Message
                  </th>
                  <th className="h-12 text-xs font-bold text-jpc-vibrant-orange-400 bg-jpc-vibrant-orange-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {errorLogs.map((error) => (
                  <tr
                    key={error.id}
                    className="border-b border-jpc-vibrant-orange-500/10 hover:bg-jpc-vibrant-orange-500/10 transition-all duration-300 group"
                  >
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-jpc-vibrant-orange-400 transition-colors font-medium">
                      #{error.id}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground/80 whitespace-nowrap">
                      {formatDate(error.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${getErrorTypeColor(error.errorType)} border font-medium transition-all duration-300`}
                      >
                        {error.errorType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {error.method && (
                        <Badge
                          variant="outline"
                          className={`${getMethodColor(error.method)} border font-medium transition-all duration-300`}
                        >
                          {error.method}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground/80 max-w-[200px] truncate">
                      {error.endpoint || '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/80 max-w-[300px]">
                      <div className="line-clamp-1 truncate">
                        {error.errorMessage}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedError(error)}
                        className="text-jpc-vibrant-cyan-400 hover:text-jpc-vibrant-cyan-400/80 font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Error Detail Modal */}
      <ErrorLogDetailModal
        error={selectedError}
        onClose={() => setSelectedError(null)}
      />
    </>
  );
}
