import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { IncidentOverviewSection } from '@/modules/analytics-dashboard/components/incident-overview-section';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import type { MockProxy } from 'vitest-mock-extended';
import type { Application, IncidentOverviewByCategoryResponse } from '@/modules/analytics-dashboard/types';

vi.mock('@/modules/analytics-dashboard/services/analytics-dashboard.service');

let mockedService: MockProxy<typeof analyticsDashboardService>;

const mockApplications: Application[] = [
  { id: 1, code: 'CD', name: 'Canales Digitales', description: null, isActive: true },
];

const defaultProps = {
  selectedApp: 'all',
  startDate: '2025-01-06',
  endDate: '2025-01-12',
  isMonthlyMode: false,
  lastDayOfMonth: '2025-01-31',
  applications: mockApplications,
};

function createMockData(): IncidentOverviewByCategoryResponse {
  return {
    resolvedInL2: {
      data: [
        { category: 'cat-a', categoryDisplayValue: 'Category A', count: 5, percentage: 50 },
        { category: 'cat-b', categoryDisplayValue: 'Category B', count: 5, percentage: 50 },
      ],
      total: 10,
    },
    pending: {
      data: [
        { category: 'cat-c', categoryDisplayValue: null, count: 3, percentage: 100 },
      ],
      total: 3,
    },
    recurrentInL2L3: {
      data: [
        { category: 'Unique', categoryDisplayValue: null, count: 7, percentage: 70 },
        { category: 'Recurrent', categoryDisplayValue: null, count: 3, percentage: 30 },
      ],
      total: 10,
    },
    assignedToL3Backlog: {
      data: [
        { category: 'cat-d', categoryDisplayValue: 'Category D', count: 2, percentage: 100 },
      ],
      total: 2,
    },
    l3Status: {
      data: [
        { status: 'In Progress', count: 4, percentage: 80 },
        { status: 'Waiting', count: 1, percentage: 20 },
      ],
      total: 5,
    },
  };
}

describe('IncidentOverviewSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedService = analyticsDashboardService as MockProxy<typeof analyticsDashboardService>;
  });

  it('should show section header', () => {
    mockedService.getIncidentOverview.mockReturnValue(new Promise(() => {}));
    renderWithQueryClient(<IncidentOverviewSection {...defaultProps} />);

    expect(screen.getByText('Incident Overview by Category')).toBeInTheDocument();
  });

  it('should show empty state when no data', async () => {
    mockedService.getIncidentOverview.mockResolvedValue(null);
    renderWithQueryClient(<IncidentOverviewSection {...defaultProps} />);

    expect(await screen.findByText('No data available')).toBeInTheDocument();
  });

  it('should display all 5 card titles', async () => {
    mockedService.getIncidentOverview.mockResolvedValue(createMockData());
    renderWithQueryClient(<IncidentOverviewSection {...defaultProps} />);

    expect(await screen.findByText('Resolved in L2')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Recurrent in L2 & L3')).toBeInTheDocument();
    expect(screen.getByText('Assigned to L3 Backlog')).toBeInTheDocument();
    expect(screen.getByText('L3 Status')).toBeInTheDocument();
  });

  it('should show category data in cards', async () => {
    mockedService.getIncidentOverview.mockResolvedValue(createMockData());
    renderWithQueryClient(<IncidentOverviewSection {...defaultProps} />);

    expect(await screen.findByText('Category A')).toBeInTheDocument();
    expect(screen.getByText('Category B')).toBeInTheDocument();
  });

  it('should show TOTAL rows', async () => {
    mockedService.getIncidentOverview.mockResolvedValue(createMockData());
    renderWithQueryClient(<IncidentOverviewSection {...defaultProps} />);

    await screen.findByText('Category A');
    const totals = screen.getAllByText('TOTAL');
    expect(totals.length).toBe(5);
  });

  it('should show recurrentInL2L3 total in header', async () => {
    mockedService.getIncidentOverview.mockResolvedValue(createMockData());
    renderWithQueryClient(<IncidentOverviewSection {...defaultProps} />);

    await screen.findByText('Category A');
    expect(screen.getByText('requests of the week')).toBeInTheDocument();
  });

  it('should call getIncidentOverview in weekly mode', async () => {
    mockedService.getIncidentOverview.mockResolvedValue(null);
    renderWithQueryClient(<IncidentOverviewSection {...defaultProps} />);

    await waitFor(() => {
      expect(mockedService.getIncidentOverview).toHaveBeenCalledWith('all', '2025-01-06', '2025-01-12');
    });
  });

  it('should call getIncidentOverviewMonthly in monthly mode', async () => {
    mockedService.getIncidentOverviewMonthly.mockResolvedValue(null);
    renderWithQueryClient(
      <IncidentOverviewSection {...defaultProps} isMonthlyMode={true} />,
    );

    await waitFor(() => {
      expect(mockedService.getIncidentOverviewMonthly).toHaveBeenCalledWith('all', '2025-01-31');
    });
  });

  it('should show app filter label', async () => {
    mockedService.getIncidentOverview.mockResolvedValue(null);
    renderWithQueryClient(
      <IncidentOverviewSection {...defaultProps} selectedApp="CD" />,
    );

    await screen.findByText(/Canales Digitales/);
  });

  it('should show weekly/monthly report label', async () => {
    mockedService.getIncidentOverview.mockResolvedValue(createMockData());
    renderWithQueryClient(<IncidentOverviewSection {...defaultProps} />);

    await screen.findByText('Category A');
    expect(screen.getByText('Weekly Report')).toBeInTheDocument();
  });

  it('should show L3 Status card data', async () => {
    mockedService.getIncidentOverview.mockResolvedValue(createMockData());
    renderWithQueryClient(<IncidentOverviewSection {...defaultProps} />);

    expect(await screen.findByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Waiting')).toBeInTheDocument();
  });

  it('should show footer text in cards', async () => {
    mockedService.getIncidentOverview.mockResolvedValue(createMockData());
    renderWithQueryClient(<IncidentOverviewSection {...defaultProps} />);

    expect(await screen.findByText('10 Resolved tickets of the Week')).toBeInTheDocument();
    expect(screen.getByText('3 pending tickets of the Week')).toBeInTheDocument();
    expect(screen.getByText('5 tickets previous week')).toBeInTheDocument();
  });

  it('should fall back to category source value when display value is null', async () => {
    mockedService.getIncidentOverview.mockResolvedValue(createMockData());
    renderWithQueryClient(<IncidentOverviewSection {...defaultProps} />);

    // cat-c has null categoryDisplayValue, so it should show the raw category
    expect(await screen.findByText('cat-c')).toBeInTheDocument();
  });
});
