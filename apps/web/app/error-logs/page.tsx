'use client';

import { useState, useEffect, useCallback } from 'react';

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
        return 'bg-jpc-orange-500/10 text-jpc-orange-500 border-jpc-orange-500/50';
      case 'ValidationError':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50';
      case 'NotFoundException':
        return 'bg-jpc-400/10 text-jpc-400 border-jpc-400/50';
      default:
        return 'bg-jpc-purple-500/10 text-jpc-purple-500 border-jpc-purple-500/50';
    }
  };

  const getMethodColor = (method?: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-500/10 text-green-500 border-green-500/50';
      case 'POST':
        return 'bg-jpc-400/10 text-jpc-400 border-jpc-400/50';
      case 'PATCH':
      case 'PUT':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/50';
      case 'DELETE':
        return 'bg-jpc-orange-500/10 text-jpc-orange-500 border-jpc-orange-500/50';
      default:
        return 'bg-jpc-gold-500/10 text-jpc-gold-500 border-jpc-gold-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-jpc-bg-900 relative overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 bg-linear-to-br from-jpc-bg-900 via-jpc-bg-500 to-jpc-bg-900 -z-10"></div>
      <div className="fixed inset-0 backdrop-blur-sm bg-jpc-900/10 -z-10"></div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-jpc-gold-500">
            🐛 Error Logs
          </h1>
          <p className="text-jpc-gold-500/70 mt-2">
            Monitor and track all system errors and exceptions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-jpc-400/10 border border-jpc-400/50 rounded-xl p-6 shadow-[0_0_9px_2px] shadow-jpc-400/30">
            <div className="text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider mb-2">Total Errors</div>
            <div className="text-4xl font-bold text-jpc-400">
              {errorLogs.length}
            </div>
          </div>
          <div className="bg-jpc-orange-500/10 border border-jpc-orange-500/50 rounded-xl p-6 shadow-[0_0_9px_2px] shadow-jpc-orange-500/30">
            <div className="text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider mb-2">Database Errors</div>
            <div className="text-4xl font-bold text-jpc-orange-500">
              {errorLogs.filter((e) => e.errorType === 'DatabaseError').length}
            </div>
          </div>
          <div className="bg-jpc-purple-500/10 border border-jpc-purple-500/50 rounded-xl p-6 shadow-[0_0_9px_2px] shadow-jpc-purple-500/30">
            <div className="text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider mb-2">Last 24h</div>
            <div className="text-4xl font-bold text-jpc-purple-500">
              {
                errorLogs.filter(
                  (e) =>
                    new Date(e.timestamp).getTime() >
                    Date.now() - 24 * 60 * 60 * 1000
                ).length
              }
            </div>
          </div>
          <div className="bg-jpc-400/10 border border-jpc-400/50 rounded-xl p-6 shadow-[0_0_9px_2px] shadow-jpc-400/30">
            <div className="text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider mb-2">Showing</div>
            <div className="flex items-center gap-2">
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="text-lg font-bold text-jpc-gold-500 bg-jpc-bg-900 border border-jpc-400/50 rounded px-2 py-1"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
              <span className="text-xs text-jpc-gold-500/70">records</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={fetchErrorLogs}
            disabled={loading}
            className="px-4 py-2 bg-jpc-bg-900 border border-jpc-400/50 text-jpc-400 rounded-lg hover:bg-jpc-400/10 hover:shadow-[0_0_9px_2px] hover:shadow-jpc-400/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
          >
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Error Logs Table */}
        <div className="bg-jpc-bg-900/50 border border-jpc-400/30 rounded-xl shadow-[0_0_9px_2px] shadow-jpc-400/20 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-400 mx-auto mb-4"></div>
              <div className="text-jpc-gold-500/70">Loading errors...</div>
            </div>
          ) : errorLogs.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <div className="text-xl font-semibold text-jpc-gold-500 mb-2">
                No Errors Logged
              </div>
              <div className="text-jpc-gold-500/70">
                Your system is running smoothly!
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-jpc-bg-900/80 border-b border-jpc-400/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-jpc-gold-500/70 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-jpc-gold-500/70 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-jpc-gold-500/70 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-jpc-gold-500/70 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-jpc-gold-500/70 uppercase tracking-wider">
                      Endpoint
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-jpc-gold-500/70 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-jpc-gold-500/70 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-jpc-bg-900/30 divide-y divide-jpc-400/20">
                  {errorLogs.map((error) => (
                    <tr
                      key={error.id}
                      className="hover:bg-jpc-400/10 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-jpc-gold-500">
                        #{error.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-jpc-gold-500/70">
                        {formatDate(error.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded border ${getErrorTypeColor(
                            error.errorType
                          )}`}
                        >
                          {error.errorType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {error.method && (
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded border ${getMethodColor(
                              error.method
                            )}`}
                          >
                            {error.method}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-jpc-gold-500/70 max-w-xs truncate">
                        {error.endpoint || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-jpc-gold-500 max-w-md">
                        <div className="line-clamp-2">{error.errorMessage}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedError(error)}
                          className="text-jpc-400 hover:text-jpc-400/80 font-medium transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Error Detail Modal */}
      {selectedError && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedError(null)}
        >
          <div
            className="bg-jpc-bg-900 border border-jpc-400/50 rounded-xl shadow-[0_0_20px_4px] shadow-jpc-400/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-jpc-bg-900/95 backdrop-blur-sm border-b border-jpc-400/30 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-jpc-gold-500 mb-2">
                  Error Details #{selectedError.id}
                </h2>
                <p className="text-sm text-jpc-gold-500/70">
                  {formatDate(selectedError.timestamp)}
                </p>
              </div>
              <button
                onClick={() => setSelectedError(null)}
                className="text-jpc-gold-500/50 hover:text-jpc-400 text-2xl leading-none transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Error Type and Method */}
              <div className="flex gap-4">
                <div>
                  <div className="text-sm text-jpc-gold-500/70 mb-1">Error Type</div>
                  <span
                    className={`inline-block px-3 py-1 text-sm font-semibold rounded border ${getErrorTypeColor(
                      selectedError.errorType
                    )}`}
                  >
                    {selectedError.errorType}
                  </span>
                </div>
                {selectedError.method && (
                  <div>
                    <div className="text-sm text-jpc-gold-500/70 mb-1">Method</div>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-semibold rounded border ${getMethodColor(
                        selectedError.method
                      )}`}
                    >
                      {selectedError.method}
                    </span>
                  </div>
                )}
              </div>

              {/* Endpoint */}
              {selectedError.endpoint && (
                <div>
                  <div className="text-sm font-semibold text-jpc-gold-500 mb-1">
                    Endpoint
                  </div>
                  <div className="bg-jpc-bg-900/50 border border-jpc-400/30 p-3 rounded font-mono text-sm text-jpc-gold-500/70">
                    {selectedError.endpoint}
                  </div>
                </div>
              )}

              {/* Error Message */}
              <div>
                <div className="text-sm font-semibold text-jpc-gold-500 mb-1">
                  Error Message
                </div>
                <div className="bg-jpc-orange-500/10 border border-jpc-orange-500/50 p-4 rounded text-sm text-jpc-orange-500">
                  {selectedError.errorMessage}
                </div>
              </div>

              {/* Stack Trace */}
              {selectedError.stackTrace && (
                <div>
                  <div className="text-sm font-semibold text-jpc-gold-500 mb-1">
                    Stack Trace
                  </div>
                  <div className="bg-black/50 border border-jpc-400/30 text-jpc-gold-500/70 p-4 rounded overflow-x-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {selectedError.stackTrace}
                    </pre>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedError.metadata && (
                <div>
                  <div className="text-sm font-semibold text-jpc-gold-500 mb-1">
                    Request Metadata
                  </div>
                  <div className="bg-jpc-bg-900/50 border border-jpc-400/30 p-4 rounded overflow-x-auto">
                    <pre className="text-xs font-mono whitespace-pre-wrap text-jpc-gold-500/70">
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
