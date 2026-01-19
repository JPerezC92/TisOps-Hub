import { useState, useMemo } from 'react';
import type { Categorization } from '../services/categorization-registry.service';

type SortBy = 'sourceValue' | 'displayValue' | 'created';
type StatusFilter = 'all' | 'active' | 'inactive';

export function useCategorizationsFilters(categorizations: Categorization[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('sourceValue');

  const filteredCategorizations = useMemo(() => {
    return categorizations
      .filter((cat) => {
        const matchesSearch =
          searchTerm === '' ||
          cat.sourceValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cat.displayValue.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' ? cat.isActive : !cat.isActive);

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
  }, [categorizations, searchTerm, statusFilter, sortBy]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filteredCategorizations,
  };
}
