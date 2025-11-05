'use client';

import { useState, useEffect } from 'react';
import type {
  RequestCategorization,
  CategorySummary,
} from '@repo/reports';

export default function RequestCategorizationPage() {
  const [data, setData] = useState<RequestCategorization[]>([]);
  const [summary, setSummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentFilename, setCurrentFilename] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
    const savedFilename = localStorage.getItem('lastUploadedErrorCategorizationFile');
    if (savedFilename) {
      setCurrentFilename(savedFilename);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dataResponse, summaryResponse] = await Promise.all([
        fetch('http://localhost:3000/request-categorization', {
          cache: 'no-store',
        }),
        fetch('http://localhost:3000/request-categorization/summary', {
          cache: 'no-store',
        }),
      ]);

      const dataJson = await dataResponse.json();
      const summaryJson = await summaryResponse.json();

      setData(dataJson);
      setSummary(summaryJson);

      const savedFilename = localStorage.getItem('lastUploadedErrorCategorizationFile');
      if (savedFilename) {
        setCurrentFilename(savedFilename);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
      const response = await fetch(
        'http://localhost:3000/request-categorization/upload',
        {
          method: 'POST',
          body: formData,
        },
      );

      if (response.ok) {
        const result = await response.json();
        alert(
          `✅ ${result.message}\n📊 Records created: ${result.recordsCreated}`,
        );
        setCurrentFilename(file.name);
        localStorage.setItem('lastUploadedErrorCategorizationFile', file.name);
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        await fetchData();
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

  return (
    <div className="min-h-screen bg-jpc-bg-900 relative overflow-hidden">
      {/* Background with blur effect */}
      <div className="fixed inset-0 bg-linear-to-br from-jpc-bg-900 via-jpc-bg-500 to-jpc-bg-900 -z-10"></div>
      <div className="fixed inset-0 backdrop-blur-sm bg-jpc-900/10 -z-10"></div>

      {/* Header */}
      <header className="bg-jpc-900/20 backdrop-blur-2xl border-b border-jpc-400/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-jpc-gold-500">ERROR CATEGORIZATION</h1>
          <p className="text-jpc-400 mt-1">Categorized Error Reports Management</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Section */}
        <div className="bg-jpc-400/10 border border-jpc-400/50 rounded-xl shadow-[0_0_9px_2px] shadow-jpc-400/30 mb-8 overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-jpc-gold-500 mb-2">Upload Error Categorization Report</h2>
            <p className="text-jpc-gold-500/70 mb-6">Upload an Excel file (REP001 PARA ETIQUETAR) to parse and categorize error reports</p>

            {/* Current Data Source */}
            <div className="bg-jpc-900/20 border border-jpc-400/30 rounded-lg px-4 py-3 mb-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-jpc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-jpc-gold-500">
                    <span className="font-semibold">Current Data Source:</span> {data.length > 0 ? `Data uploaded - ${data.length} records` : 'No data uploaded yet'}
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
                disabled={uploading}
                className="block w-full text-sm text-jpc-gold-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-jpc-400 file:text-jpc-bg-900 hover:file:bg-jpc-500 file:cursor-pointer cursor-pointer bg-jpc-900/40 border border-jpc-400/30 rounded-lg"
              />
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-jpc-500 text-jpc-bg-900 px-6 py-3 rounded-lg font-semibold hover:bg-jpc-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_9px_0px] shadow-jpc-500/50 hover:shadow-[0_0_12px_2px] hover:shadow-jpc-500/70"
            >
              {uploading ? '⏳ Uploading...' : '📤 Upload and Parse'}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        {summary.length > 0 && (
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <div className="bg-jpc-400/10 border border-jpc-400/50 rounded-xl shadow-[0_0_9px_2px] shadow-jpc-400/30 p-6">
              <h3 className="text-sm font-semibold text-jpc-gold-500/70 uppercase tracking-wider mb-3">TOTAL RECORDS</h3>
              <div className="text-4xl font-bold text-jpc-gold-500">{data.length.toLocaleString()}</div>
            </div>
            {summary.map((cat, idx) => {
              const colors = [
                { text: 'text-jpc-purple-500', border: 'border-jpc-purple-500/50', shadow: 'shadow-jpc-purple-500/30' },
                { text: 'text-jpc-orange-500', border: 'border-jpc-orange-500/50', shadow: 'shadow-jpc-orange-500/30' },
                { text: 'text-jpc-500', border: 'border-jpc-500/50', shadow: 'shadow-jpc-500/30' },
              ];
              const colorClass = colors[idx % colors.length]!;
              return (
                <div
                  key={cat.category}
                  className={`bg-jpc-400/10 border ${colorClass.border} rounded-xl shadow-[0_0_9px_2px] ${colorClass.shadow} p-6`}
                >
                  <h3 className="text-sm font-semibold text-jpc-gold-500/70 uppercase tracking-wider mb-3">{cat.category}</h3>
                  <div className={`text-4xl font-bold ${colorClass.text}`}>{cat.count.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-5 py-2.5 bg-jpc-400 text-jpc-bg-900 rounded-lg font-semibold hover:bg-jpc-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_9px_0px] shadow-jpc-400/50 hover:shadow-[0_0_12px_2px] hover:shadow-jpc-400/70 flex items-center gap-2"
          >
            <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="text-center py-12 text-jpc-gold-500">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-gold-500"></div>
            <p className="mt-4">Loading data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 bg-jpc-400/10 border border-jpc-400/50 rounded-xl shadow-[0_0_9px_2px] shadow-jpc-400/30">
            <svg className="mx-auto h-12 w-12 text-jpc-gold-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-jpc-gold-500 text-lg mb-2 mt-4">No data available</p>
            <p className="text-jpc-gold-500/70 text-sm">Upload an Excel file to get started</p>
          </div>
        ) : (
          <div className="bg-jpc-400/10 border border-jpc-400/50 rounded-xl shadow-[0_0_9px_2px] shadow-jpc-400/30 overflow-hidden">
            <div className="p-6 border-b border-jpc-400/50">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-jpc-gold-500">Error Classification Records</h3>
                <p className="text-sm text-jpc-gold-500/70">
                  Showing <span className="font-semibold text-jpc-gold-500">{data.length}</span> total records
                </p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-jpc-900/40">
                  <tr>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">ID</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Category</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Technician</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Request ID</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Created Time</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Module</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Subject</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Problem ID</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Linked Request</th>
                  </tr>
                </thead>
                <tbody className="bg-jpc-900/20">
                  {data.map((record, idx) => (
                    <tr 
                      key={record.id} 
                      className={`border-t border-jpc-400/20 hover:bg-jpc-400/10 transition-colors ${
                        idx % 2 === 0 ? 'bg-jpc-900/10' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-jpc-gold-500 font-mono">{record.id}</td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-3 py-1 bg-jpc-purple-500/20 border border-jpc-purple-500/50 text-jpc-purple-400 rounded-lg text-xs font-semibold shadow-sm">
                          {record.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-jpc-gold-500/80">{record.technician}</td>
                      <td className="py-4 px-4">
                        {record.requestIdLink ? (
                          <a
                            href={record.requestIdLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-jpc-400/30 text-jpc-gold-500 hover:bg-jpc-400/50 transition-all duration-200 no-underline border border-jpc-400/50"
                          >
                            {record.requestId}
                            <svg className="w-3 h-3 text-jpc-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-jpc-400/30 text-jpc-gold-500 border border-jpc-400/50">
                            {record.requestId}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-jpc-gold-500/80">{record.createdTime}</td>
                      <td className="py-4 px-4 text-jpc-gold-500/80">{record.modulo}</td>
                      <td className="py-4 px-4 text-jpc-gold-500/80 max-w-xs truncate" title={record.subject}>
                        {record.subject}
                      </td>
                      <td className="py-4 px-4 text-jpc-gold-500/80">{record.problemId}</td>
                      <td className="py-4 px-4">
                        {record.linkedRequestIdLink ? (
                          <a
                            href={record.linkedRequestIdLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-jpc-400/30 text-jpc-gold-500 hover:bg-jpc-400/50 transition-all duration-200 no-underline border border-jpc-400/50"
                          >
                            {record.linkedRequestId}
                            <svg className="w-3 h-3 text-jpc-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-jpc-400/30 text-jpc-gold-500/50 border border-jpc-400/50">
                            {record.linkedRequestId || '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
