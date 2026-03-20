import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { AnalyticsFilterBar } from '@/modules/analytics-dashboard/components/analytics-filter-bar';
import type { Application } from '@/modules/analytics-dashboard/types';

const mockApplications: Application[] = [
  { id: 1, code: 'CD', name: 'Canales Digitales', description: null, isActive: true },
  { id: 2, code: 'FFVV', name: 'Fuerza de Ventas', description: null, isActive: true },
];

const defaultProps = {
  selectedApp: 'all',
  selectedMonth: '2025-01',
  startDate: '2025-01-10',
  endDate: '2025-01-16',
  isMonthlyMode: false,
  lastDayOfMonth: '2025-01-31',
  selectedYear: 2025,
  selectedMonthNum: 1,
  applications: mockApplications,
  onFiltersChange: vi.fn(),
  onMonthlyModeChange: vi.fn(),
};

describe('AnalyticsFilterBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render application filter with all applications option', () => {
    renderWithQueryClient(<AnalyticsFilterBar {...defaultProps} />);

    expect(screen.getByText('Application')).toBeInTheDocument();
    expect(screen.getByText('All Applications')).toBeInTheDocument();
  });

  it('should render month display', () => {
    renderWithQueryClient(<AnalyticsFilterBar {...defaultProps} />);

    expect(screen.getByText('January 2025')).toBeInTheDocument();
  });

  it('should render date range in weekly mode', () => {
    renderWithQueryClient(<AnalyticsFilterBar {...defaultProps} />);

    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText(/Jan 10.*Jan 16, 2025/)).toBeInTheDocument();
  });

  it('should show end date in monthly mode', () => {
    renderWithQueryClient(
      <AnalyticsFilterBar {...defaultProps} isMonthlyMode={true} />
    );

    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Jan 31, 2025')).toBeInTheDocument();
  });

  it('should render weekly/monthly toggle', () => {
    renderWithQueryClient(<AnalyticsFilterBar {...defaultProps} />);

    expect(screen.getByText('Weekly')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
  });

  it('should highlight weekly label when not monthly mode', () => {
    renderWithQueryClient(<AnalyticsFilterBar {...defaultProps} isMonthlyMode={false} />);

    const weeklyLabel = screen.getByText('Weekly');
    expect(weeklyLabel.className).toContain('cyan');
  });

  it('should highlight monthly label when monthly mode', () => {
    renderWithQueryClient(<AnalyticsFilterBar {...defaultProps} isMonthlyMode={true} />);

    const monthlyLabel = screen.getByText('Monthly');
    expect(monthlyLabel.className).toContain('purple');
  });

  it('should call onMonthlyModeChange when toggle is clicked', async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<AnalyticsFilterBar {...defaultProps} />);

    const toggle = screen.getByRole('switch');
    await user.click(toggle);

    expect(defaultProps.onMonthlyModeChange).toHaveBeenCalledWith(true);
  });
});
