import { useState, useMemo } from 'react';
import type { MonthlyReportStatus } from '../services/monthly-report-status-registry.service';

type SortBy = 'rawStatus' | 'displayStatus' | 'created';
type StatusFilter = 'all' | 'active' | 'inactive';

export function useMonthlyReportStatusFilters(statuses: MonthlyReportStatus[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('rawStatus');

  const filteredStatuses = useMemo(() => {
    return statuses
      .filter((status) => {
        const matchesSearch =
          searchTerm === '' ||
          status.rawStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
          status.displayStatus.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' ? status.isActive : !status.isActive);

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'rawStatus':
            return a.rawStatus.localeCompare(b.rawStatus);
          case 'displayStatus':
            return a.displayStatus.localeCompare(b.displayStatus);
          case 'created':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });
  }, [statuses, searchTerm, statusFilter, sortBy]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    filteredStatuses,
  };
}
