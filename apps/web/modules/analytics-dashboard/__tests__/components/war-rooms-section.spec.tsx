import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { WarRoomsSection } from '@/modules/analytics-dashboard/components/war-rooms-section';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import type { MockProxy } from 'vitest-mock-extended';
import type { WarRoom, Application } from '@/modules/analytics-dashboard/types';

vi.mock('@/modules/analytics-dashboard/services/analytics-dashboard.service');

let mockedService: MockProxy<typeof analyticsDashboardService>;

const mockApplications: Application[] = [
  { id: 1, code: 'CD', name: 'Canales Digitales', description: null, isActive: true },
  { id: 2, code: 'FFVV', name: 'Fuerza de Ventas', description: null, isActive: true },
];

const defaultProps = {
  selectedApp: 'all',
  selectedMonth: '2025-01',
  isMonthlyMode: false,
  applications: mockApplications,
};

function createWarRoom(overrides?: Partial<WarRoom>): WarRoom {
  return {
    requestId: overrides?.requestId ?? 1001,
    requestIdLink: overrides?.requestIdLink ?? 'https://example.com/1001',
    application: overrides?.application ?? 'CD',
    date: overrides?.date ?? '2025-01-15T00:00:00',
    summary: overrides?.summary ?? 'Test war room incident',
    startTime: overrides?.startTime ?? '2025-01-15T10:00:00',
    durationMinutes: overrides?.durationMinutes ?? 45,
    endTime: overrides?.endTime ?? '2025-01-15T10:45:00',
    participants: overrides?.participants ?? 5,
    status: overrides?.status ?? 'Closed',
    notes: overrides?.notes ?? 'Resolved successfully',
    rcaStatus: overrides?.rcaStatus ?? 'Completed',
    urlRca: overrides?.urlRca ?? 'https://example.com/rca/1001',
    app: overrides?.app ?? { id: 1, code: 'CD', name: 'Canales Digitales' },
  };
}

describe('WarRoomsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedService = analyticsDashboardService as MockProxy<typeof analyticsDashboardService>;
  });

  it('should show loading state', () => {
    mockedService.getWarRooms.mockReturnValue(new Promise(() => {}));
    renderWithQueryClient(<WarRoomsSection {...defaultProps} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show empty state when no data', async () => {
    mockedService.getWarRooms.mockResolvedValue([]);
    renderWithQueryClient(<WarRoomsSection {...defaultProps} />);

    expect(await screen.findByText('No war rooms data found')).toBeInTheDocument();
  });

  it('should display war room data in table', async () => {
    const warRooms = [
      createWarRoom({ requestId: 1001, summary: 'Incident Alpha' }),
      createWarRoom({ requestId: 1002, summary: 'Incident Beta' }),
    ];
    mockedService.getWarRooms.mockResolvedValue(warRooms);

    renderWithQueryClient(<WarRoomsSection {...defaultProps} />);

    expect(await screen.findByText('Incident Alpha')).toBeInTheDocument();
    expect(screen.getByText('Incident Beta')).toBeInTheDocument();
    expect(screen.getByText('2 records')).toBeInTheDocument();
  });

  it('should display record count after loading', async () => {
    mockedService.getWarRooms.mockResolvedValue([
      createWarRoom({ requestId: 1 }),
      createWarRoom({ requestId: 2 }),
      createWarRoom({ requestId: 3 }),
    ]);

    renderWithQueryClient(<WarRoomsSection {...defaultProps} />);

    expect(await screen.findByText('3 records')).toBeInTheDocument();
  });

  it('should filter by search term', async () => {
    const user = userEvent.setup();
    mockedService.getWarRooms.mockResolvedValue([
      createWarRoom({ requestId: 1001, summary: 'Incident Alpha' }),
      createWarRoom({ requestId: 1002, summary: 'Incident Beta' }),
    ]);

    renderWithQueryClient(<WarRoomsSection {...defaultProps} />);

    await screen.findByText('Incident Alpha');
    await user.type(screen.getByPlaceholderText(/search/i), 'Alpha');

    await waitFor(() => {
      expect(screen.getByText('Incident Alpha')).toBeInTheDocument();
      expect(screen.queryByText('Incident Beta')).not.toBeInTheDocument();
    });
  });

  it('should render table header columns', async () => {
    mockedService.getWarRooms.mockResolvedValue([createWarRoom()]);

    renderWithQueryClient(<WarRoomsSection {...defaultProps} />);

    await screen.findByText('War Rooms Data');
    expect(screen.getByText('Application')).toBeInTheDocument();
    expect(screen.getByText('Assistants')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.getByText('Request ID')).toBeInTheDocument();
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('RCA Status')).toBeInTheDocument();
  });

  it('should show filter info with app label and month', async () => {
    mockedService.getWarRooms.mockResolvedValue([createWarRoom()]);

    renderWithQueryClient(
      <WarRoomsSection {...defaultProps} selectedApp="CD" selectedMonth="2025-03" />,
    );

    await screen.findByText(/Canales Digitales/);
    expect(screen.getByText(/March 2025/)).toBeInTheDocument();
  });

  it('should show monthly report label when monthly mode', async () => {
    mockedService.getWarRooms.mockResolvedValue([createWarRoom()]);

    renderWithQueryClient(
      <WarRoomsSection {...defaultProps} isMonthlyMode={true} />,
    );

    expect(await screen.findByText('Monthly Report')).toBeInTheDocument();
  });

  it('should show weekly report label when weekly mode', async () => {
    mockedService.getWarRooms.mockResolvedValue([createWarRoom()]);

    renderWithQueryClient(
      <WarRoomsSection {...defaultProps} isMonthlyMode={false} />,
    );

    expect(await screen.findByText('Weekly Report')).toBeInTheDocument();
  });

  it('should render request ID as link when requestIdLink exists', async () => {
    mockedService.getWarRooms.mockResolvedValue([
      createWarRoom({ requestId: 1001, requestIdLink: 'https://example.com/1001' }),
    ]);

    renderWithQueryClient(<WarRoomsSection {...defaultProps} />);

    const link = await screen.findByText('1001');
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com/1001');
  });

  it('should render RCA status as link when urlRca is valid', async () => {
    mockedService.getWarRooms.mockResolvedValue([
      createWarRoom({ rcaStatus: 'Completed', urlRca: 'https://example.com/rca' }),
    ]);

    renderWithQueryClient(<WarRoomsSection {...defaultProps} />);

    const link = await screen.findByText('Completed');
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com/rca');
  });

  it('should render RCA status as plain text when urlRca is N/A', async () => {
    mockedService.getWarRooms.mockResolvedValue([
      createWarRoom({ rcaStatus: 'Pending', urlRca: 'N/A' }),
    ]);

    renderWithQueryClient(<WarRoomsSection {...defaultProps} />);

    const text = await screen.findByText('Pending');
    expect(text.closest('a')).toBeNull();
  });

  it('should call getWarRooms with correct params', async () => {
    mockedService.getWarRooms.mockResolvedValue([]);

    renderWithQueryClient(
      <WarRoomsSection {...defaultProps} selectedApp="FFVV" selectedMonth="2025-06" />,
    );

    await waitFor(() => {
      expect(mockedService.getWarRooms).toHaveBeenCalledWith('FFVV', '2025-06');
    });
  });
});
