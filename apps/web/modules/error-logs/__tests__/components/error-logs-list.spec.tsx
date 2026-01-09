import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock, MockProxy } from 'vitest-mock-extended';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { ErrorLogsList } from '../../components/error-logs-list';
import { errorLogsService } from '../../services/error-logs.service';
import { ErrorLogFactory } from '../helpers/error-log.factory';

// Mock service
vi.mock('../../services/error-logs.service', () => ({
  errorLogsService: mock<typeof errorLogsService>(),
}));

describe('ErrorLogsList', () => {
  let mockedService: MockProxy<typeof errorLogsService>;

  beforeEach(() => {
    mockedService = errorLogsService as MockProxy<typeof errorLogsService>;
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockedService.getAll.mockReturnValue(new Promise(() => {})); // Never resolves
    renderWithQueryClient(<ErrorLogsList />);
    expect(screen.getByText(/loading error logs/i)).toBeInTheDocument();
  });

  it('should display empty state when no errors', async () => {
    mockedService.getAll.mockResolvedValue({ logs: [], total: 0 });
    renderWithQueryClient(<ErrorLogsList />);

    await waitFor(() => {
      expect(screen.getByText('No Errors Logged')).toBeInTheDocument();
    });
    expect(screen.getByText(/your system is running smoothly/i)).toBeInTheDocument();
  });

  it('should list error logs when data loads', async () => {
    const mockErrorLogs = [
      ErrorLogFactory.create({
        id: 1,
        errorType: 'DatabaseError',
        errorMessage: 'Connection failed',
      }),
      ErrorLogFactory.create({
        id: 2,
        errorType: 'ValidationError',
        errorMessage: 'Invalid input',
      }),
    ];

    mockedService.getAll.mockResolvedValue({ logs: mockErrorLogs, total: mockErrorLogs.length });
    renderWithQueryClient(<ErrorLogsList />);

    expect(await screen.findByText('#1')).toBeInTheDocument();
    expect(await screen.findByText('#2')).toBeInTheDocument();
    expect(screen.getByText('DatabaseError')).toBeInTheDocument();
    expect(screen.getByText('ValidationError')).toBeInTheDocument();
  });

  it('should display error count in header', async () => {
    const mockErrorLogs = ErrorLogFactory.createMany(5);
    mockedService.getAll.mockResolvedValue({ logs: mockErrorLogs, total: mockErrorLogs.length });
    renderWithQueryClient(<ErrorLogsList />);

    await waitFor(() => {
      expect(screen.getByText(/showing 5 errors/i)).toBeInTheDocument();
    });
  });

  it('should display method badge when method exists', async () => {
    const mockErrorLogs = [
      ErrorLogFactory.create({
        method: 'GET',
        endpoint: '/api/users',
      }),
    ];

    mockedService.getAll.mockResolvedValue({ logs: mockErrorLogs, total: mockErrorLogs.length });
    renderWithQueryClient(<ErrorLogsList />);

    await waitFor(() => {
      expect(screen.getByText('GET')).toBeInTheDocument();
    });
  });

  it('should change limit when selector changes', async () => {
    const mockErrorLogs = ErrorLogFactory.createMany(25);
    mockedService.getAll.mockResolvedValue({ logs: mockErrorLogs, total: mockErrorLogs.length });

    const user = userEvent.setup();
    renderWithQueryClient(<ErrorLogsList />);

    await waitFor(() => {
      expect(screen.getByText(/showing 25 errors/i)).toBeInTheDocument();
    });

    // Select element doesn't have combobox role by default, use CSS selector
    const limitSelect = document.querySelector('select') as HTMLSelectElement;
    await user.selectOptions(limitSelect, '100');

    await waitFor(() => {
      expect(mockedService.getAll).toHaveBeenCalledWith(100);
    });
  });

  it('should open modal when view details is clicked', async () => {
    const mockErrorLogs = [
      ErrorLogFactory.create({
        id: 1,
        errorType: 'DatabaseError',
        errorMessage: 'Connection timeout occurred',
      }),
    ];

    mockedService.getAll.mockResolvedValue({ logs: mockErrorLogs, total: mockErrorLogs.length });

    const user = userEvent.setup();
    renderWithQueryClient(<ErrorLogsList />);

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
    });

    await user.click(screen.getByText('View Details'));

    // Modal should open with error details header
    await waitFor(() => {
      expect(screen.getByText(/Error Details #1/)).toBeInTheDocument();
    });
    // Modal should show "Error Type" label
    expect(screen.getByText('Error Type')).toBeInTheDocument();
    // Modal should show "Error Message" label
    expect(screen.getByText('Error Message')).toBeInTheDocument();
  });

  it('should close modal when close button is clicked', async () => {
    const mockErrorLogs = [
      ErrorLogFactory.create({
        id: 1,
        errorType: 'DatabaseError',
      }),
    ];

    mockedService.getAll.mockResolvedValue({ logs: mockErrorLogs, total: mockErrorLogs.length });

    const user = userEvent.setup();
    renderWithQueryClient(<ErrorLogsList />);

    await waitFor(() => {
      expect(screen.getByText('#1')).toBeInTheDocument();
    });

    await user.click(screen.getByText('View Details'));

    await waitFor(() => {
      expect(screen.getByText('Error Details #1')).toBeInTheDocument();
    });

    await user.click(screen.getByTitle('Close'));

    await waitFor(() => {
      expect(screen.queryByText('Error Details #1')).not.toBeInTheDocument();
    });
  });
});
