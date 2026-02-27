import { useState, useMemo } from 'react';
import type { WeeklyCorrective } from '../services/weekly-corrective.service';

export function useWeeklyCorrectiveFilters(records: WeeklyCorrective[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const priorities = useMemo(
    () => Array.from(new Set(records.map((r) => r.priority))).sort(),
    [records]
  );

  const statuses = useMemo(
    () => Array.from(new Set(records.map((r) => r.requestStatus))).sort(),
    [records]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.aplicativos.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority =
        priorityFilter === 'all' || record.priority === priorityFilter;
      const matchesStatus =
        statusFilter === 'all' || record.requestStatus === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [records, searchTerm, priorityFilter, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    priorities,
    statuses,
    filteredRecords,
  };
}
