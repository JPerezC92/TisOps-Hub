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
import { getDisplayStatusColor } from '@/lib/utils/display-status';
import { useMonthlyReportStatuses } from '../hooks/use-monthly-report-statuses';
import { useMonthlyReportStatusFilters } from '../hooks/use-monthly-report-status-filters';
import { useCreateMonthlyReportStatus } from '../hooks/use-create-monthly-report-status';
import { useUpdateMonthlyReportStatus } from '../hooks/use-update-monthly-report-status';
import { useDeleteMonthlyReportStatus } from '../hooks/use-delete-monthly-report-status';
import type { MonthlyReportStatus } from '../services/monthly-report-status-registry.service';

interface FormData {
  rawStatus: string;
  displayStatus: string;
}

const DISPLAY_STATUS_OPTIONS = [
  'Closed',
  'On going L2',
  'On going L3',
  'In L3 Backlog',
] as const;

export function StatusMappingsList() {
  const { data: statuses = [], isLoading, error } = useMonthlyReportStatuses();
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filteredStatuses,
  } = useMonthlyReportStatusFilters(statuses);
  const pagination = usePagination(filteredStatuses, { initialItemsPerPage: 10 });
  const { resetPage } = pagination;

  const createMutation = useCreateMonthlyReportStatus();
  const updateMutation = useUpdateMonthlyReportStatus();
  const deleteMutation = useDeleteMonthlyReportStatus();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<MonthlyReportStatus | null>(null);

  // Form data
  const [formData, setFormData] = useState<FormData>({
    rawStatus: '',
    displayStatus: '',
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
      setFormData({ rawStatus: '', displayStatus: '' });
      toast.success('Status mapping created successfully');
    } catch (error) {
      toast.error('Failed to create status mapping', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus) return;

    try {
      await updateMutation.mutateAsync({
        id: selectedStatus.id,
        data: formData,
      });
      setShowEditModal(false);
      setSelectedStatus(null);
      setFormData({ rawStatus: '', displayStatus: '' });
      toast.success('Status mapping updated successfully');
    } catch (error) {
      toast.error('Failed to update status mapping', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedStatus) return;

    try {
      await deleteMutation.mutateAsync(selectedStatus.id);
      setShowDeleteConfirm(false);
      setSelectedStatus(null);
      toast.success('Status mapping deleted successfully');
    } catch (error) {
      toast.error('Failed to delete status mapping', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const openEditModal = (status: MonthlyReportStatus) => {
    setSelectedStatus(status);
    setFormData({
      rawStatus: status.rawStatus,
      displayStatus: status.displayStatus,
    });
    setShowEditModal(true);
  };

  const openDeleteConfirm = (status: MonthlyReportStatus) => {
    setSelectedStatus(status);
    setShowDeleteConfirm(true);
  };

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        Error loading status mappings: {error.message}
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
              placeholder="Search statuses..."
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
              onChange={(e) => setSortBy(e.target.value as 'rawStatus' | 'displayStatus' | 'created')}
              className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50"
            >
              <option value="rawStatus">Raw Status</option>
              <option value="displayStatus">Display Status</option>
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
            Status Mappings
            <span className="ml-3 text-xs font-normal text-muted-foreground/70">
              Showing {filteredStatuses.length} mappings
            </span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-vibrant-cyan-500"></div>
            </div>
          ) : pagination.paginatedItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No status mappings found</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-jpc-vibrant-cyan-500/10">
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-left py-4 px-6">
                    RAW STATUS
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-center py-4 px-6">
                    MAPS TO
                  </th>
                  <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-left py-4 px-6">
                    DISPLAY STATUS
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
                {pagination.paginatedItems.map((status) => (
                  <tr
                    key={status.id}
                    className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group"
                  >
                    <td className="px-6 py-4 text-xs font-semibold text-cyan-100 group-hover:text-cyan-300">
                      {status.rawStatus}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-muted-foreground/50 text-lg">→</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`${getDisplayStatusColor(status.displayStatus)} font-medium`}>
                        {status.displayStatus}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        variant="outline"
                        className={`${
                          status.isActive
                            ? 'bg-jpc-vibrant-emerald-500/20 text-jpc-vibrant-emerald-400 border-jpc-vibrant-emerald-500/40'
                            : 'bg-jpc-vibrant-orange-500/20 text-jpc-vibrant-orange-400 border-jpc-vibrant-orange-500/40'
                        } border font-medium`}
                      >
                        {status.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          onClick={() => openEditModal(status)}
                          size="sm"
                          variant="outline"
                          className="text-xs border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => openDeleteConfirm(status)}
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
              Add a new status mapping from raw status to display status.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Raw Status <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.rawStatus}
                onChange={(e) => setFormData({ ...formData, rawStatus: e.target.value })}
                placeholder="e.g., En Mantenimiento Correctivo"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground/60 mt-1">
                The exact status value from the source data
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Display Status <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.displayStatus}
                onChange={(e) => setFormData({ ...formData, displayStatus: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50"
              >
                <option value="">Select a display status...</option>
                {DISPLAY_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground/60 mt-1">
                The standardized status shown in reports
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ rawStatus: '', displayStatus: '' });
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
              Update the status mapping values.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Raw Status <span className="text-red-400">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.rawStatus}
                onChange={(e) => setFormData({ ...formData, rawStatus: e.target.value })}
                placeholder="e.g., En Mantenimiento Correctivo"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Display Status <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.displayStatus}
                onChange={(e) => setFormData({ ...formData, displayStatus: e.target.value })}
                className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50"
              >
                <option value="">Select a display status...</option>
                {DISPLAY_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
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
                  setSelectedStatus(null);
                  setFormData({ rawStatus: '', displayStatus: '' });
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
              Are you sure you want to delete the mapping for &quot;{selectedStatus?.rawStatus}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteConfirm(false);
                setSelectedStatus(null);
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
