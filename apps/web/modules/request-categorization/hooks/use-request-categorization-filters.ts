import { useState, useMemo } from 'react';
import type { RequestCategorizationWithInfo } from '../services/request-categorization.service';

export function useRequestCategorizationFilters(records: RequestCategorizationWithInfo[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const categories = useMemo(
    () => [...new Set(records.map((r) => r.category))].sort(),
    [records],
  );

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        record.requestId.toLowerCase().includes(searchLower) ||
        record.technician.toLowerCase().includes(searchLower) ||
        record.modulo.toLowerCase().includes(searchLower) ||
        record.subject.toLowerCase().includes(searchLower) ||
        record.linkedRequestId.toLowerCase().includes(searchLower);
      const matchesCategory =
        categoryFilter === 'all' || record.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [records, searchTerm, categoryFilter]);

  return {
    searchTerm,
    setSearchTerm,
    categoryFilter,
    setCategoryFilter,
    categories,
    filteredRecords,
  };
}
