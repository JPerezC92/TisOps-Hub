import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { IncidentsByDaySection } from '@/modules/analytics-dashboard/components/incidents-by-day-section';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import type { MockProxy } from 'vitest-mock-extended';
import type { Application } from '@/modules/analytics-dashboard/types';

vi.mock('@/modules/analytics-dashboard/services/analytics-dashboard.service');

let mockedService: MockProxy<typeof analyticsDashboardService>;

const mockApplications: Application[] = [
  { id: 1, code: 'CD', name: 'Canales Digitales', description: null, isActive: true },
];

const defaultProps = {
  selectedApp: 'all',
  applications: mockApplications,
};

describe('IncidentsByDaySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedService = analyticsDashboardService as MockProxy<typeof analyticsDashboardService>;
  });

  it('should show section header', () => {
    mockedService.getIncidentsByDay.mockReturnValue(new Promise(() => {}));
    renderWithQueryClient(<IncidentsByDaySection {...defaultProps} />);

    expect(screen.getByText('Incidents by Day')).toBeInTheDocument();
  });

  it('should show empty state when no data', async () => {
    mockedService.getIncidentsByDay.mockResolvedValue(null);
    renderWithQueryClient(<IncidentsByDaySection {...defaultProps} />);

    expect(await screen.findByText('No data available')).toBeInTheDocument();
  });

  it('should display incidents data', async () => {
    mockedService.getIncidentsByDay.mockResolvedValue({
      data: [
        { day: 1, count: 5 },
        { day: 2, count: 3 },
        { day: 3, count: 8 },
      ],
      totalIncidents: 16,
    });

    renderWithQueryClient(<IncidentsByDaySection {...defaultProps} />);

    expect(await screen.findByText('Day 1')).toBeInTheDocument();
    expect(screen.getByText('Day 2')).toBeInTheDocument();
    expect(screen.getByText('Day 3')).toBeInTheDocument();
  });

  it('should show total incidents count', async () => {
    mockedService.getIncidentsByDay.mockResolvedValue({
      data: [{ day: 1, count: 10 }],
      totalIncidents: 10,
    });

    renderWithQueryClient(<IncidentsByDaySection {...defaultProps} />);

    expect(await screen.findByText('10 incidents')).toBeInTheDocument();
  });

  it('should show app filter label', async () => {
    mockedService.getIncidentsByDay.mockResolvedValue(null);

    renderWithQueryClient(<IncidentsByDaySection {...defaultProps} selectedApp="CD" />);

    await screen.findByText(/Canales Digitales/);
  });

  it('should call getIncidentsByDay with correct app', async () => {
    mockedService.getIncidentsByDay.mockResolvedValue(null);

    renderWithQueryClient(<IncidentsByDaySection {...defaultProps} selectedApp="CD" />);

    await waitFor(() => {
      expect(mockedService.getIncidentsByDay).toHaveBeenCalledWith('CD');
    });
  });

  it('should render table columns', async () => {
    mockedService.getIncidentsByDay.mockResolvedValue({
      data: [{ day: 1, count: 5 }],
      totalIncidents: 5,
    });

    renderWithQueryClient(<IncidentsByDaySection {...defaultProps} />);

    await screen.findByText('Day 1');
    expect(screen.getByText('day')).toBeInTheDocument();
    expect(screen.getByText('Incidents')).toBeInTheDocument();
  });
});
