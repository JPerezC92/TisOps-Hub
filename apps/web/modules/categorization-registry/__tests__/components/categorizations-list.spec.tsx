import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock, MockProxy } from 'vitest-mock-extended';
import { CategorizationsList } from '@/modules/categorization-registry/components/categorizations-list';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { categorizationRegistryService } from '@/modules/categorization-registry/services/categorization-registry.service';
import { CategorizationFactory } from '../helpers/categorization.factory';

let mockedService: MockProxy<typeof categorizationRegistryService>;

vi.mock('@/modules/categorization-registry/services/categorization-registry.service', () => ({
  categorizationRegistryService: mock<typeof categorizationRegistryService>(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CategorizationsList', () => {
  beforeEach(() => {
    mockedService = categorizationRegistryService as MockProxy<typeof categorizationRegistryService>;
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockedService.getAll.mockReturnValue(new Promise(() => {}));

    const { container } = renderWithQueryClient(<CategorizationsList />);

    // Check for the loading spinner
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should list categorizations when data loads', async () => {
    const mockCategorizations = [
      CategorizationFactory.create({ sourceValue: 'Source A', displayValue: 'Display A' }),
      CategorizationFactory.create({ sourceValue: 'Source B', displayValue: 'Display B' }),
      CategorizationFactory.create({ sourceValue: 'Source C', displayValue: 'Display C' }),
    ];

    mockedService.getAll.mockResolvedValue(mockCategorizations);

    renderWithQueryClient(<CategorizationsList />);

    expect(await screen.findByText('Source A')).toBeInTheDocument();
    expect(screen.getByText('Source B')).toBeInTheDocument();
    expect(screen.getByText('Source C')).toBeInTheDocument();
    expect(screen.getByText('Display A')).toBeInTheDocument();
    expect(screen.getByText('Display B')).toBeInTheDocument();
    expect(screen.getByText('Display C')).toBeInTheDocument();
  });

  it('should show empty state when no categorizations', async () => {
    mockedService.getAll.mockResolvedValue([]);

    renderWithQueryClient(<CategorizationsList />);

    expect(await screen.findByText('No categorization mappings found')).toBeInTheDocument();
  });

  it('should filter by search term', async () => {
    const mockCategorizations = [
      CategorizationFactory.create({ sourceValue: 'Error Bug', displayValue: 'Bug' }),
      CategorizationFactory.create({ sourceValue: 'Feature Request', displayValue: 'Feature' }),
      CategorizationFactory.create({ sourceValue: 'Support Ticket', displayValue: 'Support' }),
    ];

    mockedService.getAll.mockResolvedValue(mockCategorizations);

    const user = userEvent.setup();
    renderWithQueryClient(<CategorizationsList />);

    await screen.findByText('Error Bug');

    const searchInput = screen.getByPlaceholderText('Search categorizations...');
    await user.type(searchInput, 'Bug');

    await waitFor(() => {
      expect(screen.getByText('Error Bug')).toBeInTheDocument();
      expect(screen.queryByText('Feature Request')).not.toBeInTheDocument();
      expect(screen.queryByText('Support Ticket')).not.toBeInTheDocument();
    });
  });

  it('should filter by status', async () => {
    const mockCategorizations = [
      CategorizationFactory.create({ sourceValue: 'Active One', isActive: true }),
      CategorizationFactory.create({ sourceValue: 'Active Two', isActive: true }),
      CategorizationFactory.create({ sourceValue: 'Inactive One', isActive: false }),
    ];

    mockedService.getAll.mockResolvedValue(mockCategorizations);

    const user = userEvent.setup();
    renderWithQueryClient(<CategorizationsList />);

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
    renderWithQueryClient(<CategorizationsList />);

    await screen.findByText('No categorization mappings found');

    const createButton = screen.getByRole('button', { name: /new mapping/i });
    await user.click(createButton);

    expect(await screen.findByText('Create New Mapping')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Error de codificación/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Bugs/i)).toBeInTheDocument();
  });

  it('should create categorization when form is submitted', async () => {
    mockedService.getAll.mockResolvedValue([]);
    mockedService.create.mockResolvedValue(
      CategorizationFactory.create({
        sourceValue: 'New Source',
        displayValue: 'New Display',
      })
    );

    const user = userEvent.setup();
    renderWithQueryClient(<CategorizationsList />);

    await screen.findByText('No categorization mappings found');

    // Open create modal
    await user.click(screen.getByRole('button', { name: /new mapping/i }));

    // Fill form
    const sourceInput = screen.getByPlaceholderText(/Error de codificación/i);
    const displayInput = screen.getByPlaceholderText(/Bugs/i);

    await user.type(sourceInput, 'New Source');
    await user.type(displayInput, 'New Display');

    // Submit
    const submitButton = screen.getByRole('button', { name: /^create$/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedService.create).toHaveBeenCalledWith({
        sourceValue: 'New Source',
        displayValue: 'New Display',
      });
    });
  });

  it('should open edit modal when clicking Edit button', async () => {
    const mockCategorization = CategorizationFactory.create({
      sourceValue: 'Test Source',
      displayValue: 'Test Display',
    });
    mockedService.getAll.mockResolvedValue([mockCategorization]);

    const user = userEvent.setup();
    renderWithQueryClient(<CategorizationsList />);

    await screen.findByText('Test Source');

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(await screen.findByText('Edit Mapping')).toBeInTheDocument();

    // Check that form is pre-filled
    const sourceInput = screen.getByDisplayValue('Test Source');
    const displayInput = screen.getByDisplayValue('Test Display');
    expect(sourceInput).toBeInTheDocument();
    expect(displayInput).toBeInTheDocument();
  });

  it('should show delete confirmation when clicking Delete button', async () => {
    const mockCategorization = CategorizationFactory.create({
      sourceValue: 'UniqueSourceToDelete',
    });
    mockedService.getAll.mockResolvedValue([mockCategorization]);

    const user = userEvent.setup();
    renderWithQueryClient(<CategorizationsList />);

    await screen.findByText('UniqueSourceToDelete');

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(await screen.findByText('Confirm Delete')).toBeInTheDocument();
    // Check that the dialog is visible (text appears in both table and dialog)
    const sourceTextElements = screen.getAllByText(/UniqueSourceToDelete/);
    expect(sourceTextElements.length).toBeGreaterThanOrEqual(2);
  });

  it('should delete categorization when confirmed', async () => {
    const mockCategorization = CategorizationFactory.create({
      id: 1,
      sourceValue: 'To Delete',
    });
    mockedService.getAll.mockResolvedValue([mockCategorization]);
    mockedService.delete.mockResolvedValue(undefined);

    const user = userEvent.setup();
    renderWithQueryClient(<CategorizationsList />);

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
    const mockCategorizations = [
      CategorizationFactory.create({ sourceValue: 'Active', isActive: true }),
      CategorizationFactory.create({ sourceValue: 'Inactive', isActive: false }),
    ];

    mockedService.getAll.mockResolvedValue(mockCategorizations);

    renderWithQueryClient(<CategorizationsList />);

    await screen.findByText('Active');

    const activeBadges = screen.getAllByText('Active');
    const inactiveBadge = screen.getByText('Inactive');

    expect(activeBadges.length).toBeGreaterThanOrEqual(1);
    expect(inactiveBadge).toBeInTheDocument();
  });
});
