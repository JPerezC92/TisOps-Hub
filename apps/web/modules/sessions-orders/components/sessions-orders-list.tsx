'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { StatsGrid } from '@/components/stats-grid';
import { UploadSectionDynamic } from '@/components/upload-section-dynamic';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import { useSessionsOrders } from '../hooks/use-sessions-orders';
import { useUploadSessionsOrders } from '../hooks/use-upload-sessions-orders';
import { useDeleteSessionsOrders } from '../hooks/use-delete-sessions-orders';
import { useSessionsOrdersFilters } from '../hooks/use-sessions-orders-filters';
import { useReleasesFilters } from '../hooks/use-releases-filters';

export function SessionsOrdersList() {
  const { data, isLoading, refetch } = useSessionsOrders();
  const uploadMutation = useUploadSessionsOrders();
  const deleteMutation = useDeleteSessionsOrders();

  const mainRecords = data?.data ?? [];
  const releaseRecords = data?.releases ?? [];

  // Sessions & Orders filters
  const sessionsFilters = useSessionsOrdersFilters(mainRecords);
  const sessionsPagination = usePagination(sessionsFilters.filteredRecords);

  // Releases filters
  const releasesFilters = useReleasesFilters(releaseRecords);
  const releasesPagination = usePagination(releasesFilters.filteredRecords);

  // Reset pagination when filters change
  useEffect(() => {
    sessionsPagination.resetPage();
  }, [sessionsFilters.searchTerm, sessionsFilters.yearFilter, sessionsFilters.monthFilter]);

  useEffect(() => {
    releasesPagination.resetPage();
  }, [releasesFilters.searchTerm, releasesFilters.weekFilter, releasesFilters.applicationFilter]);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [currentFilename, setCurrentFilename] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lastUploadedSessionsOrdersFile');
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
          `${result.message} — Main: ${result.importedMain}, Releases: ${result.importedReleases}`
        );
        setCurrentFilename(file.name);
        localStorage.setItem('lastUploadedSessionsOrdersFile', file.name);
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
        toast.success(result.message || 'All sessions/orders records deleted successfully');
        setShowDeleteDialog(false);
      },
      onError: (error) => {
        toast.error(`Failed to delete records: ${error.message}`);
        setShowDeleteDialog(false);
      },
    });
  };

  // Sessions stats
  const totalRecords = mainRecords.length;
  const totalIncidents = mainRecords.reduce((sum, so) => sum + so.incidentes, 0);
  const totalPlacedOrders = mainRecords.reduce((sum, so) => sum + so.placedOrders, 0);
  const totalBilledOrders = mainRecords.reduce((sum, so) => sum + so.billedOrders, 0);

  const sessionsStatsData = [
    { label: 'TOTAL RECORDS', value: totalRecords.toLocaleString(), color: 'purple' as const },
    { label: 'TOTAL INCIDENTS', value: totalIncidents.toLocaleString(), color: 'orange' as const },
    { label: 'TOTAL PLACED ORDERS', value: totalPlacedOrders.toLocaleString(), color: 'cyan' as const },
    { label: 'TOTAL BILLED ORDERS', value: totalBilledOrders.toLocaleString(), color: 'emerald' as const },
  ];

  // Releases stats
  const totalReleases = releaseRecords.length;
  const releasesBySB = releaseRecords.filter((r) => r.aplicacion === 'SB').length;
  const releasesByFFVV = releaseRecords.filter((r) => r.aplicacion === 'FFVV').length;
  const avgTicketsPerRelease =
    releaseRecords.length > 0
      ? (releaseRecords.reduce((sum, r) => sum + r.ticketsCount, 0) / releaseRecords.length).toFixed(1)
      : '0';

  const releasesStatsData = [
    { label: 'TOTAL RELEASES', value: totalReleases.toLocaleString(), color: 'purple' as const },
    { label: 'SB RELEASES', value: releasesBySB.toLocaleString(), color: 'cyan' as const },
    { label: 'FFVV RELEASES', value: releasesByFFVV.toLocaleString(), color: 'emerald' as const },
    { label: 'AVG TICKETS/RELEASE', value: avgTicketsPerRelease, color: 'orange' as const },
  ];

  const loading = isLoading || deleteMutation.isPending;

  return (
    <>
      {/* Upload Section */}
      <UploadSectionDynamic
        currentFilename={currentFilename}
        recordsCount={mainRecords.length + releaseRecords.length}
        file={file}
        uploading={uploadMutation.isPending}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
        hardcodedFilename="SB INCIDENTES ORDENES SESIONES.xlsx"
        title="Upload Sessions & Orders Report"
        description="Upload an Excel file (SB INCIDENTES ORDENES SESIONES) to import and manage sessions, orders, and release data"
      />

      {/* Tabs */}
      <Tabs defaultValue="sessions-orders" className="mt-8">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="sessions-orders">Sessions & Orders</TabsTrigger>
          <TabsTrigger value="releases">Releases</TabsTrigger>
        </TabsList>

        {/* SESSIONS & ORDERS TAB */}
        <TabsContent value="sessions-orders">
          {/* Statistics */}
          <StatsGrid
            stats={sessionsStatsData}
            onRefresh={() => refetch()}
            onClearData={mainRecords.length > 0 ? () => setShowDeleteDialog(true) : undefined}
            loading={loading}
          />

          {/* Filters */}
          <div className="bg-card border border-border/60 rounded-xl p-6 mb-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Search</label>
                <input
                  type="text"
                  value={sessionsFilters.searchTerm}
                  onChange={(e) => sessionsFilters.setSearchTerm(e.target.value)}
                  placeholder="Year, Month, Day..."
                  className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Year</label>
                <select
                  value={sessionsFilters.yearFilter}
                  onChange={(e) => sessionsFilters.setYearFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
                >
                  <option value="all">All Years</option>
                  {sessionsFilters.years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Month</label>
                <select
                  value={sessionsFilters.monthFilter}
                  onChange={(e) => sessionsFilters.setMonthFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
                >
                  <option value="all">All Months</option>
                  {sessionsFilters.months.map((month) => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="rounded-2xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-cyan-500/10 backdrop-blur-sm hover:border-jpc-vibrant-cyan-500/30 transition-all duration-300">
            <div className="px-6 py-6 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5">
              <h3 className="text-sm font-bold text-foreground">
                Sessions & Orders Records
                <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                  Showing {sessionsFilters.filteredRecords.length} records
                </span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-12 text-foreground">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="mt-4">Loading sessions & orders...</p>
                </div>
              ) : sessionsFilters.filteredRecords.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border/60 rounded-xl shadow-xl">
                  <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-foreground text-lg mb-2 mt-4">No sessions & orders found</p>
                  <p className="text-muted-foreground/70 text-sm">Try adjusting your filters or upload a file</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-transparent">
                      <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">Year</th>
                      <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">Month</th>
                      <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">Day</th>
                      <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">Incidents</th>
                      <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">Placed Orders</th>
                      <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">Billed Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionsPagination.paginatedItems.map((so) => (
                      <tr key={so.id} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group">
                        <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors font-medium">{so.ano}</td>
                        <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">{so.mes}</td>
                        <td className="px-6 py-4 text-xs text-muted-foreground/80">{so.dia}</td>
                        <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">{so.incidentes}</td>
                        <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">{so.placedOrders}</td>
                        <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">{so.billedOrders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && sessionsFilters.filteredRecords.length > 0 && (
              <div className="bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5 px-6 py-4 border-t border-jpc-vibrant-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-cyan-100/90">
                      Showing{' '}
                      <span className="font-semibold text-cyan-100">{sessionsPagination.startIndex + 1}</span>{' '}
                      to{' '}
                      <span className="font-semibold text-cyan-100">{sessionsPagination.endIndex}</span>{' '}
                      of{' '}
                      <span className="font-semibold text-cyan-100">{sessionsPagination.totalItems}</span>{' '}
                      results
                    </span>
                    <select
                      value={sessionsPagination.itemsPerPage}
                      onChange={(e) => sessionsPagination.changeItemsPerPage(Number(e.target.value))}
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
                      onClick={sessionsPagination.goToPreviousPage}
                      disabled={sessionsPagination.isFirstPage}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        sessionsPagination.isFirstPage
                          ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                          : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                      }`}
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, sessionsPagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (sessionsPagination.totalPages <= 5) pageNum = i + 1;
                        else if (sessionsPagination.currentPage <= 3) pageNum = i + 1;
                        else if (sessionsPagination.currentPage >= sessionsPagination.totalPages - 2) pageNum = sessionsPagination.totalPages - 4 + i;
                        else pageNum = sessionsPagination.currentPage - 2 + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => sessionsPagination.goToPage(pageNum)}
                            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                              sessionsPagination.currentPage === pageNum
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
                      onClick={sessionsPagination.goToNextPage}
                      disabled={sessionsPagination.isLastPage}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        sessionsPagination.isLastPage
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
        </TabsContent>

        {/* RELEASES TAB */}
        <TabsContent value="releases">
          {/* Statistics */}
          <StatsGrid
            stats={releasesStatsData}
            onRefresh={() => refetch()}
            onClearData={releaseRecords.length > 0 ? () => setShowDeleteDialog(true) : undefined}
            loading={loading}
          />

          {/* Filters */}
          <div className="bg-card border border-border/60 rounded-xl p-6 mb-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Search</label>
                <input
                  type="text"
                  value={releasesFilters.searchTerm}
                  onChange={(e) => releasesFilters.setSearchTerm(e.target.value)}
                  placeholder="Week, Application, Release..."
                  className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Week</label>
                <select
                  value={releasesFilters.weekFilter}
                  onChange={(e) => releasesFilters.setWeekFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
                >
                  <option value="all">All Weeks</option>
                  {releasesFilters.weeks.map((week) => (
                    <option key={week} value={week}>{week}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Application</label>
                <select
                  value={releasesFilters.applicationFilter}
                  onChange={(e) => releasesFilters.setApplicationFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
                >
                  <option value="all">All Applications</option>
                  {releasesFilters.applications.map((app) => (
                    <option key={app} value={app}>{app}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Releases Table */}
          <div className="rounded-2xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-cyan-500/10 backdrop-blur-sm hover:border-jpc-vibrant-cyan-500/30 transition-all duration-300">
            <div className="px-6 py-6 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5">
              <h3 className="text-sm font-bold text-foreground">
                Release Records
                <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                  Showing {releasesFilters.filteredRecords.length} releases
                </span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-12 text-foreground">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="mt-4">Loading releases...</p>
                </div>
              ) : releasesFilters.filteredRecords.length === 0 ? (
                <div className="text-center py-12 bg-card border border-border/60 rounded-xl shadow-xl">
                  <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-foreground text-lg mb-2 mt-4">No releases found</p>
                  <p className="text-muted-foreground/70 text-sm">Try adjusting your filters or upload a file</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-transparent">
                      <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">Week</th>
                      <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">Application</th>
                      <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">Date</th>
                      <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">Release</th>
                      <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">Tickets</th>
                      <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">Ticket IDs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {releasesPagination.paginatedItems.map((release) => {
                      let tickets: string[] = [];
                      try {
                        tickets = JSON.parse(release.ticketsData);
                      } catch {
                        tickets = [];
                      }

                      return (
                        <tr key={release.id} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group">
                          <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors font-medium">{release.semana}</td>
                          <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              release.aplicacion === 'SB'
                                ? 'bg-jpc-vibrant-cyan-500/20 text-cyan-100'
                                : 'bg-jpc-vibrant-emerald-500/20 text-emerald-100'
                            }`}>
                              {release.aplicacion}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground/80">{release.fecha}</td>
                          <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">{release.release}</td>
                          <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors font-bold">{release.ticketsCount}</td>
                          <td className="px-6 py-4 text-xs text-muted-foreground/80 max-w-md">
                            <div className="flex flex-wrap gap-1">
                              {tickets.slice(0, 5).map((ticket, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-jpc-vibrant-purple-500/20 text-purple-100 rounded text-xs"
                                >
                                  {ticket}
                                </span>
                              ))}
                              {tickets.length > 5 && (
                                <span className="px-2 py-0.5 text-muted-foreground/60 text-xs">
                                  +{tickets.length - 5} more
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {!loading && releasesFilters.filteredRecords.length > 0 && (
              <div className="bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5 px-6 py-4 border-t border-jpc-vibrant-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-cyan-100/90">
                      Showing{' '}
                      <span className="font-semibold text-cyan-100">{releasesPagination.startIndex + 1}</span>{' '}
                      to{' '}
                      <span className="font-semibold text-cyan-100">{releasesPagination.endIndex}</span>{' '}
                      of{' '}
                      <span className="font-semibold text-cyan-100">{releasesPagination.totalItems}</span>{' '}
                      results
                    </span>
                    <select
                      value={releasesPagination.itemsPerPage}
                      onChange={(e) => releasesPagination.changeItemsPerPage(Number(e.target.value))}
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
                      onClick={releasesPagination.goToPreviousPage}
                      disabled={releasesPagination.isFirstPage}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        releasesPagination.isFirstPage
                          ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                          : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                      }`}
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, releasesPagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (releasesPagination.totalPages <= 5) pageNum = i + 1;
                        else if (releasesPagination.currentPage <= 3) pageNum = i + 1;
                        else if (releasesPagination.currentPage >= releasesPagination.totalPages - 2) pageNum = releasesPagination.totalPages - 4 + i;
                        else pageNum = releasesPagination.currentPage - 2 + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => releasesPagination.goToPage(pageNum)}
                            className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                              releasesPagination.currentPage === pageNum
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
                      onClick={releasesPagination.goToNextPage}
                      disabled={releasesPagination.isLastPage}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        releasesPagination.isLastPage
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
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Sessions & Orders Records</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all data from both the sessions/orders and releases tables.
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
