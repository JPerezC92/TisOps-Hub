'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FileImport {
  id: string;
  filename: string;
  uploadedAt: string;
  recordCount: number;
  status: 'success' | 'processing' | 'failed';
  source: 'request-relationships' | 'error-categorization' | 'request-tags' | 'other-source';
  sourceLabel: string;
}

export default function ImportsPage() {
  const [fileImports, setFileImports] = useState<FileImport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImportData = async () => {
      try {
        const [reqRelResponse, errorCatResponse, requestTagsResponse] = await Promise.all([
          fetch('http://localhost:3000/parent-child-requests', { cache: 'no-store' }),
          fetch('http://localhost:3000/request-categorization', { cache: 'no-store' }),
          fetch('http://localhost:3000/request-tags', { cache: 'no-store' }),
        ]);

        const imports: FileImport[] = [];

        // Request Relationships
        if (reqRelResponse.ok) {
          const reqRelData = await reqRelResponse.json();
          console.log('Request Relationships data:', reqRelData);
          // API returns { data: [], total: number }
          if (reqRelData.data && reqRelData.data.length > 0) {
            imports.push({
              id: '1',
              filename: 'REP02 padre hijo.xlsx',
              uploadedAt: new Date().toISOString(),
              recordCount: reqRelData.total || reqRelData.data.length,
              status: 'success',
              source: 'request-relationships',
              sourceLabel: 'Request Relationships',
            });
          }
        }

        // Error Categorization
        if (errorCatResponse.ok) {
          const errorCatData = await errorCatResponse.json();
          console.log('Error Categorization data:', errorCatData);
          // API returns a direct array [{...}, {...}]
          if (Array.isArray(errorCatData) && errorCatData.length > 0) {
            imports.push({
              id: '2',
              filename: 'REP001 PARA ETIQUETAR.xlsx',
              uploadedAt: new Date().toISOString(),
              recordCount: errorCatData.length,
              status: 'success',
              source: 'error-categorization',
              sourceLabel: 'Error Categorization',
            });
          }
        }

        // Request Tags
        if (requestTagsResponse.ok) {
          const requestTagsData = await requestTagsResponse.json();
          console.log('Request Tags data:', requestTagsData);
          // API returns { data: [], total: number }
          if (requestTagsData.data && requestTagsData.data.length > 0) {
            imports.push({
              id: '3',
              filename: 'REP01 XD TAG 2025.xlsx',
              uploadedAt: new Date().toISOString(),
              recordCount: requestTagsData.total || requestTagsData.data.length,
              status: 'success',
              source: 'request-tags',
              sourceLabel: 'Request Tags',
            });
          }
        }

        console.log('Final imports array:', imports);
        setFileImports(imports);
      } catch (error) {
        console.error('Failed to fetch import data:', error);
        // If fetch fails, still set empty array to stop loading
        setFileImports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImportData();
  }, []);

  const [uploadingErrorCat, setUploadingErrorCat] = useState(false);
  const [uploadingReqRel, setUploadingReqRel] = useState(false);
  const [uploadingRequestTags, setUploadingRequestTags] = useState(false);

  // Error states for each upload type
  const [errorCatError, setErrorCatError] = useState<string | null>(null);
  const [reqRelError, setReqRelError] = useState<string | null>(null);
  const [requestTagsError, setRequestTagsError] = useState<string | null>(null);

  // Success states for each upload type
  const [errorCatSuccess, setErrorCatSuccess] = useState<string | null>(null);
  const [reqRelSuccess, setReqRelSuccess] = useState<string | null>(null);
  const [requestTagsSuccess, setRequestTagsSuccess] = useState<string | null>(null);

  const copyFilenameWithoutExtension = (filename: string) => {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    navigator.clipboard.writeText(nameWithoutExt);
  };

  const handleErrorCategorizationFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingErrorCat(true);
    setErrorCatError(null);
    setErrorCatSuccess(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/request-categorization/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }
      
      setErrorCatSuccess('File uploaded successfully!');
      // Reset the input
      e.target.value = '';
      // Auto-hide success after 5 seconds
      setTimeout(() => setErrorCatSuccess(null), 5000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      setErrorCatError(message);
      e.target.value = '';
    } finally {
      setUploadingErrorCat(false);
    }
  };

  const handleRequestRelationshipsFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingReqRel(true);
    setReqRelError(null);
    setReqRelSuccess(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/parent-child-requests/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }
      
      setReqRelSuccess('File uploaded successfully!');
      // Reset the input
      e.target.value = '';
      // Auto-hide success after 5 seconds
      setTimeout(() => setReqRelSuccess(null), 5000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      setReqRelError(message);
      e.target.value = '';
    } finally {
      setUploadingReqRel(false);
    }
  };

  const handleRequestTagsFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingRequestTags(true);
    setRequestTagsError(null);
    setRequestTagsSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:3000/request-tags/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      setRequestTagsSuccess(`File uploaded successfully! Imported: ${result.imported || 0} records, Skipped: ${result.skipped || 0} duplicates`);
      // Reset the input
      e.target.value = '';
      // Auto-hide success after 5 seconds
      setTimeout(() => setRequestTagsSuccess(null), 5000);
      // Refresh the page data
      setTimeout(() => window.location.reload(), 5000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      setRequestTagsError(message);
      e.target.value = '';
    } finally {
      setUploadingRequestTags(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getSourceLink = (source: string) => {
    switch (source) {
      case 'request-relationships':
        return '/request-relationships';
      case 'error-categorization':
        return '/error-categorization';
      case 'request-tags':
        return '/request-tags';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">File Imports</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            Manage and track all uploaded files across different import sources
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Total Imports</p>
                <p className="text-4xl font-bold text-jpc-vibrant-cyan-400">{fileImports.length}</p>
              </div>
              <svg className="h-10 w-10 text-jpc-vibrant-cyan-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Successful</p>
                <p className="text-4xl font-bold text-jpc-vibrant-emerald-400">
                  {fileImports.filter((f) => f.status === 'success').length}
                </p>
              </div>
              <svg className="h-10 w-10 text-jpc-vibrant-emerald-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Processing</p>
                <p className="text-4xl font-bold text-jpc-vibrant-cyan-400">
                  {fileImports.filter((f) => f.status === 'processing').length}
                </p>
              </div>
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-jpc-vibrant-cyan-400"></div>
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Failed</p>
                <p className="text-4xl font-bold text-jpc-vibrant-orange-400">
                  {fileImports.filter((f) => f.status === 'failed').length}
                </p>
              </div>
              <svg className="h-10 w-10 text-jpc-vibrant-orange-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Upload Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Error Categorization Upload */}
          <div className="bg-card border border-jpc-vibrant-orange-500/20 rounded-xl shadow-xl p-4 hover:border-jpc-vibrant-orange-500/40 transition-all">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <svg className="h-5 w-5 text-jpc-vibrant-orange-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">Error Categorization</h3>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-muted-foreground/80 truncate">REP001 PARA ETIQUETAR.xlsx</p>
                    <button
                      onClick={() => copyFilenameWithoutExtension('REP001 PARA ETIQUETAR.xlsx')}
                      className="shrink-0 p-0.5 hover:bg-jpc-vibrant-orange-500/20 rounded transition-colors"
                      title="Copy filename without extension"
                    >
                      <svg className="h-3 w-3 text-muted-foreground/70 hover:text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative shrink-0">
                <label
                  htmlFor="error-cat-upload"
                  className={`cursor-pointer inline-flex items-center justify-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    uploadingErrorCat
                      ? 'bg-jpc-vibrant-orange-500/50 cursor-not-allowed'
                      : 'bg-jpc-vibrant-orange-500 hover:bg-jpc-vibrant-orange-500/80 text-white'
                  }`}
                >
                  <input
                    type="file"
                    id="error-cat-upload"
                    accept=".xlsx,.xls"
                    onChange={handleErrorCategorizationFileChange}
                    disabled={uploadingErrorCat}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploadingErrorCat ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </label>
              </div>
            </div>
            
            {/* Error Message Box */}
            {errorCatError && (
              <div className="mt-3 bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-red-500 mb-1">Upload Failed</p>
                    <p className="text-xs text-red-400 break-words">{errorCatError}</p>
                  </div>
                  <button
                    onClick={() => setErrorCatError(null)}
                    className="text-red-400 hover:text-red-300 shrink-0"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* Success Message Box */}
            {errorCatSuccess && (
              <div className="mt-3 bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs text-green-400">{errorCatSuccess}</p>
                  </div>
                  <button
                    onClick={() => setErrorCatSuccess(null)}
                    className="text-green-400 hover:text-green-300 shrink-0"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Request Relationships Upload */}
          <div className="bg-card border border-jpc-vibrant-cyan-500/20 rounded-xl shadow-xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <svg className="h-5 w-5 text-jpc-vibrant-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">Request Relationships</h3>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-foreground/70 truncate">REP02 padre hijo.xlsx</p>
                    <button
                      onClick={() => copyFilenameWithoutExtension('REP02 padre hijo.xlsx')}
                      className="shrink-0 p-0.5 hover:bg-jpc-vibrant-cyan-500/20 rounded transition-colors"
                      title="Copy filename without extension"
                    >
                      <svg className="h-3 w-3 text-foreground/70 hover:text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative shrink-0">
                <label
                  htmlFor="req-rel-upload"
                  className={`cursor-pointer inline-flex items-center justify-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    uploadingReqRel
                      ? 'bg-jpc-vibrant-cyan-500/50 cursor-not-allowed'
                      : 'bg-jpc-vibrant-cyan-500 hover:bg-jpc-vibrant-cyan-500/80 text-white'
                  }`}
                >
                  <input
                    type="file"
                    id="req-rel-upload"
                    accept=".xlsx,.xls"
                    onChange={handleRequestRelationshipsFileChange}
                    disabled={uploadingReqRel}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploadingReqRel ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </label>
              </div>
            </div>
            
            {/* Error Message Box */}
            {reqRelError && (
              <div className="mt-3 bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-red-500 mb-1">Upload Failed</p>
                    <p className="text-xs text-red-400 break-words">{reqRelError}</p>
                  </div>
                  <button
                    onClick={() => setReqRelError(null)}
                    className="text-red-400 hover:text-red-300 shrink-0"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* Success Message Box */}
            {reqRelSuccess && (
              <div className="mt-3 bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs text-green-400">{reqRelSuccess}</p>
                  </div>
                  <button
                    onClick={() => setReqRelSuccess(null)}
                    className="text-green-400 hover:text-green-300 shrink-0"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Request Tags Upload */}
          <div className="bg-card border border-jpc-vibrant-purple-500/20 rounded-xl shadow-xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <svg className="h-5 w-5 text-jpc-vibrant-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">Request Tags</h3>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-foreground/70 truncate">REP01 XD TAG 2025.xlsx</p>
                    <button
                      onClick={() => copyFilenameWithoutExtension('REP01 XD TAG 2025.xlsx')}
                      className="shrink-0 p-0.5 hover:bg-jpc-vibrant-purple-500/20 rounded transition-colors"
                      title="Copy filename without extension"
                    >
                      <svg className="h-3 w-3 text-foreground/70 hover:text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative shrink-0">
                <label
                  htmlFor="request-tags-upload"
                  className={`cursor-pointer inline-flex items-center justify-center px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    uploadingRequestTags
                      ? 'bg-jpc-vibrant-purple-500/50 cursor-not-allowed'
                      : 'bg-jpc-vibrant-purple-500 hover:bg-jpc-vibrant-purple-500/80 text-white'
                  }`}
                >
                  <input
                    type="file"
                    id="request-tags-upload"
                    accept=".xlsx,.xls"
                    onChange={handleRequestTagsFileChange}
                    disabled={uploadingRequestTags}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploadingRequestTags ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  )}
                </label>
              </div>
            </div>
            
            {/* Error Message Box */}
            {requestTagsError && (
              <div className="mt-3 bg-red-500/10 border border-red-500/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-red-500 mb-1">Upload Failed</p>
                    <p className="text-xs text-red-400 break-words">{requestTagsError}</p>
                  </div>
                  <button
                    onClick={() => setRequestTagsError(null)}
                    className="text-red-400 hover:text-red-300 shrink-0"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* Success Message Box */}
            {requestTagsSuccess && (
              <div className="mt-3 bg-green-500/10 border border-green-500/50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="h-5 w-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs text-green-400">{requestTagsSuccess}</p>
                  </div>
                  <button
                    onClick={() => setRequestTagsSuccess(null)}
                    className="text-green-400 hover:text-green-300 shrink-0"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-card border border-jpc-vibrant-cyan-500/20 rounded-xl shadow-xl">
          <div className="px-6 py-4 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Import History
                </h2>
                <p className="text-sm text-foreground/70">
                  All file imports from different sources
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-vibrant-cyan-400 mx-auto mb-4"></div>
                <p className="text-foreground/70">Loading import history...</p>
              </div>
            ) : fileImports.length === 0 ? (
              <div className="text-center py-12 text-foreground/70">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium mb-2">No files uploaded yet</p>
                <p className="text-sm mb-4">Upload your first file to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fileImports.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()).map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 bg-card border border-border/60 rounded-lg hover:bg-jpc-vibrant-cyan-500/5 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* File Icon with Status */}
                      <div className="shrink-0">
                        {file.status === 'success' && (
                          <div className="relative">
                            <svg className="h-12 w-12 text-jpc-vibrant-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                        {file.status === 'processing' && (
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-vibrant-cyan-400"></div>
                        )}
                        {file.status === 'failed' && (
                          <svg className="h-12 w-12 text-jpc-vibrant-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-semibold text-foreground truncate">
                            {file.filename}
                          </h3>
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                              file.status === 'success'
                                ? 'bg-green-100 text-green-700'
                                : file.status === 'processing'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {file.status === 'success' && '✓ Success'}
                            {file.status === 'processing' && '⟳ Processing'}
                            {file.status === 'failed' && '✕ Failed'}
                          </span>
                        </div>
                        <div className="flex items-center gap-6">
                          <Link
                            href={getSourceLink(file.source)}
                            className="flex items-center gap-2 text-sm text-jpc-vibrant-cyan-400 hover:text-jpc-vibrant-cyan-400 font-medium"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            {file.sourceLabel}
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-foreground/70">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="font-medium">{file.recordCount.toLocaleString()}</span> records
                          </div>
                          <div className="flex items-center gap-2 text-sm text-foreground/70">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(file.uploadedAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <button
                        type="button"
                        className="p-2 hover:bg-jpc-vibrant-cyan-500/10 rounded-lg transition-colors"
                        title="View details"
                      >
                        <svg className="h-5 w-5 text-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-jpc-vibrant-cyan-500/10 rounded-lg transition-colors"
                        title="Download file"
                      >
                        <svg className="h-5 w-5 text-foreground/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-jpc-vibrant-orange-500/10 rounded-lg transition-colors"
                        title="Delete import"
                      >
                        <svg className="h-5 w-5 text-jpc-vibrant-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

