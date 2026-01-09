import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { mock, MockProxy } from 'vitest-mock-extended';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { ErrorLogsStats } from '../../components/error-logs-stats';
import { errorLogsService } from '../../services/error-logs.service';
import { ErrorLogFactory } from '../helpers/error-log.factory';

// Mock service
vi.mock('../../services/error-logs.service', () => ({
  errorLogsService: mock<typeof errorLogsService>(),
}));

describe('ErrorLogsStats', () => {
  let mockedService: MockProxy<typeof errorLogsService>;

  beforeEach(() => {
    mockedService = errorLogsService as MockProxy<typeof errorLogsService>;
    vi.clearAllMocks();
  });

  it('should display total errors count', async () => {
    // Use old timestamps to avoid counting in "last 24h"
    const oldTimestamp = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const mockErrorLogs = ErrorLogFactory.createMany(10, {
      errorType: 'ValidationError', // Not DatabaseError
      timestamp: oldTimestamp,
    });
    mockedService.getAll.mockResolvedValue({ logs: mockErrorLogs, total: mockErrorLogs.length });

    renderWithQueryClient(<ErrorLogsStats />);

    await waitFor(() => {
      expect(screen.getByText('TOTAL ERRORS')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  it('should display database errors count', async () => {
    // Use old timestamps to avoid counting in "last 24h"
    const oldTimestamp = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const mockErrorLogs = [
      ErrorLogFactory.create({ errorType: 'DatabaseError', timestamp: oldTimestamp }),
      ErrorLogFactory.create({ errorType: 'DatabaseError', timestamp: oldTimestamp }),
      ErrorLogFactory.create({ errorType: 'ValidationError', timestamp: oldTimestamp }),
    ];
    mockedService.getAll.mockResolvedValue({ logs: mockErrorLogs, total: mockErrorLogs.length });

    renderWithQueryClient(<ErrorLogsStats />);

    await waitFor(() => {
      expect(screen.getByText('DATABASE ERRORS')).toBeInTheDocument();
    });
    // Total: 3, Database: 2, Last 24H: 0
    // Check database count specifically
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // Total
      expect(screen.getByText('2')).toBeInTheDocument(); // Database
    });
  });

  it('should display last 24h errors count', async () => {
    const recentTimestamp = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago
    const oldTimestamp = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(); // 48 hours ago

    const mockErrorLogs = [
      ErrorLogFactory.create({ errorType: 'ValidationError', timestamp: recentTimestamp }),
      ErrorLogFactory.create({ errorType: 'ValidationError', timestamp: oldTimestamp }),
    ];
    mockedService.getAll.mockResolvedValue({ logs: mockErrorLogs, total: mockErrorLogs.length });

    renderWithQueryClient(<ErrorLogsStats />);

    // Total: 2, Database: 0, Last 24H: 1
    await waitFor(() => {
      expect(screen.getByText('LAST 24H')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument(); // Total
      expect(screen.getByText('1')).toBeInTheDocument(); // Last 24H
    });
  });

  it('should display zero counts when no errors', async () => {
    mockedService.getAll.mockResolvedValue({ logs: [], total: 0 });

    renderWithQueryClient(<ErrorLogsStats />);

    await waitFor(() => {
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBe(3); // TOTAL, DATABASE, LAST 24H
    });
  });

  it('should have refresh button', async () => {
    mockedService.getAll.mockResolvedValue({ logs: [], total: 0 });

    renderWithQueryClient(<ErrorLogsStats />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });
  });
});
