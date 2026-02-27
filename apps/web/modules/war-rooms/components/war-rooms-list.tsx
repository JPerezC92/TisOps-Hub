'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DateTime } from 'luxon';
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
import { useWarRooms } from '../hooks/use-war-rooms';
import { useUploadWarRooms } from '../hooks/use-upload-war-rooms';
import { useDeleteWarRooms } from '../hooks/use-delete-war-rooms';
import { useWarRoomsFilters } from '../hooks/use-war-rooms-filters';

function formatExcelDate(timestamp: number | Date | string): string {
  if (!timestamp) return 'N/A';

  let date: DateTime;
  if (timestamp instanceof Date) {
    date = DateTime.fromJSDate(timestamp);
  } else if (typeof timestamp === 'string') {
    date = DateTime.fromISO(timestamp);
  } else {
    date = DateTime.fromMillis(timestamp);
  }

  return date.toFormat('MMM d, yyyy');
}

export function WarRoomsList() {
  const { data, isLoading, refetch } = useWarRooms();
  const uploadMutation = useUploadWarRooms();
  const deleteMutation = useDeleteWarRooms();

  const records = data?.data ?? [];
  const {
    searchTerm,
    setSearchTerm,
    applicationFilter,
    setApplicationFilter,
    statusFilter,
    setStatusFilter,
    applications,
    statuses,
    filteredRecords,
  } = useWarRoomsFilters(records);

  const pagination = usePagination(filteredRecords);

  // Reset pagination when filters change
  useEffect(() => {
    pagination.resetPage();
  }, [searchTerm, applicationFilter, statusFilter]);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [currentFilename, setCurrentFilename] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lastUploadedWarRoomsFile');
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
        localStorage.setItem('lastUploadedWarRoomsFile', file.name);
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
        toast.success(result.message || 'All war rooms records deleted successfully');
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
  const criticalPriority = records.filter(w => w.initialPriority === 'CRITICAL').length;
  const highPriority = records.filter(w => w.initialPriority === 'HIGH').length;
  const closedStatus = records.filter(w => w.status === 'Closed').length;

  const statsData = [
    { label: 'TOTAL RECORDS', value: totalRecords.toLocaleString(), color: 'purple' as const },
    {
      label: 'CRITICAL PRIORITY',
      value: `${criticalPriority.toLocaleString()} (${totalRecords > 0 ? Math.round((criticalPriority / totalRecords) * 100) : 0}%)`,
      color: 'orange' as const,
    },
    {
      label: 'HIGH PRIORITY',
      value: `${highPriority.toLocaleString()} (${totalRecords > 0 ? Math.round((highPriority / totalRecords) * 100) : 0}%)`,
      color: 'cyan' as const,
    },
    {
      label: 'CLOSED STATUS',
      value: `${closedStatus.toLocaleString()} (${totalRecords > 0 ? Math.round((closedStatus / totalRecords) * 100) : 0}%)`,
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
        hardcodedFilename="EDWarRooms2025.xlsx"
        title="Upload War Rooms Report"
        description="Upload an Excel file (EDWarRooms2025) to import and manage war room incident data"
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
              placeholder="Request ID, Application, Summary..."
              className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Application
            </label>
            <select
              value={applicationFilter}
              onChange={(e) => setApplicationFilter(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
            >
              <option value="all">All Applications</option>
              {applications.map((app) => (
                <option key={app} value={app}>
                  {app}
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
            War Room Records
            <span className="ml-3 text-xs font-normal text-muted-foreground/70">
              Showing {filteredRecords.length} records
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-foreground">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4">Loading war rooms...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border/60 rounded-xl shadow-xl">
              <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-foreground text-lg mb-2 mt-4">No war rooms found</p>
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
                    Application
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Date
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Summary
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Initial Priority
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Status
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Participants
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Duration (Min)
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagination.paginatedItems.map((warRoom) => (
                  <tr key={warRoom.requestId} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group">
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors font-medium">
                      {warRoom.requestIdLink ? (
                        <a
                          href={warRoom.requestIdLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-jpc-vibrant-cyan-500 hover:text-jpc-vibrant-cyan-400 underline decoration-jpc-vibrant-cyan-500/30 hover:decoration-jpc-vibrant-cyan-400 transition-colors"
                        >
                          {warRoom.requestId}
                        </a>
                      ) : (
                        warRoom.requestId
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                      <div className="max-w-xs truncate" title={warRoom.application}>
                        {warRoom.application}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground/80">
                      {formatExcelDate(warRoom.date)}
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                      <div className="max-w-xs truncate" title={warRoom.summary}>
                        {warRoom.summary}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${
                          warRoom.initialPriority === 'CRITICAL'
                            ? 'bg-red-500/20 text-red-100 border-red-500/40'
                            : warRoom.initialPriority === 'HIGH'
                            ? 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40 hover:bg-jpc-vibrant-orange-500/30'
                            : 'bg-jpc-vibrant-purple-500/20 text-purple-100 border-jpc-vibrant-purple-500/40 hover:bg-jpc-vibrant-purple-500/30'
                        } border font-medium transition-all duration-300`}
                      >
                        {warRoom.initialPriority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${
                          warRoom.status === 'Closed'
                            ? 'bg-emerald-500/20 text-emerald-100 border-emerald-500/40'
                            : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 border-jpc-vibrant-cyan-500/40 hover:bg-jpc-vibrant-cyan-500/30'
                        } border font-medium transition-all duration-300`}
                      >
                        {warRoom.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground/80">
                      {warRoom.participants}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground/80">
                      {warRoom.durationMinutes}
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
                  <option value={200}>200 per page</option>
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
            <AlertDialogTitle>Delete All War Room Records</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all data from the war rooms table.
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
