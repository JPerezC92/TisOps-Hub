import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { StabilityIndicatorsSection } from '@/modules/analytics-dashboard/components/stability-indicators-section';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import type { MockProxy } from 'vitest-mock-extended';
import type { Application } from '@/modules/analytics-dashboard/types';

vi.mock('@/modules/analytics-dashboard/services/analytics-dashboard.service');

let mockedService: MockProxy<typeof analyticsDashboardService>;

const mockApplications: Application[] = [
  { id: 1, code: 'CD', name: 'Canales Digitales', description: null, isActive: true },
  { id: 2, code: 'SB', name: 'Somos Belcorp', description: null, isActive: true },
];

const defaultProps = {
  selectedApp: 'all',
  selectedMonth: '2025-01',
  selectedYear: 2025,
  isMonthlyMode: false,
  applications: mockApplications,
};

function setupDefaultMocks() {
  mockedService.getStabilityIndicators.mockResolvedValue(null);
  mockedService.getCategoryDistribution.mockResolvedValue(null);
  mockedService.getBusinessFlowPriority.mockResolvedValue(null);
  mockedService.getPriorityByApp.mockResolvedValue(null);
  mockedService.getL3TicketsByStatus.mockResolvedValue(null);
  mockedService.getIncidentsByWeek.mockResolvedValue(null);
  mockedService.getSessionsOrdersLast30Days.mockResolvedValue(null);
  mockedService.getIncidentsVsOrdersByMonth.mockResolvedValue(null);
  mockedService.getIncidentsByReleaseByDay.mockResolvedValue(null);
  mockedService.getChangeReleaseByModule.mockResolvedValue(null);
}

describe('StabilityIndicatorsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedService = analyticsDashboardService as MockProxy<typeof analyticsDashboardService>;
  });

  it('should render the section header', async () => {
    setupDefaultMocks();
    renderWithQueryClient(<StabilityIndicatorsSection {...defaultProps} />);

    expect(screen.getByText('Operational Stability Indicators')).toBeInTheDocument();
  });

  it('should show empty state for stability indicators when no data', async () => {
    setupDefaultMocks();
    renderWithQueryClient(<StabilityIndicatorsSection {...defaultProps} />);

    expect(await screen.findByText('No stability data found for the selected filters')).toBeInTheDocument();
  });

  it('should display stability indicators data', async () => {
    setupDefaultMocks();
    mockedService.getStabilityIndicators.mockResolvedValue({
      data: [
        { application: 'App A', l2Count: 5, l3Count: 3, unmappedCount: 0, unmappedRequests: [], total: 8 },
        { application: 'App B', l2Count: 2, l3Count: 7, unmappedCount: 1, unmappedRequests: [], total: 10 },
      ],
      hasUnmappedStatuses: true,
    });

    renderWithQueryClient(<StabilityIndicatorsSection {...defaultProps} />);

    expect(await screen.findByText('App A')).toBeInTheDocument();
    expect(screen.getByText('App B')).toBeInTheDocument();
  });

  it('should show unmapped warning banner when hasUnmappedStatuses is true', async () => {
    setupDefaultMocks();
    mockedService.getStabilityIndicators.mockResolvedValue({
      data: [{ application: 'App', l2Count: 1, l3Count: 1, unmappedCount: 2, unmappedRequests: [], total: 4 }],
      hasUnmappedStatuses: true,
    });

    renderWithQueryClient(<StabilityIndicatorsSection {...defaultProps} />);

    expect(await screen.findByText(/unmapped statuses/)).toBeInTheDocument();
  });

  it('should show empty state for category distribution when no data', async () => {
    setupDefaultMocks();
    renderWithQueryClient(<StabilityIndicatorsSection {...defaultProps} />);

    expect(await screen.findByText('No category data found for the selected filters')).toBeInTheDocument();
  });

  it('should display category distribution data', async () => {
    setupDefaultMocks();
    mockedService.getCategoryDistribution.mockResolvedValue({
      monthName: 'January',
      totalIncidents: 10,
      data: [
        {
          categorySourceValue: 'Bug',
          categoryDisplayValue: 'Bug Fix',
          newCount: 5,
          recurringCount: 3,
          unassignedCount: 0,
          unassignedRequests: [],
          total: 8,
          percentage: 80,
        },
      ],
    });

    renderWithQueryClient(<StabilityIndicatorsSection {...defaultProps} />);

    expect(await screen.findByText('Bug Fix')).toBeInTheDocument();
    expect(screen.getByText('80.0%')).toBeInTheDocument();
  });

  it('should toggle unassigned column visibility', async () => {
    const user = userEvent.setup();
    setupDefaultMocks();
    mockedService.getCategoryDistribution.mockResolvedValue({
      monthName: 'January',
      totalIncidents: 5,
      data: [
        {
          categorySourceValue: 'Bug',
          categoryDisplayValue: 'Bug',
          newCount: 3,
          recurringCount: 1,
          unassignedCount: 1,
          unassignedRequests: [],
          total: 5,
          percentage: 100,
        },
      ],
    });

    renderWithQueryClient(<StabilityIndicatorsSection {...defaultProps} />);

    await screen.findByText('Bug');
    expect(screen.queryByText('Unassigned')).not.toBeInTheDocument();

    await user.click(screen.getByText('Show Unassigned'));
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('should show empty state for business flow when no data', async () => {
    setupDefaultMocks();
    renderWithQueryClient(<StabilityIndicatorsSection {...defaultProps} />);

    expect(await screen.findByText('No business flow data found for the selected filters')).toBeInTheDocument();
  });

  it('should show empty state for priority by app when no data', async () => {
    setupDefaultMocks();
    renderWithQueryClient(<StabilityIndicatorsSection {...defaultProps} />);

    expect(await screen.findByText('No priority data found for the selected filters')).toBeInTheDocument();
  });

  it('should show empty state for L3 tickets when no data', async () => {
    setupDefaultMocks();
    renderWithQueryClient(<StabilityIndicatorsSection {...defaultProps} />);

    expect(await screen.findByText('No L3 tickets found for the selected filters')).toBeInTheDocument();
  });

  it('should display incidents by week data', async () => {
    setupDefaultMocks();
    mockedService.getIncidentsByWeek.mockResolvedValue({
      year: 2025,
      totalIncidents: 15,
      data: [
        { weekNumber: 1, startDate: '2025-01-06', endDate: '2025-01-12', count: 5 },
        { weekNumber: 2, startDate: '2025-01-13', endDate: '2025-01-19', count: 10 },
      ],
    });

    renderWithQueryClient(<StabilityIndicatorsSection {...defaultProps} />);

    expect(await screen.findByText('Week 1')).toBeInTheDocument();
    expect(screen.getByText('Week 2')).toBeInTheDocument();
  });

  it('should not show SB-only subsections when selectedApp is not SB', async () => {
    setupDefaultMocks();
    renderWithQueryClient(<StabilityIndicatorsSection {...defaultProps} selectedApp="CD" />);

    await screen.findByText('Operational Stability Indicators');
    expect(screen.queryByText('Sessions and Orders - Last 30 Days')).not.toBeInTheDocument();
    expect(screen.queryByText('Number of Incidents vs Placed Orders by Month')).not.toBeInTheDocument();
  });

  it('should show SB-only subsections when selectedApp is SB', async () => {
    setupDefaultMocks();
    renderWithQueryClient(<StabilityIndicatorsSection {...defaultProps} selectedApp="SB" />);

    await screen.findByText('Sessions and Orders - Last 30 Days');
    expect(screen.getByText('Number of Incidents vs Placed Orders by Month')).toBeInTheDocument();
  });

  it('should call service methods with correct params', async () => {
    setupDefaultMocks();

    renderWithQueryClient(
      <StabilityIndicatorsSection {...defaultProps} selectedApp="CD" selectedMonth="2025-06" selectedYear={2025} />,
    );

    await waitFor(() => {
      expect(mockedService.getStabilityIndicators).toHaveBeenCalledWith('CD', '2025-06');
      expect(mockedService.getCategoryDistribution).toHaveBeenCalledWith('CD', '2025-06');
      expect(mockedService.getBusinessFlowPriority).toHaveBeenCalledWith('CD', '2025-06');
      expect(mockedService.getPriorityByApp).toHaveBeenCalledWith('CD', '2025-06');
      expect(mockedService.getL3TicketsByStatus).toHaveBeenCalledWith('CD');
      expect(mockedService.getIncidentsByWeek).toHaveBeenCalledWith('CD', 2025);
      expect(mockedService.getIncidentsVsOrdersByMonth).toHaveBeenCalledWith(2025);
    });
  });
});
