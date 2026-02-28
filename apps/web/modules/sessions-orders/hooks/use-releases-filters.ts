import { useState, useMemo } from 'react';
import type { SessionsOrdersRelease } from '../services/sessions-orders.service';

export function useReleasesFilters(records: SessionsOrdersRelease[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [weekFilter, setWeekFilter] = useState('all');
  const [applicationFilter, setApplicationFilter] = useState('all');

  const weeks = useMemo(
    () => Array.from(new Set(records.map((r) => r.semana))).sort(),
    [records]
  );

  const applications = useMemo(
    () => Array.from(new Set(records.map((r) => r.aplicacion))).sort(),
    [records]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.semana.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.aplicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.release.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesWeek =
        weekFilter === 'all' || record.semana === weekFilter;
      const matchesApp =
        applicationFilter === 'all' || record.aplicacion === applicationFilter;

      return matchesSearch && matchesWeek && matchesApp;
    });
  }, [records, searchTerm, weekFilter, applicationFilter]);

  return {
    searchTerm,
    setSearchTerm,
    weekFilter,
    setWeekFilter,
    applicationFilter,
    setApplicationFilter,
    weeks,
    applications,
    filteredRecords,
  };
}
