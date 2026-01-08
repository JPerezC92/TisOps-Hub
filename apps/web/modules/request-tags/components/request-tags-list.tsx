'use client';

import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useRequestTags } from '@/modules/request-tags/hooks/use-request-tags';
import { useRequestTagsFilters } from '@/modules/request-tags/hooks/use-request-tags-filters';
import { usePagination } from '@/shared/hooks/use-pagination';

export function RequestTagsList() {
  const { data, isLoading } = useRequestTags();
  const tags = data?.tags ?? [];

  const {
    searchTerm,
    setSearchTerm,
    filterModule,
    setFilterModule,
    filterCategorizacion,
    setFilterCategorizacion,
    filteredTags,
    uniqueModules,
    uniqueCategorizaciones,
  } = useRequestTagsFilters(tags);

  const pagination = usePagination(filteredTags);

  // Reset page when filters change
  useEffect(() => {
    pagination.resetPage();
  }, [searchTerm, filterModule, filterCategorizacion]);

  return (
    <>
      {/* Filters */}
      <div className="bg-card border border-border/60 rounded-xl p-6 mb-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Request ID, Technician, Module..."
              className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Module</label>
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
            >
              <option value="all">All Modules</option>
              {uniqueModules.map((module) => (
                <option key={module} value={module}>
                  {module}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Categorization</label>
            <select
              value={filterCategorizacion}
              onChange={(e) => setFilterCategorizacion(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
            >
              <option value="all">All Categories</option>
              {uniqueCategorizaciones.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground/80">
            Showing {pagination.startIndex + 1}-{pagination.endIndex} of {filteredTags.length} filtered
            records ({tags.length} total)
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground/80">Per page:</label>
            <select
              value={pagination.itemsPerPage}
              onChange={(e) => pagination.changeItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 bg-background border border-border/60 rounded text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-cyan-500/10 backdrop-blur-sm hover:border-jpc-vibrant-cyan-500/30 transition-all duration-300">
        <div className="px-6 py-6 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5">
          <h3 className="text-sm font-bold text-foreground">
            Tag Records
            <span className="ml-3 text-xs font-normal text-muted-foreground/70">
              Showing {filteredTags.length} records
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-foreground">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4">Loading tags...</p>
            </div>
          ) : filteredTags.length === 0 ? (
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <p className="text-foreground text-lg mb-2 mt-4">No tags found</p>
              <p className="text-muted-foreground/70 text-sm">Try adjusting your filters or upload a file</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-transparent">
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Request ID
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Created Time
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Module
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Categorization
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Technician
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Jira
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Linked Request
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagination.paginatedItems.map((tag) => (
                  <tr
                    key={tag.requestId}
                    className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group"
                  >
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors font-medium">
                      {tag.requestId}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground/80">{tag.createdTime}</td>
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                      <div className="max-w-xs truncate" title={tag.modulo}>
                        {tag.modulo}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${
                          tag.categorizacion === 'No asignado'
                            ? 'bg-gray-500/20 text-gray-100 border-gray-500/40'
                            : 'bg-jpc-vibrant-purple-500/20 text-purple-100 border-jpc-vibrant-purple-500/40 hover:bg-jpc-vibrant-purple-500/30'
                        } border font-medium transition-all duration-300`}
                      >
                        {tag.categorizacion}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                      <div className="max-w-xs truncate" title={tag.technician}>
                        {tag.technician}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${
                          tag.jira === 'No asignado'
                            ? 'bg-gray-500/20 text-gray-100 border-gray-500/40'
                            : 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40 hover:bg-jpc-vibrant-orange-500/30'
                        } border font-medium transition-all duration-300`}
                      >
                        {tag.jira}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground/80">{tag.linkedRequestId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoading && filteredTags.length > 0 && (
          <div className="px-6 py-4 border-t border-jpc-vibrant-cyan-500/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground/80">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={pagination.goToFirstPage}
                  disabled={pagination.isFirstPage}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    pagination.isFirstPage
                      ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                      : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                  }`}
                >
                  First
                </button>
                <button
                  onClick={pagination.goToPreviousPage}
                  disabled={pagination.isFirstPage}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    pagination.isFirstPage
                      ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                      : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                  }`}
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => pagination.goToPage(pageNum)}
                        className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                          pagination.currentPage === pageNum
                            ? 'bg-jpc-vibrant-purple-500 text-white border border-jpc-vibrant-purple-500/50'
                            : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={pagination.goToNextPage}
                  disabled={pagination.isLastPage}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    pagination.isLastPage
                      ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                      : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                  }`}
                >
                  Next
                </button>
                <button
                  onClick={pagination.goToLastPage}
                  disabled={pagination.isLastPage}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    pagination.isLastPage
                      ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                      : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                  }`}
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
