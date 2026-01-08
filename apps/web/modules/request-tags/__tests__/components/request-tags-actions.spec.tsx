import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock, MockProxy } from 'vitest-mock-extended';
import { RequestTagsActions } from '@/modules/request-tags/components/request-tags-actions';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { requestTagsService } from '@/modules/request-tags/services/request-tags.service';
import { toast } from 'sonner';
import { RequestTagFactory } from '../helpers/request-tag.factory';

let mockedService: MockProxy<typeof requestTagsService>;

vi.mock('@/modules/request-tags/services/request-tags.service', () => ({
  requestTagsService: mock<typeof requestTagsService>(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('RequestTagsActions', () => {
  beforeEach(() => {
    mockedService = requestTagsService as MockProxy<typeof requestTagsService>;
    vi.clearAllMocks();
  });

  it('should display stats when data loads', async () => {
    const mockTags = RequestTagFactory.createMany(3);

    mockedService.getAll.mockResolvedValue({
      tags: mockTags,
      total: mockTags.length,
    });

    renderWithQueryClient(<RequestTagsActions />);

    expect(await screen.findByText('3')).toBeInTheDocument();
    expect(screen.getByText('TOTAL TAGS')).toBeInTheDocument();
    expect(screen.getByText('CATEGORIZED')).toBeInTheDocument();
    expect(screen.getByText('WITH JIRA')).toBeInTheDocument();
    expect(screen.getByText('LINKED')).toBeInTheDocument();
  });

  it('should calculate stats correctly', async () => {
    const mockTags = [
      RequestTagFactory.create({ categorizacion: 'Bug', jira: 'JIRA-123', linkedRequestId: 'REQ-002' }),
      RequestTagFactory.create({ categorizacion: 'No asignado', jira: 'No asignado', linkedRequestId: 'No asignado' }),
      RequestTagFactory.create({ categorizacion: 'Feature', jira: 'JIRA-456', linkedRequestId: 'REQ-001' }),
    ];

    mockedService.getAll.mockResolvedValue({
      tags: mockTags,
      total: mockTags.length,
    });

    renderWithQueryClient(<RequestTagsActions />);

    expect(await screen.findByText('3')).toBeInTheDocument();
    // 2 categorized, 2 with jira, 2 linked
    const percentageStats = screen.getAllByText('2 (67%)');
    expect(percentageStats).toHaveLength(3);
  });

  it('should show delete button when tags exist', async () => {
    const mockTags = RequestTagFactory.createMany(5);

    mockedService.getAll.mockResolvedValue({
      tags: mockTags,
      total: mockTags.length,
    });

    renderWithQueryClient(<RequestTagsActions />);

    expect(await screen.findByRole('button', { name: /clear all data/i })).toBeInTheDocument();
  });

  it('should not show delete button when no tags', async () => {
    mockedService.getAll.mockResolvedValue({
      tags: [],
      total: 0,
    });

    renderWithQueryClient(<RequestTagsActions />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /clear all data/i })).not.toBeInTheDocument();
  });

  it('should show confirmation dialog when delete is clicked', async () => {
    const mockTags = RequestTagFactory.createMany(3);

    mockedService.getAll.mockResolvedValue({
      tags: mockTags,
      total: mockTags.length,
    });

    const user = userEvent.setup();
    renderWithQueryClient(<RequestTagsActions />);

    const deleteButton = await screen.findByRole('button', { name: /clear all data/i });
    await user.click(deleteButton);

    expect(screen.getByText('Delete all request tags?')).toBeInTheDocument();
    expect(screen.getByText(/This will permanently delete all/)).toBeInTheDocument();
  });

  it('should delete all tags when confirmed', async () => {
    const mockTags = RequestTagFactory.createMany(3);

    mockedService.getAll.mockResolvedValue({
      tags: mockTags,
      total: mockTags.length,
    });

    mockedService.deleteAll.mockResolvedValue({
      deleted: 3,
    });

    const user = userEvent.setup();
    renderWithQueryClient(<RequestTagsActions />);

    const deleteButton = await screen.findByRole('button', { name: /clear all data/i });
    await user.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: /delete all/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockedService.deleteAll).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Successfully deleted 3 records');
    });
  });

  it('should show error toast when delete fails', async () => {
    const mockTags = RequestTagFactory.createMany(3);

    mockedService.getAll.mockResolvedValue({
      tags: mockTags,
      total: mockTags.length,
    });

    mockedService.deleteAll.mockRejectedValue(new Error('Delete failed'));

    const user = userEvent.setup();
    renderWithQueryClient(<RequestTagsActions />);

    const deleteButton = await screen.findByRole('button', { name: /clear all data/i });
    await user.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: /delete all/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to delete records', {
        description: 'Delete failed',
      });
    });
  });

  it('should cancel delete when cancel is clicked', async () => {
    const mockTags = RequestTagFactory.createMany(3);

    mockedService.getAll.mockResolvedValue({
      tags: mockTags,
      total: mockTags.length,
    });

    const user = userEvent.setup();
    renderWithQueryClient(<RequestTagsActions />);

    const deleteButton = await screen.findByRole('button', { name: /clear all data/i });
    await user.click(deleteButton);

    expect(screen.getByText('Delete all request tags?')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Delete all request tags?')).not.toBeInTheDocument();
    });

    expect(mockedService.deleteAll).not.toHaveBeenCalled();
  });
});
