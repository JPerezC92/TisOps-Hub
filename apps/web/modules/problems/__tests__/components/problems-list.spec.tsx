import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock, MockProxy } from 'vitest-mock-extended';
import { ProblemsList } from '@/modules/problems/components/problems-list';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { problemsService } from '@/modules/problems/services/problems.service';
import { ProblemFactory } from '../helpers/problem.factory';

let mockedService: MockProxy<typeof problemsService>;

vi.mock('@/modules/problems/services/problems.service', () => ({
  problemsService: mock<typeof problemsService>(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ProblemsList', () => {
  beforeEach(() => {
    mockedService = problemsService as MockProxy<typeof problemsService>;
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    mockedService.getAll.mockReturnValue(new Promise(() => {}));

    renderWithQueryClient(<ProblemsList />);

    expect(screen.getByText('Problem Records')).toBeInTheDocument();
  });

  it('should list problems when data loads', async () => {
    const mockProblems = [
      ProblemFactory.createProblem({ requestId: 10001, subject: 'Server crash', aplicativos: 'CD' }),
      ProblemFactory.createProblem({ requestId: 10002, subject: 'Memory leak', aplicativos: 'FFVV' }),
      ProblemFactory.createProblem({ requestId: 10003, subject: 'Timeout error', aplicativos: 'SB' }),
    ];

    mockedService.getAll.mockResolvedValue({ data: mockProblems, total: 3 });

    renderWithQueryClient(<ProblemsList />);

    expect(await screen.findByText('Server crash')).toBeInTheDocument();
    expect(screen.getByText('Memory leak')).toBeInTheDocument();
    expect(screen.getByText('Timeout error')).toBeInTheDocument();
  });

  it('should filter by search term', async () => {
    const mockProblems = [
      ProblemFactory.createProblem({ requestId: 10001, subject: 'Server crash in CD' }),
      ProblemFactory.createProblem({ requestId: 10002, subject: 'Memory leak in FFVV' }),
      ProblemFactory.createProblem({ requestId: 10003, subject: 'Timeout error in SB' }),
    ];

    mockedService.getAll.mockResolvedValue({ data: mockProblems, total: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<ProblemsList />);

    await screen.findByText('Server crash in CD');

    const searchInput = screen.getByPlaceholderText('Subject or Request ID...');
    await user.type(searchInput, 'Server');

    await waitFor(() => {
      expect(screen.getByText('Server crash in CD')).toBeInTheDocument();
      expect(screen.queryByText('Memory leak in FFVV')).not.toBeInTheDocument();
      expect(screen.queryByText('Timeout error in SB')).not.toBeInTheDocument();
    });
  });

  it('should show delete confirmation dialog when clear data is clicked', async () => {
    const mockProblems = [
      ProblemFactory.createProblem({ requestId: 20001, subject: 'Delete dialog test 1' }),
      ProblemFactory.createProblem({ requestId: 20002, subject: 'Delete dialog test 2' }),
      ProblemFactory.createProblem({ requestId: 20003, subject: 'Delete dialog test 3' }),
    ];
    mockedService.getAll.mockResolvedValue({ data: mockProblems, total: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<ProblemsList />);

    await screen.findByText('Delete dialog test 1');

    const clearButton = screen.getByRole('button', { name: /clear all data/i });
    await user.click(clearButton);

    expect(await screen.findByText('Delete All Problems')).toBeInTheDocument();
  });

  it('should close delete dialog when Cancel is clicked', async () => {
    const mockProblems = [
      ProblemFactory.createProblem({ requestId: 30001, subject: 'Cancel test 1' }),
      ProblemFactory.createProblem({ requestId: 30002, subject: 'Cancel test 2' }),
      ProblemFactory.createProblem({ requestId: 30003, subject: 'Cancel test 3' }),
    ];
    mockedService.getAll.mockResolvedValue({ data: mockProblems, total: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<ProblemsList />);

    await screen.findByText('Cancel test 1');

    const clearButton = screen.getByRole('button', { name: /clear all data/i });
    await user.click(clearButton);

    const cancelButton = await screen.findByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByText('Delete All Problems')).not.toBeInTheDocument();
    });
  });

  it('should call deleteAll when delete is confirmed', async () => {
    const mockProblems = [
      ProblemFactory.createProblem({ requestId: 40001, subject: 'Confirm test 1' }),
      ProblemFactory.createProblem({ requestId: 40002, subject: 'Confirm test 2' }),
      ProblemFactory.createProblem({ requestId: 40003, subject: 'Confirm test 3' }),
    ];
    mockedService.getAll.mockResolvedValue({ data: mockProblems, total: 3 });
    mockedService.deleteAll.mockResolvedValue({ message: 'All deleted', deleted: 3 });

    const user = userEvent.setup();
    renderWithQueryClient(<ProblemsList />);

    await screen.findByText('Confirm test 1');

    const clearButton = screen.getByRole('button', { name: /clear all data/i });
    await user.click(clearButton);

    const deleteButton = await screen.findByRole('button', { name: /delete all/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockedService.deleteAll).toHaveBeenCalled();
    });
  });

  it('should display stats grid', async () => {
    const mockProblems = [
      ProblemFactory.createProblem({ subject: 'Stats test 1', aplicativos: 'CD', createdBy: 'User A', planesDeAccion: 'Plan 1' }),
      ProblemFactory.createProblem({ subject: 'Stats test 2', aplicativos: 'FFVV', createdBy: 'User B', planesDeAccion: 'No asignado' }),
      ProblemFactory.createProblem({ subject: 'Stats test 3', aplicativos: 'CD', createdBy: 'User A', planesDeAccion: 'Plan 2' }),
    ];

    mockedService.getAll.mockResolvedValue({ data: mockProblems, total: 3 });

    renderWithQueryClient(<ProblemsList />);

    await screen.findByText('Stats test 1');

    expect(screen.getByText('Total Problems')).toBeInTheDocument();
    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(screen.getByText('Creators')).toBeInTheDocument();
    expect(screen.getByText('With Action Plans')).toBeInTheDocument();
  });
});
