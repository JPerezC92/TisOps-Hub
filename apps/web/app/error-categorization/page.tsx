'use client';

import { useState, useEffect } from 'react';
import type {
  RequestCategorization,
  CategorySummary,
} from '@repo/reports';

interface RequestCategorizationWithInfo extends RequestCategorization {
  additionalInformation: string[];
  tagCategorizacion: string[];
}

interface AdditionalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  additionalInfo: string;
  linkedRequestId: string;
  requestIds: Array<{ requestId: string; requestIdLink?: string }>;
  loading: boolean;
}

function AdditionalInfoModal({ isOpen, onClose, additionalInfo, linkedRequestId, requestIds, loading }: AdditionalInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-jpc-bg-900 border border-jpc-400/50 rounded-xl shadow-[0_0_30px_5px] shadow-jpc-400/30 max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-jpc-bg-900/80 border-b border-jpc-400/30 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-jpc-gold-500">Request IDs</h3>
            <p className="text-sm text-jpc-gold-500/70 mt-1">
              Linked Request: <span className="text-jpc-400 font-semibold">{linkedRequestId}</span>
              {' • '}
              Additional Info: <span className="text-jpc-400 font-semibold">{additionalInfo}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-jpc-gold-500/50 hover:text-jpc-400 text-2xl leading-none transition-colors"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-400 mb-4"></div>
              <p className="text-jpc-gold-500/70">Loading Request IDs...</p>
            </div>
          ) : requestIds.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-semibold text-jpc-gold-500 mb-2">No Request IDs Found</p>
              <p className="text-jpc-gold-500/70">This additional info is not assigned to any requests</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-jpc-gold-500/70">
                  Found <span className="text-jpc-400 font-bold">{requestIds.length}</span> Request ID{requestIds.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,5rem),max-content))] gap-3">
                {requestIds.map((item, index) => (
                  <div
                    key={index}
                    className="bg-jpc-400/10 border border-jpc-400/30 rounded-lg px-3 py-2 hover:bg-jpc-400/20 transition-all flex flex-wrap"
                  >
                    {item.requestIdLink ? (
                      <a
                        href={item.requestIdLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-jpc-400 font-mono text-sm hover:text-jpc-400/80 transition-colors no-underline flex items-center gap-1"
                      >
                        {item.requestId}
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-jpc-gold-500 font-mono text-sm">
                        {item.requestId}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CategorizacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkedRequestId: string;
  categorizacion: string;
  requestIds: Array<{ requestId: string; requestIdLink?: string }>;
  loading: boolean;
}

function CategorizacionModal({ isOpen, onClose, linkedRequestId, categorizacion, requestIds, loading }: CategorizacionModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-jpc-bg-900 border border-jpc-purple-500/50 rounded-xl shadow-[0_0_30px_5px] shadow-jpc-purple-500/30 max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-jpc-bg-900/80 border-b border-jpc-purple-500/30 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-jpc-purple-300">Request IDs by Tag Categorization</h3>
            <p className="text-sm text-jpc-purple-300/70 mt-1">
              Linked Request: <span className="text-jpc-purple-300 font-semibold">{linkedRequestId}</span>
              {' • '}
              Categorization: <span className="text-jpc-purple-300 font-semibold">{categorizacion}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-jpc-purple-300/50 hover:text-jpc-purple-300 text-2xl leading-none transition-colors"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-purple-500 mb-4"></div>
              <p className="text-jpc-purple-300/70">Loading Request IDs...</p>
            </div>
          ) : requestIds.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-semibold text-jpc-purple-300 mb-2">No Request IDs Found</p>
              <p className="text-jpc-purple-300/70">No requests match this combination</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-jpc-purple-300/70">
                  Found <span className="text-jpc-purple-300 font-bold">{requestIds.length}</span> Request ID{requestIds.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,5rem),max-content))] gap-3">
                {requestIds.map((item, index) => (
                  <div
                    key={index}
                    className="bg-jpc-purple-500/10 border border-jpc-purple-500/30 rounded-lg px-3 py-2 hover:bg-jpc-purple-500/20 transition-all flex flex-wrap"
                  >
                    {item.requestIdLink ? (
                      <a
                        href={item.requestIdLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-jpc-purple-300 font-mono text-sm hover:text-jpc-purple-300/80 transition-colors no-underline flex items-center gap-1"
                      >
                        {item.requestId}
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-jpc-purple-300 font-mono text-sm">
                        {item.requestId}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface MissingIdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  linkedRequestId: string;
  requestIds: Array<{ requestId: string; requestIdLink?: string }>;
  loading: boolean;
}

function MissingIdsModal({ isOpen, onClose, linkedRequestId, requestIds, loading }: MissingIdsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-jpc-bg-900 border border-orange-500/50 rounded-xl shadow-[0_0_30px_5px] shadow-orange-500/30 max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-jpc-bg-900/80 border-b border-orange-500/30 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-orange-300">Missing Request IDs</h3>
            <p className="text-sm text-orange-300/70 mt-1">
              Linked Request: <span className="text-orange-300 font-semibold">{linkedRequestId}</span>
            </p>
            <p className="text-xs text-orange-300/60 mt-1">
              IDs in parent_child_requests but missing from rep01_tags
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-orange-300/50 hover:text-orange-300 text-2xl leading-none transition-colors"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
              <p className="text-orange-300/70">Loading Missing IDs...</p>
            </div>
          ) : requestIds.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✓</div>
              <p className="text-xl font-semibold text-orange-300 mb-2">No Missing IDs</p>
              <p className="text-orange-300/70">All parent_child_requests are present in rep01_tags</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-orange-300/70">
                  Found <span className="text-orange-300 font-bold">{requestIds.length}</span> Missing Request ID{requestIds.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,5rem),max-content))] gap-3">
                {requestIds.map((item, index) => (
                  <div
                    key={index}
                    className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2 hover:bg-orange-500/20 transition-all flex flex-wrap"
                  >
                    {item.requestIdLink ? (
                      <a
                        href={item.requestIdLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-300 font-mono text-sm hover:text-orange-300/80 transition-colors no-underline flex items-center gap-1"
                      >
                        {item.requestId}
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-orange-300 font-mono text-sm">
                        {item.requestId}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RequestCategorizationPage() {
  const [data, setData] = useState<RequestCategorizationWithInfo[]>([]);
  const [summary, setSummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentFilename, setCurrentFilename] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [copiedBadge, setCopiedBadge] = useState<string | null>(null);
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAdditionalInfo, setSelectedAdditionalInfo] = useState<string>('');
  const [selectedLinkedRequestIdForAdditionalInfo, setSelectedLinkedRequestIdForAdditionalInfo] = useState<string>('');
  const [modalRequestIds, setModalRequestIds] = useState<Array<{ requestId: string; requestIdLink?: string }>>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Tag Categorization Modal state
  const [categorizacionModalOpen, setCategorizacionModalOpen] = useState(false);
  const [selectedLinkedRequestId, setSelectedLinkedRequestId] = useState<string>('');
  const [selectedCategorizacion, setSelectedCategorizacion] = useState<string>('');
  const [categorizacionModalRequestIds, setCategorizacionModalRequestIds] = useState<Array<{ requestId: string; requestIdLink?: string }>>([]);
  const [categorizacionModalLoading, setCategorizacionModalLoading] = useState(false);

  // Missing IDs Modal state
  const [missingIdsModalOpen, setMissingIdsModalOpen] = useState(false);
  const [selectedMissingIdsLinkedRequestId, setSelectedMissingIdsLinkedRequestId] = useState<string>('');
  const [missingIdsModalRequestIds, setMissingIdsModalRequestIds] = useState<Array<{ requestId: string; requestIdLink?: string }>>([]);
  const [missingIdsModalLoading, setMissingIdsModalLoading] = useState(false);

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
          `✅ ${result.message}\n` +
          `📊 Total records: ${result.totalRecords}\n` +
          `✨ New: ${result.recordsCreated}\n` +
          `🔄 Updated: ${result.recordsUpdated}`,
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
    };
  };

  const handleCopyBadge = async (text: string, identifier: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBadge(identifier);
      setTimeout(() => setCopiedBadge(null), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleBadgeClick = async (additionalInfo: string, linkedRequestId: string) => {
    setSelectedAdditionalInfo(additionalInfo);
    setSelectedLinkedRequestIdForAdditionalInfo(linkedRequestId);
    setModalOpen(true);
    setModalLoading(true);
    setModalRequestIds([]);

    try {
      const response = await fetch(
        `http://localhost:3000/rep01-tags/by-additional-info?info=${encodeURIComponent(additionalInfo)}&linkedRequestId=${encodeURIComponent(linkedRequestId)}`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Request IDs');
      }

      const requestIds = await response.json();
      setModalRequestIds(requestIds);
    } catch (error) {
      console.error('Error fetching Request IDs:', error);
      setModalRequestIds([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCategorizacionBadgeClick = async (
    linkedRequestId: string,
    categorizacion: string,
  ) => {
    setSelectedLinkedRequestId(linkedRequestId);
    setSelectedCategorizacion(categorizacion);
    setCategorizacionModalOpen(true);
    setCategorizacionModalLoading(true);
    setCategorizacionModalRequestIds([]);

    try {
      const response = await fetch(
        `http://localhost:3000/request-categorization/request-ids-by-categorization?linkedRequestId=${encodeURIComponent(linkedRequestId)}&categorizacion=${encodeURIComponent(categorizacion)}`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Request IDs');
      }

      const data = await response.json();
      setCategorizacionModalRequestIds(data.requestIds || []);
    } catch (error) {
      console.error('Error fetching Request IDs by categorization:', error);
      setCategorizacionModalRequestIds([]);
    } finally {
      setCategorizacionModalLoading(false);
    }
  };

  const handleMissingIdsBadgeClick = async (linkedRequestId: string) => {
    setSelectedMissingIdsLinkedRequestId(linkedRequestId);
    setMissingIdsModalOpen(true);
    setMissingIdsModalLoading(true);
    setMissingIdsModalRequestIds([]);

    try {
      const response = await fetch(
        `http://localhost:3000/rep01-tags/missing-ids?linkedRequestId=${encodeURIComponent(linkedRequestId)}`,
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch missing IDs');
      }

      const data = await response.json();
      setMissingIdsModalRequestIds(data.missingIds || []);
    } catch (error) {
      console.error('Error fetching missing IDs:', error);
      setMissingIdsModalRequestIds([]);
    } finally {
      setMissingIdsModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-jpc-bg-900 relative overflow-hidden">
      {/* Background with blur effect */}
      <div className="fixed inset-0 bg-linear-to-br from-jpc-bg-900 via-jpc-bg-500 to-jpc-bg-900 -z-10"></div>
      <div className="fixed inset-0 backdrop-blur-sm bg-jpc-900/10 -z-10"></div>

      {/* Modal */}
      <AdditionalInfoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        additionalInfo={selectedAdditionalInfo}
        linkedRequestId={selectedLinkedRequestIdForAdditionalInfo}
        requestIds={modalRequestIds}
        loading={modalLoading}
      />

      {/* Tag Categorization Modal */}
      <CategorizacionModal
        isOpen={categorizacionModalOpen}
        onClose={() => setCategorizacionModalOpen(false)}
        linkedRequestId={selectedLinkedRequestId}
        categorizacion={selectedCategorizacion}
        requestIds={categorizacionModalRequestIds}
        loading={categorizacionModalLoading}
      />

      {/* Missing IDs Modal */}
      <MissingIdsModal
        isOpen={missingIdsModalOpen}
        onClose={() => setMissingIdsModalOpen(false)}
        linkedRequestId={selectedMissingIdsLinkedRequestId}
        requestIds={missingIdsModalRequestIds}
        loading={missingIdsModalLoading}
      />

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

            {/* Info Message */}
            <div className="bg-jpc-400/10 border border-jpc-400/30 rounded-lg px-4 py-3 mb-4">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-jpc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-jpc-gold-500">
                  <span className="font-semibold">UPSERT Mode:</span> Existing records will be updated, new ones will be created
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

        {/* Column Types Legend */}
        {showLegend && data.length > 0 && (
          <div className="mb-6 bg-jpc-400/10 border border-jpc-400/30 rounded-xl p-4 relative">
            <button
              onClick={() => setShowLegend(false)}
              className="absolute top-2 right-2 text-jpc-gold-500/50 hover:text-jpc-400 text-lg leading-none transition-colors"
              title="Hide legend"
            >
              ×
            </button>
            <div className="flex items-start gap-3">
              <div className="text-2xl">ℹ️</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-jpc-gold-500 mb-2">
                  Column Types Legend
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-jpc-gold-500/70">
                  <div className="flex items-start gap-2">
                    <span className="inline-block w-4 h-4 bg-jpc-bg-900 border border-jpc-gold-500/30 rounded mt-0.5 flex-shrink-0"></span>
                    <div>
                      <span className="font-semibold text-jpc-gold-500">Stored Columns:</span> Data
                      saved directly in the database. Fast to retrieve, always available.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="inline-block w-4 h-4 bg-jpc-400/20 border border-jpc-400/50 rounded mt-0.5 flex-shrink-0 relative">
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-jpc-400">⚡</span>
                    </span>
                    <div>
                      <span className="font-semibold text-jpc-400">Computed Columns:</span> Data
                      calculated on-demand from related tables (REP01 Tags). Always fresh, may be
                      slower.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Show Legend Button (when hidden) */}
        {!showLegend && data.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowLegend(true)}
              className="px-4 py-2 bg-jpc-400/10 border border-jpc-400/30 text-jpc-400 rounded-lg hover:bg-jpc-400/20 transition-all text-sm font-medium"
            >
              ℹ️ Show Column Types Legend
            </button>
          </div>
        )}

        {/* Missing IDs Info Banner */}
        {data.length > 0 && (
          <div className="mb-6 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-orange-400 mb-2">
                  About the &apos;Missing IDs&apos; Column
                </h3>
                <p className="text-xs text-orange-300/70 leading-relaxed">
                  The <span className="font-semibold text-orange-300">&apos;Missing IDs&apos;</span> column shows Request IDs that exist in the <span className="font-mono bg-orange-500/20 px-1 rounded">parent_child_requests</span> table but are missing from the <span className="font-mono bg-orange-500/20 px-1 rounded">rep01_tags</span> table.
                </p>
              </div>
            </div>
          </div>
        )}

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
                    <th className="text-center py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider w-16">#</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Category</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Technician</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Request ID</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Created Time</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Module</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Subject</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Problem ID</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">Linked Request</th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Additional Info</span>
                        {/* Computed Column Indicator */}
                        <span
                          className="inline-flex items-center justify-center w-4 h-4 bg-jpc-400/20 border border-jpc-400/50 rounded text-[8px] font-bold text-jpc-400"
                          title="Computed Column: Calculated from REP01 Tags table"
                        >
                          ⚡
                        </span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Tag Categorization</span>
                        {/* Computed Column Indicator */}
                        <span
                          className="inline-flex items-center justify-center w-4 h-4 bg-jpc-purple-500/20 border border-jpc-purple-500/50 rounded text-[8px] font-bold text-jpc-purple-300"
                          title="Computed Column: Calculated from REP01 Tags table"
                        >
                          ⚡
                        </span>
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 text-jpc-gold-500 font-semibold uppercase text-xs tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Missing IDs</span>
                        {/* Computed Column Indicator */}
                        <span
                          className="inline-flex items-center justify-center w-4 h-4 bg-orange-500/20 border border-orange-500/50 rounded text-[8px] font-bold text-orange-300"
                          title="Computed Column: IDs in parent_child_requests but not in rep01_tags"
                        >
                          ⚡
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-jpc-900/20">
                  {data.map((record, idx) => (
                    <tr
                      key={record.requestId}
                      className={`border-t border-jpc-400/20 hover:bg-jpc-400/10 transition-colors ${
                        idx % 2 === 0 ? 'bg-jpc-900/10' : ''
                      }`}
                    >
                      <td className="py-4 px-4 text-center text-jpc-gold-500/60 font-mono text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block px-3 py-1 bg-jpc-purple-500/30 border border-jpc-purple-500/50 text-jpc-purple-300 rounded-lg text-xs font-semibold shadow-sm">
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
                      <td className="py-4 px-4">
                        {record.additionalInformation && record.additionalInformation.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {record.additionalInformation.map((info, index) => {
                              const badgeId = `${record.requestId}-${index}`;
                              const isCopied = copiedBadge === badgeId;
                              
                              return (
                                <div
                                  key={index}
                                  className="group relative inline-flex items-center gap-1 px-3 py-1 bg-jpc-400/30 text-jpc-400 border border-jpc-400/50 rounded-full text-xs font-semibold hover:bg-jpc-400/50 hover:shadow-[0_0_8px_2px] hover:shadow-jpc-400/30 transition-all duration-200 cursor-pointer whitespace-nowrap"
                                  title={`Click to see Request IDs with: ${info}`}
                                  onClick={() => handleBadgeClick(info, record.linkedRequestId)}
                                >
                                  <span>
                                    {info}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyBadge(info, badgeId);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:text-jpc-400/80 focus:outline-none"
                                    title="Copy to clipboard"
                                  >
                                    {isCopied ? (
                                      <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    ) : (
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-jpc-gold-500/50 text-xs italic">
                            No matches found
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {record.tagCategorizacion && record.tagCategorizacion.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {record.tagCategorizacion.map((cat, index) => (
                              <div
                                key={index}
                                onClick={() => handleCategorizacionBadgeClick(record.linkedRequestId, cat)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-jpc-purple-500/30 text-jpc-purple-300 border border-jpc-purple-500/50 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer hover:bg-jpc-purple-500/40 transition-colors"
                              >
                                <span>{cat}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-jpc-gold-500/50 text-xs italic">
                            No matches found
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {record.linkedRequestId && record.linkedRequestId !== 'No asignado' ? (
                          <div
                            onClick={() => handleMissingIdsBadgeClick(record.linkedRequestId)}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/30 text-orange-300 border border-orange-500/50 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer hover:bg-orange-500/40 transition-colors"
                            title="Click to see missing Request IDs"
                          >
                            <span>⚠️</span>
                            <span>Check Missing IDs</span>
                          </div>
                        ) : (
                          <span className="text-jpc-gold-500/50 text-xs italic">-</span>
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
