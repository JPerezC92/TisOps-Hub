'use client';

import { useState, useEffect } from 'react';
import type { WarRoom } from '@repo/reports';
import { StatsGrid } from '@/components/stats-grid';
import { UploadSectionDynamic } from '@/components/upload-section-dynamic';
import { Badge } from '@/components/ui/badge';

export default function WarRoomsPage() {
  const [warRooms, setWarRooms] = useState<WarRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApplication, setFilterApplication] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentFilename, setCurrentFilename] = useState<string>('');

  useEffect(() => {
    fetchWarRooms();
    const savedFilename = localStorage.getItem('lastUploadedWarRoomsFile');
    if (savedFilename) {
      setCurrentFilename(savedFilename);
    }
  }, []);

  const fetchWarRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/war-rooms', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setWarRooms(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch war rooms:', error);
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
      const response = await fetch('http://localhost:3000/war-rooms/upload', {
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
        localStorage.setItem('lastUploadedWarRoomsFile', file.name);
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        await fetchWarRooms();
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
      '⚠️ WARNING: This will permanently delete all data from the war_rooms table!\n\n' +
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
        'http://localhost:3000/war-rooms',
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);
        await fetchWarRooms();
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

  // Get unique applications and statuses for filters
  const applications = ['all', ...Array.from(new Set(warRooms.map(w => w.application)))];
  const statuses = ['all', ...Array.from(new Set(warRooms.map(w => w.status)))];

  // Filter war rooms
  const filteredWarRooms = warRooms.filter(warRoom => {
    const matchesSearch =
      warRoom.incidentId.toString().includes(searchTerm.toLowerCase()) ||
      warRoom.application.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warRoom.summary.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesApplication = filterApplication === 'all' || warRoom.application === filterApplication;
    const matchesStatus = filterStatus === 'all' || warRoom.status === filterStatus;

    return matchesSearch && matchesApplication && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredWarRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWarRooms = filteredWarRooms.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterApplication, filterStatus]);

  // Statistics
  const totalRecords = warRooms.length;
  const criticalPriority = warRooms.filter(w => w.initialPriority === 'CRITICAL').length;
  const highPriority = warRooms.filter(w => w.initialPriority === 'HIGH').length;
  const closedStatus = warRooms.filter(w => w.status === 'Closed').length;

  // Prepare stats data for StatsGrid
  const statsData = [
    { label: "TOTAL RECORDS", value: totalRecords.toLocaleString(), color: 'purple' as const },
    {
      label: "CRITICAL PRIORITY",
      value: `${criticalPriority.toLocaleString()} (${totalRecords > 0 ? Math.round((criticalPriority / totalRecords) * 100) : 0}%)`,
      color: 'orange' as const
    },
    {
      label: "HIGH PRIORITY",
      value: `${highPriority.toLocaleString()} (${totalRecords > 0 ? Math.round((highPriority / totalRecords) * 100) : 0}%)`,
      color: 'cyan' as const
    },
    {
      label: "CLOSED STATUS",
      value: `${closedStatus.toLocaleString()} (${totalRecords > 0 ? Math.round((closedStatus / totalRecords) * 100) : 0}%)`,
      color: 'emerald' as const
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">War Rooms</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            View and manage war room incident records
          </p>
        </div>

        {/* Upload Section */}
        <UploadSectionDynamic
          currentFilename={currentFilename}
          recordsCount={warRooms.length}
          file={file}
          uploading={uploading}
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
            onRefresh={fetchWarRooms}
            onClearData={warRooms.length > 0 ? handleDropTable : undefined}
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
                placeholder="Incident ID, Application, Summary..."
                className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
              />
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
              Showing {startIndex + 1}-{Math.min(endIndex, filteredWarRooms.length)} of {filteredWarRooms.length} filtered records ({totalRecords} total)
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
              War Room Records
              <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                Showing {filteredWarRooms.length} records
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-foreground">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4">Loading war rooms...</p>
              </div>
            ) : filteredWarRooms.length === 0 ? (
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
                      Incident ID
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
                  {paginatedWarRooms.map((warRoom) => (
                    <tr key={warRoom.incidentId} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group">
                      <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors font-medium">
                        {warRoom.incidentId}
                      </td>
                      <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                        <div className="max-w-xs truncate" title={warRoom.application}>
                          {warRoom.application}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground/80">
                        {warRoom.date}
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

          {/* Pagination Controls */}
          {!loading && filteredWarRooms.length > 0 && (
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
