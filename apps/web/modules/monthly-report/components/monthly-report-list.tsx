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
import { Priority } from '@repo/reports/frontend';
import { getPriorityColorClasses } from '@/lib/utils/priority-colors';
import { getDisplayStatusColor } from '@/lib/utils/display-status';
import { useMonthlyReports } from '../hooks/use-monthly-reports';
import { useUploadMonthlyReport } from '../hooks/use-upload-monthly-report';
import { useDeleteMonthlyReports } from '../hooks/use-delete-monthly-reports';
import { useMonthlyReportFilters } from '../hooks/use-monthly-report-filters';

export function MonthlyReportList() {
  const { data, isLoading, refetch } = useMonthlyReports();
  const uploadMutation = useUploadMonthlyReport();
  const deleteMutation = useDeleteMonthlyReports();

  const records = data?.data ?? [];
  const {
    searchTerm,
    setSearchTerm,
    categorizationFilter,
    setCategorizationFilter,
    priorityFilter,
    setPriorityFilter,
    categorizations,
    priorities,
    filteredRecords,
  } = useMonthlyReportFilters(records);

  const pagination = usePagination(filteredRecords, {
    initialItemsPerPage: 50,
  });

  const [file, setFile] = useState<File | null>(null);
  const [currentFilename, setCurrentFilename] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lastUploadedMonthlyReportFile');
    if (saved) setCurrentFilename(saved);
  }, []);

  useEffect(() => {
    pagination.goToFirstPage();
  }, [searchTerm, categorizationFilter, priorityFilter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    uploadMutation.mutate(file, {
      onSuccess: (result) => {
        toast.success(`Imported ${result.imported} of ${result.total} records`);
        setCurrentFilename(file.name);
        localStorage.setItem('lastUploadedMonthlyReportFile', file.name);
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      onError: () => {
        toast.error('Failed to upload file');
      },
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: (result) => {
        toast.success(`Deleted ${result.deleted} records`);
        setShowDeleteDialog(false);
      },
      onError: () => {
        toast.error('Failed to delete records');
        setShowDeleteDialog(false);
      },
    });
  };

  // Statistics
  const totalRecords = records.length;
  const altaPriority = records.filter((r) => r.priority === Priority.High).length;
  const categorizationCounts = records.reduce(
    (acc, r) => {
      acc[r.categorizacion] = (acc[r.categorizacion] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const topCategorization = Object.entries(categorizationCounts).sort((a, b) => b[1] - a[1])[0];

  const statsData = [
    { label: 'TOTAL RECORDS', value: totalRecords.toLocaleString(), color: 'purple' as const },
    {
      label: 'ALTA PRIORITY',
      value: `${altaPriority.toLocaleString()} (${totalRecords > 0 ? Math.round((altaPriority / totalRecords) * 100) : 0}%)`,
      color: 'orange' as const,
    },
    {
      label: 'TOP CATEGORIZATION',
      value: topCategorization
        ? `${topCategorization[0].substring(0, 20)}... (${topCategorization[1]})`
        : 'N/A',
      color: 'cyan' as const,
    },
    {
      label: 'UNIQUE CATEGORIES',
      value: Object.keys(categorizationCounts).length.toLocaleString(),
      color: 'emerald' as const,
    },
  ];

  return (
    <>
      <UploadSectionDynamic
        currentFilename={currentFilename}
        recordsCount={records.length}
        file={file}
        uploading={uploadMutation.isPending}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
        hardcodedFilename="XD 2025 DATA INFORME MENSUAL - Current Month.xlsx"
        title="Upload Monthly Report"
        description="Upload an Excel file (XD 2025 DATA INFORME MENSUAL) to import and manage monthly report data"
      />

      {statsData.length > 0 && (
        <StatsGrid
          stats={statsData}
          onRefresh={() => refetch()}
          onClearData={records.length > 0 ? () => setShowDeleteDialog(true) : undefined}
          loading={isLoading}
        />
      )}

      {/* Filters */}
      <div className="bg-card border border-border/60 rounded-xl p-6 mb-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Request ID, Application, Technician..."
              className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Categorization</label>
            <select
              value={categorizationFilter}
              onChange={(e) => setCategorizationFilter(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
            >
              <option value="all">All Categories</option>
              {categorizations.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
            >
              <option value="all">All Priorities</option>
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground/80">
            Showing {filteredRecords.length > 0 ? (pagination.currentPage - 1) * pagination.itemsPerPage + 1 : 0}-
            {Math.min(pagination.currentPage * pagination.itemsPerPage, filteredRecords.length)} of{' '}
            {filteredRecords.length} filtered records ({totalRecords} total)
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
            Monthly Report Records
            <span className="ml-3 text-xs font-normal text-muted-foreground/70">
              Showing {filteredRecords.length} records
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-foreground">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4">Loading monthly reports...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-foreground text-lg mb-2 mt-4">No monthly reports found</p>
              <p className="text-muted-foreground/70 text-sm">
                Try adjusting your filters or upload a file
              </p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-transparent">
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Request ID
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
                    <div className="flex items-center gap-2">
                      <span>Display Status</span>
                      <span
                        className="inline-flex items-center justify-center w-4 h-4 bg-jpc-vibrant-emerald-500/15 border border-jpc-vibrant-emerald-500/30 rounded text-[8px] font-bold text-emerald-300"
                        title="Computed Column: Mapped from Request Status Registry"
                      >
                        ⚡
                      </span>
                    </div>
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Priority
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Technician
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Created Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagination.paginatedItems.map((report) => (
                  <tr
                    key={report.requestId}
                    className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group"
                  >
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors font-medium">
                      {report.requestId}
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                      <div className="max-w-xs truncate" title={report.aplicativos}>
                        {report.aplicativos}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className="bg-jpc-vibrant-purple-500/20 text-purple-100 border-jpc-vibrant-purple-500/40 hover:bg-jpc-vibrant-purple-500/30 border font-medium transition-all duration-300"
                      >
                        <div className="max-w-[150px] truncate" title={report.categorizacion}>
                          {report.categorizacion}
                        </div>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                      <div className="max-w-xs truncate" title={report.requestStatus}>
                        {report.requestStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${getDisplayStatusColor((report as any).displayStatus)} border font-medium transition-all duration-300`}
                      >
                        {(report as any).displayStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${getPriorityColorClasses(report.priority)} border font-medium transition-all duration-300`}
                      >
                        {report.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                      <div className="max-w-xs truncate" title={report.technician}>
                        {report.technician}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground/80">
                      {report.createdTime instanceof Date
                        ? report.createdTime.toLocaleString()
                        : String(report.createdTime)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoading && filteredRecords.length > 0 && (
          <div className="px-6 py-4 border-t border-jpc-vibrant-cyan-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground/80">Items per page:</span>
                <select
                  value={pagination.itemsPerPage}
                  onChange={(e) => pagination.changeItemsPerPage(Number(e.target.value))}
                  className="px-2 py-1 bg-background border border-border/60 rounded text-foreground text-sm"
                >
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => pagination.goToFirstPage()}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 rounded-md text-sm font-medium bg-muted/60 text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => pagination.goToPreviousPage()}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 rounded-md text-sm font-medium bg-muted/60 text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground/80">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => pagination.goToNextPage()}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 rounded-md text-sm font-medium bg-muted/60 text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => pagination.goToLastPage()}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 rounded-md text-sm font-medium bg-muted/60 text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Last
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
            <AlertDialogTitle>Delete All Monthly Reports</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {records.length} monthly report records. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
