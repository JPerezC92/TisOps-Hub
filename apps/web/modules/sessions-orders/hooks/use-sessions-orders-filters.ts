import { useState, useMemo } from 'react';
import type { SessionsOrder } from '../services/sessions-orders.service';

export function useSessionsOrdersFilters(records: SessionsOrder[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');

  const years = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.ano.toString()))).sort(),
    [records]
  );

  const months = useMemo(
    () =>
      Array.from(new Set(records.map((r) => r.mes.toString()))).sort(
        (a, b) => Number(a) - Number(b)
      ),
    [records]
  );

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesSearch =
        record.ano.toString().includes(searchTerm) ||
        record.mes.toString().includes(searchTerm) ||
        record.dia.toString().includes(searchTerm);
      const matchesYear =
        yearFilter === 'all' || record.ano.toString() === yearFilter;
      const matchesMonth =
        monthFilter === 'all' || record.mes.toString() === monthFilter;

      return matchesSearch && matchesYear && matchesMonth;
    });
  }, [records, searchTerm, yearFilter, monthFilter]);

  return {
    searchTerm,
    setSearchTerm,
    yearFilter,
    setYearFilter,
    monthFilter,
    setMonthFilter,
    years,
    months,
    filteredRecords,
  };
}
