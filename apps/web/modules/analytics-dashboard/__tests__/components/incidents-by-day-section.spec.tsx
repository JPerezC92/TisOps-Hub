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
  endDay: 19,
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

  it('should display all days up to endDay, filling gaps with 0', async () => {
    mockedService.getIncidentsByDay.mockResolvedValue({
      data: [
        { day: 5, count: 1 },
        { day: 12, count: 1 },
        { day: 18, count: 2 },
        { day: 19, count: 1 },
      ],
      totalIncidents: 5,
    });

    renderWithQueryClient(<IncidentsByDaySection {...defaultProps} endDay={19} />);

    // All 19 days should be rendered
    for (let i = 1; i <= 19; i++) {
      expect(await screen.findByText(`Day ${i}`)).toBeInTheDocument();
    }
  });

  it('should show 0 count for days without incidents', async () => {
    mockedService.getIncidentsByDay.mockResolvedValue({
      data: [{ day: 3, count: 2 }],
      totalIncidents: 2,
    });

    renderWithQueryClient(<IncidentsByDaySection {...defaultProps} endDay={5} />);

    await screen.findByText('Day 1');
    // Days 1, 2, 4, 5 should show 0
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(4);
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

  it('should dim rows with zero incidents', async () => {
    mockedService.getIncidentsByDay.mockResolvedValue({
      data: [{ day: 2, count: 3 }],
      totalIncidents: 3,
    });

    const { container } = renderWithQueryClient(<IncidentsByDaySection {...defaultProps} endDay={3} />);

    await screen.findByText('Day 1');
    const rows = container.querySelectorAll('tbody tr');
    // Day 1 (0 incidents) should have opacity class
    expect(rows[0].className).toContain('opacity-40');
    // Day 2 (3 incidents) should not
    expect(rows[1].className).not.toContain('opacity-40');
  });
});
