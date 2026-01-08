'use client';

import { useState, useEffect } from 'react';
import type { Problem } from '@repo/reports/frontend';
import { StatsGrid } from '@/components/stats-grid';
import { UploadSectionDynamic } from '@/components/upload-section-dynamic';
import { Badge } from '@/components/ui/badge';
import { getErrorMessage } from '@/lib/api';

export default function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterApplication, setFilterApplication] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentFilename, setCurrentFilename] = useState<string>('');

  useEffect(() => {
    fetchProblems();
    const savedFilename = localStorage.getItem('lastUploadedProblemsFile');
    if (savedFilename) {
      setCurrentFilename(savedFilename);
    }
  }, []);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/problems', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setProblems(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch problems:', error);
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
      const response = await fetch('http://localhost:3000/problems/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          `✅ ${result.message}\n` +
          `📊 Total records: ${result.total}\n` +
          `✨ Imported: ${result.imported}`
        );
        setCurrentFilename(file.name);
        localStorage.setItem('lastUploadedProblemsFile', file.name);
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        await fetchProblems();
      } else {
        const error = await response.json();
        alert(`❌ Upload failed: ${getErrorMessage(error)}`);
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
      '⚠️ WARNING: This will permanently delete all data from the problems table!\n\n' +
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
      const response = await fetch('http://localhost:3000/problems', {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message || 'All problems deleted successfully'}`);
        await fetchProblems();
      } else {
        const error = await response.json();
        alert(`❌ Failed to delete records: ${getErrorMessage(error)}`);
      }
    } catch (error) {
      console.error('Delete records error:', error);
      alert('❌ Failed to delete records');
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.requestId.toString().includes(searchTerm);
    const matchesApplication = filterApplication === 'all' || problem.aplicativos === filterApplication;
    const matchesCategory = filterCategory === 'all' || problem.serviceCategory === filterCategory;

    return matchesSearch && matchesApplication && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProblems = filteredProblems.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterApplication, filterCategory]);

  // Stats
  const totalProblems = problems.length;
  const uniqueApplications = new Set(problems.map((p) => p.aplicativos)).size;
  const uniqueCreators = new Set(problems.map((p) => p.createdBy)).size;
  const withActionPlans = problems.filter((p) => p.planesDeAccion !== 'No asignado').length;

  const statsData = [
    { label: 'Total Problems', value: totalProblems, color: 'cyan' as const },
    { label: 'Applications', value: uniqueApplications, color: 'emerald' as const },
    { label: 'Creators', value: uniqueCreators, color: 'purple' as const },
    { label: 'With Action Plans', value: withActionPlans, color: 'orange' as const },
  ];

  // Get unique values for filters
  const applications = Array.from(new Set(problems.map((p) => p.aplicativos)));
  const categories = Array.from(new Set(problems.map((p) => p.serviceCategory)));

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Problems Dashboard</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            View and manage reported problems from XD PROBLEMAS NUEVOS
          </p>
        </div>

        {/* Upload Section */}
        <UploadSectionDynamic
          currentFilename={currentFilename}
          recordsCount={problems.length}
          file={file}
          uploading={uploading}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
          hardcodedFilename="XD PROBLEMAS NUEVOS.xlsx"
          title="Upload Problems Report"
          description="Upload an Excel file (XD PROBLEMAS NUEVOS) to import and manage problems data"
        />

        {/* Statistics */}
        {statsData.length > 0 && (
          <StatsGrid
            stats={statsData}
            onRefresh={fetchProblems}
            onClearData={problems.length > 0 ? handleDropTable : undefined}
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
                placeholder="Subject or Request ID..."
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
                Category
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
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
              Problem Records
              <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                Showing {filteredProblems.length} records
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-transparent">
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Request ID
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Subject
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Application
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Category
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Created By
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Created Time
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Due By
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Action Plan
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">
                    Observations
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedProblems.map((problem) => (
                  <tr key={problem.requestId} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {problem.requestIdLink ? (
                        <a
                          href={problem.requestIdLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Badge
                            variant="outline"
                            className="bg-jpc-vibrant-cyan-500/20 text-cyan-100 border-jpc-vibrant-cyan-500/40 hover:bg-jpc-vibrant-cyan-500/30 border font-medium transition-all duration-300 cursor-pointer inline-flex items-center gap-1"
                          >
                            {problem.requestId}
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
                        <Badge variant="outline" className="font-medium">
                          {problem.requestId}
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                      {problem.subjectLink ? (
                        <a
                          href={problem.subjectLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-jpc-vibrant-cyan-400 hover:text-jpc-vibrant-cyan-300 hover:underline transition-colors"
                          title={problem.subject}
                        >
                          <div className="max-w-xs truncate">
                            {problem.subject}
                          </div>
                        </a>
                      ) : (
                        <div className="max-w-xs truncate" title={problem.subject}>
                          {problem.subject}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className="bg-jpc-vibrant-purple-500/20 text-purple-100 border-jpc-vibrant-purple-500/40 hover:bg-jpc-vibrant-purple-500/30 border font-medium transition-all duration-300"
                      >
                        {problem.aplicativos}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                      <div className="max-w-xs truncate" title={problem.serviceCategory}>
                        {problem.serviceCategory}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground/80 group-hover:text-cyan-100 transition-colors">
                      <div className="max-w-xs truncate" title={problem.createdBy}>
                        {problem.createdBy}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground/80">
                      {problem.createdTime}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground/80">
                      {problem.dueByTime}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${
                          problem.planesDeAccion === 'No asignado'
                            ? 'bg-gray-500/20 text-gray-100 border-gray-500/40'
                            : 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40 hover:bg-jpc-vibrant-orange-500/30'
                        } border font-medium transition-all duration-300`}
                      >
                        <div className="max-w-[150px] truncate" title={problem.planesDeAccion}>
                          {problem.planesDeAccion}
                        </div>
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${
                          problem.observaciones === 'No asignado'
                            ? 'bg-gray-500/20 text-gray-100 border-gray-500/40'
                            : 'bg-jpc-vibrant-emerald-500/20 text-jpc-vibrant-emerald-400 border-jpc-vibrant-emerald-500/40 hover:bg-jpc-vibrant-emerald-500/30'
                        } border font-medium transition-all duration-300`}
                      >
                        <div className="max-w-[150px] truncate" title={problem.observaciones}>
                          {problem.observaciones}
                        </div>
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5 px-6 py-4 border-t border-jpc-vibrant-cyan-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm text-cyan-100/90">
                  Showing <span className="font-semibold text-cyan-100">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-semibold text-cyan-100">{Math.min(currentPage * itemsPerPage, filteredProblems.length)}</span> of{' '}
                  <span className="font-semibold text-cyan-100">{filteredProblems.length}</span> results
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-jpc-vibrant-cyan-500/20 border border-jpc-vibrant-cyan-500/40 rounded-lg text-sm text-cyan-100 focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500 hover:bg-jpc-vibrant-cyan-500/30 transition-colors"
                >
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                      : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
