import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock, MockProxy } from 'vitest-mock-extended';
import { SessionsOrdersList } from '@/modules/sessions-orders/components/sessions-orders-list';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { sessionsOrdersService } from '@/modules/sessions-orders/services/sessions-orders.service';
import { createSessionsOrder, createRelease } from '../helpers/sessions-orders.factory';

let mockedService: MockProxy<typeof sessionsOrdersService>;

vi.mock('@/modules/sessions-orders/services/sessions-orders.service', () => ({
  sessionsOrdersService: mock<typeof sessionsOrdersService>(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SessionsOrdersList', () => {
  beforeEach(() => {
    mockedService = sessionsOrdersService as MockProxy<typeof sessionsOrdersService>;
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockedService.getAll.mockReturnValue(new Promise(() => {}));

    const { container } = renderWithQueryClient(<SessionsOrdersList />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should list sessions orders when data loads', async () => {
    const mockData = [
      createSessionsOrder({ ano: 2025, mes: 6, dia: 1719792000000, incidentes: 15 }),
      createSessionsOrder({ ano: 2025, mes: 7, dia: 1722470400000, incidentes: 20 }),
      createSessionsOrder({ ano: 2024, mes: 12, dia: 1701388800000, incidentes: 5 }),
    ];

    mockedService.getAll.mockResolvedValue({
      data: mockData,
      releases: [],
      total: 3,
      totalReleases: 0,
    });

    renderWithQueryClient(<SessionsOrdersList />);

    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
    });
  });

  it('should show empty state when no sessions orders', async () => {
    mockedService.getAll.mockResolvedValue({
      data: [],
      releases: [],
      total: 0,
      totalReleases: 0,
    });

    renderWithQueryClient(<SessionsOrdersList />);

    expect(await screen.findByText('No sessions & orders found')).toBeInTheDocument();
  });

  it('should filter by search term', async () => {
    const mockData = [
      createSessionsOrder({ ano: 2025, mes: 6, dia: 15, incidentes: 10 }),
      createSessionsOrder({ ano: 2024, mes: 3, dia: 20, incidentes: 25 }),
    ];

    mockedService.getAll.mockResolvedValue({
      data: mockData,
      releases: [],
      total: 2,
      totalReleases: 0,
    });

    const user = userEvent.setup();
    renderWithQueryClient(<SessionsOrdersList />);

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Year, Month, Day...');
    await user.type(searchInput, '2024');

    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.queryByText('10')).not.toBeInTheDocument();
    });
  });

  it('should show delete confirmation dialog when clear data is clicked', async () => {
    const mockData = [
      createSessionsOrder({ incidentes: 100 }),
      createSessionsOrder({ incidentes: 200 }),
      createSessionsOrder({ incidentes: 300 }),
    ];

    mockedService.getAll.mockResolvedValue({
      data: mockData,
      releases: [],
      total: 3,
      totalReleases: 0,
    });

    const user = userEvent.setup();
    renderWithQueryClient(<SessionsOrdersList />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    const clearButton = screen.getByRole('button', { name: /clear all data/i });
    await user.click(clearButton);

    expect(await screen.findByText('Delete All Sessions & Orders Records')).toBeInTheDocument();
  });

  it('should close delete dialog when Cancel is clicked', async () => {
    const mockData = [
      createSessionsOrder({ incidentes: 111 }),
      createSessionsOrder({ incidentes: 222 }),
      createSessionsOrder({ incidentes: 333 }),
    ];

    mockedService.getAll.mockResolvedValue({
      data: mockData,
      releases: [],
      total: 3,
      totalReleases: 0,
    });

    const user = userEvent.setup();
    renderWithQueryClient(<SessionsOrdersList />);

    await waitFor(() => {
      expect(screen.getByText('111')).toBeInTheDocument();
    });

    const clearButton = screen.getByRole('button', { name: /clear all data/i });
    await user.click(clearButton);

    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Delete All Sessions & Orders Records')).not.toBeInTheDocument();
    });
  });

  it('should call deleteAll when delete is confirmed', async () => {
    const mockData = [
      createSessionsOrder({ incidentes: 444 }),
      createSessionsOrder({ incidentes: 555 }),
      createSessionsOrder({ incidentes: 666 }),
    ];

    mockedService.getAll.mockResolvedValue({
      data: mockData,
      releases: [],
      total: 3,
      totalReleases: 0,
    });
    mockedService.deleteAll.mockResolvedValue({ message: 'All deleted', deletedMain: 3, deletedReleases: 0 });

    const user = userEvent.setup();
    renderWithQueryClient(<SessionsOrdersList />);

    await waitFor(() => {
      expect(screen.getByText('444')).toBeInTheDocument();
    });

    const clearButton = screen.getByRole('button', { name: /clear all data/i });
    await user.click(clearButton);

    const deleteButton = await screen.findByRole('button', { name: /delete all/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockedService.deleteAll).toHaveBeenCalled();
    });
  });

  it('should display stats grid', async () => {
    const mockData = [
      createSessionsOrder({ incidentes: 10, placedOrders: 100, billedOrders: 90 }),
      createSessionsOrder({ incidentes: 20, placedOrders: 200, billedOrders: 180 }),
      createSessionsOrder({ incidentes: 30, placedOrders: 300, billedOrders: 270 }),
    ];

    mockedService.getAll.mockResolvedValue({
      data: mockData,
      releases: [],
      total: 3,
      totalReleases: 0,
    });

    renderWithQueryClient(<SessionsOrdersList />);

    await waitFor(() => {
      expect(screen.getByText('TOTAL RECORDS')).toBeInTheDocument();
      expect(screen.getByText('TOTAL INCIDENTS')).toBeInTheDocument();
      expect(screen.getByText('TOTAL PLACED ORDERS')).toBeInTheDocument();
      expect(screen.getByText('TOTAL BILLED ORDERS')).toBeInTheDocument();
    });
  });
});
