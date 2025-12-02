'use client';

import { useState, useEffect } from 'react';
import type { SessionsOrder, SessionsOrdersRelease } from '@repo/reports/frontend';
import { StatsGrid } from '@/components/stats-grid';
import { UploadSectionDynamic } from '@/components/upload-section-dynamic';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function SessionsOrdersPage() {
  // State for both datasets
  const [sessionsOrders, setSessionsOrders] = useState<SessionsOrder[]>([]);
  const [releases, setReleases] = useState<SessionsOrdersRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentFilename, setCurrentFilename] = useState<string>('');

  // Sessions & Orders filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Releases filters
  const [releaseSearchTerm, setReleaseSearchTerm] = useState('');
  const [filterWeek, setFilterWeek] = useState<string>('all');
  const [filterApplication, setFilterApplication] = useState<string>('all');
  const [releaseCurrentPage, setReleaseCurrentPage] = useState(1);
  const [releaseItemsPerPage, setReleaseItemsPerPage] = useState(50);

  useEffect(() => {
    fetchSessionsOrders();
    const savedFilename = localStorage.getItem('lastUploadedSessionsOrdersFile');
    if (savedFilename) {
      setCurrentFilename(savedFilename);
    }
  }, []);

  const fetchSessionsOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/sessions-orders', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setSessionsOrders(data.data || []);
        setReleases(data.releases || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/sessions-orders/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          `✅ ${result.message}\n\n` +
          `📊 Main Records (Hoja1):\n` +
          `   Total: ${result.totalMain}\n` +
          `   Imported: ${result.importedMain}\n\n` +
          `📊 Release Records (Hoja3):\n` +
          `   Total: ${result.totalReleases}\n` +
          `   Imported: ${result.importedReleases}`
        );
        setCurrentFilename(file.name);
        localStorage.setItem('lastUploadedSessionsOrdersFile', file.name);
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        await fetchSessionsOrders();
      } else {
        const error = await response.json();
        alert(`❌ Upload failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDropTable = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete all data from both tables!\n\n' +
      'Are you sure you want to continue?'
    );

    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      '🚨 FINAL CONFIRMATION\n\n' +
      'This action CANNOT be undone. All data will be lost.\n\n' +
      'Type OK in your mind and click OK to proceed.'
    );

    if (!doubleConfirm) return;

    setLoading(true);
    try {
      const response = await fetch(
        'http://localhost:3000/sessions-orders',
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);
        await fetchSessionsOrders();
      } else {
        const error = await response.json();
        alert(`❌ Failed to delete records: ${error.message}`);
      }
    } catch (error) {
      console.error('Delete records error:', error);
      alert('❌ Failed to delete records');
    } finally {
      setLoading(false);
    }
  };

  // ============ SESSIONS & ORDERS TAB ============
  const years = ['all', ...Array.from(new Set(sessionsOrders.map(s => s.ano.toString()))).sort()];
  const months = ['all', ...Array.from(new Set(sessionsOrders.map(s => s.mes.toString()))).sort((a, b) => Number(a) - Number(b))];

  const filteredSessionsOrders = sessionsOrders.filter(so => {
    const matchesSearch =
      so.ano.toString().includes(searchTerm) ||
      so.mes.toString().includes(searchTerm) ||
      so.dia.toString().includes(searchTerm);

    const matchesYear = filterYear === 'all' || so.ano.toString() === filterYear;
    const matchesMonth = filterMonth === 'all' || so.mes.toString() === filterMonth;

    return matchesSearch && matchesYear && matchesMonth;
  });

  const totalSessionsPages = Math.ceil(filteredSessionsOrders.length / itemsPerPage);
  const sessionsStartIndex = (currentPage - 1) * itemsPerPage;
  const sessionsEndIndex = sessionsStartIndex + itemsPerPage;
  const paginatedSessionsOrders = filteredSessionsOrders.slice(sessionsStartIndex, sessionsEndIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterYear, filterMonth]);

  const totalRecords = sessionsOrders.length;
  const totalIncidents = sessionsOrders.reduce((sum, so) => sum + so.incidentes, 0);
  const totalPlacedOrders = sessionsOrders.reduce((sum, so) => sum + so.placedOrders, 0);
  const totalBilledOrders = sessionsOrders.reduce((sum, so) => sum + so.billedOrders, 0);

  const sessionsStatsData = [
    { label: "TOTAL RECORDS", value: totalRecords.toLocaleString(), color: 'purple' as const },
    { label: "TOTAL INCIDENTS", value: totalIncidents.toLocaleString(), color: 'orange' as const },
    { label: "TOTAL PLACED ORDERS", value: totalPlacedOrders.toLocaleString(), color: 'cyan' as const },
    { label: "TOTAL BILLED ORDERS", value: totalBilledOrders.toLocaleString(), color: 'emerald' as const }
  ];

  // ============ RELEASES TAB ============
  const weeks = ['all', ...Array.from(new Set(releases.map(r => r.semana))).sort()];
  const applications = ['all', ...Array.from(new Set(releases.map(r => r.aplicacion))).sort()];

  const filteredReleases = releases.filter(r => {
    const matchesSearch =
      r.semana.toLowerCase().includes(releaseSearchTerm.toLowerCase()) ||
      r.aplicacion.toLowerCase().includes(releaseSearchTerm.toLowerCase()) ||
      r.release.toLowerCase().includes(releaseSearchTerm.toLowerCase());

    const matchesWeek = filterWeek === 'all' || r.semana === filterWeek;
    const matchesApp = filterApplication === 'all' || r.aplicacion === filterApplication;

    return matchesSearch && matchesWeek && matchesApp;
  });

  const totalReleasesPages = Math.ceil(filteredReleases.length / releaseItemsPerPage);
  const releasesStartIndex = (releaseCurrentPage - 1) * releaseItemsPerPage;
  const releasesEndIndex = releasesStartIndex + releaseItemsPerPage;
  const paginatedReleases = filteredReleases.slice(releasesStartIndex, releasesEndIndex);

  useEffect(() => {
    setReleaseCurrentPage(1);
  }, [releaseSearchTerm, filterWeek, filterApplication]);

  const totalReleases = releases.length;
  const releasesBySB = releases.filter(r => r.aplicacion === 'SB').length;
  const releasesByFFVV = releases.filter(r => r.aplicacion === 'FFVV').length;
  const avgTicketsPerRelease = releases.length > 0
    ? (releases.reduce((sum, r) => sum + r.ticketsCount, 0) / releases.length).toFixed(1)
    : '0';

  const releasesStatsData = [
    { label: "TOTAL RELEASES", value: totalReleases.toLocaleString(), color: 'purple' as const },
    { label: "SB RELEASES", value: releasesBySB.toLocaleString(), color: 'cyan' as const },
    { label: "FFVV RELEASES", value: releasesByFFVV.toLocaleString(), color: 'emerald' as const },
    { label: "AVG TICKETS/RELEASE", value: avgTicketsPerRelease, color: 'orange' as const }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Sessions & Orders</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            View incidents, sessions, orders, and release data
          </p>
        </div>

        {/* Upload Section */}
        <UploadSectionDynamic
          currentFilename={currentFilename}
          recordsCount={sessionsOrders.length + releases.length}
          file={file}
          uploading={uploading}
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
            {sessionsStatsData.length > 0 && (
              <StatsGrid
                stats={sessionsStatsData}
                onRefresh={fetchSessionsOrders}
                onClearData={sessionsOrders.length > 0 ? handleDropTable : undefined}
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
                    placeholder="Year, Month, Day..."
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Year
                  </label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year === 'all' ? 'All Years' : year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Month
                  </label>
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
                  >
                    {months.map(month => (
                      <option key={month} value={month}>
                        {month === 'all' ? 'All Months' : month}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground/80">
                  Showing {sessionsStartIndex + 1}-{Math.min(sessionsEndIndex, filteredSessionsOrders.length)} of {filteredSessionsOrders.length} filtered records ({totalRecords} total)
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground/80">Per page:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
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
                  Sessions & Orders Records
                  <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                    Showing {filteredSessionsOrders.length} records
                  </span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-12 text-foreground">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4">Loading sessions & orders...</p>
                  </div>
                ) : filteredSessionsOrders.length === 0 ? (
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
                        <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                          Year
                        </th>
                        <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                          Month
                        </th>
                        <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                          Day
                        </th>
                        <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                          Incidents
                        </th>
                        <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                          Placed Orders
                        </th>
                        <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                          Billed Orders
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSessionsOrders.map((so) => (
                        <tr key={so.id} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group">
                          <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors font-medium">
                            {so.ano}
                          </td>
                          <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                            {so.mes}
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground/80">
                            {so.dia}
                          </td>
                          <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                            {so.incidentes}
                          </td>
                          <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                            {so.placedOrders}
                          </td>
                          <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                            {so.billedOrders}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination Controls */}
              {!loading && filteredSessionsOrders.length > 0 && (
                <div className="px-6 py-4 border-t border-jpc-vibrant-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground/80">
                      Page {currentPage} of {totalSessionsPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          currentPage === 1
                            ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                            : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                        }`}
                      >
                        First
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          currentPage === 1
                            ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                            : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                        }`}
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalSessionsPages) }, (_, i) => {
                          let pageNum;
                          if (totalSessionsPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalSessionsPages - 2) {
                            pageNum = totalSessionsPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                                currentPage === pageNum
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
                        onClick={() => setCurrentPage(prev => Math.min(totalSessionsPages, prev + 1))}
                        disabled={currentPage === totalSessionsPages}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          currentPage === totalSessionsPages
                            ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                            : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                        }`}
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalSessionsPages)}
                        disabled={currentPage === totalSessionsPages}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          currentPage === totalSessionsPages
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
          </TabsContent>

          {/* RELEASES TAB */}
          <TabsContent value="releases">
            {/* Statistics */}
            {releasesStatsData.length > 0 && (
              <StatsGrid
                stats={releasesStatsData}
                onRefresh={fetchSessionsOrders}
                onClearData={releases.length > 0 ? handleDropTable : undefined}
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
                    value={releaseSearchTerm}
                    onChange={(e) => setReleaseSearchTerm(e.target.value)}
                    placeholder="Week, Application, Release..."
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Week
                  </label>
                  <select
                    value={filterWeek}
                    onChange={(e) => setFilterWeek(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
                  >
                    {weeks.map(week => (
                      <option key={week} value={week}>
                        {week === 'all' ? 'All Weeks' : week}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Application
                  </label>
                  <select
                    value={filterApplication}
                    onChange={(e) => setFilterApplication(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
                  >
                    {applications.map(app => (
                      <option key={app} value={app}>
                        {app === 'all' ? 'All Applications' : app}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground/80">
                  Showing {releasesStartIndex + 1}-{Math.min(releasesEndIndex, filteredReleases.length)} of {filteredReleases.length} filtered releases ({totalReleases} total)
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground/80">Per page:</label>
                  <select
                    value={releaseItemsPerPage}
                    onChange={(e) => {
                      setReleaseItemsPerPage(Number(e.target.value));
                      setReleaseCurrentPage(1);
                    }}
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

            {/* Releases Table */}
            <div className="rounded-2xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-cyan-500/10 backdrop-blur-sm hover:border-jpc-vibrant-cyan-500/30 transition-all duration-300">
              <div className="px-6 py-6 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5">
                <h3 className="text-sm font-bold text-foreground">
                  Release Records
                  <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                    Showing {filteredReleases.length} releases
                  </span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-12 text-foreground">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4">Loading releases...</p>
                  </div>
                ) : filteredReleases.length === 0 ? (
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
                        <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                          Week
                        </th>
                        <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                          Application
                        </th>
                        <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                          Date
                        </th>
                        <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                          Release
                        </th>
                        <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                          Tickets
                        </th>
                        <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                          Ticket IDs
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedReleases.map((release) => {
                        let tickets: string[] = [];
                        try {
                          tickets = JSON.parse(release.ticketsData);
                        } catch (e) {
                          tickets = [];
                        }

                        return (
                          <tr key={release.id} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group">
                            <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors font-medium">
                              {release.semana}
                            </td>
                            <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                release.aplicacion === 'SB'
                                  ? 'bg-jpc-vibrant-cyan-500/20 text-cyan-100'
                                  : 'bg-jpc-vibrant-emerald-500/20 text-emerald-100'
                              }`}>
                                {release.aplicacion}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-muted-foreground/80">
                              {release.fecha}
                            </td>
                            <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                              {release.release}
                            </td>
                            <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors font-bold">
                              {release.ticketsCount}
                            </td>
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

              {/* Pagination Controls */}
              {!loading && filteredReleases.length > 0 && (
                <div className="px-6 py-4 border-t border-jpc-vibrant-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground/80">
                      Page {releaseCurrentPage} of {totalReleasesPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReleaseCurrentPage(1)}
                        disabled={releaseCurrentPage === 1}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          releaseCurrentPage === 1
                            ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                            : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                        }`}
                      >
                        First
                      </button>
                      <button
                        onClick={() => setReleaseCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={releaseCurrentPage === 1}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          releaseCurrentPage === 1
                            ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                            : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                        }`}
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalReleasesPages) }, (_, i) => {
                          let pageNum;
                          if (totalReleasesPages <= 5) {
                            pageNum = i + 1;
                          } else if (releaseCurrentPage <= 3) {
                            pageNum = i + 1;
                          } else if (releaseCurrentPage >= totalReleasesPages - 2) {
                            pageNum = totalReleasesPages - 4 + i;
                          } else {
                            pageNum = releaseCurrentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setReleaseCurrentPage(pageNum)}
                              className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                                releaseCurrentPage === pageNum
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
                        onClick={() => setReleaseCurrentPage(prev => Math.min(totalReleasesPages, prev + 1))}
                        disabled={releaseCurrentPage === totalReleasesPages}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          releaseCurrentPage === totalReleasesPages
                            ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                            : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                        }`}
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setReleaseCurrentPage(totalReleasesPages)}
                        disabled={releaseCurrentPage === totalReleasesPages}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          releaseCurrentPage === totalReleasesPages
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
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
