'use client';

import { useState, useEffect } from 'react';
import { StatsGrid } from '@/components/stats-grid';
import { UploadSectionDynamic } from '@/components/upload-section-dynamic';
import { Badge } from '@/components/ui/badge';

interface ParentChildRequest {
  id: number;
  requestId: string;
  linkedRequestId: string;
  requestIdLink: string | null;
  linkedRequestIdLink: string | null;
}

interface Stats {
  totalRecords: number;
  uniqueParents: number;
  topParents: Array<{
    parentId: string;
    childCount: number;
    link: string | null;
  }>;
}

export default function PortfolioStylePage() {
  const [relationships, setRelationships] = useState<ParentChildRequest[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRecords: 0,
    uniqueParents: 0,
    topParents: [],
  });
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentFilename, setCurrentFilename] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, dataRes] = await Promise.all([
        fetch('http://localhost:3000/parent-child-requests/stats', { cache: 'no-store' }),
        fetch('http://localhost:3000/parent-child-requests?limit=100&offset=0', { cache: 'no-store' }),
      ]);

      const statsData = await statsRes.json();
      const relationshipsData = await dataRes.json();

      setStats(statsData);
      // API returns data wrapped in a "data" property
      const relationships = relationshipsData.data || relationshipsData;
      setRelationships(relationships);

      // Set filename from localStorage or use default
      const savedFilename = localStorage.getItem('lastUploadedFilename');
      if (savedFilename) {
        setCurrentFilename(savedFilename);
      }
    } catch (error: unknown) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/parent-child-requests/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          `✅ Upload successful!\n` +
          `📊 Imported: ${result.imported} records`
        );
        setCurrentFilename(file.name);
        localStorage.setItem('lastUploadedFilename', file.name);
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        await fetchData();
      } else {
        const error = await response.json();
        alert(`❌ Upload failed: ${error.message || 'Failed to upload file'}`);
      }
    } catch (error: unknown) {
      console.error('Upload error:', error);
      alert('❌ Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDropTable = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete all data from the parent_child_requests table!\n\n' +
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
        'http://localhost:3000/parent-child-requests',
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}`);
        await fetchData();
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const calculateAverage = () => {
    if (stats.uniqueParents === 0) return '0.00';
    return (stats.totalRecords / stats.uniqueParents).toFixed(2);
  };

  // Prepare stats data for StatsGrid
  const statsData = [
    { label: "TOTAL RELATIONSHIPS", value: formatNumber(stats.totalRecords), color: 'cyan' as const },
    { label: "UNIQUE PARENT REQUESTS", value: formatNumber(stats.uniqueParents), color: 'purple' as const },
    { label: "AVERAGE CHILDREN", value: calculateAverage(), color: 'orange' as const }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Request Relationships</h1>
          <p className="mt-3 text-base text-muted-foreground/90">Parent-Child Request Management</p>
        </div>

        {/* Upload Section */}
        <UploadSectionDynamic
          currentFilename={currentFilename}
          recordsCount={relationships.length}
          file={file}
          uploading={uploading}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
        />

        {/* Statistics */}
        {statsData.length > 0 && (
          <StatsGrid
            stats={statsData}
            onRefresh={fetchData}
            onClearData={relationships.length > 0 ? handleDropTable : undefined}
            loading={loading}
          />
        )}

        {/* Top Parents Table */}
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
                  <th className="h-12 text-xs font-bold text-jpc-vibrant-purple-400 bg-jpc-vibrant-purple-500/5 uppercase tracking-wider text-left py-4 px-6">Rank</th>
                  <th className="h-12 text-xs font-bold text-jpc-vibrant-purple-400 bg-jpc-vibrant-purple-500/5 uppercase tracking-wider text-left py-4 px-6">Parent Request ID</th>
                  <th className="h-12 text-xs font-bold text-jpc-vibrant-purple-400 bg-jpc-vibrant-purple-500/5 uppercase tracking-wider text-left py-4 px-6">Child Count</th>
                </tr>
              </thead>
              <tbody>
                {stats.topParents.map((parent, index) => (
                  <tr key={parent.parentId} className="border-b border-jpc-vibrant-purple-500/10 hover:bg-jpc-vibrant-purple-500/10 transition-all duration-300 group">
                    <td className="px-6 py-4 text-xs text-muted-foreground/80">{index + 1}</td>
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
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
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
                      <span className="text-sm font-bold text-foreground/80 group-hover:text-jpc-vibrant-purple-400 transition-colors">{parent.childCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Relationships Table */}
        <div className="rounded-2xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-cyan-500/10 backdrop-blur-sm hover:border-jpc-vibrant-cyan-500/30 transition-all duration-300">
          <div className="px-6 py-6 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5">
            <h3 className="text-sm font-bold text-foreground">
              Recent Relationships
              <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                Showing {Math.min(100, relationships.length)} of {formatNumber(stats.totalRecords)} total
              </span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-foreground">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4">Loading relationships...</p>
              </div>
            ) : relationships.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border/60 rounded-xl shadow-xl">
                <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p className="text-foreground text-lg mb-2 mt-4">No data available</p>
                <p className="text-muted-foreground/70 text-sm">Upload a file to get started</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-transparent">
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-center py-4 px-2 w-16">ID</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">Child Request ID</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-6">Parent Request ID</th>
                  </tr>
                </thead>
                <tbody>
                  {relationships.map((rel) => (
                    <tr key={rel.id} className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group">
                      <td className="py-4 px-2 text-center text-jpc-vibrant-cyan-400/70 font-mono text-xs font-medium">{rel.id}</td>
                      <td className="px-6 py-4">
                        {rel.requestIdLink ? (
                          <a
                            href={rel.requestIdLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-underline"
                          >
                            <Badge
                              variant="secondary"
                              className="font-mono text-xs bg-jpc-vibrant-cyan-500/15 text-jpc-vibrant-cyan-400 border border-jpc-vibrant-cyan-500/30 group-hover:bg-jpc-vibrant-cyan-500/25 transition-all duration-300 inline-flex items-center gap-1"
                            >
                              {rel.requestId}
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </Badge>
                          </a>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs bg-jpc-vibrant-cyan-500/15 text-jpc-vibrant-cyan-400 border border-jpc-vibrant-cyan-500/30 group-hover:bg-jpc-vibrant-cyan-500/25 transition-all duration-300"
                          >
                            {rel.requestId}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {rel.linkedRequestIdLink ? (
                          <a
                            href={rel.linkedRequestIdLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-underline"
                          >
                            <Badge
                              variant="secondary"
                              className="font-mono text-xs bg-jpc-vibrant-orange-500/15 text-jpc-vibrant-orange-400 border border-jpc-vibrant-orange-500/30 group-hover:bg-jpc-vibrant-orange-500/25 transition-all duration-300 inline-flex items-center gap-1"
                            >
                              {rel.linkedRequestId}
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </Badge>
                          </a>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs bg-jpc-vibrant-orange-500/15 text-jpc-vibrant-orange-400 border border-jpc-vibrant-orange-500/30 group-hover:bg-jpc-vibrant-orange-500/25 transition-all duration-300"
                          >
                            {rel.linkedRequestId}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

