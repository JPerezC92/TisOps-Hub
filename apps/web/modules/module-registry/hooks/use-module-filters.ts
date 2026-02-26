import { useState, useMemo } from 'react';
import type { Module } from '../services/module-registry.service';

type SortBy = 'sourceValue' | 'displayValue' | 'application' | 'created';
type StatusFilter = 'all' | 'active' | 'inactive';

export function useModuleFilters(modules: Module[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [applicationFilter, setApplicationFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('sourceValue');

  const filteredModules = useMemo(() => {
    return modules
      .filter((mod) => {
        const matchesSearch =
          searchTerm === '' ||
          mod.sourceValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mod.displayValue.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' ? mod.isActive : !mod.isActive);

        const matchesApplication =
          applicationFilter === 'all' || mod.application === applicationFilter;

        return matchesSearch && matchesStatus && matchesApplication;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'sourceValue':
            return a.sourceValue.localeCompare(b.sourceValue);
          case 'displayValue':
            return a.displayValue.localeCompare(b.displayValue);
          case 'application':
            return a.application.localeCompare(b.application);
          case 'created':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });
  }, [modules, searchTerm, statusFilter, applicationFilter, sortBy]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    applicationFilter,
    setApplicationFilter,
    sortBy,
    setSortBy,
    filteredModules,
  };
}
