'use client';

import { useState, useEffect } from 'react';
import type { WeeklyCorrective } from '@repo/reports/frontend';
import { StatsGrid } from '@/components/stats-grid';
import { UploadSectionDynamic } from '@/components/upload-section-dynamic';
import { Badge } from '@/components/ui/badge';

export default function WeeklyCorrectivePage() {
  const [weeklyCorrectives, setWeeklyCorrectives] = useState<WeeklyCorrective[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentFilename, setCurrentFilename] = useState<string>('');

  useEffect(() => {
    fetchWeeklyCorrectives();
    const savedFilename = localStorage.getItem('lastUploadedWeeklyCorrectiveFile');
    if (savedFilename) {
      setCurrentFilename(savedFilename);
    }
  }, []);

  const fetchWeeklyCorrectives = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/weekly-corrective', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setWeeklyCorrectives(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch weekly correctives:', error);
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
      const response = await fetch('http://localhost:3000/weekly-corrective/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          `✅ ${result.message}\n` +
          `📊 Total records: ${result.total}\n` +
          `✨ Imported: ${result.imported}\n` +
          `⏭️ Skipped: ${result.skipped}`
        );
        setCurrentFilename(file.name);
        localStorage.setItem('lastUploadedWeeklyCorrectiveFile', file.name);
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        await fetchWeeklyCorrectives();
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
      '⚠️ WARNING: This will permanently delete all data from the weekly_correctives table!\n\n' +
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
        'http://localhost:3000/weekly-corrective',
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);
        await fetchWeeklyCorrectives();
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

  // Get unique priorities and statuses for filters
  const priorities = ['all', ...Array.from(new Set(weeklyCorrectives.map(w => w.priority)))];
  const statuses = ['all', ...Array.from(new Set(weeklyCorrectives.map(w => w.requestStatus)))];

  // Filter weekly correctives
  const filteredWeeklyCorrectives = weeklyCorrectives.filter(wc => {
    const matchesSearch =
      wc.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wc.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wc.aplicativos.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wc.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = filterPriority === 'all' || wc.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || wc.requestStatus === filterStatus;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredWeeklyCorrectives.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWeeklyCorrectives = filteredWeeklyCorrectives.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterPriority, filterStatus]);

  // Statistics
  const totalRecords = weeklyCorrectives.length;

  // Count by priority
  const priorityCounts = weeklyCorrectives.reduce((acc, w) => {
    acc[w.priority] = (acc[w.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count by status
  const statusCounts = weeklyCorrectives.reduce((acc, w) => {
    acc[w.requestStatus] = (acc[w.requestStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPriority = Object.entries(priorityCounts).sort((a, b) => b[1] - a[1])[0];
  const topStatus = Object.entries(statusCounts).sort((a, b) => b[1] - a[1])[0];

  // Prepare stats data for StatsGrid
  const statsData = [
    { label: "TOTAL RECORDS", value: totalRecords.toLocaleString(), color: 'purple' as const },
    {
      label: "TOP PRIORITY",
      value: topPriority ? `${topPriority[0]} (${topPriority[1]})` : 'N/A',
      color: 'orange' as const
    },
    {
      label: "TOP STATUS",
      value: topStatus ? `${topStatus[0].substring(0, 15)}... (${topStatus[1]})` : 'N/A',
      color: 'cyan' as const
    },
    {
      label: "UNIQUE STATUSES",
      value: Object.keys(statusCounts).length.toLocaleString(),
      color: 'emerald' as const
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Weekly Corrective</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            Weekly corrective action reports
          </p>
        </div>

        {/* Upload Section */}
        <UploadSectionDynamic
          currentFilename={currentFilename}
          recordsCount={weeklyCorrectives.length}
          file={file}
          uploading={uploading}
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
            onRefresh={fetchWeeklyCorrectives}
            onClearData={weeklyCorrectives.length > 0 ? handleDropTable : undefined}
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
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
              >
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority === 'all' ? 'All Priorities' : priority}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground/80">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredWeeklyCorrectives.length)} of {filteredWeeklyCorrectives.length} filtered records ({totalRecords} total)
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
              Weekly Corrective Records
              <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                Showing {filteredWeeklyCorrectives.length} records
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-foreground">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4">Loading weekly correctives...</p>
              </div>
            ) : filteredWeeklyCorrectives.length === 0 ? (
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
                  {paginatedWeeklyCorrectives.map((wc) => (
                    <tr key={wc.requestId} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group">
                      <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors font-medium">
                        {wc.requestId}
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

          {/* Pagination Controls */}
          {!loading && filteredWeeklyCorrectives.length > 0 && (
            <div className="px-6 py-4 border-t border-jpc-vibrant-cyan-500/20">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground/80">
                  Page {currentPage} of {totalPages}
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

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
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
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                        : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                    }`}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currentPage === totalPages
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
      </main>
    </div>
  );
}
