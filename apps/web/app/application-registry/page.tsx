'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ApplicationPattern {
  id: number;
  applicationId: number;
  pattern: string;
  priority: number;
  matchType: string;
  isActive: boolean;
}

interface Application {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  patterns?: ApplicationPattern[];
}

interface ApplicationFormData {
  code: string;
  name: string;
  description: string;
}

interface PatternFormData {
  pattern: string;
  priority: number;
}

export default function ApplicationRegistryPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddPatternModal, setShowAddPatternModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'app' | 'pattern'; id: number } | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Form data
  const [appFormData, setAppFormData] = useState<ApplicationFormData>({
    code: '',
    name: '',
    description: '',
  });
  const [patternFormData, setPatternFormData] = useState<PatternFormData>({
    pattern: '',
    priority: 100,
  });

  // Fetch applications with patterns
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/application-registry/with-patterns', {
        cache: 'no-store',
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        alert('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      alert('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Toggle row expansion
  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  // Create application
  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/application-registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...appFormData,
          isActive: true,
        }),
      });

      if (response.ok) {
        await fetchApplications();
        setShowCreateModal(false);
        setAppFormData({ code: '', name: '', description: '' });
        alert('Application created successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to create application'}`);
      }
    } catch (error) {
      console.error('Failed to create application:', error);
      alert('Failed to create application');
    }
  };

  // Update application
  const handleUpdateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      const response = await fetch(`http://localhost:3000/application-registry/${selectedApp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appFormData),
      });

      if (response.ok) {
        await fetchApplications();
        setShowEditModal(false);
        setSelectedApp(null);
        setAppFormData({ code: '', name: '', description: '' });
        alert('Application updated successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to update application'}`);
      }
    } catch (error) {
      console.error('Failed to update application:', error);
      alert('Failed to update application');
    }
  };

  // Delete application or pattern
  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const url =
        deleteTarget.type === 'app'
          ? `http://localhost:3000/application-registry/${deleteTarget.id}`
          : `http://localhost:3000/application-registry/patterns/${deleteTarget.id}`;

      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchApplications();
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
        alert(`${deleteTarget.type === 'app' ? 'Application' : 'Pattern'} deleted successfully`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to delete'}`);
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete');
    }
  };

  // Add pattern to application
  const handleAddPattern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      const response = await fetch(`http://localhost:3000/application-registry/${selectedApp.id}/patterns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...patternFormData,
          matchType: 'contains',
          isActive: true,
        }),
      });

      if (response.ok) {
        await fetchApplications();
        setShowAddPatternModal(false);
        setSelectedApp(null);
        setPatternFormData({ pattern: '', priority: 100 });
        alert('Pattern added successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to add pattern'}`);
      }
    } catch (error) {
      console.error('Failed to add pattern:', error);
      alert('Failed to add pattern');
    }
  };

  // Open edit modal
  const openEditModal = (app: Application) => {
    setSelectedApp(app);
    setAppFormData({
      code: app.code,
      name: app.name,
      description: app.description || '',
    });
    setShowEditModal(true);
  };

  // Open add pattern modal
  const openAddPatternModal = (app: Application) => {
    setSelectedApp(app);
    setPatternFormData({ pattern: '', priority: 100 });
    setShowAddPatternModal(true);
  };

  // Open delete confirmation
  const openDeleteConfirm = (type: 'app' | 'pattern', id: number) => {
    setDeleteTarget({ type, id });
    setShowDeleteConfirm(true);
  };

  // Filter and sort applications
  const filteredApps = applications
    .filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? app.isActive : !app.isActive);
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'code':
          return a.code.localeCompare(b.code);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'patterns':
          return (b.patterns?.length || 0) - (a.patterns?.length || 0);
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedApps = filteredApps.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

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
                onChange={(e) => setSortBy(e.target.value)}
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
                Showing {filteredApps.length} applications
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-vibrant-cyan-500"></div>
              </div>
            ) : paginatedApps.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No applications found</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-jpc-vibrant-cyan-500/10">
                    <th className="w-12 h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-center py-4 px-6">

                    </th>
                    <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-left py-4 px-6">
                      CODE
                    </th>
                    <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-left py-4 px-6">
                      NAME
                    </th>
                    <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-left py-4 px-6">
                      DESCRIPTION
                    </th>
                    <th className="h-12 text-xs font-bold text-cyan-100 bg-jpc-vibrant-cyan-500/5 text-center py-4 px-6">
                      PATTERNS
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
                  {paginatedApps.map((app) => (
                    <React.Fragment key={app.id}>
                      <tr
                        className="border-b border-jpc-vibrant-cyan-500/10 hover:bg-jpc-vibrant-cyan-500/10 transition-all duration-300 group cursor-pointer"
                        onClick={() => toggleRow(app.id)}
                      >
                        <td className="px-6 py-4 text-center">
                          <span className="text-cyan-100 group-hover:text-cyan-300">
                            {expandedRows.has(app.id) ? '▼' : '▶'}
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
                                  {app.patterns
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

      {/* Create Application Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border border-jpc-vibrant-cyan-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Create New Application</h2>
            <form onSubmit={handleCreateApp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Code <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={appFormData.code}
                  onChange={(e) => setAppFormData({ ...appFormData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., FFVV"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={appFormData.name}
                  onChange={(e) => setAppFormData({ ...appFormData, name: e.target.value })}
                  placeholder="e.g., Fuerza de Venta"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={appFormData.description}
                  onChange={(e) => setAppFormData({ ...appFormData, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setAppFormData({ code: '', name: '', description: '' });
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

      {/* Edit Application Modal */}
      {showEditModal && selectedApp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border border-jpc-vibrant-cyan-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Edit Application</h2>
            <form onSubmit={handleUpdateApp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Code <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={appFormData.code}
                  onChange={(e) => setAppFormData({ ...appFormData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., FFVV"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={appFormData.name}
                  onChange={(e) => setAppFormData({ ...appFormData, name: e.target.value })}
                  placeholder="e.g., Fuerza de Venta"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={appFormData.description}
                  onChange={(e) => setAppFormData({ ...appFormData, description: e.target.value })}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border/60 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-jpc-vibrant-cyan-500/50"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedApp(null);
                    setAppFormData({ code: '', name: '', description: '' });
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

      {/* Add Pattern Modal */}
      {showAddPatternModal && selectedApp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border border-jpc-vibrant-purple-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-2">Add Pattern</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Adding pattern to: <span className="font-semibold text-cyan-100">{selectedApp.name}</span>
            </p>
            <form onSubmit={handleAddPattern} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Pattern <span className="text-red-400">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={patternFormData.pattern}
                  onChange={(e) => setPatternFormData({ ...patternFormData, pattern: e.target.value })}
                  placeholder="e.g., Somos Belcorp"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground/60 mt-1">
                  This pattern will be matched using case-insensitive contains logic
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Priority <span className="text-red-400">*</span>
                </label>
                <Input
                  type="number"
                  required
                  min="1"
                  value={patternFormData.priority}
                  onChange={(e) => setPatternFormData({ ...patternFormData, priority: parseInt(e.target.value) })}
                  placeholder="100"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground/60 mt-1">Lower number = higher priority</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => {
                    setShowAddPatternModal(false);
                    setSelectedApp(null);
                    setPatternFormData({ pattern: '', priority: 100 });
                  }}
                  variant="outline"
                  className="flex-1 border-border/60 text-foreground hover:bg-background/80"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-jpc-vibrant-purple-500/20 text-purple-100 hover:bg-jpc-vibrant-purple-500/30 border border-jpc-vibrant-purple-500/40"
                >
                  Add Pattern
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-card border border-red-500/30 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-4">Confirm Delete</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this {deleteTarget.type === 'app' ? 'application' : 'pattern'}? This
              action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
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
