import { useState, useMemo } from 'react';
import type { AppRegistryWithPatterns } from '../services/application-registry.service';

type SortBy = 'name' | 'code' | 'created' | 'patterns';

export function useApplicationFilters(applications: AppRegistryWithPatterns[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');

  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          searchTerm === '' ||
          app.name.toLowerCase().includes(searchLower) ||
          app.code.toLowerCase().includes(searchLower);
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' ? app.isActive : !app.isActive);
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
  }, [applications, searchTerm, statusFilter, sortBy]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filteredApplications,
  };
}
