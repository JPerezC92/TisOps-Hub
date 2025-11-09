'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatsGrid } from '@/components/stats-grid';
import { Badge } from '@/components/ui/badge';

interface ErrorLog {
  id: number;
  timestamp: string;
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  endpoint?: string;
  method?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export default function ErrorLogsPage() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [limit, setLimit] = useState(50);

  const fetchErrorLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/error-logs?limit=${limit}`,
        { cache: 'no-store' }
      );
      const data = await response.json();
      setErrorLogs(data);
    } catch (error) {
      console.error('Failed to fetch error logs:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchErrorLogs();
  }, [fetchErrorLogs]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case 'DatabaseError':
        return 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40 hover:bg-jpc-vibrant-orange-500/30';
      case 'ValidationError':
        return 'bg-yellow-500/20 text-yellow-100 border-yellow-500/40 hover:bg-yellow-500/30';
      case 'NotFoundException':
        return 'bg-jpc-vibrant-cyan-500/20 text-jpc-vibrant-cyan-400 border-jpc-vibrant-cyan-500/40 hover:bg-jpc-vibrant-cyan-500/30';
      default:
        return 'bg-jpc-vibrant-purple-500/20 text-jpc-vibrant-purple-400 border-jpc-vibrant-purple-500/40 hover:bg-jpc-vibrant-purple-500/30';
    }
  };

  const getMethodColor = (method?: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-500/20 text-green-100 border-green-500/40 hover:bg-green-500/30';
      case 'POST':
        return 'bg-jpc-vibrant-cyan-500/20 text-jpc-vibrant-cyan-400 border-jpc-vibrant-cyan-500/40 hover:bg-jpc-vibrant-cyan-500/30';
      case 'PATCH':
      case 'PUT':
        return 'bg-yellow-500/20 text-yellow-100 border-yellow-500/40 hover:bg-yellow-500/30';
      case 'DELETE':
        return 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40 hover:bg-jpc-vibrant-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-100 border-gray-500/40 hover:bg-gray-500/30';
    }
  };

  // Prepare stats data for StatsGrid
  const statsData = [
    { label: "TOTAL ERRORS", value: errorLogs.length.toString(), color: 'cyan' as const },
    {
      label: "DATABASE ERRORS",
      value: errorLogs.filter((e) => e.errorType === 'DatabaseError').length.toString(),
      color: 'orange' as const
    },
    {
      label: "LAST 24H",
      value: errorLogs.filter((e) => new Date(e.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000).length.toString(),
      color: 'purple' as const
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Error Logs</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            Monitor and track all system errors and exceptions
          </p>
        </div>

        {/* Statistics */}
        <StatsGrid
          stats={statsData}
          onRefresh={fetchErrorLogs}
          loading={loading}
        />

        {/* Limit Selector */}
        <div className="mb-8 bg-card border border-border/60 rounded-xl p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Records per page:</label>
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
            {loading ? (
              <div className="text-center py-12 text-foreground">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4">Loading error logs...</p>
              </div>
            ) : errorLogs.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border/60 rounded-xl shadow-xl">
                <div className="text-6xl mb-4">✅</div>
                <p className="text-foreground text-lg mb-2 mt-4">No Errors Logged</p>
                <p className="text-muted-foreground/70 text-sm">Your system is running smoothly!</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-jpc-vibrant-orange-500/10 hover:bg-transparent">
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-orange-400 bg-jpc-vibrant-orange-500/5 uppercase tracking-wider text-left py-4 px-6">ID</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-orange-400 bg-jpc-vibrant-orange-500/5 uppercase tracking-wider text-left py-4 px-6">Timestamp</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-orange-400 bg-jpc-vibrant-orange-500/5 uppercase tracking-wider text-left py-4 px-6">Type</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-orange-400 bg-jpc-vibrant-orange-500/5 uppercase tracking-wider text-left py-4 px-6">Method</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-orange-400 bg-jpc-vibrant-orange-500/5 uppercase tracking-wider text-left py-4 px-6">Endpoint</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-orange-400 bg-jpc-vibrant-orange-500/5 uppercase tracking-wider text-left py-4 px-6">Message</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-orange-400 bg-jpc-vibrant-orange-500/5 uppercase tracking-wider text-left py-4 px-6">Actions</th>
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
                        <div className="line-clamp-1 truncate">{error.errorMessage}</div>
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
      </main>

      {/* Error Detail Modal */}
      {selectedError && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedError(null)}
        >
          <div
            className="bg-card border border-jpc-vibrant-orange-500/30 rounded-xl shadow-[0_0_30px_5px] shadow-jpc-vibrant-orange-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-card/80 border-b border-jpc-vibrant-orange-500/30 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground/80">Error Details #{selectedError.id}</h3>
                <p className="text-sm text-muted-foreground/80 mt-1">
                  {formatDate(selectedError.timestamp)}
                </p>
              </div>
              <button
                onClick={() => setSelectedError(null)}
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
                  <div className="text-sm text-muted-foreground/80 mb-2">Error Type</div>
                  <Badge
                    variant="outline"
                    className={`${getErrorTypeColor(selectedError.errorType)} border font-medium transition-all duration-300`}
                  >
                    {selectedError.errorType}
                  </Badge>
                </div>
                {selectedError.method && (
                  <div>
                    <div className="text-sm text-muted-foreground/80 mb-2">Method</div>
                    <Badge
                      variant="outline"
                      className={`${getMethodColor(selectedError.method)} border font-medium transition-all duration-300`}
                    >
                      {selectedError.method}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Endpoint */}
              {selectedError.endpoint && (
                <div>
                  <div className="text-sm font-semibold text-foreground mb-2">Endpoint</div>
                  <div className="bg-background border border-border/60 p-3 rounded font-mono text-sm text-foreground/80">
                    {selectedError.endpoint}
                  </div>
                </div>
              )}

              {/* Error Message */}
              <div>
                <div className="text-sm font-semibold text-foreground mb-2">Error Message</div>
                <div className="bg-jpc-vibrant-orange-500/10 border border-jpc-vibrant-orange-500/50 p-4 rounded text-sm text-jpc-vibrant-orange-400">
                  {selectedError.errorMessage}
                </div>
              </div>

              {/* Stack Trace */}
              {selectedError.stackTrace && (
                <div>
                  <div className="text-sm font-semibold text-foreground mb-2">Stack Trace</div>
                  <div className="bg-black/50 border border-border/60 text-foreground/70 p-4 rounded overflow-x-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {selectedError.stackTrace}
                    </pre>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedError.metadata && (
                <div>
                  <div className="text-sm font-semibold text-foreground mb-2">Request Metadata</div>
                  <div className="bg-background border border-border/60 p-4 rounded overflow-x-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap text-foreground/70">
                      {JSON.stringify(selectedError.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
