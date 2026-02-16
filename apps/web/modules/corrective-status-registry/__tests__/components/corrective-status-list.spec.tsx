import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock, MockProxy } from 'vitest-mock-extended';
import { CorrectiveStatusList } from '@/modules/corrective-status-registry/components/corrective-status-list';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { correctiveStatusRegistryService } from '@/modules/corrective-status-registry/services/corrective-status-registry.service';
import { CorrectiveStatusFactory } from '../helpers/corrective-status.factory';

let mockedService: MockProxy<typeof correctiveStatusRegistryService>;

vi.mock('@/modules/corrective-status-registry/services/corrective-status-registry.service', () => ({
  correctiveStatusRegistryService: mock<typeof correctiveStatusRegistryService>(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CorrectiveStatusList', () => {
  beforeEach(() => {
    mockedService = correctiveStatusRegistryService as MockProxy<typeof correctiveStatusRegistryService>;
    vi.clearAllMocks();
    // Default mock for display status options
    mockedService.getDisplayStatusOptions.mockResolvedValue([
      'In Backlog',
      'Dev in Progress',
      'In Testing',
      'PRD Deployment',
    ]);
  });

  it('should display loading state initially', () => {
    mockedService.getAll.mockReturnValue(new Promise(() => {}));

    const { container } = renderWithQueryClient(<CorrectiveStatusList />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should list status mappings when data loads', async () => {
    const mockStatuses = [
      CorrectiveStatusFactory.create({ rawStatus: 'En Cola', displayStatus: 'In Backlog' }),
      CorrectiveStatusFactory.create({ rawStatus: 'En Desarrollo', displayStatus: 'Dev in Progress' }),
      CorrectiveStatusFactory.create({ rawStatus: 'En Pruebas', displayStatus: 'In Testing' }),
    ];

    mockedService.getAll.mockResolvedValue(mockStatuses);

    renderWithQueryClient(<CorrectiveStatusList />);

    expect(await screen.findByText('En Cola')).toBeInTheDocument();
    expect(screen.getByText('En Desarrollo')).toBeInTheDocument();
    expect(screen.getByText('En Pruebas')).toBeInTheDocument();
    expect(screen.getByText('In Backlog')).toBeInTheDocument();
    expect(screen.getByText('Dev in Progress')).toBeInTheDocument();
    expect(screen.getByText('In Testing')).toBeInTheDocument();
  });

  it('should show empty state when no status mappings', async () => {
    mockedService.getAll.mockResolvedValue([]);

    renderWithQueryClient(<CorrectiveStatusList />);

    expect(await screen.findByText('No status mappings found')).toBeInTheDocument();
  });

  it('should filter by search term', async () => {
    const mockStatuses = [
      CorrectiveStatusFactory.create({ rawStatus: 'En Cola de Dev', displayStatus: 'In Backlog' }),
      CorrectiveStatusFactory.create({ rawStatus: 'En Desarrollo Activo', displayStatus: 'Dev in Progress' }),
      CorrectiveStatusFactory.create({ rawStatus: 'En Pruebas QA', displayStatus: 'In Testing' }),
    ];

    mockedService.getAll.mockResolvedValue(mockStatuses);

    const user = userEvent.setup();
    renderWithQueryClient(<CorrectiveStatusList />);

    await screen.findByText('En Cola de Dev');

    const searchInput = screen.getByPlaceholderText('Search statuses...');
    await user.type(searchInput, 'Desarrollo');

    await waitFor(() => {
      expect(screen.getByText('En Desarrollo Activo')).toBeInTheDocument();
      expect(screen.queryByText('En Cola de Dev')).not.toBeInTheDocument();
      expect(screen.queryByText('En Pruebas QA')).not.toBeInTheDocument();
    });
  });

  it('should filter by status', async () => {
    const mockStatuses = [
      CorrectiveStatusFactory.create({ rawStatus: 'Active One', isActive: true }),
      CorrectiveStatusFactory.create({ rawStatus: 'Active Two', isActive: true }),
      CorrectiveStatusFactory.create({ rawStatus: 'Inactive One', isActive: false }),
    ];

    mockedService.getAll.mockResolvedValue(mockStatuses);

    const user = userEvent.setup();
    renderWithQueryClient(<CorrectiveStatusList />);

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
    renderWithQueryClient(<CorrectiveStatusList />);

    await screen.findByText('No status mappings found');

    const createButton = screen.getByRole('button', { name: /new mapping/i });
    await user.click(createButton);

    expect(await screen.findByText('Create New Mapping')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/En Cola de Desarrollo/i)).toBeInTheDocument();
  });

  it('should load display status options in create modal', async () => {
    mockedService.getAll.mockResolvedValue([]);

    const user = userEvent.setup();
    renderWithQueryClient(<CorrectiveStatusList />);

    await screen.findByText('No status mappings found');

    await user.click(screen.getByRole('button', { name: /new mapping/i }));

    await screen.findByText('Create New Mapping');

    // Check that display status options are loaded
    const selectElements = screen.getAllByRole('combobox');
    const displaySelect = selectElements.find(el => {
      const options = el.querySelectorAll('option');
      return Array.from(options).some(opt => opt.value === 'In Backlog');
    });

    expect(displaySelect).toBeTruthy();
  });

  it('should create status mapping when form is submitted', async () => {
    mockedService.getAll.mockResolvedValue([]);
    mockedService.create.mockResolvedValue(
      CorrectiveStatusFactory.create({
        rawStatus: 'New Status',
        displayStatus: 'In Backlog',
      })
    );

    const user = userEvent.setup();
    renderWithQueryClient(<CorrectiveStatusList />);

    await screen.findByText('No status mappings found');

    await user.click(screen.getByRole('button', { name: /new mapping/i }));

    const rawStatusInput = screen.getByPlaceholderText(/En Cola de Desarrollo/i);
    await user.type(rawStatusInput, 'New Status');

    const selectElements = screen.getAllByRole('combobox');
    const displaySelect = selectElements.find(el => {
      const options = el.querySelectorAll('option');
      return Array.from(options).some(opt => opt.value === 'In Backlog');
    });

    if (displaySelect) {
      await user.selectOptions(displaySelect, 'In Backlog');
    }

    const submitButton = screen.getByRole('button', { name: /^create$/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedService.create).toHaveBeenCalledWith({
        rawStatus: 'New Status',
        displayStatus: 'In Backlog',
      });
    });
  });

  it('should open edit modal when clicking Edit button', async () => {
    const mockStatus = CorrectiveStatusFactory.create({
      rawStatus: 'Test Raw Status',
      displayStatus: 'Dev in Progress',
    });
    mockedService.getAll.mockResolvedValue([mockStatus]);

    const user = userEvent.setup();
    renderWithQueryClient(<CorrectiveStatusList />);

    await screen.findByText('Test Raw Status');

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(await screen.findByText('Edit Mapping')).toBeInTheDocument();

    const rawStatusInput = screen.getByDisplayValue('Test Raw Status');
    expect(rawStatusInput).toBeInTheDocument();
  });

  it('should show delete confirmation when clicking Delete button', async () => {
    const mockStatus = CorrectiveStatusFactory.create({
      rawStatus: 'UniqueStatusToDelete',
    });
    mockedService.getAll.mockResolvedValue([mockStatus]);

    const user = userEvent.setup();
    renderWithQueryClient(<CorrectiveStatusList />);

    await screen.findByText('UniqueStatusToDelete');

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(await screen.findByText('Confirm Delete')).toBeInTheDocument();
    const statusTextElements = screen.getAllByText(/UniqueStatusToDelete/);
    expect(statusTextElements.length).toBeGreaterThanOrEqual(2);
  });

  it('should delete status mapping when confirmed', async () => {
    const mockStatus = CorrectiveStatusFactory.create({
      id: 1,
      rawStatus: 'To Delete',
    });
    mockedService.getAll.mockResolvedValue([mockStatus]);
    mockedService.delete.mockResolvedValue(undefined);

    const user = userEvent.setup();
    renderWithQueryClient(<CorrectiveStatusList />);

    await screen.findByText('To Delete');

    await user.click(screen.getByRole('button', { name: /delete/i }));

    const confirmButton = await screen.findByRole('button', { name: /^delete$/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockedService.delete).toHaveBeenCalledWith(1);
    });
  });

  it('should display active/inactive status badges', async () => {
    const mockStatuses = [
      CorrectiveStatusFactory.create({ rawStatus: 'Active Status', isActive: true }),
      CorrectiveStatusFactory.create({ rawStatus: 'Inactive Status', isActive: false }),
    ];

    mockedService.getAll.mockResolvedValue(mockStatuses);

    renderWithQueryClient(<CorrectiveStatusList />);

    await screen.findByText('Active Status');

    const activeBadges = screen.getAllByText('Active');
    const inactiveBadges = screen.getAllByText('Inactive');

    expect(activeBadges.length).toBeGreaterThanOrEqual(1);
    expect(inactiveBadges.length).toBeGreaterThanOrEqual(2);
  });
});
