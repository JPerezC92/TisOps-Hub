import { useState, useMemo } from 'react';
import type { MonthlyReport } from '../services/monthly-report.service';

export function useMonthlyReportFilters(records: MonthlyReport[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categorizationFilter, setCategorizationFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const categorizations = useMemo(
    () => Array.from(new Set(records.map((r) => r.categorizacion))).sort(),
    [records]
  );

  const priorities = useMemo(
    () => Array.from(new Set(records.map((r) => r.priority))).sort(),
    [records]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.requestId.toString().includes(searchTerm) ||
        record.aplicativos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategorization =
        categorizationFilter === 'all' || record.categorizacion === categorizationFilter;
      const matchesPriority =
        priorityFilter === 'all' || record.priority === priorityFilter;

      return matchesSearch && matchesCategorization && matchesPriority;
    });
  }, [records, searchTerm, categorizationFilter, priorityFilter]);

  return {
    searchTerm,
    setSearchTerm,
    categorizationFilter,
    setCategorizationFilter,
    priorityFilter,
    setPriorityFilter,
    categorizations,
    priorities,
    filteredRecords,
  };
}
