'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Rep01Tag } from '@repo/reports';

export default function Rep01TagsPage() {
  const [tags, setTags] = useState<Rep01Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterCategorizacion, setFilterCategorizacion] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('http://localhost:3000/rep01-tags', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setTags(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch REP01 tags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  // Get unique modules and categorizations for filters
  const modules = ['all', ...Array.from(new Set(tags.map(t => t.modulo)))];
  const categorizaciones = ['all', ...Array.from(new Set(tags.map(t => t.categorizacion)))];

  // Filter tags
  const filteredTags = tags.filter(tag => {
    const matchesSearch = 
      tag.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.modulo.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = filterModule === 'all' || tag.modulo === filterModule;
    const matchesCategorizacion = filterCategorizacion === 'all' || tag.categorizacion === filterCategorizacion;

    return matchesSearch && matchesModule && matchesCategorizacion;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTags.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTags = filteredTags.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterModule, filterCategorizacion]);

  // Statistics
  const totalTags = tags.length;
  const categorizedCount = tags.filter(t => t.categorizacion !== 'No asignado').length;
  const withJiraCount = tags.filter(t => t.jira !== 'No asignado').length;
  const linkedCount = tags.filter(t => t.linkedRequestId !== 'No asignado').length;

  return (
    <div className="min-h-screen bg-jpc-bg-900 relative overflow-hidden">
      {/* Background layers */}
      <div className="fixed inset-0 bg-linear-to-br from-jpc-bg-900 via-jpc-bg-500 to-jpc-bg-900 -z-10"></div>
      <div className="fixed inset-0 backdrop-blur-sm bg-jpc-900/10 -z-10"></div>
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-jpc-gold-500">
              🏷️ REP01 Tags
            </h1>
            <p className="text-jpc-gold-500/70 mt-2">
              View and manage REP01 XD TAG 2025 import data
            </p>
          </div>
          <Link
            href="/imports"
            className="px-4 py-2 bg-jpc-400/20 hover:bg-jpc-400/30 border border-jpc-400/50 rounded-lg text-jpc-gold-500 transition-colors"
          >
            ← Back to Imports
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-jpc-purple-500/10 border border-jpc-purple-500/50 rounded-xl p-6 shadow-[0_0_9px_2px] shadow-jpc-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider">Total Tags</p>
                <p className="text-4xl font-bold text-jpc-purple-500">{totalTags}</p>
              </div>
              <svg className="h-10 w-10 text-jpc-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>

          <div className="bg-jpc-400/10 border border-jpc-400/50 rounded-xl p-6 shadow-[0_0_9px_2px] shadow-jpc-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider">Categorized</p>
                <p className="text-4xl font-bold text-jpc-400">
                  {categorizedCount}
                  <span className="text-sm ml-2 text-jpc-gold-500/70">
                    ({totalTags > 0 ? Math.round((categorizedCount / totalTags) * 100) : 0}%)
                  </span>
                </p>
              </div>
              <svg className="h-10 w-10 text-jpc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>

          <div className="bg-jpc-orange-500/10 border border-jpc-orange-500/50 rounded-xl p-6 shadow-[0_0_9px_2px] shadow-jpc-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider">With Jira</p>
                <p className="text-4xl font-bold text-jpc-orange-500">
                  {withJiraCount}
                  <span className="text-sm ml-2 text-jpc-gold-500/70">
                    ({totalTags > 0 ? Math.round((withJiraCount / totalTags) * 100) : 0}%)
                  </span>
                </p>
              </div>
              <svg className="h-10 w-10 text-jpc-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>

          <div className="bg-jpc-400/10 border border-jpc-400/50 rounded-xl p-6 shadow-[0_0_9px_2px] shadow-jpc-400/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-jpc-gold-500/70 uppercase tracking-wider">Linked</p>
                <p className="text-4xl font-bold text-jpc-400">
                  {linkedCount}
                  <span className="text-sm ml-2 text-jpc-gold-500/70">
                    ({totalTags > 0 ? Math.round((linkedCount / totalTags) * 100) : 0}%)
                  </span>
                </p>
              </div>
              <svg className="h-10 w-10 text-jpc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-jpc-400/10 border border-jpc-400/30 rounded-xl p-6 mb-8 shadow-[0_0_9px_2px] shadow-jpc-400/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-jpc-gold-500 mb-2">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Request ID, Technician, Module..."
                className="w-full px-4 py-2 bg-jpc-bg-900 border border-jpc-400/30 rounded-lg text-jpc-gold-500 placeholder-jpc-gold-500/40 focus:outline-none focus:border-jpc-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-jpc-gold-500 mb-2">
                Module
              </label>
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                className="w-full px-4 py-2 bg-jpc-bg-900 border border-jpc-400/30 rounded-lg text-jpc-gold-500 focus:outline-none focus:border-jpc-400"
              >
                {modules.map(module => (
                  <option key={module} value={module}>
                    {module === 'all' ? 'All Modules' : module}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-jpc-gold-500 mb-2">
                Categorization
              </label>
              <select
                value={filterCategorizacion}
                onChange={(e) => setFilterCategorizacion(e.target.value)}
                className="w-full px-4 py-2 bg-jpc-bg-900 border border-jpc-400/30 rounded-lg text-jpc-gold-500 focus:outline-none focus:border-jpc-400"
              >
                {categorizaciones.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-jpc-gold-500/70">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredTags.length)} of {filteredTags.length} filtered records ({totalTags} total)
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-jpc-gold-500/70">Per page:</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-jpc-bg-900 border border-jpc-400/30 rounded text-jpc-gold-500 text-sm focus:outline-none focus:border-jpc-400"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-jpc-400/10 border border-jpc-400/30 rounded-xl shadow-[0_0_9px_2px] shadow-jpc-400/30 overflow-hidden">
          <div className="px-6 py-4 border-b border-jpc-400/30">
            <h2 className="text-lg font-semibold text-jpc-gold-500">
              Tag Records
            </h2>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-jpc-400 mx-auto mb-4"></div>
                <p className="text-jpc-gold-500/70">Loading tags...</p>
              </div>
            ) : filteredTags.length === 0 ? (
              <div className="text-center py-12 text-jpc-gold-500/70">
                <p className="text-lg font-medium mb-2">No tags found</p>
                <p className="text-sm">Try adjusting your filters or upload a file</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-jpc-400/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-jpc-gold-500 uppercase tracking-wider">
                      Request ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-jpc-gold-500 uppercase tracking-wider">
                      Created Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-jpc-gold-500 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-jpc-gold-500 uppercase tracking-wider">
                      Categorization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-jpc-gold-500 uppercase tracking-wider">
                      Technician
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-jpc-gold-500 uppercase tracking-wider">
                      Jira
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-jpc-gold-500 uppercase tracking-wider">
                      Linked Request
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-jpc-400/20">
                  {paginatedTags.map((tag) => (
                    <tr key={tag.requestId} className="hover:bg-jpc-400/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-jpc-gold-500">
                        {tag.requestId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-jpc-gold-500/70">
                        {tag.createdTime}
                      </td>
                      <td className="px-6 py-4 text-sm text-jpc-gold-500/70">
                        <div className="max-w-xs truncate" title={tag.modulo}>
                          {tag.modulo}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          tag.categorizacion === 'No asignado'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-jpc-purple-500/20 text-jpc-purple-500 border border-jpc-purple-500/50'
                        }`}>
                          {tag.categorizacion}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-jpc-gold-500/70">
                        <div className="max-w-xs truncate" title={tag.technician}>
                          {tag.technician}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          tag.jira === 'No asignado'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-jpc-orange-500/20 text-jpc-orange-500 border border-jpc-orange-500/50'
                        }`}>
                          {tag.jira}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-jpc-gold-500/70">
                        {tag.linkedRequestId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {!loading && filteredTags.length > 0 && (
            <div className="px-6 py-4 border-t border-jpc-400/30">
              <div className="flex items-center justify-between">
                <div className="text-sm text-jpc-gold-500/70">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-jpc-400/10 text-jpc-gold-500/40 cursor-not-allowed'
                        : 'bg-jpc-400/20 text-jpc-gold-500 hover:bg-jpc-400/30'
                    }`}
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? 'bg-jpc-400/10 text-jpc-gold-500/40 cursor-not-allowed'
                        : 'bg-jpc-400/20 text-jpc-gold-500 hover:bg-jpc-400/30'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-md text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-jpc-purple-500 text-white'
                              : 'bg-jpc-400/20 text-jpc-gold-500 hover:bg-jpc-400/30'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-jpc-400/10 text-jpc-gold-500/40 cursor-not-allowed'
                        : 'bg-jpc-400/20 text-jpc-gold-500 hover:bg-jpc-400/30'
                    }`}
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'bg-jpc-400/10 text-jpc-gold-500/40 cursor-not-allowed'
                        : 'bg-jpc-400/20 text-jpc-gold-500 hover:bg-jpc-400/30'
                    }`}
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
