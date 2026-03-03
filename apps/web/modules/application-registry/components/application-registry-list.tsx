'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { usePagination } from '@/shared/hooks/use-pagination';
import { useApplicationsWithPatterns } from '../hooks/use-applications-with-patterns';
import { useCreateApplication } from '../hooks/use-create-application';
import { useUpdateApplication } from '../hooks/use-update-application';
import { useDeleteApplication } from '../hooks/use-delete-application';
import { useCreatePattern } from '../hooks/use-create-pattern';
import { useDeletePattern } from '../hooks/use-delete-pattern';
import { useApplicationFilters } from '../hooks/use-application-filters';
import type { AppRegistryWithPatterns } from '../services/application-registry.service';
import { CreateApplicationModal } from './create-application-modal';
import { EditApplicationModal } from './edit-application-modal';
import { AddPatternModal } from './add-pattern-modal';
import { DeleteConfirmDialog } from './delete-confirm-dialog';

export function ApplicationRegistryList() {
  const { data: applications = [], isLoading } = useApplicationsWithPatterns();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filteredApplications,
  } = useApplicationFilters(applications);

  const {
    paginatedItems,
    currentPage,
    totalPages,
    goToFirstPage,
    goToLastPage,
    goToNextPage,
    goToPreviousPage,
    isFirstPage,
    isLastPage,
    resetPage,
  } = usePagination(filteredApplications, { initialItemsPerPage: 10 });

  // Reset page when filters change
  useEffect(() => {
    resetPage();
  }, [searchTerm, statusFilter, sortBy, resetPage]);

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddPatternModal, setShowAddPatternModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'app' | 'pattern'; id: number } | null>(null);
  const [selectedApp, setSelectedApp] = useState<AppRegistryWithPatterns | null>(null);

  // Mutations
  const createApp = useCreateApplication();
  const updateApp = useUpdateApplication();
  const deleteApp = useDeleteApplication();
  const createPattern = useCreatePattern();
  const deletePattern = useDeletePattern();

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateApp = (data: { code: string; name: string; description?: string }) => {
    createApp.mutate(data, {
      onSuccess: () => {
        setShowCreateModal(false);
        toast.success('Application created successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create application');
      },
    });
  };

  const handleUpdateApp = (data: { code: string; name: string; description?: string }) => {
    if (!selectedApp) return;
    updateApp.mutate(
      { id: selectedApp.id, data },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setSelectedApp(null);
          toast.success('Application updated successfully');
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to update application');
        },
      },
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'app') {
      deleteApp.mutate(deleteTarget.id, {
        onSuccess: () => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
          toast.success('Application deleted successfully');
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to delete application');
        },
      });
    } else {
      deletePattern.mutate(deleteTarget.id, {
        onSuccess: () => {
          setShowDeleteConfirm(false);
          setDeleteTarget(null);
          toast.success('Pattern deleted successfully');
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to delete pattern');
        },
      });
    }
  };

  const handleAddPattern = (data: { pattern: string; priority: number }) => {
    if (!selectedApp) return;
    createPattern.mutate(
      { appId: selectedApp.id, data },
      {
        onSuccess: () => {
          setShowAddPatternModal(false);
          setSelectedApp(null);
          toast.success('Pattern added successfully');
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to add pattern');
        },
      },
    );
  };

  const openEditModal = (app: AppRegistryWithPatterns) => {
    setSelectedApp(app);
    setShowEditModal(true);
  };

  const openAddPatternModal = (app: AppRegistryWithPatterns) => {
    setSelectedApp(app);
    setShowAddPatternModal(true);
  };

  const openDeleteConfirm = (type: 'app' | 'pattern', id: number) => {
    setDeleteTarget({ type, id });
    setShowDeleteConfirm(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Application Registry</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            Manage application names and their pattern matching rules
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-card border border-border/60 rounded-xl p-6 mb-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Search</label>
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Name or code..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'code' | 'created' | 'patterns')}
                className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50"
              >
                <option value="name">Name</option>
                <option value="code">Code</option>
                <option value="created">Date Created</option>
                <option value="patterns">Pattern Count</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40"
              >
                + New Application
              </Button>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="rounded-2xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-2xl">
          <div className="px-6 py-6 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5">
            <h3 className="text-sm font-bold text-foreground">
              Applications
              <span className="ml-3 text-xs font-normal text-muted-foreground/70">
                Showing {filteredApplications.length} applications
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-vibrant-cyan-500"></div>
              </div>
            ) : paginatedItems.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No applications found</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-jpc-vibrant-cyan-500/10">
                    <th className="w-12 h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-center py-4 px-6"></th>
                    <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-left py-4 px-6">CODE</th>
                    <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-left py-4 px-6">NAME</th>
                    <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-left py-4 px-6">DESCRIPTION</th>
                    <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-center py-4 px-6">PATTERNS</th>
                    <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-center py-4 px-6">STATUS</th>
                    <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-right py-4 px-6">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((app) => (
                    <React.Fragment key={app.id}>
                      <tr
                        className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group cursor-pointer"
                        onClick={() => toggleRow(app.id)}
                      >
                        <td className="px-6 py-4 text-center">
                          <span className="text-cyan-100 group-hover:text-cyan-300">
                            {expandedRows.has(app.id) ? '\u25BC' : '\u25B6'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-cyan-100 group-hover:text-cyan-300">
                          {app.code}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-foreground/90 group-hover:text-cyan-100">
                          {app.name}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground/70">
                          {app.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-xs text-center">
                          <Badge
                            variant="outline"
                            className="bg-jpc-vibrant-purple-500/20 text-jpc-vibrant-purple-400 border-jpc-vibrant-purple-500/40"
                          >
                            {app.patterns?.length || 0}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge
                            variant="outline"
                            className={`${
                              app.isActive
                                ? 'bg-jpc-vibrant-emerald-500/20 text-jpc-vibrant-emerald-400 border-jpc-vibrant-emerald-500/40'
                                : 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40'
                            } border font-medium`}
                          >
                            {app.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2 justify-end">
                            <Button
                              onClick={() => openEditModal(app)}
                              size="sm"
                              variant="outline"
                              className="text-xs border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => openDeleteConfirm('app', app.id)}
                              size="sm"
                              variant="outline"
                              className="text-xs border-red-500/30 text-red-300 hover:bg-red-500/20"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {expandedRows.has(app.id) && (
                        <tr key={`${app.id}-patterns`} className="bg-jpc-vibrant-cyan-500/5">
                          <td colSpan={7} className="px-12 py-6">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between mb-4">
                                <h4 className="text-sm font-semibold text-cyan-100">Pattern Matching Rules</h4>
                                <Button
                                  onClick={() => openAddPatternModal(app)}
                                  size="sm"
                                  className="text-xs bg-jpc-vibrant-purple-500/20 text-purple-100 hover:bg-jpc-vibrant-purple-500/30 border border-jpc-vibrant-purple-500/40"
                                >
                                  + Add Pattern
                                </Button>
                              </div>
                              {app.patterns && app.patterns.length > 0 ? (
                                <div className="grid grid-cols-1 gap-2">
                                  {[...app.patterns]
                                    .sort((a, b) => a.priority - b.priority)
                                    .map((pattern) => (
                                      <div
                                        key={pattern.id}
                                        className="flex items-center justify-between bg-background/60 border border-jpc-vibrant-cyan-500/20 rounded-lg px-4 py-3 hover:border-jpc-vibrant-cyan-500/40 transition-all"
                                      >
                                        <div className="flex items-center gap-4">
                                          <Badge
                                            variant="outline"
                                            className="bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40 font-mono text-xs"
                                          >
                                            Priority: {pattern.priority}
                                          </Badge>
                                          <span className="text-sm font-medium text-foreground">
                                            {pattern.pattern}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className="bg-jpc-vibrant-purple-500/20 text-jpc-vibrant-purple-400 border-jpc-vibrant-purple-500/40 text-xs"
                                          >
                                            {pattern.matchType}
                                          </Badge>
                                        </div>
                                        <Button
                                          onClick={() => openDeleteConfirm('pattern', pattern.id)}
                                          size="sm"
                                          variant="outline"
                                          className="text-xs border-red-500/30 text-red-300 hover:bg-red-500/20"
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground/60">
                                  No patterns defined. Click &quot;Add Pattern&quot; to create one.
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-jpc-vibrant-cyan-500/20">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={goToFirstPage}
                  disabled={isFirstPage}
                  size="sm"
                  variant="outline"
                  className={`${
                    isFirstPage
                      ? 'opacity-40 cursor-not-allowed'
                      : 'border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20'
                  }`}
                >
                  First
                </Button>
                <Button
                  onClick={goToPreviousPage}
                  disabled={isFirstPage}
                  size="sm"
                  variant="outline"
                  className={`${
                    isFirstPage
                      ? 'opacity-40 cursor-not-allowed'
                      : 'border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20'
                  }`}
                >
                  Previous
                </Button>
                <Button
                  onClick={goToNextPage}
                  disabled={isLastPage}
                  size="sm"
                  variant="outline"
                  className={`${
                    isLastPage
                      ? 'opacity-40 cursor-not-allowed'
                      : 'border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20'
                  }`}
                >
                  Next
                </Button>
                <Button
                  onClick={goToLastPage}
                  disabled={isLastPage}
                  size="sm"
                  variant="outline"
                  className={`${
                    isLastPage
                      ? 'opacity-40 cursor-not-allowed'
                      : 'border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20'
                  }`}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <CreateApplicationModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateApp}
        isPending={createApp.isPending}
      />

      <EditApplicationModal
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) setSelectedApp(null);
        }}
        application={selectedApp}
        onSubmit={handleUpdateApp}
        isPending={updateApp.isPending}
      />

      <AddPatternModal
        open={showAddPatternModal}
        onOpenChange={(open) => {
          setShowAddPatternModal(open);
          if (!open) setSelectedApp(null);
        }}
        applicationName={selectedApp?.name || ''}
        onSubmit={handleAddPattern}
        isPending={createPattern.isPending}
      />

      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          setShowDeleteConfirm(open);
          if (!open) setDeleteTarget(null);
        }}
        targetType={deleteTarget?.type || 'app'}
        onConfirm={handleDelete}
        isPending={deleteApp.isPending || deletePattern.isPending}
      />
    </div>
  );
}
