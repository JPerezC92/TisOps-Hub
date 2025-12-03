'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Categorization {
  id: number;
  sourceValue: string;
  displayValue: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategorizationFormData {
  sourceValue: string;
  displayValue: string;
}

export default function CategorizationRegistryPage() {
  const [categorizations, setCategorizations] = useState<Categorization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('sourceValue');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCategorization, setSelectedCategorization] = useState<Categorization | null>(null);

  // Form data
  const [formData, setFormData] = useState<CategorizationFormData>({
    sourceValue: '',
    displayValue: '',
  });

  // Fetch categorizations
  const fetchCategorizations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/categorization-registry', {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setCategorizations(data);
      } else {
        alert('Failed to fetch categorization mappings');
      }
    } catch (error) {
      console.error('Failed to fetch categorization mappings:', error);
      alert('Failed to fetch categorization mappings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorizations();
  }, []);

  // Create categorization
  const handleCreateCategorization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/categorization-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isActive: true,
        }),
      });

      if (response.ok) {
        await fetchCategorizations();
        setShowCreateModal(false);
        setFormData({ sourceValue: '', displayValue: '' });
        alert('Categorization mapping created successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to create categorization mapping'}`);
      }
    } catch (error) {
      console.error('Failed to create categorization mapping:', error);
      alert('Failed to create categorization mapping');
    }
  };

  // Update categorization
  const handleUpdateCategorization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategorization) return;

    try {
      const response = await fetch(`http://localhost:3000/categorization-registry/${selectedCategorization.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCategorizations();
        setShowEditModal(false);
        setSelectedCategorization(null);
        setFormData({ sourceValue: '', displayValue: '' });
        alert('Categorization mapping updated successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to update categorization mapping'}`);
      }
    } catch (error) {
      console.error('Failed to update categorization mapping:', error);
      alert('Failed to update categorization mapping');
    }
  };

  // Delete categorization
  const handleDelete = async () => {
    if (!selectedCategorization) return;

    try {
      const response = await fetch(`http://localhost:3000/categorization-registry/${selectedCategorization.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchCategorizations();
        setShowDeleteConfirm(false);
        setSelectedCategorization(null);
        alert('Categorization mapping deleted successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to delete categorization mapping'}`);
      }
    } catch (error) {
      console.error('Failed to delete categorization mapping:', error);
      alert('Failed to delete categorization mapping');
    }
  };

  // Open edit modal
  const openEditModal = (categorization: Categorization) => {
    setSelectedCategorization(categorization);
    setFormData({
      sourceValue: categorization.sourceValue,
      displayValue: categorization.displayValue,
    });
    setShowEditModal(true);
  };

  // Open delete confirmation
  const openDeleteConfirm = (categorization: Categorization) => {
    setSelectedCategorization(categorization);
    setShowDeleteConfirm(true);
  };

  // Filter and sort categorizations
  const filteredCategorizations = categorizations
    .filter((cat) => {
      const matchesSearch =
        cat.sourceValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.displayValue.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || (statusFilter === 'active' ? cat.isActive : !cat.isActive);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'sourceValue':
          return a.sourceValue.localeCompare(b.sourceValue);
        case 'displayValue':
          return a.displayValue.localeCompare(b.displayValue);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredCategorizations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategorizations = filteredCategorizations.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">Categorization Registry</h1>
          <p className="mt-3 text-base text-muted-foreground/90">
            Manage categorization mappings (Source Value → Display Value)
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
                placeholder="Search categorizations..."
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
                onChange={(e) => setSortBy(e.target.value)}
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

        {/* Categorization Mappings Table */}
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
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-vibrant-cyan-500"></div>
              </div>
            ) : paginatedCategorizations.length === 0 ? (
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
                  {paginatedCategorizations.map((cat) => (
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-jpc-vibrant-cyan-500/20">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  size="sm"
                  variant="outline"
                  className={`${
                    currentPage === 1
                      ? 'opacity-40 cursor-not-allowed'
                      : 'border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20'
                  }`}
                >
                  First
                </Button>
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  size="sm"
                  variant="outline"
                  className={`${
                    currentPage === 1
                      ? 'opacity-40 cursor-not-allowed'
                      : 'border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20'
                  }`}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  size="sm"
                  variant="outline"
                  className={`${
                    currentPage === totalPages
                      ? 'opacity-40 cursor-not-allowed'
                      : 'border-jpc-vibrant-cyan-500/30 text-cyan-300 hover:bg-jpc-vibrant-cyan-500/20'
                  }`}
                >
                  Next
                </Button>
                <Button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  size="sm"
                  variant="outline"
                  className={`${
                    currentPage === totalPages
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

      {/* Create Categorization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border border-jpc-vibrant-cyan-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Create New Mapping</h2>
            <form onSubmit={handleCreateCategorization} className="space-y-4">
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
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ sourceValue: '', displayValue: '' });
                  }}
                  variant="outline"
                  className="flex-1 border-border/60 text-foreground hover:bg-background/80"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40"
                >
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Categorization Modal */}
      {showEditModal && selectedCategorization && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border border-jpc-vibrant-cyan-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Edit Mapping</h2>
            <form onSubmit={handleUpdateCategorization} className="space-y-4">
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
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCategorization(null);
                    setFormData({ sourceValue: '', displayValue: '' });
                  }}
                  variant="outline"
                  className="flex-1 border-border/60 text-foreground hover:bg-background/80"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-jpc-vibrant-cyan-500/20 text-cyan-100 hover:bg-jpc-vibrant-cyan-500/30 border border-jpc-vibrant-cyan-500/40"
                >
                  Update
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedCategorization && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border border-red-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Confirm Delete</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete the mapping for &quot;{selectedCategorization.sourceValue}&quot;? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedCategorization(null);
                }}
                variant="outline"
                className="flex-1 border-border/60 text-foreground hover:bg-background/80"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                className="flex-1 bg-red-500/20 text-red-100 hover:bg-red-500/30 border border-red-500/40"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
