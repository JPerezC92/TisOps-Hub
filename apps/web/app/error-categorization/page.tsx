'use client';

import { InfoBanners } from '@/components/info-banners';
import { StatsGrid } from '@/components/stats-grid';
import { Badge } from '@/components/ui/badge';
import { UploadSectionDynamic } from '@/components/upload-section-dynamic';
import type {
  CategorySummary,
  RequestCategorization,
} from '@repo/reports';
import { useEffect, useState } from 'react';

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
        className="bg-card border border-jpc-vibrant-cyan-500/30 rounded-xl shadow-[0_0_30px_5px] shadow-jpc-vibrant-cyan-500/30 max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-card/80 border-b border-jpc-vibrant-cyan-500/30 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground/80">Request IDs</h3>
            <p className="text-sm text-muted-foreground/80 mt-1">
              Linked Request: <span className="text-jpc-vibrant-cyan-400 font-semibold">{linkedRequestId}</span>
              {' • '}
              Additional Info: <span className="text-jpc-vibrant-cyan-400 font-semibold">{additionalInfo}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground/80 hover:text-jpc-vibrant-cyan-400 text-2xl leading-none transition-colors"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-vibrant-cyan-500 mb-4"></div>
              <p className="text-muted-foreground/80">Loading Request IDs...</p>
            </div>
          ) : requestIds.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-semibold text-foreground/80 mb-2">No Request IDs Found</p>
              <p className="text-muted-foreground/80">This additional info is not assigned to any requests</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground/80">
                  Found <span className="text-jpc-vibrant-cyan-400 font-bold">{requestIds.length}</span> Request ID{requestIds.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,5rem),max-content))] gap-3">
                {requestIds.map((item, index) => (
                  <div
                    key={index}
                    className="bg-jpc-vibrant-cyan-500/10 border border-jpc-vibrant-cyan-500/30 rounded-lg px-3 py-2 hover:bg-jpc-vibrant-cyan-500/20 transition-all flex flex-wrap"
                  >
                    {item.requestIdLink ? (
                      <a
                        href={item.requestIdLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-jpc-vibrant-cyan-400 font-mono text-sm hover:text-jpc-vibrant-cyan-400/80 transition-colors no-underline flex items-center gap-1"
                      >
                        {item.requestId}
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-foreground/80 font-mono text-sm">
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
        className="bg-card border border-jpc-vibrant-purple-500/30 rounded-xl shadow-[0_0_30px_5px] shadow-jpc-vibrant-purple-500/30 max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-card/80 border-b border-jpc-vibrant-purple-500/30 px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-purple-300">Request IDs by Tag Categorization</h3>
            <p className="text-sm text-purple-300/70 mt-1">
              Linked Request: <span className="text-purple-300 font-semibold">{linkedRequestId}</span>
              {' • '}
              Categorization: <span className="text-purple-300 font-semibold">{categorizacion}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-purple-300/50 hover:text-purple-300 text-2xl leading-none transition-colors"
            title="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-vibrant-purple-500 mb-4"></div>
              <p className="text-purple-300/70">Loading Request IDs...</p>
            </div>
          ) : requestIds.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl font-semibold text-purple-300 mb-2">No Request IDs Found</p>
              <p className="text-purple-300/70">No requests match this combination</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-purple-300/70">
                  Found <span className="text-purple-300 font-bold">{requestIds.length}</span> Request ID{requestIds.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,5rem),max-content))] gap-3">
                {requestIds.map((item, index) => (
                  <div
                    key={index}
                    className="bg-jpc-vibrant-purple-500/10 border border-jpc-vibrant-purple-500/30 rounded-lg px-3 py-2 hover:bg-jpc-vibrant-purple-500/20 transition-all flex flex-wrap"
                  >
                    {item.requestIdLink ? (
                      <a
                        href={item.requestIdLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-300 font-mono text-sm hover:text-purple-300/80 transition-colors no-underline flex items-center gap-1"
                      >
                        {item.requestId}
                        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-purple-300 font-mono text-sm">
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
        className="bg-card border border-jpc-vibrant-orange-500/50 rounded-xl shadow-[0_0_30px_5px] shadow-jpc-vibrant-orange-500/30 max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-card/80 border-b border-jpc-vibrant-orange-500/30 px-6 py-4 flex items-center justify-between">
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-vibrant-orange-500 mb-4"></div>
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
                    className="bg-jpc-vibrant-orange-500/10 border border-jpc-vibrant-orange-500/30 rounded-lg px-3 py-2 hover:bg-jpc-vibrant-orange-500/20 transition-all flex flex-wrap"
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

const categoryColors = {
  "Error de Alcance": "bg-jpc-vibrant-cyan-500/20 text-jpc-vibrant-cyan-400 border-jpc-vibrant-cyan-500/40 hover:bg-jpc-vibrant-cyan-500/30",
  "Error de codificación (Bug)": "bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40 hover:bg-jpc-vibrant-orange-500/30",
  "Error de datos (Data Source)": "bg-jpc-vibrant-emerald-500/20 text-jpc-vibrant-emerald-400 border-jpc-vibrant-emerald-500/40 hover:bg-jpc-vibrant-emerald-500/30",
} as const;

export default function RequestCategorizationPage() {
  const [data, setData] = useState<RequestCategorizationWithInfo[]>([]);
  const [summary, setSummary] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentFilename, setCurrentFilename] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
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
        `http://localhost:3000/request-tags/by-additional-info?info=${encodeURIComponent(additionalInfo)}&linkedRequestId=${encodeURIComponent(linkedRequestId)}`,
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
        `http://localhost:3000/request-tags/missing-ids?linkedRequestId=${encodeURIComponent(linkedRequestId)}`,
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

  const handleDropTable = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete all data from the request_categorization table!\n\n' +
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
        'http://localhost:3000/request-categorization',
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

  // Prepare stats data for StatsGrid
  const statsData = [
    { label: "TOTAL RECORDS", value: data.length.toLocaleString(), color: 'cyan' as const },
    ...summary.map((cat, idx) => {
      const colors: Array<'purple' | 'orange' | 'emerald'> = ['purple', 'orange', 'emerald'];
      const colorIndex = idx % colors.length;
      return {
        label: cat.category.toUpperCase(),
        value: cat.count.toLocaleString(),
        color: colors[colorIndex]!
      };
    })
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Modals */}
      <AdditionalInfoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        additionalInfo={selectedAdditionalInfo}
        linkedRequestId={selectedLinkedRequestIdForAdditionalInfo}
        requestIds={modalRequestIds}
        loading={modalLoading}
      />
      <CategorizacionModal
        isOpen={categorizacionModalOpen}
        onClose={() => setCategorizacionModalOpen(false)}
        linkedRequestId={selectedLinkedRequestId}
        categorizacion={selectedCategorizacion}
        requestIds={categorizacionModalRequestIds}
        loading={categorizacionModalLoading}
      />
      <MissingIdsModal
        isOpen={missingIdsModalOpen}
        onClose={() => setMissingIdsModalOpen(false)}
        linkedRequestId={selectedMissingIdsLinkedRequestId}
        requestIds={missingIdsModalRequestIds}
        loading={missingIdsModalLoading}
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground">Error Categorization</h1>
          <p className="mt-3 text-base text-muted-foreground/90">Categorized Error Reports Management</p>
        </div>
        {/* Upload Section */}
        <UploadSectionDynamic
          currentFilename={currentFilename}
          recordsCount={data.length}
          file={file}
          uploading={uploading}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
          hardcodedFilename="REP001 PARA ETIQUETAR.xlsx"
          title="Upload Error Categorization Report"
          description="Upload an Excel file (REPORT PARA ETIQUETAR) to parse and categorize error reports"
        />

        {/* Statistics */}
        {statsData.length > 1 && (
          <StatsGrid
            stats={statsData}
            onRefresh={fetchData}
            onClearData={data.length > 0 ? handleDropTable : undefined}
            loading={loading}
          />
        )}

        {/* Info Banners */}
        {data.length > 0 && <InfoBanners />}

        {/* Data Table */}
        {loading ? (
          <div className="text-center py-12 text-foreground">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4">Loading data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border/60 rounded-xl shadow-xl">
            <svg className="mx-auto h-12 w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-foreground text-lg mb-2 mt-4">No data available</p>
            <p className="text-muted-foreground/70 text-sm">Upload an Excel file to get started</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-2xl shadow-jpc-vibrant-cyan-500/10 backdrop-blur-sm hover:border-jpc-vibrant-cyan-500/30 transition-all duration-300">
            <div className="px-6 py-6 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5">
              <h3 className="text-sm font-bold text-foreground">
                Error Classification Records
                <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                  Showing {data.length} total records
                </span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-transparent">
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-center py-4 px-2 w-16">#</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-2">Category</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-2">Technician</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-2">Request ID</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-2">Created Time</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-2">Module</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-2">Subject</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-2">Problem ID</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-2">Linked Request</th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-2">
                      <div className="flex items-center gap-2">
                        <span>Additional Info</span>
                        {/* Computed Column Indicator */}
                        <span
                          className="inline-flex items-center justify-center w-4 h-4 bg-jpc-vibrant-cyan-500/15 border border-jpc-vibrant-cyan-500/30 rounded text-[8px] font-bold text-jpc-vibrant-cyan-400"
                          title="Computed Column: Calculated from REP01 Tags table"
                        >
                          ⚡
                        </span>
                      </div>
                    </th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-2">
                      <div className="flex items-center gap-2">
                        <span>Tag Categorization</span>
                        {/* Computed Column Indicator */}
                        <span
                          className="inline-flex items-center justify-center w-4 h-4 bg-jpc-vibrant-purple-500/15 border border-jpc-vibrant-purple-500/30 rounded text-[8px] font-bold text-purple-300"
                          title="Computed Column: Calculated from REP01 Tags table"
                        >
                          ⚡
                        </span>
                      </div>
                    </th>
                    <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-2">
                      <div className="flex items-center gap-2">
                        <span>Missing IDs</span>
                        {/* Computed Column Indicator */}
                        <span
                          className="inline-flex items-center justify-center w-4 h-4 bg-jpc-vibrant-orange-500/15 border border-jpc-vibrant-orange-500/30 rounded text-[8px] font-bold text-orange-300"
                          title="Computed Column: IDs in parent_child_requests but not in rep01_tags"
                        >
                          ⚡
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((record, idx) => (
                    <tr
                      key={record.requestId}
                      className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group"
                    >
                      <td className="py-4 px-2 text-center text-jpc-vibrant-cyan-400/70 font-mono text-xs font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-4 px-2">
                        <Badge
                          variant="outline"
                          className={`${categoryColors[record.category as keyof typeof categoryColors] || "bg-jpc-vibrant-purple-500/20 text-jpc-vibrant-purple-400 border-jpc-vibrant-purple-500/40 hover:bg-jpc-vibrant-purple-500/30"} border font-medium transition-all duration-300`}
                        >
                          {record.category}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-xs text-foreground/80 group-hover:text-jpc-vibrant-cyan-400 transition-colors">{record.technician}</td>
                      <td className="py-4 px-4">
                        {record.requestIdLink ? (
                          <a
                            href={record.requestIdLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-underline"
                          >
                            <Badge
                              variant="secondary"
                              className="font-mono text-xs bg-jpc-vibrant-cyan-500/15 text-jpc-vibrant-cyan-400 border border-jpc-vibrant-cyan-500/30 group-hover:bg-jpc-vibrant-cyan-500/25 transition-all duration-300 inline-flex items-center gap-1"
                            >
                              {record.requestId}
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
                            {record.requestId}
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground/80">{record.createdTime}</td>
                      <td className="py-4 px-4 text-xs text-foreground/80 group-hover:text-jpc-vibrant-cyan-400 transition-colors">{record.modulo}</td>
                      <td className="py-4 px-4 text-xs text-muted-foreground/75 truncate max-w-xs" title={record.subject}>
                        {record.subject}
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground/80">{record.problemId}</td>
                      <td className="py-4 px-4">
                        {record.linkedRequestIdLink ? (
                          <a
                            href={record.linkedRequestIdLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-underline"
                          >
                            <Badge
                              variant="secondary"
                              className="font-mono text-xs bg-jpc-vibrant-cyan-500/20 text-jpc-vibrant-cyan-400 border border-jpc-vibrant-cyan-500/40 group-hover:bg-jpc-vibrant-cyan-500/30 transition-all duration-300 inline-flex items-center gap-1"
                            >
                              {record.linkedRequestId}
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </Badge>
                          </a>
                        ) : record.linkedRequestId !== "No asignado" ? (
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs bg-jpc-vibrant-cyan-500/20 text-jpc-vibrant-cyan-400 border border-jpc-vibrant-cyan-500/40 group-hover:bg-jpc-vibrant-cyan-500/30 transition-all duration-300"
                          >
                            {record.linkedRequestId}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground/80">{record.linkedRequestId}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {record.additionalInformation && record.additionalInformation.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {record.additionalInformation.map((info, index) => {
                              const badgeId = `${record.requestId}-${index}`;
                              const isCopied = copiedBadge === badgeId;
                              
                              return (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="group relative inline-flex items-center gap-1 bg-jpc-vibrant-cyan-500/20 text-jpc-vibrant-cyan-400 border-jpc-vibrant-cyan-500/40 hover:bg-jpc-vibrant-cyan-500/30 font-medium transition-all duration-300 cursor-pointer"
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
                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 hover:text-jpc-vibrant-cyan-400/80 focus:outline-none"
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
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/80 text-xs italic">
                            No matches found
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {record.tagCategorizacion && record.tagCategorizacion.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {record.tagCategorizacion.map((cat, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                onClick={() => handleCategorizacionBadgeClick(record.linkedRequestId, cat)}
                                className="bg-jpc-vibrant-purple-500/20 text-jpc-vibrant-purple-400 border-jpc-vibrant-purple-500/40 hover:bg-jpc-vibrant-purple-500/30 font-medium transition-all duration-300 cursor-pointer"
                              >
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground/80 text-xs italic">
                            No matches found
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {record.linkedRequestId && record.linkedRequestId !== 'No asignado' ? (
                          <Badge
                            variant="outline"
                            onClick={() => handleMissingIdsBadgeClick(record.linkedRequestId)}
                            className="inline-flex items-center gap-2 bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40 hover:bg-jpc-vibrant-orange-500/30 font-medium transition-all duration-300 cursor-pointer"
                            title="Click to see missing Request IDs"
                          >
                            <span>⚠️</span>
                            <span>Check Missing IDs</span>
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground/80 text-xs italic">-</span>
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
