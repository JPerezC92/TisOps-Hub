'use client';

import { Badge } from '@/components/ui/badge';

interface TopParent {
  parentId: string;
  childCount: number;
  link: string | null;
}

interface TopParentsTableProps {
  topParents: TopParent[];
}

export function TopParentsTable({ topParents }: TopParentsTableProps) {
  return (
    <div className="rounded-2xl border border-jpc-vibrant-purple-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-purple-500/10 backdrop-blur-sm hover:border-jpc-vibrant-purple-500/30 transition-all duration-300 mb-8">
      <div className="px-6 py-6 border-b border-jpc-vibrant-purple-500/20 bg-gradient-to-r from-jpc-vibrant-purple-500/10 to-jpc-vibrant-cyan-500/5">
        <h3 className="text-sm font-bold text-foreground">
          Top 10 Parent Requests
          <span className="ml-3 text-xs font-normal text-muted-foreground/70">
            Parent requests with the most child relationships
          </span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-jpc-vibrant-purple-500/10 hover:bg-transparent">
              <th className="h-12 text-xs font-bold text-jpc-vibrant-purple-400 bg-jpc-vibrant-purple-500/5 uppercase tracking-wider text-left py-4 px-6">
                Rank
              </th>
              <th className="h-12 text-xs font-bold text-jpc-vibrant-purple-400 bg-jpc-vibrant-purple-500/5 uppercase tracking-wider text-left py-4 px-6">
                Parent Request ID
              </th>
              <th className="h-12 text-xs font-bold text-jpc-vibrant-purple-400 bg-jpc-vibrant-purple-500/5 uppercase tracking-wider text-left py-4 px-6">
                Child Count
              </th>
            </tr>
          </thead>
          <tbody>
            {topParents.map((parent, index) => (
              <tr
                key={parent.parentId}
                className="border-b border-jpc-vibrant-purple-500/10 hover:bg-jpc-vibrant-purple-500/10 transition-all duration-300 group"
              >
                <td className="px-6 py-4 text-xs text-muted-foreground/80">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  {parent.link ? (
                    <a
                      href={parent.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline"
                    >
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs bg-jpc-vibrant-purple-500/15 text-jpc-vibrant-purple-400 border border-jpc-vibrant-purple-500/30 group-hover:bg-jpc-vibrant-purple-500/25 transition-all duration-300 inline-flex items-center gap-1"
                      >
                        {parent.parentId}
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
                      className="font-mono text-xs bg-jpc-vibrant-purple-500/15 text-jpc-vibrant-purple-400 border border-jpc-vibrant-purple-500/30 group-hover:bg-jpc-vibrant-purple-500/25 transition-all duration-300"
                    >
                      {parent.parentId}
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-foreground/80 group-hover:text-jpc-vibrant-purple-400 transition-colors">
                    {parent.childCount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
