import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock, MockProxy } from 'vitest-mock-extended';
import { StatusMappingsList } from '@/modules/monthly-report-status-registry/components/status-mappings-list';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { monthlyReportStatusRegistryService } from '@/modules/monthly-report-status-registry/services/monthly-report-status-registry.service';
import { MonthlyReportStatusFactory } from '../helpers/monthly-report-status.factory';

let mockedService: MockProxy<typeof monthlyReportStatusRegistryService>;

vi.mock('@/modules/monthly-report-status-registry/services/monthly-report-status-registry.service', () => ({
  monthlyReportStatusRegistryService: mock<typeof monthlyReportStatusRegistryService>(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('StatusMappingsList', () => {
  beforeEach(() => {
    mockedService = monthlyReportStatusRegistryService as MockProxy<typeof monthlyReportStatusRegistryService>;
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockedService.getAll.mockReturnValue(new Promise(() => {}));

    const { container } = renderWithQueryClient(<StatusMappingsList />);

    // Check for the loading spinner
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should list status mappings when data loads', async () => {
    const mockStatuses = [
      MonthlyReportStatusFactory.create({ rawStatus: 'En Proceso', displayStatus: 'On going L2' }),
      MonthlyReportStatusFactory.create({ rawStatus: 'Cerrado', displayStatus: 'Closed' }),
      MonthlyReportStatusFactory.create({ rawStatus: 'En Backlog', displayStatus: 'In L3 Backlog' }),
    ];

    mockedService.getAll.mockResolvedValue(mockStatuses);

    renderWithQueryClient(<StatusMappingsList />);

    expect(await screen.findByText('En Proceso')).toBeInTheDocument();
    expect(screen.getByText('Cerrado')).toBeInTheDocument();
    expect(screen.getByText('En Backlog')).toBeInTheDocument();
    expect(screen.getByText('On going L2')).toBeInTheDocument();
    expect(screen.getByText('Closed')).toBeInTheDocument();
    expect(screen.getByText('In L3 Backlog')).toBeInTheDocument();
  });

  it('should show empty state when no status mappings', async () => {
    mockedService.getAll.mockResolvedValue([]);

    renderWithQueryClient(<StatusMappingsList />);

    expect(await screen.findByText('No status mappings found')).toBeInTheDocument();
  });

  it('should filter by search term', async () => {
    const mockStatuses = [
      MonthlyReportStatusFactory.create({ rawStatus: 'En Proceso L2', displayStatus: 'On going L2' }),
      MonthlyReportStatusFactory.create({ rawStatus: 'Cerrado Final', displayStatus: 'Closed' }),
      MonthlyReportStatusFactory.create({ rawStatus: 'En Backlog L3', displayStatus: 'In L3 Backlog' }),
    ];

    mockedService.getAll.mockResolvedValue(mockStatuses);

    const user = userEvent.setup();
    renderWithQueryClient(<StatusMappingsList />);

    await screen.findByText('En Proceso L2');

    const searchInput = screen.getByPlaceholderText('Search statuses...');
    await user.type(searchInput, 'Cerrado');

    await waitFor(() => {
      expect(screen.getByText('Cerrado Final')).toBeInTheDocument();
      expect(screen.queryByText('En Proceso L2')).not.toBeInTheDocument();
      expect(screen.queryByText('En Backlog L3')).not.toBeInTheDocument();
    });
  });

  it('should filter by status', async () => {
    const mockStatuses = [
      MonthlyReportStatusFactory.create({ rawStatus: 'Active One', isActive: true }),
      MonthlyReportStatusFactory.create({ rawStatus: 'Active Two', isActive: true }),
      MonthlyReportStatusFactory.create({ rawStatus: 'Inactive One', isActive: false }),
    ];

    mockedService.getAll.mockResolvedValue(mockStatuses);

    const user = userEvent.setup();
    renderWithQueryClient(<StatusMappingsList />);

    await screen.findByText('Active One');

    const statusSelect = screen.getAllByRole('combobox').find(
      (select) => (select as HTMLSelectElement).value === 'all'
    );

    if (statusSelect) {
      await user.selectOptions(statusSelect, 'inactive');
    }

    await waitFor(() => {
      expect(screen.getByText('Inactive One')).toBeInTheDocument();
      expect(screen.queryByText('Active One')).not.toBeInTheDocument();
      expect(screen.queryByText('Active Two')).not.toBeInTheDocument();
    });
  });

  it('should open create modal when clicking New Mapping button', async () => {
    mockedService.getAll.mockResolvedValue([]);

    const user = userEvent.setup();
    renderWithQueryClient(<StatusMappingsList />);

    await screen.findByText('No status mappings found');

    const createButton = screen.getByRole('button', { name: /new mapping/i });
    await user.click(createButton);

    expect(await screen.findByText('Create New Mapping')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/En Mantenimiento Correctivo/i)).toBeInTheDocument();
  });

  it('should create status mapping when form is submitted', async () => {
    mockedService.getAll.mockResolvedValue([]);
    mockedService.create.mockResolvedValue(
      MonthlyReportStatusFactory.create({
        rawStatus: 'New Status',
        displayStatus: 'Closed',
      })
    );

    const user = userEvent.setup();
    renderWithQueryClient(<StatusMappingsList />);

    await screen.findByText('No status mappings found');

    // Open create modal
    await user.click(screen.getByRole('button', { name: /new mapping/i }));

    // Fill form
    const rawStatusInput = screen.getByPlaceholderText(/En Mantenimiento Correctivo/i);
    const displayStatusSelect = screen.getByRole('combobox', { name: '' });

    await user.type(rawStatusInput, 'New Status');

    // Find the display status select in the modal (it's a native select)
    const selectElements = screen.getAllByRole('combobox');
    const displaySelect = selectElements.find(el => {
      const options = el.querySelectorAll('option');
      return Array.from(options).some(opt => opt.value === 'Closed');
    });

    if (displaySelect) {
      await user.selectOptions(displaySelect, 'Closed');
    }

    // Submit
    const submitButton = screen.getByRole('button', { name: /^create$/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedService.create).toHaveBeenCalledWith({
        rawStatus: 'New Status',
        displayStatus: 'Closed',
      });
    });
  });

  it('should open edit modal when clicking Edit button', async () => {
    const mockStatus = MonthlyReportStatusFactory.create({
      rawStatus: 'Test Raw Status',
      displayStatus: 'On going L2',
    });
    mockedService.getAll.mockResolvedValue([mockStatus]);

    const user = userEvent.setup();
    renderWithQueryClient(<StatusMappingsList />);

    await screen.findByText('Test Raw Status');

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(await screen.findByText('Edit Mapping')).toBeInTheDocument();

    // Check that form is pre-filled
    const rawStatusInput = screen.getByDisplayValue('Test Raw Status');
    expect(rawStatusInput).toBeInTheDocument();
  });

  it('should show delete confirmation when clicking Delete button', async () => {
    const mockStatus = MonthlyReportStatusFactory.create({
      rawStatus: 'UniqueStatusToDelete',
    });
    mockedService.getAll.mockResolvedValue([mockStatus]);

    const user = userEvent.setup();
    renderWithQueryClient(<StatusMappingsList />);

    await screen.findByText('UniqueStatusToDelete');

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(await screen.findByText('Confirm Delete')).toBeInTheDocument();
    // Check that the dialog is visible (text appears in both table and dialog)
    const statusTextElements = screen.getAllByText(/UniqueStatusToDelete/);
    expect(statusTextElements.length).toBeGreaterThanOrEqual(2);
  });

  it('should delete status mapping when confirmed', async () => {
    const mockStatus = MonthlyReportStatusFactory.create({
      id: 1,
      rawStatus: 'To Delete',
    });
    mockedService.getAll.mockResolvedValue([mockStatus]);
    mockedService.delete.mockResolvedValue(undefined);

    const user = userEvent.setup();
    renderWithQueryClient(<StatusMappingsList />);

    await screen.findByText('To Delete');

    // Open delete dialog
    await user.click(screen.getByRole('button', { name: /delete/i }));

    // Confirm delete
    const confirmButton = await screen.findByRole('button', { name: /^delete$/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockedService.delete).toHaveBeenCalledWith(1);
    });
  });

  it('should display active/inactive status badges', async () => {
    const mockStatuses = [
      MonthlyReportStatusFactory.create({ rawStatus: 'Active Status', isActive: true }),
      MonthlyReportStatusFactory.create({ rawStatus: 'Inactive Status', isActive: false }),
    ];

    mockedService.getAll.mockResolvedValue(mockStatuses);

    renderWithQueryClient(<StatusMappingsList />);

    await screen.findByText('Active Status');

    const activeBadges = screen.getAllByText('Active');
    const inactiveBadges = screen.getAllByText('Inactive');

    // There should be at least one active badge (the one in the table row)
    expect(activeBadges.length).toBeGreaterThanOrEqual(1);
    // There should be at least 2 Inactive elements: one in the filter dropdown option and one in the table badge
    expect(inactiveBadges.length).toBeGreaterThanOrEqual(2);
  });
});
