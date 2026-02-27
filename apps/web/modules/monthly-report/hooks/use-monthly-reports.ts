import { useQuery } from '@tanstack/react-query';
import { monthlyReportService } from '../services/monthly-report.service';
import { monthlyReportKeys } from '../keys';

export function useMonthlyReports() {
  return useQuery({
    queryKey: monthlyReportKeys.all,
    queryFn: monthlyReportService.getAll,
  });
}
