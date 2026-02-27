import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock, MockProxy } from 'vitest-mock-extended';
import { WarRoomsList } from '@/modules/war-rooms/components/war-rooms-list';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { warRoomsService } from '@/modules/war-rooms/services/war-rooms.service';
import { createWarRoom } from '../helpers/war-rooms.factory';

let mockedService: MockProxy<typeof warRoomsService>;

vi.mock('@/modules/war-rooms/services/war-rooms.service', () => ({
  warRoomsService: mock<typeof warRoomsService>(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('WarRoomsList', () => {
  beforeEach(() => {
    mockedService = warRoomsService as MockProxy<typeof warRoomsService>;
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockedService.getAll.mockReturnValue(new Promise(() => {}));

    const { container } = renderWithQueryClient(<WarRoomsList />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should list war rooms when data loads', async () => {
    const mockWarRooms = [
      createWarRoom({ requestId: 100001, application: 'FFVV', summary: 'Critical outage' }),
      createWarRoom({ requestId: 100002, application: 'B2B', summary: 'Performance issue' }),
      createWarRoom({ requestId: 100003, application: 'SB', summary: 'Login failure' }),
    ];

    mockedService.getAll.mockResolvedValue({ data: mockWarRooms, total: 3 });

    renderWithQueryClient(<WarRoomsList />);

    expect(await screen.findByText('Critical outage')).toBeInTheDocument();
    expect(screen.getByText('Performance issue')).toBeInTheDocument();
    expect(screen.getByText('Login failure')).toBeInTheDocument();
  });

  it('should show empty state when no war rooms', async () => {
    mockedService.getAll.mockResolvedValue({ data: [], total: 0 });

    renderWithQueryClient(<WarRoomsList />);

    expect(await screen.findByText('No war rooms found')).toBeInTheDocument();
  });

  it('should filter by search term', async () => {
    const mockWarRooms = [
      createWarRoom({ requestId: 100001, application: 'FFVV', summary: 'Critical outage in FFVV' }),
      createWarRoom({ requestId: 100002, application: 'B2B', summary: 'Performance issue in B2B' }),
      createWarRoom({ requestId: 100003, application: 'SB', summary: 'Login failure in SB' }),
    ];

    mockedService.getAll.mockResolvedValue({ data: mockWarRooms, total: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<WarRoomsList />);

    await screen.findByText('Critical outage in FFVV');

    const searchInput = screen.getByPlaceholderText('Request ID, Application, Summary...');
    await user.type(searchInput, 'FFVV');

    await waitFor(() => {
      expect(screen.getByText('Critical outage in FFVV')).toBeInTheDocument();
      expect(screen.queryByText('Performance issue in B2B')).not.toBeInTheDocument();
      expect(screen.queryByText('Login failure in SB')).not.toBeInTheDocument();
    });
  });

  it('should show delete confirmation dialog when clear data is clicked', async () => {
    const mockWarRooms = [
      createWarRoom({ requestId: 200001, summary: 'WR delete test 1' }),
      createWarRoom({ requestId: 200002, summary: 'WR delete test 2' }),
      createWarRoom({ requestId: 200003, summary: 'WR delete test 3' }),
    ];
    mockedService.getAll.mockResolvedValue({ data: mockWarRooms, total: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<WarRoomsList />);

    await screen.findByText('WR delete test 1');

    const clearButton = screen.getByRole('button', { name: /clear all data/i });
    await user.click(clearButton);

    expect(await screen.findByText('Delete All War Room Records')).toBeInTheDocument();
  });

  it('should close delete dialog when Cancel is clicked', async () => {
    const mockWarRooms = [
      createWarRoom({ requestId: 300001, summary: 'WR cancel test 1' }),
      createWarRoom({ requestId: 300002, summary: 'WR cancel test 2' }),
      createWarRoom({ requestId: 300003, summary: 'WR cancel test 3' }),
    ];
    mockedService.getAll.mockResolvedValue({ data: mockWarRooms, total: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<WarRoomsList />);

    await screen.findByText('WR cancel test 1');

    const clearButton = screen.getByRole('button', { name: /clear all data/i });
    await user.click(clearButton);

    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Delete All War Room Records')).not.toBeInTheDocument();
    });
  });

  it('should call deleteAll when delete is confirmed', async () => {
    const mockWarRooms = [
      createWarRoom({ requestId: 400001, summary: 'WR confirm test 1' }),
      createWarRoom({ requestId: 400002, summary: 'WR confirm test 2' }),
      createWarRoom({ requestId: 400003, summary: 'WR confirm test 3' }),
    ];
    mockedService.getAll.mockResolvedValue({ data: mockWarRooms, total: 3 });
    mockedService.deleteAll.mockResolvedValue({ message: 'All deleted', deleted: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<WarRoomsList />);

    await screen.findByText('WR confirm test 1');

    const clearButton = screen.getByRole('button', { name: /clear all data/i });
    await user.click(clearButton);

    const deleteButton = await screen.findByRole('button', { name: /delete all/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockedService.deleteAll).toHaveBeenCalled();
    });
  });

  it('should display stats grid', async () => {
    const mockWarRooms = [
      createWarRoom({ initialPriority: 'CRITICAL', status: 'Closed', summary: 'Stats test 1' }),
      createWarRoom({ initialPriority: 'HIGH', status: 'Open', summary: 'Stats test 2' }),
      createWarRoom({ initialPriority: 'MEDIUM', status: 'Closed', summary: 'Stats test 3' }),
    ];

    mockedService.getAll.mockResolvedValue({ data: mockWarRooms, total: 3 });

    renderWithQueryClient(<WarRoomsList />);

    await screen.findByText('Stats test 1');

    expect(screen.getByText('TOTAL RECORDS')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL PRIORITY')).toBeInTheDocument();
    expect(screen.getByText('HIGH PRIORITY')).toBeInTheDocument();
    expect(screen.getByText('CLOSED STATUS')).toBeInTheDocument();
  });
});
