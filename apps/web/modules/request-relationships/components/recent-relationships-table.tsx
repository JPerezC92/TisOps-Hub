'use client';

import { Badge } from '@/components/ui/badge';
import type { ParentChildRequest } from '../services/request-relationships.service';

interface RecentRelationshipsTableProps {
  relationships: ParentChildRequest[];
  total: number;
  loading: boolean;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function RecentRelationshipsTable({
  relationships,
  total,
  loading,
}: RecentRelationshipsTableProps) {
  return (
    <div className="rounded-2xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-cyan-500/10 backdrop-blur-sm hover:border-jpc-vibrant-cyan-500/30 transition-all duration-300">
      <div className="px-6 py-6 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5">
        <h3 className="text-sm font-bold text-foreground">
          Recent Relationships
          <span className="ml-3 text-xs font-normal text-muted-foreground/70">
            Showing {Math.min(100, relationships.length)} of {formatNumber(total)}{' '}
            total
          </span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-12 text-foreground">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4">Loading relationships...</p>
          </div>
        ) : relationships.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border/60 rounded-xl shadow-xl">
            <svg
              className="mx-auto h-12 w-12 text-muted-foreground/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <p className="text-foreground text-lg mb-2 mt-4">No data available</p>
            <p className="text-muted-foreground/70 text-sm">
              Upload a file to get started
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-transparent">
                <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-center py-4 px-2 w-16">
                  ID
                </th>
                <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                  Child Request ID
                </th>
                <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                  Parent Request ID
                </th>
              </tr>
            </thead>
            <tbody>
              {relationships.map((rel) => (
                <tr
                  key={rel.id}
                  className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group"
                >
                  <td className="py-4 px-2 text-center text-jpc-vibrant-cyan-400/70 font-mono text-xs font-medium">
                    {rel.id}
                  </td>
                  <td className="px-6 py-4">
                    {rel.requestIdLink ? (
                      <a
                        href={rel.requestIdLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline"
                      >
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs bg-jpc-vibrant-cyan-500/15 text-jpc-vibrant-cyan-400 border border-jpc-vibrant-cyan-500/30 group-hover:bg-jpc-vibrant-cyan-500/25 transition-all duration-300 inline-flex items-center gap-1"
                        >
                          {rel.requestId}
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </Badge>
                      </a>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs bg-jpc-vibrant-cyan-500/15 text-jpc-vibrant-cyan-400 border border-jpc-vibrant-cyan-500/30 group-hover:bg-jpc-vibrant-cyan-500/25 transition-all duration-300"
                      >
                        {rel.requestId}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {rel.linkedRequestIdLink ? (
                      <a
                        href={rel.linkedRequestIdLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="no-underline"
                      >
                        <Badge
                          variant="secondary"
                          className="font-mono text-xs bg-jpc-vibrant-orange-500/15 text-jpc-vibrant-orange-400 border border-jpc-vibrant-orange-500/30 group-hover:bg-jpc-vibrant-orange-500/25 transition-all duration-300 inline-flex items-center gap-1"
                        >
                          {rel.linkedRequestId}
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </Badge>
                      </a>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs bg-jpc-vibrant-orange-500/15 text-jpc-vibrant-orange-400 border border-jpc-vibrant-orange-500/30 group-hover:bg-jpc-vibrant-orange-500/25 transition-all duration-300"
                      >
                        {rel.linkedRequestId}
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
