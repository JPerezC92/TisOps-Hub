import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock, MockProxy } from 'vitest-mock-extended';
import { RequestTagsList } from '@/modules/request-tags/components/request-tags-list';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { requestTagsService } from '@/modules/request-tags/services/request-tags.service';
import { RequestTagFactory } from '../helpers/request-tag.factory';

let mockedService: MockProxy<typeof requestTagsService>;

vi.mock('@/modules/request-tags/services/request-tags.service', () => ({
  requestTagsService: mock<typeof requestTagsService>(),
}));

describe('RequestTagsList', () => {
  beforeEach(() => {
    mockedService = requestTagsService as MockProxy<typeof requestTagsService>;
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockedService.getAll.mockReturnValue(new Promise(() => {}));

    renderWithQueryClient(<RequestTagsList />);

    expect(screen.getByText('Loading tags...')).toBeInTheDocument();
  });

  it('should list tags when data loads', async () => {
    const mockTags = [
      RequestTagFactory.create({ technician: 'John Doe' }),
      RequestTagFactory.create({ technician: 'Jane Smith' }),
      RequestTagFactory.create({ technician: 'Bob Wilson' }),
    ];

    mockedService.getAll.mockResolvedValue({
      tags: mockTags,
      total: mockTags.length,
    });

    renderWithQueryClient(<RequestTagsList />);

    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
  });

  it('should show empty state when no tags', async () => {
    mockedService.getAll.mockResolvedValue({
      tags: [],
      total: 0,
    });

    renderWithQueryClient(<RequestTagsList />);

    expect(await screen.findByText('No tags found')).toBeInTheDocument();
  });

  it('should filter by search term', async () => {
    const mockTags = [
      RequestTagFactory.create({ technician: 'John Doe', modulo: 'Finanzas' }),
      RequestTagFactory.create({ technician: 'Jane Smith', modulo: 'Ventas' }),
      RequestTagFactory.create({ technician: 'Bob Wilson', modulo: 'Operaciones' }),
    ];

    mockedService.getAll.mockResolvedValue({
      tags: mockTags,
      total: mockTags.length,
    });

    const user = userEvent.setup();
    renderWithQueryClient(<RequestTagsList />);

    await screen.findByText('John Doe');

    const searchInput = screen.getByPlaceholderText('Request ID, Technician, Module...');
    await user.type(searchInput, 'John');

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    });
  });

  it('should filter by module', async () => {
    const mockTags = [
      RequestTagFactory.create({ technician: 'John Doe', modulo: 'Finanzas' }),
      RequestTagFactory.create({ technician: 'Jane Smith', modulo: 'Ventas' }),
      RequestTagFactory.create({ technician: 'Bob Wilson', modulo: 'Finanzas' }),
    ];

    mockedService.getAll.mockResolvedValue({
      tags: mockTags,
      total: mockTags.length,
    });

    const user = userEvent.setup();
    renderWithQueryClient(<RequestTagsList />);

    await screen.findByText('John Doe');

    const selects = screen.getAllByRole('combobox');
    const moduleSelect = selects.find(s =>
      Array.from((s as HTMLSelectElement).options).some(o => o.text === 'All Modules')
    );

    if (moduleSelect) {
      await user.selectOptions(moduleSelect, 'Ventas');
    }

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    });
  });

  it('should filter by categorization', async () => {
    const mockTags = [
      RequestTagFactory.create({ technician: 'John Doe', categorizacion: 'Bug' }),
      RequestTagFactory.create({ technician: 'Jane Smith', categorizacion: 'No asignado' }),
      RequestTagFactory.create({ technician: 'Bob Wilson', categorizacion: 'Feature' }),
    ];

    mockedService.getAll.mockResolvedValue({
      tags: mockTags,
      total: mockTags.length,
    });

    const user = userEvent.setup();
    renderWithQueryClient(<RequestTagsList />);

    await screen.findByText('John Doe');

    const selects = screen.getAllByRole('combobox');
    const catSelect = selects.find(s =>
      Array.from((s as HTMLSelectElement).options).some(o => o.text === 'All Categories')
    );

    if (catSelect) {
      await user.selectOptions(catSelect, 'No asignado');
    }

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    });
  });
});
