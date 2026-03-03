'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { InfoBanners } from '@/components/info-banners';
import { StatsGrid } from '@/components/stats-grid';
import { Badge } from '@/components/ui/badge';
import { UploadSectionDynamic } from '@/components/upload-section-dynamic';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePagination } from '@/shared/hooks/use-pagination';
import { useRequestCategorizations } from '../hooks/use-request-categorizations';
import { useCategorySummary } from '../hooks/use-category-summary';
import { useUploadRequestCategorization } from '../hooks/use-upload-request-categorization';
import { useDeleteRequestCategorizations } from '../hooks/use-delete-request-categorizations';
import { useRequestCategorizationFilters } from '../hooks/use-request-categorization-filters';
import { requestCategorizationService } from '../services/request-categorization.service';
import { requestTagsService } from '@/modules/request-tags/services/request-tags.service';
import { AdditionalInfoModal } from './additional-info-modal';
import { CategorizacionModal } from './categorizacion-modal';
import { MissingIdsModal } from './missing-ids-modal';
import type { RequestIdItem } from './request-id-grid';

const categoryColors = {
  "Error de Alcance": "bg-jpc-vibrant-cyan-500/20 text-jpc-vibrant-cyan-400 border-jpc-vibrant-cyan-500/40 hover:bg-jpc-vibrant-cyan-500/30",
  "Error de codificación (Bug)": "bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40 hover:bg-jpc-vibrant-orange-500/30",
  "Error de datos (Data Source)": "bg-jpc-vibrant-emerald-500/20 text-jpc-vibrant-emerald-400 border-jpc-vibrant-emerald-500/40 hover:bg-jpc-vibrant-emerald-500/30",
} as const;

export function ErrorCategorizationList() {
  const { data: records = [], isLoading, refetch } = useRequestCategorizations();
  const { data: summary = [] } = useCategorySummary();
  const uploadMutation = useUploadRequestCategorization();
  const deleteMutation = useDeleteRequestCategorizations();

  const {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    categories,
    filteredRecords,
  } = useRequestCategorizationFilters(records);

  const pagination = usePagination(filteredRecords);

  // Reset pagination when filters change
  useEffect(() => {
    pagination.resetPage();
  }, [searchTerm, categoryFilter]);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [currentFilename, setCurrentFilename] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState<string | null>(null);

  // Additional Info Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAdditionalInfo, setSelectedAdditionalInfo] = useState('');
  const [selectedLinkedRequestIdForAdditionalInfo, setSelectedLinkedRequestIdForAdditionalInfo] = useState('');
  const [modalRequestIds, setModalRequestIds] = useState<RequestIdItem[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Tag Categorization Modal state
  const [categorizacionModalOpen, setCategorizacionModalOpen] = useState(false);
  const [selectedLinkedRequestId, setSelectedLinkedRequestId] = useState('');
  const [selectedCategorizacion, setSelectedCategorizacion] = useState('');
  const [categorizacionModalRequestIds, setCategorizacionModalRequestIds] = useState<RequestIdItem[]>([]);
  const [categorizacionModalLoading, setCategorizacionModalLoading] = useState(false);

  // Missing IDs Modal state
  const [missingIdsModalOpen, setMissingIdsModalOpen] = useState(false);
  const [selectedMissingIdsLinkedRequestId, setSelectedMissingIdsLinkedRequestId] = useState('');
  const [missingIdsModalRequestIds, setMissingIdsModalRequestIds] = useState<RequestIdItem[]>([]);
  const [missingIdsModalLoading, setMissingIdsModalLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lastUploadedErrorCategorizationFile');
    if (saved) setCurrentFilename(saved);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
  };

  const handleUpload = () => {
    if (!file) return;

    uploadMutation.mutate(file, {
      onSuccess: (result) => {
        toast.success(
          `${result.message} — Total: ${result.totalRecords}, New: ${result.recordsCreated}, Updated: ${result.recordsUpdated}`,
        );
        setCurrentFilename(file.name);
        localStorage.setItem('lastUploadedErrorCategorizationFile', file.name);
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      onError: (error) => {
        toast.error(`Upload failed: ${error.message}`);
      },
    });
  };

  const handleDeleteAll = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: (result) => {
        toast.success(result.message);
        setShowDeleteDialog(false);
      },
      onError: (error) => {
        toast.error(`Failed to delete records: ${error.message}`);
        setShowDeleteDialog(false);
      },
    });
  };

  const handleCopyBadge = async (text: string, identifier: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBadge(identifier);
      setTimeout(() => setCopiedBadge(null), 2000);
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
      const data = await requestTagsService.getByAdditionalInfo(additionalInfo, linkedRequestId);
      setModalRequestIds(data.requestIds);
    } catch (error) {
      console.error('Error fetching Request IDs:', error);
      setModalRequestIds([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCategorizacionBadgeClick = async (linkedRequestId: string, categorizacion: string) => {
    setSelectedLinkedRequestId(linkedRequestId);
    setSelectedCategorizacion(categorizacion);
    setCategorizacionModalOpen(true);
    setCategorizacionModalLoading(true);
    setCategorizacionModalRequestIds([]);

    try {
      const data = await requestCategorizationService.getRequestIdsByCategorization(linkedRequestId, categorizacion);
      setCategorizacionModalRequestIds(data.requestIds);
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
      const data = await requestTagsService.getMissingIds(linkedRequestId);
      setMissingIdsModalRequestIds(data.missingIds);
    } catch (error) {
      console.error('Error fetching missing IDs:', error);
      setMissingIdsModalRequestIds([]);
    } finally {
      setMissingIdsModalLoading(false);
    }
  };

  const loading = isLoading || deleteMutation.isPending;

  // Stats
  const statsData = [
    { label: 'TOTAL RECORDS', value: records.length.toLocaleString(), color: 'cyan' as const },
    ...summary.map((cat, idx) => {
      const colors: Array<'purple' | 'orange' | 'emerald'> = ['purple', 'orange', 'emerald'];
      return {
        label: cat.category.toUpperCase(),
        value: cat.count.toLocaleString(),
        color: colors[idx % colors.length]!,
      };
    }),
  ];

  return (
    <>
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

      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-foreground">Error Categorization</h1>
            <p className="mt-3 text-base text-muted-foreground/90">Categorized Error Reports Management</p>
          </div>

          {/* Upload Section */}
          <UploadSectionDynamic
            currentFilename={currentFilename}
            recordsCount={records.length}
            file={file}
            uploading={uploadMutation.isPending}
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
              onRefresh={() => refetch()}
              onClearData={records.length > 0 ? () => setShowDeleteDialog(true) : undefined}
              loading={loading}
            />
          )}

          {/* Info Banners */}
          {records.length > 0 && <InfoBanners />}

          {/* Filters */}
          {records.length > 0 && (
            <div className="bg-card border border-border/60 rounded-xl p-6 mb-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Search</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Request ID, Technician, Module, Subject..."
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50 focus:border-jpc-vibrant-cyan-500/50"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Data Table */}
          {loading ? (
            <div className="text-center py-12 text-foreground">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4">Loading data...</p>
            </div>
          ) : records.length === 0 ? (
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
                    Showing {pagination.startIndex + 1}–{pagination.endIndex} of {pagination.totalItems} records
                    {filteredRecords.length !== records.length && (
                      <span className="ml-1">(filtered from {records.length})</span>
                    )}
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
                          <span
                            className="inline-flex items-center justify-center w-4 h-4 bg-jpc-vibrant-cyan-500/15 border border-jpc-vibrant-cyan-500/30 rounded text-[8px] font-bold text-jpc-vibrant-cyan-400"
                            title="Computed Column: Calculated from Request Tags table"
                          >
                            C
                          </span>
                        </div>
                      </th>
                      <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-2">
                        <div className="flex items-center gap-2">
                          <span>Tag Categorization</span>
                          <span
                            className="inline-flex items-center justify-center w-4 h-4 bg-jpc-vibrant-purple-500/15 border border-jpc-vibrant-purple-500/30 rounded text-[8px] font-bold text-purple-300"
                            title="Computed Column: Calculated from Request Tags table"
                          >
                            C
                          </span>
                        </div>
                      </th>
                      <th className="h-12 text-xs font-bold text-jpc-vibrant-cyan-400 bg-jpc-vibrant-cyan-500/5 uppercase tracking-wider text-left py-4 px-2">
                        <div className="flex items-center gap-2">
                          <span>Missing IDs</span>
                          <span
                            className="inline-flex items-center justify-center w-4 h-4 bg-jpc-vibrant-orange-500/15 border border-jpc-vibrant-orange-500/30 rounded text-[8px] font-bold text-orange-300"
                            title="Computed Column: IDs in parent_child_requests but not in request_tags"
                          >
                            C
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagination.paginatedItems.map((record, idx) => (
                      <tr
                        key={record.requestId}
                        className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group"
                      >
                        <td className="py-4 px-2 text-center text-jpc-vibrant-cyan-400/70 font-mono text-xs font-medium">
                          {pagination.startIndex + idx + 1}
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
                            <a href={record.requestIdLink} target="_blank" rel="noopener noreferrer" className="no-underline">
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
                            <a href={record.linkedRequestIdLink} target="_blank" rel="noopener noreferrer" className="no-underline">
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
                                    <span>{info}</span>
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
                            <span className="text-muted-foreground/80 text-xs italic">No matches found</span>
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
                            <span className="text-muted-foreground/80 text-xs italic">No matches found</span>
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

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground/70">
                        Showing{' '}
                        <span className="font-semibold text-cyan-100">{pagination.startIndex + 1}</span>{' '}
                        to{' '}
                        <span className="font-semibold text-cyan-100">{pagination.endIndex}</span>{' '}
                        of{' '}
                        <span className="font-semibold text-cyan-100">{pagination.totalItems}</span>{' '}
                        results
                      </span>
                      <select
                        value={pagination.itemsPerPage}
                        onChange={(e) => pagination.changeItemsPerPage(Number(e.target.value))}
                        className="px-3 py-1.5 bg-jpc-vibrant-cyan-500/20 border border-jpc-vibrant-cyan-500/40 rounded-lg text-sm text-cyan-100 focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500 hover:bg-jpc-vibrant-cyan-500/30 transition-colors"
                      >
                        <option value={25}>25 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                        <option value={200}>200 per page</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={pagination.goToPreviousPage}
                        disabled={pagination.isFirstPage}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          pagination.isFirstPage
                            ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                            : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                        }`}
                      >
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum;
                          if (pagination.totalPages <= 5) pageNum = i + 1;
                          else if (pagination.currentPage <= 3) pageNum = i + 1;
                          else if (pagination.currentPage >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                          else pageNum = pagination.currentPage - 2 + i;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => pagination.goToPage(pageNum)}
                              className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                                pagination.currentPage === pageNum
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
                        onClick={pagination.goToNextPage}
                        disabled={pagination.isLastPage}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          pagination.isLastPage
                            ? 'bg-muted/40 text-muted-foreground/40 cursor-not-allowed'
                            : 'bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Error Categorization Records</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all data from the request_categorization table.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
