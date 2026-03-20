import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe('analyticsDashboardService', () => {
  describe('getWarRooms', () => {
    it('should fetch war rooms with app and month params', async () => {
      const warRooms = [{ requestId: 1, summary: 'Test war room' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: { data: warRooms } }),
      });

      const result = await analyticsDashboardService.getWarRooms('CD', '2025-01');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/war-rooms/analytics?app=CD&month=2025-01'),
        expect.objectContaining({ cache: 'no-store' }),
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ requestId: 1 });
    });

    it('should omit app param when "all"', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: { data: [] } }),
      });

      await analyticsDashboardService.getWarRooms('all', '2025-01');

      const url = mockFetch.mock.calls[0]?.[0] as string;
      expect(url).not.toContain('app=');
      expect(url).toContain('month=2025-01');
    });

    it('should return empty array on fetch error', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await analyticsDashboardService.getWarRooms('all', '2025-01');
      expect(result).toEqual([]);
    });

    it('should return empty array when response is not ok', async () => {
      mockFetch.mockResolvedValue({ ok: false });

      const result = await analyticsDashboardService.getWarRooms('all', '2025-01');
      expect(result).toEqual([]);
    });
  });

  describe('getCriticalIncidents', () => {
    it('should fetch critical incidents and unwrap JSend', async () => {
      const incidents = [{ requestId: 100, priority: 'Critical' }];
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: incidents }),
      });

      const result = await analyticsDashboardService.getCriticalIncidents('CD', '2025-01');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/monthly-report/analytics?app=CD&month=2025-01'),
        expect.objectContaining({ cache: 'no-store' }),
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({ requestId: 100 });
    });

    it('should return empty array on error', async () => {
      mockFetch.mockRejectedValue(new Error('fail'));
      const result = await analyticsDashboardService.getCriticalIncidents('all', '2025-01');
      expect(result).toEqual([]);
    });
  });

  describe('getStabilityIndicators', () => {
    it('should fetch and return stability data', async () => {
      const data = { data: [{ application: 'CD', l2Count: 5 }], hasUnmappedStatuses: false };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data }),
      });

      const result = await analyticsDashboardService.getStabilityIndicators('CD', '2025-01');

      expect(result).toMatchObject({ hasUnmappedStatuses: false });
      expect(result?.data).toHaveLength(1);
    });

    it('should return null on error', async () => {
      mockFetch.mockRejectedValue(new Error('fail'));
      const result = await analyticsDashboardService.getStabilityIndicators('all', '2025-01');
      expect(result).toBeNull();
    });
  });

  describe('getModuleEvolution', () => {
    it('should include startDate and endDate params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: { data: [], total: 0 } }),
      });

      await analyticsDashboardService.getModuleEvolution('CD', '2025-01-10', '2025-01-16');

      const url = mockFetch.mock.calls[0]?.[0] as string;
      expect(url).toContain('startDate=2025-01-10');
      expect(url).toContain('endDate=2025-01-16');
      expect(url).toContain('app=CD');
    });
  });

  describe('getModuleEvolutionMonthly', () => {
    it('should only include endDate param', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: { data: [], total: 0 } }),
      });

      await analyticsDashboardService.getModuleEvolutionMonthly('all', '2025-01-31');

      const url = mockFetch.mock.calls[0]?.[0] as string;
      expect(url).toContain('endDate=2025-01-31');
      expect(url).not.toContain('startDate=');
      expect(url).not.toContain('app=');
    });
  });

  describe('getL3TicketsByStatus', () => {
    it('should not include month param', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: { data: [], statusColumns: [] } }),
      });

      await analyticsDashboardService.getL3TicketsByStatus('CD');

      const url = mockFetch.mock.calls[0]?.[0] as string;
      expect(url).toContain('app=CD');
      expect(url).not.toContain('month=');
    });
  });

  describe('getIncidentsByWeek', () => {
    it('should include year param', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: { data: [], year: 2025 } }),
      });

      await analyticsDashboardService.getIncidentsByWeek('all', 2025);

      const url = mockFetch.mock.calls[0]?.[0] as string;
      expect(url).toContain('year=2025');
    });
  });

  describe('getSessionsOrdersLast30Days', () => {
    it('should fetch without params', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: { data: [] } }),
      });

      await analyticsDashboardService.getSessionsOrdersLast30Days();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/sessions-orders/last-30-days'),
        expect.objectContaining({ cache: 'no-store' }),
      );
    });
  });

  describe('getIncidentsVsOrdersByMonth', () => {
    it('should include year param', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'success', data: { data: [] } }),
      });

      await analyticsDashboardService.getIncidentsVsOrdersByMonth(2025);

      const url = mockFetch.mock.calls[0]?.[0] as string;
      expect(url).toContain('year=2025');
    });
  });
});
