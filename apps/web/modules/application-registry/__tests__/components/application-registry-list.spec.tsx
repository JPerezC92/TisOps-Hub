import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock, MockProxy } from 'vitest-mock-extended';
import { ApplicationRegistryList } from '@/modules/application-registry/components/application-registry-list';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { applicationRegistryService } from '@/modules/application-registry/services/application-registry.service';
import { toast } from 'sonner';
import { ApplicationFactory } from '../helpers/application.factory';

let mockedService: MockProxy<typeof applicationRegistryService>;

vi.mock('@/modules/application-registry/services/application-registry.service', () => ({
  applicationRegistryService: mock<typeof applicationRegistryService>(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ApplicationRegistryList', () => {
  beforeEach(() => {
    mockedService = applicationRegistryService as MockProxy<typeof applicationRegistryService>;
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockedService.getAllWithPatterns.mockReturnValue(new Promise(() => {}));

    renderWithQueryClient(<ApplicationRegistryList />);

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should list applications when data loads', async () => {
    const mockApps = [
      ApplicationFactory.create({ name: 'Canales Digitales', code: 'CD' }),
      ApplicationFactory.create({ name: 'Fuerza de Venta', code: 'FFVV' }),
    ];

    mockedService.getAllWithPatterns.mockResolvedValue(mockApps);

    renderWithQueryClient(<ApplicationRegistryList />);

    expect(await screen.findByText('Canales Digitales')).toBeInTheDocument();
    expect(screen.getByText('Fuerza de Venta')).toBeInTheDocument();
    expect(screen.getByText('CD')).toBeInTheDocument();
    expect(screen.getByText('FFVV')).toBeInTheDocument();
  });

  it('should show empty state when no applications', async () => {
    mockedService.getAllWithPatterns.mockResolvedValue([]);

    renderWithQueryClient(<ApplicationRegistryList />);

    expect(await screen.findByText('No applications found')).toBeInTheDocument();
  });

  it('should filter by search term', async () => {
    const mockApps = [
      ApplicationFactory.create({ name: 'Canales Digitales', code: 'CD' }),
      ApplicationFactory.create({ name: 'Fuerza de Venta', code: 'FFVV' }),
    ];

    mockedService.getAllWithPatterns.mockResolvedValue(mockApps);

    const user = userEvent.setup();
    renderWithQueryClient(<ApplicationRegistryList />);

    await screen.findByText('Canales Digitales');

    const searchInput = screen.getByPlaceholderText('Name or code...');
    await user.type(searchInput, 'Canales');

    await waitFor(() => {
      expect(screen.getByText('Canales Digitales')).toBeInTheDocument();
      expect(screen.queryByText('Fuerza de Venta')).not.toBeInTheDocument();
    });
  });

  it('should filter by status', async () => {
    const mockApps = [
      ApplicationFactory.create({ name: 'Active App', isActive: true }),
      ApplicationFactory.create({ name: 'Inactive App', isActive: false }),
    ];

    mockedService.getAllWithPatterns.mockResolvedValue(mockApps);

    const user = userEvent.setup();
    renderWithQueryClient(<ApplicationRegistryList />);

    await screen.findByText('Active App');

    const selects = screen.getAllByRole('combobox');
    const statusSelect = selects.find(s =>
      Array.from((s as HTMLSelectElement).options).some(o => o.text === 'Active')
    );

    if (statusSelect) {
      await user.selectOptions(statusSelect, 'inactive');
    }

    await waitFor(() => {
      expect(screen.getByText('Inactive App')).toBeInTheDocument();
      expect(screen.queryByText('Active App')).not.toBeInTheDocument();
    });
  });

  it('should open create modal when clicking new application button', async () => {
    mockedService.getAllWithPatterns.mockResolvedValue([]);

    const user = userEvent.setup();
    renderWithQueryClient(<ApplicationRegistryList />);

    await screen.findByText('No applications found');

    const createButton = screen.getByText('+ New Application');
    await user.click(createButton);

    expect(screen.getByText('Create New Application')).toBeInTheDocument();
  });

  it('should create application when form is submitted', async () => {
    mockedService.getAllWithPatterns.mockResolvedValue([]);
    mockedService.create.mockResolvedValue(
      ApplicationFactory.createApplication({ code: 'NEW', name: 'New App' })
    );

    const user = userEvent.setup();
    renderWithQueryClient(<ApplicationRegistryList />);

    await screen.findByText('No applications found');

    await user.click(screen.getByText('+ New Application'));

    await user.type(screen.getByPlaceholderText('e.g., FFVV'), 'NEW');
    await user.type(screen.getByPlaceholderText('e.g., Fuerza de Venta'), 'New App');

    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(mockedService.create).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'NEW', name: 'New App' })
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Application created successfully');
    });
  });

  it('should show delete confirmation when clicking delete', async () => {
    const mockApps = [
      ApplicationFactory.create({ name: 'Test App', code: 'TST' }),
    ];

    mockedService.getAllWithPatterns.mockResolvedValue(mockApps);

    const user = userEvent.setup();
    renderWithQueryClient(<ApplicationRegistryList />);

    await screen.findByText('Test App');

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this application/)).toBeInTheDocument();
  });

  it('should delete application when confirmed', async () => {
    const mockApps = [
      ApplicationFactory.create({ id: 1, name: 'Test App', code: 'TST' }),
    ];

    mockedService.getAllWithPatterns.mockResolvedValue(mockApps);
    mockedService.delete.mockResolvedValue({ message: 'Deleted' });

    const user = userEvent.setup();
    renderWithQueryClient(<ApplicationRegistryList />);

    await screen.findByText('Test App');

    await user.click(screen.getByRole('button', { name: /delete/i }));

    const confirmButton = screen.getAllByRole('button', { name: /delete/i }).find(
      btn => btn.closest('[role="alertdialog"]')
    );
    if (confirmButton) {
      await user.click(confirmButton);
    }

    await waitFor(() => {
      expect(mockedService.delete).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Application deleted successfully');
    });
  });

  it('should show error toast when create fails', async () => {
    mockedService.getAllWithPatterns.mockResolvedValue([]);
    mockedService.create.mockRejectedValue(new Error('Creation failed'));

    const user = userEvent.setup();
    renderWithQueryClient(<ApplicationRegistryList />);

    await screen.findByText('No applications found');

    await user.click(screen.getByText('+ New Application'));
    await user.type(screen.getByPlaceholderText('e.g., FFVV'), 'ERR');
    await user.type(screen.getByPlaceholderText('e.g., Fuerza de Venta'), 'Error App');
    await user.click(screen.getByRole('button', { name: /create/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Creation failed');
    });
  });
});
