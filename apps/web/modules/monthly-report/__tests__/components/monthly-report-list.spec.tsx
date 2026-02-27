import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock, MockProxy } from 'vitest-mock-extended';
import { MonthlyReportList } from '@/modules/monthly-report/components/monthly-report-list';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { monthlyReportService } from '@/modules/monthly-report/services/monthly-report.service';
import { createMonthlyReport } from '../helpers/monthly-report.factory';

let mockedService: MockProxy<typeof monthlyReportService>;

vi.mock('@/modules/monthly-report/services/monthly-report.service', () => ({
  monthlyReportService: mock<typeof monthlyReportService>(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('MonthlyReportList', () => {
  beforeEach(() => {
    mockedService = monthlyReportService as MockProxy<typeof monthlyReportService>;
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockedService.getAll.mockReturnValue(new Promise(() => {}));

    const { container } = renderWithQueryClient(<MonthlyReportList />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should list monthly reports when data loads', async () => {
    const mockReports = [
      createMonthlyReport({ requestId: 100001, aplicativos: 'Somos Belcorp', categorizacion: 'Error por Cambio' }),
      createMonthlyReport({ requestId: 100002, aplicativos: 'FFVV', categorizacion: 'Bug' }),
      createMonthlyReport({ requestId: 100003, aplicativos: 'B2B', categorizacion: 'Mejora' }),
    ];

    mockedService.getAll.mockResolvedValue({ data: mockReports, total: 3 });

    renderWithQueryClient(<MonthlyReportList />);

    expect(await screen.findByText('100001')).toBeInTheDocument();
    expect(screen.getByText('100002')).toBeInTheDocument();
    expect(screen.getByText('100003')).toBeInTheDocument();
  });

  it('should show empty state when no reports', async () => {
    mockedService.getAll.mockResolvedValue({ data: [], total: 0 });

    renderWithQueryClient(<MonthlyReportList />);

    expect(await screen.findByText('No monthly reports found')).toBeInTheDocument();
  });

  it('should filter by search term', async () => {
    const mockReports = [
      createMonthlyReport({ requestId: 100001, aplicativos: 'Somos Belcorp', technician: 'Juan Perez' }),
      createMonthlyReport({ requestId: 100002, aplicativos: 'FFVV', technician: 'Maria Garcia' }),
      createMonthlyReport({ requestId: 100003, aplicativos: 'B2B', technician: 'Carlos Lopez' }),
    ];

    mockedService.getAll.mockResolvedValue({ data: mockReports, total: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<MonthlyReportList />);

    await screen.findByText('100001');

    const searchInput = screen.getByPlaceholderText('Request ID, Application, Technician...');
    await user.type(searchInput, 'Juan');

    await waitFor(() => {
      expect(screen.getByText('100001')).toBeInTheDocument();
      expect(screen.queryByText('100002')).not.toBeInTheDocument();
      expect(screen.queryByText('100003')).not.toBeInTheDocument();
    });
  });

  it('should show delete confirmation dialog when clear data is clicked', async () => {
    const mockReports = [
      createMonthlyReport({ requestId: 200001 }),
      createMonthlyReport({ requestId: 200002 }),
      createMonthlyReport({ requestId: 200003 }),
    ];
    mockedService.getAll.mockResolvedValue({ data: mockReports, total: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<MonthlyReportList />);

    await screen.findByText('200001');

    const clearButton = screen.getByRole('button', { name: /clear all data/i });
    await user.click(clearButton);

    expect(await screen.findByText('Delete All Monthly Reports')).toBeInTheDocument();
  });

  it('should close delete dialog when Cancel is clicked', async () => {
    const mockReports = [
      createMonthlyReport({ requestId: 300001 }),
      createMonthlyReport({ requestId: 300002 }),
      createMonthlyReport({ requestId: 300003 }),
    ];
    mockedService.getAll.mockResolvedValue({ data: mockReports, total: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<MonthlyReportList />);

    await screen.findByText('300001');

    const clearButton = screen.getByRole('button', { name: /clear all data/i });
    await user.click(clearButton);

    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Delete All Monthly Reports')).not.toBeInTheDocument();
    });
  });

  it('should call deleteAll when delete is confirmed', async () => {
    const mockReports = [
      createMonthlyReport({ requestId: 400001 }),
      createMonthlyReport({ requestId: 400002 }),
      createMonthlyReport({ requestId: 400003 }),
    ];
    mockedService.getAll.mockResolvedValue({ data: mockReports, total: 3 });
    mockedService.deleteAll.mockResolvedValue({ message: 'All deleted', deleted: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<MonthlyReportList />);

    await screen.findByText('400001');

    const clearButton = screen.getByRole('button', { name: /clear all data/i });
    await user.click(clearButton);

    const deleteButton = await screen.findByRole('button', { name: /delete all/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockedService.deleteAll).toHaveBeenCalled();
    });
  });

  it('should display stats grid', async () => {
    const mockReports = [
      createMonthlyReport({ priority: 'High', categorizacion: 'Error por Cambio' }),
      createMonthlyReport({ priority: 'Low', categorizacion: 'Bug' }),
      createMonthlyReport({ priority: 'High', categorizacion: 'Error por Cambio' }),
    ];

    mockedService.getAll.mockResolvedValue({ data: mockReports, total: 3 });

    renderWithQueryClient(<MonthlyReportList />);

    await screen.findByText(String(mockReports[0]!.requestId));

    expect(screen.getByText('TOTAL RECORDS')).toBeInTheDocument();
    expect(screen.getByText('ALTA PRIORITY')).toBeInTheDocument();
    expect(screen.getByText('TOP CATEGORIZATION')).toBeInTheDocument();
    expect(screen.getByText('UNIQUE CATEGORIES')).toBeInTheDocument();
  });
});
