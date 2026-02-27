import { useState, useMemo } from 'react';
import type { WarRoom } from '../services/war-rooms.service';

export function useWarRoomsFilters(records: WarRoom[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [applicationFilter, setApplicationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const applications = useMemo(
    () => Array.from(new Set(records.map((r) => r.application))).sort(),
    [records]
  );

  const statuses = useMemo(
    () => Array.from(new Set(records.map((r) => r.status))).sort(),
    [records]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.requestId.toString().includes(searchTerm.toLowerCase()) ||
        record.application.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.summary.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesApplication =
        applicationFilter === 'all' || record.application === applicationFilter;
      const matchesStatus =
        statusFilter === 'all' || record.status === statusFilter;

      return matchesSearch && matchesApplication && matchesStatus;
    });
  }, [records, searchTerm, applicationFilter, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    applicationFilter,
    setApplicationFilter,
    statusFilter,
    setStatusFilter,
    applications,
    statuses,
    filteredRecords,
  };
}
