import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock, MockProxy } from 'vitest-mock-extended';
import { WeeklyCorrectiveList } from '@/modules/weekly-corrective/components/weekly-corrective-list';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { weeklyCorrectiveService } from '@/modules/weekly-corrective/services/weekly-corrective.service';
import { WeeklyCorrectiveFactory } from '../helpers/weekly-corrective.factory';

let mockedService: MockProxy<typeof weeklyCorrectiveService>;

vi.mock('@/modules/weekly-corrective/services/weekly-corrective.service', () => ({
  weeklyCorrectiveService: mock<typeof weeklyCorrectiveService>(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('WeeklyCorrectiveList', () => {
  beforeEach(() => {
    mockedService = weeklyCorrectiveService as MockProxy<typeof weeklyCorrectiveService>;
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockedService.getAll.mockReturnValue(new Promise(() => {}));

    const { container } = renderWithQueryClient(<WeeklyCorrectiveList />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should list weekly correctives when data loads', async () => {
    const mockRecords = [
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-10001', technician: 'Juan Perez', aplicativos: 'CD' }),
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-10002', technician: 'Maria Garcia', aplicativos: 'FFVV' }),
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-10003', technician: 'Carlos Lopez', aplicativos: 'SB' }),
    ];

    mockedService.getAll.mockResolvedValue({ data: mockRecords, total: 3 });

    renderWithQueryClient(<WeeklyCorrectiveList />);

    expect(await screen.findByText('REQ-10001')).toBeInTheDocument();
    expect(screen.getByText('REQ-10002')).toBeInTheDocument();
    expect(screen.getByText('REQ-10003')).toBeInTheDocument();
    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
    expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
  });

  it('should show empty state when no records', async () => {
    mockedService.getAll.mockResolvedValue({ data: [], total: 0 });

    renderWithQueryClient(<WeeklyCorrectiveList />);

    expect(await screen.findByText('No weekly correctives found')).toBeInTheDocument();
  });

  it('should filter by search term', async () => {
    const mockRecords = [
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-10001', technician: 'Juan Perez', aplicativos: 'CD' }),
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-10002', technician: 'Maria Garcia', aplicativos: 'FFVV' }),
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-10003', technician: 'Carlos Lopez', aplicativos: 'SB' }),
    ];

    mockedService.getAll.mockResolvedValue({ data: mockRecords, total: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<WeeklyCorrectiveList />);

    await screen.findByText('REQ-10001');

    const searchInput = screen.getByPlaceholderText('Request ID, Technician, Application...');
    await user.type(searchInput, 'Juan');

    await waitFor(() => {
      expect(screen.getByText('REQ-10001')).toBeInTheDocument();
      expect(screen.queryByText('REQ-10002')).not.toBeInTheDocument();
      expect(screen.queryByText('REQ-10003')).not.toBeInTheDocument();
    });
  });

  it('should show delete confirmation dialog when clear data is clicked', async () => {
    const mockRecords = [
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-20001' }),
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-20002' }),
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-20003' }),
    ];
    mockedService.getAll.mockResolvedValue({ data: mockRecords, total: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<WeeklyCorrectiveList />);

    await screen.findByText('REQ-20001');

    const clearButton = screen.getByRole('button', { name: /clear all data/i });
    await user.click(clearButton);

    expect(await screen.findByText('Delete All Weekly Corrective Records')).toBeInTheDocument();
  });

  it('should close delete dialog when Cancel is clicked', async () => {
    const mockRecords = [
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-30001' }),
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-30002' }),
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-30003' }),
    ];
    mockedService.getAll.mockResolvedValue({ data: mockRecords, total: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<WeeklyCorrectiveList />);

    await screen.findByText('REQ-30001');

    const clearButton = screen.getByRole('button', { name: /clear all data/i });
    await user.click(clearButton);

    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Delete All Weekly Corrective Records')).not.toBeInTheDocument();
    });
  });

  it('should call deleteAll when delete is confirmed', async () => {
    const mockRecords = [
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-40001' }),
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-40002' }),
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-40003' }),
    ];
    mockedService.getAll.mockResolvedValue({ data: mockRecords, total: 3 });
    mockedService.deleteAll.mockResolvedValue({ message: 'All deleted', deleted: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<WeeklyCorrectiveList />);

    await screen.findByText('REQ-40001');

    const clearButton = screen.getByRole('button', { name: /clear all data/i });
    await user.click(clearButton);

    const deleteButton = await screen.findByRole('button', { name: /delete all/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockedService.deleteAll).toHaveBeenCalled();
    });
  });

  it('should display stats grid', async () => {
    const mockRecords = [
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-50001', priority: 'Alta', requestStatus: 'En Pruebas' }),
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-50002', priority: 'Media', requestStatus: 'Cerrado' }),
      WeeklyCorrectiveFactory.createRecord({ requestId: 'REQ-50003', priority: 'Alta', requestStatus: 'En Pruebas' }),
    ];

    mockedService.getAll.mockResolvedValue({ data: mockRecords, total: 3 });

    renderWithQueryClient(<WeeklyCorrectiveList />);

    await screen.findByText('REQ-50001');

    expect(screen.getByText('Total Records')).toBeInTheDocument();
    expect(screen.getByText('Top Priority')).toBeInTheDocument();
    expect(screen.getByText('Top Status')).toBeInTheDocument();
    expect(screen.getByText('Unique Statuses')).toBeInTheDocument();
  });
});
