'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useModules } from '../hooks/use-modules';
import { useModuleFilters } from '../hooks/use-module-filters';
import { useCreateModule } from '../hooks/use-create-module';
import { useUpdateModule } from '../hooks/use-update-module';
import { useDeleteModule } from '../hooks/use-delete-module';
import {
  APPLICATIONS,
  APPLICATION_COLORS,
} from '../services/module-registry.service';
import type { Module } from '../services/module-registry.service';

interface FormData {
  sourceValue: string;
  displayValue: string;
  application: string;
}

const DEFAULT_FORM: FormData = {
  sourceValue: '',
  displayValue: '',
  application: 'SB',
};

function getApplicationColors(app: string) {
  return APPLICATION_COLORS[app] || { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/40' };
}

export function ModuleRegistryList() {
  const { data: modules = [], isLoading, error } = useModules();
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    applicationFilter,
    setApplicationFilter,
    sortBy,
    setSortBy,
    filteredModules,
  } = useModuleFilters(modules);
  const pagination = usePagination(filteredModules, { initialItemsPerPage: 10 });
  const { resetPage } = pagination;

  const createMutation = useCreateModule();
  const updateMutation = useUpdateModule();
  const deleteMutation = useDeleteModule();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  // Form data
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);

  // Reset pagination when filters change
  useEffect(() => {
    resetPage();
  }, [searchTerm, statusFilter, applicationFilter, sortBy, resetPage]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setShowCreateModal(false);
      setFormData(DEFAULT_FORM);
      toast.success('Module mapping created successfully');
    } catch (error) {
      toast.error('Failed to create module mapping', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedModule.id,
        data: formData,
      });
      setShowEditModal(false);
      setSelectedModule(null);
      setFormData(DEFAULT_FORM);
      toast.success('Module mapping updated successfully');
    } catch (error) {
      toast.error('Failed to update module mapping', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedModule) return;

    try {
      await deleteMutation.mutateAsync(selectedModule.id);
      setShowDeleteConfirm(false);
      setSelectedModule(null);
      toast.success('Module mapping deleted successfully');
    } catch (error) {
      toast.error('Failed to delete module mapping', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const openEditModal = (mod: Module) => {
    setSelectedModule(mod);
    setFormData({
      sourceValue: mod.sourceValue,
      displayValue: mod.displayValue,
      application: mod.application,
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (mod: Module) => {
    setSelectedModule(mod);
    setShowDeleteConfirm(true);
  };

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        Error loading module mappings: {error.message}
      </div>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      {/* Filters Section */}
      <div className="bg-card border border-border/60 rounded-xl p-6 mb-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Search</label>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search modules..."
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Application</label>
            <select
              value={applicationFilter}
              onChange={(e) => setApplicationFilter(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50"
            >
              <option value="all">All Applications</option>
              {APPLICATIONS.map((app) => (
                <option key={app} value={app}>
                  {app}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
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
              onChange={(e) => setSortBy(e.target.value as 'sourceValue' | 'displayValue' | 'application' | 'created')}
              className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50"
            >
              <option value="sourceValue">Source Value</option>
              <option value="displayValue">Display Value</option>
              <option value="application">Application</option>
              <option value="created">Date Created</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40"
            >
              + New Mapping
            </Button>
          </div>
        </div>
      </div>

      {/* Module Mappings Table */}
      <div className="rounded-2xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-2xl">
        <div className="px-6 py-6 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5">
          <h3 className="text-sm font-bold text-foreground">
            Module Mappings
            <span className="ml-3 text-xs font-normal text-muted-foreground/70">
              Showing {filteredModules.length} mappings
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-vibrant-cyan-500"></div>
            </div>
          ) : pagination.paginatedItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No module mappings found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-jpc-vibrant-cyan-500/10">
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-left py-4 px-6">
                    SOURCE VALUE
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-center py-4 px-6">
                    MAPS TO
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-left py-4 px-6">
                    DISPLAY VALUE
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-center py-4 px-6">
                    APPLICATION
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-center py-4 px-6">
                    STATUS
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-right py-4 px-6">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagination.paginatedItems.map((mod) => {
                  const appColors = getApplicationColors(mod.application);
                  return (
                    <tr
                      key={mod.id}
                      className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group"
                    >
                      <td className="px-6 py-4 text-xs font-semibold text-cyan-100 group-hover:text-cyan-300">
                        {mod.sourceValue}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-muted-foreground/50 text-lg">&rarr;</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-jpc-vibrant-purple-500/20 text-jpc-vibrant-purple-400 border-jpc-vibrant-purple-500/40 font-medium">
                          {mod.displayValue}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant="outline"
                          className={`${appColors.bg} ${appColors.text} ${appColors.border} font-medium`}
                        >
                          {mod.application}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          variant="outline"
                          className={`${
                            mod.isActive
                              ? 'bg-jpc-vibrant-emerald-500/20 text-jpc-vibrant-emerald-400 border-jpc-vibrant-emerald-500/40'
                              : 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40'
                          } border font-medium`}
                        >
                          {mod.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => openEditModal(mod)}
                            size="sm"
                            variant="outline"
                            className="text-xs border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => openDeleteConfirm(mod)}
                            size="sm"
                            variant="outline"
                            className="text-xs border-red-500/30 text-red-300 hover:bg-red-500/20"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-jpc-vibrant-cyan-500/20">
            <div className="text-sm text-muted-foreground">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => pagination.goToPage(1)}
                disabled={pagination.currentPage === 1}
                size="sm"
                variant="outline"
                className={`${
                  pagination.currentPage === 1
                    ? 'opacity-40 cursor-not-allowed'
                    : 'border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20'
                }`}
              >
                First
              </Button>
              <Button
                onClick={pagination.goToPreviousPage}
                disabled={pagination.currentPage === 1}
                size="sm"
                variant="outline"
                className={`${
                  pagination.currentPage === 1
                    ? 'opacity-40 cursor-not-allowed'
                    : 'border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20'
                }`}
              >
                Previous
              </Button>
              <Button
                onClick={pagination.goToNextPage}
                disabled={pagination.currentPage === pagination.totalPages}
                size="sm"
                variant="outline"
                className={`${
                  pagination.currentPage === pagination.totalPages
                    ? 'opacity-40 cursor-not-allowed'
                    : 'border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20'
                }`}
              >
                Next
              </Button>
              <Button
                onClick={() => pagination.goToPage(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                size="sm"
                variant="outline"
                className={`${
                  pagination.currentPage === pagination.totalPages
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

      {/* Create Module Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-card border-jpc-vibrant-cyan-500/30">
          <DialogHeader>
            <DialogTitle>Create New Module Mapping</DialogTitle>
            <DialogDescription>
              Add a new module mapping (Source Value &rarr; Display Value).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Source Value <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.sourceValue}
                onChange={(e) => setFormData({ ...formData, sourceValue: e.target.value })}
                placeholder="e.g., SB2 ChatBot"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground/60 mt-1">
                The exact module value from the source data
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Display Value <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.displayValue}
                onChange={(e) => setFormData({ ...formData, displayValue: e.target.value })}
                placeholder="e.g., ChatBot"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground/60 mt-1">
                The custom display value shown in reports
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Application <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.application}
                onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50"
              >
                {APPLICATIONS.map((app) => (
                  <option key={app} value={app}>
                    {app}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground/60 mt-1">
                The application this module belongs to
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData(DEFAULT_FORM);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Module Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-card border-jpc-vibrant-cyan-500/30">
          <DialogHeader>
            <DialogTitle>Edit Module Mapping</DialogTitle>
            <DialogDescription>
              Update the module mapping values.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Source Value <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.sourceValue}
                onChange={(e) => setFormData({ ...formData, sourceValue: e.target.value })}
                placeholder="e.g., SB2 ChatBot"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Display Value <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.displayValue}
                onChange={(e) => setFormData({ ...formData, displayValue: e.target.value })}
                placeholder="e.g., ChatBot"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Application <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.application}
                onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50"
              >
                {APPLICATIONS.map((app) => (
                  <option key={app} value={app}>
                    {app}
                  </option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedModule(null);
                  setFormData(DEFAULT_FORM);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the mapping for &quot;{selectedModule?.sourceValue}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedModule(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
