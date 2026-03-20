import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { EvolutionOfIncidentsSection } from '@/modules/analytics-dashboard/components/evolution-of-incidents-section';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import type { MockProxy } from 'vitest-mock-extended';
import type { Application, ModuleEvolutionResponse } from '@/modules/analytics-dashboard/types';

vi.mock('@/modules/analytics-dashboard/services/analytics-dashboard.service');

let mockedService: MockProxy<typeof analyticsDashboardService>;

const mockApplications: Application[] = [
  { id: 1, code: 'CD', name: 'Canales Digitales', description: null, isActive: true },
];

const defaultProps = {
  selectedApp: 'all',
  selectedMonth: '2025-01',
  startDate: '2025-01-06',
  endDate: '2025-01-12',
  isMonthlyMode: false,
  lastDayOfMonth: '2025-01-31',
  applications: mockApplications,
};

function createMockData(overrides?: Partial<ModuleEvolutionResponse>): ModuleEvolutionResponse {
  return {
    total: overrides?.total ?? 10,
    data: overrides?.data ?? [
      {
        moduleSourceValue: 'module-a',
        moduleDisplayValue: 'Module A',
        count: 7,
        percentage: 70,
        categorizations: [
          {
            categorizationSourceValue: 'cat-1',
            categorizationDisplayValue: 'Category 1',
            count: 4,
            percentage: 57.1,
            tickets: [
              {
                requestId: 'REQ-001',
                requestIdLink: 'https://example.com/REQ-001',
                parentTicketId: 'PARENT-01',
                additionalInfo: 'Info A',
                statusSourceValue: 'open',
                statusDisplayValue: 'Open',
                isUnmapped: false,
              },
              {
                requestId: 'REQ-002',
                requestIdLink: 'https://example.com/REQ-002',
                parentTicketId: 'PARENT-01',
                additionalInfo: 'Info A',
                statusSourceValue: 'open',
                statusDisplayValue: 'Open',
                isUnmapped: false,
              },
            ],
          },
          {
            categorizationSourceValue: 'cat-2',
            categorizationDisplayValue: 'Category 2',
            count: 3,
            percentage: 42.9,
            tickets: [],
          },
        ],
      },
      {
        moduleSourceValue: 'module-b',
        moduleDisplayValue: 'Module B',
        count: 3,
        percentage: 30,
        categorizations: [],
      },
    ],
  };
}

describe('EvolutionOfIncidentsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedService = analyticsDashboardService as MockProxy<typeof analyticsDashboardService>;
  });

  it('should show section header', () => {
    mockedService.getModuleEvolution.mockReturnValue(new Promise(() => {}));
    renderWithQueryClient(<EvolutionOfIncidentsSection {...defaultProps} />);

    expect(screen.getByText('Evolution of Incidents')).toBeInTheDocument();
  });

  it('should show loading skeleton', () => {
    mockedService.getModuleEvolution.mockReturnValue(new Promise(() => {}));
    const { container } = renderWithQueryClient(<EvolutionOfIncidentsSection {...defaultProps} />);

    const skeletons = container.querySelectorAll('[class*="animate-pulse"], [data-slot="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show empty state when no data', async () => {
    mockedService.getModuleEvolution.mockResolvedValue(null);
    renderWithQueryClient(<EvolutionOfIncidentsSection {...defaultProps} />);

    expect(await screen.findByText('No incidents found for the selected date range')).toBeInTheDocument();
  });

  it('should display module rows', async () => {
    mockedService.getModuleEvolution.mockResolvedValue(createMockData());
    renderWithQueryClient(<EvolutionOfIncidentsSection {...defaultProps} />);

    expect(await screen.findByText('Module A')).toBeInTheDocument();
    expect(screen.getByText('Module B')).toBeInTheDocument();
  });

  it('should display categorization rows', async () => {
    mockedService.getModuleEvolution.mockResolvedValue(createMockData());
    renderWithQueryClient(<EvolutionOfIncidentsSection {...defaultProps} />);

    expect(await screen.findByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('Category 2')).toBeInTheDocument();
  });

  it('should show module count and percentage', async () => {
    mockedService.getModuleEvolution.mockResolvedValue(createMockData());
    renderWithQueryClient(<EvolutionOfIncidentsSection {...defaultProps} />);

    await screen.findByText('Module A');
    expect(screen.getByText('70.0%')).toBeInTheDocument();
  });

  it('should show total incidents in header', async () => {
    mockedService.getModuleEvolution.mockResolvedValue(createMockData({ total: 25 }));
    renderWithQueryClient(<EvolutionOfIncidentsSection {...defaultProps} />);

    expect(await screen.findByText(/25 incidents across/)).toBeInTheDocument();
  });

  it('should show table column headers', async () => {
    mockedService.getModuleEvolution.mockResolvedValue(createMockData());
    renderWithQueryClient(<EvolutionOfIncidentsSection {...defaultProps} />);

    await screen.findByText('Module A');
    expect(screen.getByText('Module / Categorization')).toBeInTheDocument();
    expect(screen.getByText('Count')).toBeInTheDocument();
    expect(screen.getByText('Percentage')).toBeInTheDocument();
  });

  it('should not show ticket details by default', async () => {
    mockedService.getModuleEvolution.mockResolvedValue(createMockData());
    renderWithQueryClient(<EvolutionOfIncidentsSection {...defaultProps} />);

    await screen.findByText('Module A');
    expect(screen.getByText('Show Details')).toBeInTheDocument();
    // Ticket group rows should not be visible
    expect(screen.queryByText(/PARENT-01/)).not.toBeInTheDocument();
  });

  it('should show ticket details when toggle is clicked', async () => {
    const user = userEvent.setup();
    mockedService.getModuleEvolution.mockResolvedValue(createMockData());
    renderWithQueryClient(<EvolutionOfIncidentsSection {...defaultProps} />);

    await screen.findByText('Module A');
    await user.click(screen.getByText('Show Details'));

    expect(screen.getByText('Hide Details')).toBeInTheDocument();
    expect(screen.getByText(/PARENT-01/)).toBeInTheDocument();
  });

  it('should call getModuleEvolution in weekly mode', async () => {
    mockedService.getModuleEvolution.mockResolvedValue(null);
    renderWithQueryClient(<EvolutionOfIncidentsSection {...defaultProps} />);

    await waitFor(() => {
      expect(mockedService.getModuleEvolution).toHaveBeenCalledWith('all', '2025-01-06', '2025-01-12');
    });
  });

  it('should call getModuleEvolutionMonthly in monthly mode', async () => {
    mockedService.getModuleEvolutionMonthly.mockResolvedValue(null);
    renderWithQueryClient(
      <EvolutionOfIncidentsSection {...defaultProps} isMonthlyMode={true} />,
    );

    await waitFor(() => {
      expect(mockedService.getModuleEvolutionMonthly).toHaveBeenCalledWith('all', '2025-01-31');
    });
  });

  it('should show filter info with app label', async () => {
    mockedService.getModuleEvolution.mockResolvedValue(createMockData());
    renderWithQueryClient(
      <EvolutionOfIncidentsSection {...defaultProps} selectedApp="CD" />,
    );

    await screen.findByText(/Canales Digitales/);
  });

  it('should show weekly report label in weekly mode', async () => {
    mockedService.getModuleEvolution.mockResolvedValue(createMockData());
    renderWithQueryClient(<EvolutionOfIncidentsSection {...defaultProps} />);

    await screen.findByText('Module A');
    expect(screen.getByText('Weekly Report')).toBeInTheDocument();
  });

  it('should show monthly report label in monthly mode', async () => {
    mockedService.getModuleEvolutionMonthly.mockResolvedValue(createMockData());
    renderWithQueryClient(
      <EvolutionOfIncidentsSection {...defaultProps} isMonthlyMode={true} />,
    );

    await screen.findByText('Module A');
    expect(screen.getByText('Monthly Report')).toBeInTheDocument();
  });

  it('should fall back to source value when display value is empty', async () => {
    mockedService.getModuleEvolution.mockResolvedValue(createMockData({
      data: [{
        moduleSourceValue: 'raw-module',
        moduleDisplayValue: '',
        count: 5,
        percentage: 100,
        categorizations: [{
          categorizationSourceValue: 'raw-cat',
          categorizationDisplayValue: '',
          count: 5,
          percentage: 100,
          tickets: [],
        }],
      }],
    }));
    renderWithQueryClient(<EvolutionOfIncidentsSection {...defaultProps} />);

    expect(await screen.findByText('raw-module')).toBeInTheDocument();
    expect(screen.getByText('raw-cat')).toBeInTheDocument();
  });
});
