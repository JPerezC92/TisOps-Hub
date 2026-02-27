'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { StatsGrid } from '@/components/stats-grid';
import { UploadSectionDynamic } from '@/components/upload-section-dynamic';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePagination } from '@/shared/hooks/use-pagination';
import { useWeeklyCorrectives } from '../hooks/use-weekly-correctives';
import { useUploadWeeklyCorrectives } from '../hooks/use-upload-weekly-correctives';
import { useDeleteWeeklyCorrectives } from '../hooks/use-delete-weekly-correctives';
import { useWeeklyCorrectiveFilters } from '../hooks/use-weekly-corrective-filters';

export function WeeklyCorrectiveList() {
  const { data, isLoading, refetch } = useWeeklyCorrectives();
  const uploadMutation = useUploadWeeklyCorrectives();
  const deleteMutation = useDeleteWeeklyCorrectives();

  const records = data?.data ?? [];
  const {
    searchTerm,
    setSearchTerm,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    priorities,
    statuses,
    filteredRecords,
  } = useWeeklyCorrectiveFilters(records);

  const pagination = usePagination(filteredRecords);

  // Reset pagination when filters change
  useEffect(() => {
    pagination.resetPage();
  }, [searchTerm, priorityFilter, statusFilter]);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [currentFilename, setCurrentFilename] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lastUploadedWeeklyCorrectiveFile');
    if (saved) setCurrentFilename(saved);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleUpload = () => {
    if (!file) return;

    uploadMutation.mutate(file, {
      onSuccess: (result) => {
        toast.success(
          `${result.message} — Total: ${result.total}, Imported: ${result.imported}`
        );
        setCurrentFilename(file.name);
        localStorage.setItem('lastUploadedWeeklyCorrectiveFile', file.name);
        setFile(null);
        const fileInput = document.querySelector(
          'input[type="file"]'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      onError: (error) => {
        toast.error(`Upload failed: ${error.message}`);
      },
    });
  };

  const handleDeleteAll = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: (result) => {
        toast.success(result.message || 'All weekly corrective records deleted successfully');
        setShowDeleteDialog(false);
      },
      onError: (error) => {
        toast.error(`Failed to delete records: ${error.message}`);
        setShowDeleteDialog(false);
      },
    });
  };

  // Stats
  const totalRecords = records.length;

  const priorityCounts = records.reduce((acc, w) => {
    acc[w.priority] = (acc[w.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = records.reduce((acc, w) => {
    acc[w.requestStatus] = (acc[w.requestStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPriority = Object.entries(priorityCounts).sort((a, b) => b[1] - a[1])[0];
  const topStatus = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0];

  const statsData = [
    { label: 'Total Records', value: totalRecords.toLocaleString(), color: 'purple' as const },
    {
      label: 'Top Priority',
      value: topPriority ? `${topPriority[0]} (${topPriority[1]})` : 'N/A',
      color: 'orange' as const,
    },
    {
      label: 'Top Status',
      value: topStatus ? `${topStatus[0].substring(0, 15)}... (${topStatus[1]})` : 'N/A',
      color: 'cyan' as const,
    },
    {
      label: 'Unique Statuses',
      value: Object.keys(statusCounts).length.toLocaleString(),
      color: 'emerald' as const,
    },
  ];

  const loading = isLoading || deleteMutation.isPending;

  return (
    <>
      {/* Upload Section */}
      <UploadSectionDynamic
        currentFilename={currentFilename}
        recordsCount={records.length}
        file={file}
        uploading={uploadMutation.isPending}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
        hardcodedFilename="XD SEMANAL CORRECTIVO.xlsx"
        title="Upload Weekly Corrective Report"
        description="Upload an Excel file (XD SEMANAL CORRECTIVO) to import and manage weekly corrective data"
      />

      {/* Statistics */}
      {statsData.length > 0 && (
        <StatsGrid
          stats={statsData}
          onRefresh={() => refetch()}
          onClearData={records.length > 0 ? () => setShowDeleteDialog(true) : undefined}
          loading={loading}
        />
      )}

      {/* Filters */}
      <div className="bg-card border border-border/60 rounded-xl p-6 mb-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Request ID, Technician, Application..."
              className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
            >
              <option value="all">All Priorities</option>
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
            >
              <option value="all">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-cyan-500/10 backdrop-blur-sm hover:border-jpc-vibrant-cyan-500/30 transition-all duration-300">
        <div className="px-6 py-6 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5">
          <h3 className="text-sm font-bold text-foreground">
            Weekly Corrective Records
            <span className="ml-3 text-xs font-normal text-muted-foreground/70">
              Showing {filteredRecords.length} records
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-foreground">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4">Loading weekly correctives...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border/60 rounded-xl shadow-xl">
              <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-foreground text-lg mb-2 mt-4">No weekly correctives found</p>
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
                    Technician
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Aplicativos
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Categorization
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Status
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Priority
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Created Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagination.paginatedItems.map((wc) => (
                  <tr key={wc.requestId} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group">
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors font-medium">
                      {wc.requestIdLink ? (
                        <a
                          href={wc.requestIdLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-jpc-vibrant-cyan-400 hover:text-jpc-vibrant-cyan-300 hover:underline transition-colors"
                        >
                          {wc.requestId}
                        </a>
                      ) : (
                        wc.requestId
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                      <div className="max-w-xs truncate" title={wc.technician}>
                        {wc.technician}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                      <div className="max-w-xs truncate" title={wc.aplicativos}>
                        {wc.aplicativos}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className="bg-jpc-vibrant-purple-500/20 text-purple-100 border-jpc-vibrant-purple-500/40 hover:bg-jpc-vibrant-purple-500/30 border font-medium transition-all duration-300"
                      >
                        <div className="max-w-[150px] truncate" title={wc.categorizacion}>
                          {wc.categorizacion}
                        </div>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                      <div className="max-w-xs truncate" title={wc.requestStatus}>
                        {wc.requestStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${
                          wc.priority === 'Alta'
                            ? 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40 hover:bg-jpc-vibrant-orange-500/30'
                            : wc.priority === 'Media'
                            ? 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 border-jpc-vibrant-cyan-500/40 hover:bg-jpc-vibrant-cyan-500/30'
                            : 'bg-gray-500/20 text-gray-100 border-gray-500/40'
                        } border font-medium transition-all duration-300`}
                      >
                        {wc.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground/80">
                      {wc.createdTime}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredRecords.length > 0 && (
          <div className="bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5 px-6 py-4 border-t border-jpc-vibrant-cyan-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-cyan-100/90">
                  Showing{' '}
                  <span className="font-semibold text-cyan-100">
                    {pagination.startIndex + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-cyan-100">
                    {pagination.endIndex}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-cyan-100">
                    {pagination.totalItems}
                  </span>{' '}
                  results
                </span>
                <select
                  value={pagination.itemsPerPage}
                  onChange={(e) =>
                    pagination.changeItemsPerPage(Number(e.target.value))
                  }
                  className="px-3 py-1.5 bg-jpc-vibrant-cyan-500/20 border border-jpc-vibrant-cyan-500/40 rounded-lg text-sm text-cyan-100 focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500 hover:bg-jpc-vibrant-cyan-500/30 transition-colors"
                >
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
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
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.totalPages - 2
                      ) {
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
                    }
                  )}
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
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Weekly Corrective Records</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all data from the weekly correctives table.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
