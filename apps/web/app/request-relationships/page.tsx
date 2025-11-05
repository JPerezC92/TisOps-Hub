'use client';

import { useState, useEffect } from 'react';

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
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [currentDataSource, setCurrentDataSource] = useState<string>('No data uploaded yet');
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

      if (relationships.length > 0) {
        setCurrentDataSource(`Data uploaded - ${relationships.length} records`);
        // Set filename from localStorage or use default
        const savedFilename = localStorage.getItem('lastUploadedFilename');
        if (savedFilename) {
          setCurrentFilename(savedFilename);
        }
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
      setUploadStatus({ type: null, message: '' });
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setUploadStatus({ type: null, message: '' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/parent-child-requests/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadStatus({
          type: 'success',
          message: `Successfully imported ${result.imported} records!`,
        });
        setCurrentFilename(file.name);
        localStorage.setItem('lastUploadedFilename', file.name);
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        await fetchData();
      } else {
        const error = await response.json();
        setUploadStatus({
          type: 'error',
          message: error.message || 'Failed to upload file',
        });
      }
    } catch (error: unknown) {
      setUploadStatus({
        type: 'error',
        message: 'Network error. Please try again.',
      });
      console.error('Upload error:', error);
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

  return (
    <div className="min-h-screen bg-jpc-bg-900 relative overflow-hidden">
      {/* Background with blur effect */}
      <div className="fixed inset-0 bg-linear-to-br from-jpc-bg-900 via-jpc-bg-500 to-jpc-bg-900 -z-10"></div>
      <div className="fixed inset-0 backdrop-blur-sm bg-jpc-900/10 -z-10"></div>

      {/* Header */}
      <header className="bg-jpc-900/20 backdrop-blur-2xl border-b border-jpc-400/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-jpc-gold-500">REQUEST RELATIONSHIPS</h1>
          <p className="text-jpc-400 mt-1">Parent-Child Request Management</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Section */}
        <div className="bg-jpc-400/10 border border-jpc-400/50 rounded-xl shadow-[0_0_9px_2px] shadow-jpc-400/30 mb-8 overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-jpc-gold-500 mb-2">Upload For Tagging Report</h2>
            <p className="text-jpc-gold-500/70 mb-6">Upload an Excel file to parse and save for tagging data</p>

            {/* Current Data Source */}
            <div className="bg-jpc-900/20 border border-jpc-400/30 rounded-lg px-4 py-3 mb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-jpc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-jpc-gold-500">
                    <span className="font-semibold">Current Data Source:</span> {currentDataSource}
                  </span>
                </div>
                {currentFilename && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-jpc-gold-500/70 font-mono">{currentFilename}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(currentFilename);
                      }}
                      className="p-1 hover:bg-jpc-400/10 rounded transition-colors"
                      title="Copy filename"
                    >
                      <svg className="h-3 w-3 text-jpc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-jpc-orange-500/10 border border-jpc-orange-500/30 rounded-lg px-4 py-3 mb-4">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-jpc-orange-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-jpc-gold-500">
                  <span className="font-semibold">Warning:</span> Uploading will replace all existing data
                </span>
              </div>
            </div>

            {/* File Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-jpc-gold-500 mb-2">Select Excel File</label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-jpc-gold-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-jpc-400 file:text-jpc-bg-900 hover:file:bg-jpc-400/80 file:cursor-pointer cursor-pointer bg-jpc-900/20 border border-jpc-400/30 rounded-lg"
              />
            </div>

            {/* Upload Button */}
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || loading}
              className="w-full bg-jpc-400 hover:bg-jpc-400/80 disabled:bg-jpc-400/30 text-jpc-bg-900 font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-jpc-bg-900"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload & Parse</span>
                </>
              )}
            </button>

            {/* Upload Status Messages */}
            {uploadStatus.type === 'success' && (
              <div className="mt-4 bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-jpc-gold-500">{uploadStatus.message}</span>
                </div>
              </div>
            )}

            {uploadStatus.type === 'error' && (
              <div className="mt-4 bg-jpc-orange-500/20 border border-jpc-orange-500/50 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-jpc-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="text-sm text-jpc-gold-500">{uploadStatus.message}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-jpc-400/10 border border-jpc-400/50 rounded-xl p-6 shadow-[0_0_9px_2px] shadow-jpc-400/30">
            <h3 className="text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider mb-2">Total Relationships</h3>
            <p className="text-4xl font-bold text-jpc-400">{formatNumber(stats.totalRecords)}</p>
          </div>
          <div className="bg-jpc-purple-500/10 border border-jpc-purple-500/50 rounded-xl p-6 shadow-[0_0_9px_2px] shadow-jpc-purple-500/30">
            <h3 className="text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider mb-2">Unique Parent Requests</h3>
            <p className="text-4xl font-bold text-jpc-purple-500">{formatNumber(stats.uniqueParents)}</p>
          </div>
          <div className="bg-jpc-orange-500/10 border border-jpc-orange-500/50 rounded-xl p-6 shadow-[0_0_9px_2px] shadow-jpc-orange-500/30">
            <h3 className="text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider mb-2">Average Children</h3>
            <p className="text-4xl font-bold text-jpc-orange-500">{calculateAverage()}</p>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end mb-6">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="bg-jpc-400 hover:bg-jpc-400/80 disabled:bg-jpc-400/30 text-jpc-bg-900 font-semibold px-6 py-2 rounded-lg text-sm flex items-center gap-2 shadow-lg transition-all duration-200"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-jpc-bg-900"></div>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh Data
          </button>
        </div>

        {/* Top Parents Table */}
        <div className="bg-jpc-400/10 border border-jpc-400/50 rounded-xl shadow-[0_0_9px_2px] shadow-jpc-400/30 mb-8 overflow-hidden">
          <div className="px-6 py-4 bg-jpc-purple-900 border-b border-jpc-400/30">
            <h3 className="text-xl font-bold text-jpc-gold-500">Top 10 Parent Requests</h3>
            <p className="text-jpc-gold-500/70 mt-1">Parent requests with the most child relationships</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-jpc-400/20">
              <thead className="bg-jpc-900/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-jpc-gold-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-jpc-gold-500 uppercase tracking-wider">Parent Request ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-jpc-gold-500 uppercase tracking-wider">Child Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-jpc-400/10">
                {stats.topParents.map((parent, index) => (
                  <tr key={parent.parentId} className="hover:bg-jpc-400/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-jpc-gold-500/70">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {parent.link ? (
                        <a
                          href={parent.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-jpc-purple-500/50 text-jpc-gold-500 hover:bg-jpc-purple-500/70 transition-all duration-200 no-underline border border-jpc-purple-500/50"
                        >
                          {parent.parentId}
                          <svg className="w-3 h-3 text-jpc-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-jpc-purple-500/50 text-jpc-gold-500 border border-jpc-purple-500/50">
                          {parent.parentId}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-jpc-400">{parent.childCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Relationships Table */}
        <div className="bg-jpc-400/10 border border-jpc-400/50 rounded-xl shadow-[0_0_9px_2px] shadow-jpc-400/30 overflow-hidden">
          <div className="px-6 py-4 bg-jpc-purple-900 border-b border-jpc-400/30">
            <h3 className="text-xl font-bold text-jpc-gold-500">Recent Relationships</h3>
            <p className="text-jpc-gold-500/70 mt-1">
              Showing <span className="font-semibold text-jpc-400">{Math.min(100, relationships.length)}</span> of{' '}
              <span className="font-semibold text-jpc-400">{formatNumber(stats.totalRecords)}</span> total relationships
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-jpc-400/20">
              <thead className="bg-jpc-900/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-jpc-gold-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-jpc-gold-500 uppercase tracking-wider">Child Request ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-jpc-gold-500 uppercase tracking-wider">Parent Request ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-jpc-400/10">
                {Array.isArray(relationships) && relationships.length > 0 ? (
                  relationships.map((rel) => (
                    <tr key={rel.id} className="hover:bg-jpc-400/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-jpc-gold-500/70">{rel.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rel.requestIdLink ? (
                        <a
                          href={rel.requestIdLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-jpc-400/30 text-jpc-gold-500 hover:bg-jpc-400/50 transition-all duration-200 no-underline border border-jpc-400/50"
                        >
                          {rel.requestId}
                          <svg className="w-3 h-3 text-jpc-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-jpc-400/30 text-jpc-gold-500 border border-jpc-400/50">
                          {rel.requestId}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {rel.linkedRequestIdLink ? (
                        <a
                          href={rel.linkedRequestIdLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-jpc-orange-500/30 text-jpc-gold-500 hover:bg-jpc-orange-500/50 transition-all duration-200 no-underline border border-jpc-orange-500/50"
                        >
                          {rel.linkedRequestId}
                          <svg className="w-3 h-3 text-jpc-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-jpc-orange-500/30 text-jpc-gold-500 border border-jpc-orange-500/50">
                          {rel.linkedRequestId}
                        </span>
                      )}
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-jpc-gold-500/70">
                      No data available. Upload a file to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

