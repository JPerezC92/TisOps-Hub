import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { L3SummarySection } from '@/modules/analytics-dashboard/components/l3-summary-section';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import type { MockProxy } from 'vitest-mock-extended';
import type { Application, L3SummaryResponse } from '@/modules/analytics-dashboard/types';

vi.mock('@/modules/analytics-dashboard/services/analytics-dashboard.service');

let mockedService: MockProxy<typeof analyticsDashboardService>;

const mockApplications: Application[] = [
  { id: 1, code: 'CD', name: 'Canales Digitales', description: null, isActive: true },
];

const defaultProps = {
  selectedApp: 'all',
  isMonthlyMode: false,
  applications: mockApplications,
};

function createMockData(): L3SummaryResponse {
  return {
    data: [
      { status: 'dev', statusLabel: 'Dev in Progress', critical: 2, high: 3, medium: 1, low: 0, total: 6 },
      { status: 'testing', statusLabel: 'In Testing', critical: 0, high: 1, medium: 0, low: 1, total: 2 },
    ],
    totals: { critical: 2, high: 4, medium: 1, low: 1, total: 8 },
  };
}

describe('L3SummarySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedService = analyticsDashboardService as MockProxy<typeof analyticsDashboardService>;
  });

  it('should show section header', () => {
    mockedService.getL3Summary.mockReturnValue(new Promise(() => {}));
    renderWithQueryClient(<L3SummarySection {...defaultProps} />);

    expect(screen.getByText('L3 Summary')).toBeInTheDocument();
  });

  it('should show empty state when no data', async () => {
    mockedService.getL3Summary.mockResolvedValue(null);
    renderWithQueryClient(<L3SummarySection {...defaultProps} />);

    expect(await screen.findByText('No data available')).toBeInTheDocument();
  });

  it('should display status rows', async () => {
    mockedService.getL3Summary.mockResolvedValue(createMockData());
    renderWithQueryClient(<L3SummarySection {...defaultProps} />);

    expect(await screen.findByText('Dev in Progress')).toBeInTheDocument();
    expect(screen.getByText('In Testing')).toBeInTheDocument();
  });

  it('should show column headers', async () => {
    mockedService.getL3Summary.mockResolvedValue(createMockData());
    renderWithQueryClient(<L3SummarySection {...defaultProps} />);

    await screen.findByText('Dev in Progress');
    expect(screen.getByText('Pending code fixes')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('should show TOTAL row', async () => {
    mockedService.getL3Summary.mockResolvedValue(createMockData());
    renderWithQueryClient(<L3SummarySection {...defaultProps} />);

    await screen.findByText('Dev in Progress');
    // TOTAL appears in both column header and row
    const totals = screen.getAllByText('TOTAL');
    expect(totals.length).toBeGreaterThanOrEqual(2);
  });

  it('should render empty cells for zero values (no dashes for clean copy-paste)', async () => {
    mockedService.getL3Summary.mockResolvedValue(createMockData());
    renderWithQueryClient(<L3SummarySection {...defaultProps} />);

    await screen.findByText('Dev in Progress');
    // Zero values should not render any visible text (no dashes)
    expect(screen.queryByText('-')).not.toBeInTheDocument();
  });

  it('should show totals in header', async () => {
    mockedService.getL3Summary.mockResolvedValue(createMockData());
    renderWithQueryClient(<L3SummarySection {...defaultProps} />);

    await screen.findByText('Dev in Progress');
    expect(screen.getByText('pending code fixes')).toBeInTheDocument();
  });

  it('should call getL3Summary with correct app', async () => {
    mockedService.getL3Summary.mockResolvedValue(null);
    renderWithQueryClient(<L3SummarySection {...defaultProps} selectedApp="CD" />);

    await waitFor(() => {
      expect(mockedService.getL3Summary).toHaveBeenCalledWith('CD');
    });
  });

  it('should show app filter label', async () => {
    mockedService.getL3Summary.mockResolvedValue(null);
    renderWithQueryClient(<L3SummarySection {...defaultProps} selectedApp="CD" />);

    await screen.findByText(/Canales Digitales/);
  });

  it('should show weekly report label', async () => {
    mockedService.getL3Summary.mockResolvedValue(createMockData());
    renderWithQueryClient(<L3SummarySection {...defaultProps} />);

    await screen.findByText('Dev in Progress');
    expect(screen.getByText('Weekly Report')).toBeInTheDocument();
  });

  it('should show monthly report label in monthly mode', async () => {
    mockedService.getL3Summary.mockResolvedValue(createMockData());
    renderWithQueryClient(<L3SummarySection {...defaultProps} isMonthlyMode={true} />);

    await screen.findByText('Dev in Progress');
    expect(screen.getByText('Monthly Report')).toBeInTheDocument();
  });
});
