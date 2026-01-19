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
import { useCategorizations } from '../hooks/use-categorizations';
import { useCategorizationsFilters } from '../hooks/use-categorizations-filters';
import { useCreateCategorization } from '../hooks/use-create-categorization';
import { useUpdateCategorization } from '../hooks/use-update-categorization';
import { useDeleteCategorization } from '../hooks/use-delete-categorization';
import type { Categorization } from '../services/categorization-registry.service';

interface FormData {
  sourceValue: string;
  displayValue: string;
}

export function CategorizationsList() {
  const { data: categorizations = [], isLoading, error } = useCategorizations();
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filteredCategorizations,
  } = useCategorizationsFilters(categorizations);
  const pagination = usePagination(filteredCategorizations, { initialItemsPerPage: 10 });
  const { resetPage } = pagination;

  const createMutation = useCreateCategorization();
  const updateMutation = useUpdateCategorization();
  const deleteMutation = useDeleteCategorization();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCategorization, setSelectedCategorization] = useState<Categorization | null>(null);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    sourceValue: '',
    displayValue: '',
  });

  // Reset pagination when filters change
  useEffect(() => {
    resetPage();
  }, [searchTerm, statusFilter, sortBy, resetPage]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setShowCreateModal(false);
      setFormData({ sourceValue: '', displayValue: '' });
      toast.success('Categorization mapping created successfully');
    } catch (error) {
      toast.error('Failed to create categorization mapping', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategorization) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedCategorization.id,
        data: formData,
      });
      setShowEditModal(false);
      setSelectedCategorization(null);
      setFormData({ sourceValue: '', displayValue: '' });
      toast.success('Categorization mapping updated successfully');
    } catch (error) {
      toast.error('Failed to update categorization mapping', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedCategorization) return;

    try {
      await deleteMutation.mutateAsync(selectedCategorization.id);
      setShowDeleteConfirm(false);
      setSelectedCategorization(null);
      toast.success('Categorization mapping deleted successfully');
    } catch (error) {
      toast.error('Failed to delete categorization mapping', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const openEditModal = (categorization: Categorization) => {
    setSelectedCategorization(categorization);
    setFormData({
      sourceValue: categorization.sourceValue,
      displayValue: categorization.displayValue,
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (categorization: Categorization) => {
    setSelectedCategorization(categorization);
    setShowDeleteConfirm(true);
  };

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        Error loading categorizations: {error.message}
      </div>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      {/* Filters Section */}
      <div className="bg-card border border-border/60 rounded-xl p-6 mb-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Search</label>
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search categorizations..."
              className="w-full"
            />
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
              onChange={(e) => setSortBy(e.target.value as 'sourceValue' | 'displayValue' | 'created')}
              className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50"
            >
              <option value="sourceValue">Source Value</option>
              <option value="displayValue">Display Value</option>
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

      {/* Table */}
      <div className="rounded-2xl border border-jpc-vibrant-cyan-500/20 bg-card/60 overflow-hidden shadow-2xl">
        <div className="px-6 py-6 border-b border-jpc-vibrant-cyan-500/20 bg-gradient-to-r from-jpc-vibrant-cyan-500/10 to-jpc-vibrant-purple-500/5">
          <h3 className="text-sm font-bold text-foreground">
            Categorization Mappings
            <span className="ml-3 text-xs font-normal text-muted-foreground/70">
              Showing {filteredCategorizations.length} mappings
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-vibrant-cyan-500"></div>
            </div>
          ) : pagination.paginatedItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No categorization mappings found</div>
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
                    STATUS
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-right py-4 px-6">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagination.paginatedItems.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group"
                  >
                    <td className="px-6 py-4 text-xs font-semibold text-cyan-100 group-hover:text-cyan-300">
                      {cat.sourceValue}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-muted-foreground/50 text-lg">→</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-jpc-vibrant-purple-500/20 text-jpc-vibrant-purple-400 border-jpc-vibrant-purple-500/40 font-medium">
                        {cat.displayValue}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        variant="outline"
                        className={`${
                          cat.isActive
                            ? 'bg-jpc-vibrant-emerald-500/20 text-jpc-vibrant-emerald-400 border-jpc-vibrant-emerald-500/40'
                            : 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40'
                        } border font-medium`}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => openEditModal(cat)}
                          size="sm"
                          variant="outline"
                          className="text-xs border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => openDeleteConfirm(cat)}
                          size="sm"
                          variant="outline"
                          className="text-xs border-red-500/30 text-red-300 hover:bg-red-500/20"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                onClick={pagination.goToFirstPage}
                disabled={pagination.isFirstPage}
                size="sm"
                variant="outline"
                className={`${
                  pagination.isFirstPage
                    ? 'opacity-40 cursor-not-allowed'
                    : 'border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20'
                }`}
              >
                First
              </Button>
              <Button
                onClick={pagination.goToPreviousPage}
                disabled={pagination.isFirstPage}
                size="sm"
                variant="outline"
                className={`${
                  pagination.isFirstPage
                    ? 'opacity-40 cursor-not-allowed'
                    : 'border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20'
                }`}
              >
                Previous
              </Button>
              <Button
                onClick={pagination.goToNextPage}
                disabled={pagination.isLastPage}
                size="sm"
                variant="outline"
                className={`${
                  pagination.isLastPage
                    ? 'opacity-40 cursor-not-allowed'
                    : 'border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20'
                }`}
              >
                Next
              </Button>
              <Button
                onClick={pagination.goToLastPage}
                disabled={pagination.isLastPage}
                size="sm"
                variant="outline"
                className={`${
                  pagination.isLastPage
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

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-card border-jpc-vibrant-cyan-500/30">
          <DialogHeader>
            <DialogTitle>Create New Mapping</DialogTitle>
            <DialogDescription>
              Add a new categorization mapping from source value to display value.
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
                placeholder="e.g., Error de codificación (Bug)"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground/60 mt-1">
                The exact categorization value from the source data
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
                placeholder="e.g., Bugs"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground/60 mt-1">
                The custom display value shown in reports
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ sourceValue: '', displayValue: '' });
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

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-card border-jpc-vibrant-cyan-500/30">
          <DialogHeader>
            <DialogTitle>Edit Mapping</DialogTitle>
            <DialogDescription>
              Update the categorization mapping values.
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
                placeholder="e.g., Error de codificación (Bug)"
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
                placeholder="e.g., Bugs"
                className="w-full"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCategorization(null);
                  setFormData({ sourceValue: '', displayValue: '' });
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
              Are you sure you want to delete the mapping for &quot;{selectedCategorization?.sourceValue}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedCategorization(null);
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
