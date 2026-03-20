'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { DateTime } from 'luxon';
import { getDefaultDateRange } from '@/modules/analytics-dashboard/utils';
import type { Application, AnalyticsFilters } from '@/modules/analytics-dashboard/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useAnalyticsFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [applications, setApplications] = useState<Application[]>([]);
  const [isMonthlyMode, setIsMonthlyMode] = useState(false);

  // Get filter values from URL parameters
  const selectedApp = searchParams.get('app') || 'all';
  const selectedMonth = searchParams.get('month') || DateTime.now().toFormat('yyyy-MM');

  // Get date range from URL or use default
  const defaultRange = getDefaultDateRange();
  const startDate = searchParams.get('startDate') || defaultRange.startDate;
  const endDate = searchParams.get('endDate') || defaultRange.endDate;

  // Parse selected month for picker
  const parts = selectedMonth.split('-').map(Number);
  const selectedYear = parts[0] ?? DateTime.now().year;
  const selectedMonthNum = parts[1] ?? DateTime.now().month;

  // Calculate last day of month for Monthly mode
  const lastDayOfMonth = DateTime.fromFormat(selectedMonth, 'yyyy-MM').endOf('month').toFormat('yyyy-MM-dd');

  // Update URL parameters
  const updateFilters = useCallback(
    (app: string, month: string, newStartDate?: string, newEndDate?: string) => {
      const params = new URLSearchParams();
      if (app !== 'all') params.set('app', app);
      if (month) params.set('month', month);

      const dateStart = newStartDate ?? searchParams.get('startDate');
      const dateEnd = newEndDate ?? searchParams.get('endDate');
      if (dateStart) params.set('startDate', dateStart);
      if (dateEnd) params.set('endDate', dateEnd);

      const queryString = params.toString();
      router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
    },
    [router, pathname, searchParams]
  );

  // Fetch applications for filter dropdown
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/application-registry`, { cache: 'no-store' });
        if (response.ok) {
          const result = await response.json();
          setApplications(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch applications:', error);
      }
    };
    fetchApplications();
  }, []);

  const filters: AnalyticsFilters = {
    selectedApp,
    selectedMonth,
    startDate,
    endDate,
    isMonthlyMode,
    lastDayOfMonth,
  };

  return {
    filters,
    applications,
    isMonthlyMode,
    setIsMonthlyMode,
    selectedYear,
    selectedMonthNum,
    updateFilters,
  };
}
