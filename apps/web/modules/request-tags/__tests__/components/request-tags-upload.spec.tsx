import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock, MockProxy } from 'vitest-mock-extended';
import { faker } from '@faker-js/faker';
import { RequestTagsUpload } from '@/modules/request-tags/components/request-tags-upload';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { requestTagsService } from '@/modules/request-tags/services/request-tags.service';
import { toast } from 'sonner';

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

describe('RequestTagsUpload', () => {
  beforeEach(() => {
    mockedService = requestTagsService as MockProxy<typeof requestTagsService>;
    vi.clearAllMocks();
    localStorage.clear();
    mockedService.getAll.mockResolvedValue({
      tags: [],
      total: 0,
    });
  });

  it('should render upload section', async () => {
    renderWithQueryClient(<RequestTagsUpload />);

    expect(screen.getByText('Upload Request Tags Report')).toBeInTheDocument();
  });

  it('should show expected filename', async () => {
    renderWithQueryClient(<RequestTagsUpload />);

    expect(screen.getByText(/REP01 XD TAG 2025\.xlsx/)).toBeInTheDocument();
  });

  it('should upload file successfully', async () => {
    const importedCount = faker.number.int({ min: 50, max: 200 });
    const skippedCount = faker.number.int({ min: 0, max: 20 });
    const totalCount = importedCount + skippedCount;

    mockedService.upload.mockResolvedValue({
      total: totalCount,
      imported: importedCount,
      skipped: skippedCount,
    });

    const user = userEvent.setup();
    renderWithQueryClient(<RequestTagsUpload />);

    const file = new File(['test content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const fileInput = screen.getByLabelText(/browse files/i) as HTMLInputElement;
    await user.upload(fileInput, file);

    await waitFor(() => {
      const uploadButton = screen.getByRole('button', { name: /upload and parse/i });
      expect(uploadButton).not.toBeDisabled();
    });

    const uploadButton = screen.getByRole('button', { name: /upload and parse/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(mockedService.upload).toHaveBeenCalled();
      expect(mockedService.upload.mock.calls[0]?.[0]).toEqual(file);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Upload successful', {
        description: `Total: ${totalCount} | Imported: ${importedCount} | Skipped: ${skippedCount}`,
      });
    });
  });

  it('should show error toast on upload failure', async () => {
    const errorMessage = faker.lorem.sentence();
    mockedService.upload.mockRejectedValue(new Error(errorMessage));

    const user = userEvent.setup();
    renderWithQueryClient(<RequestTagsUpload />);

    const file = new File(['test content'], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    const uploadButton = await screen.findByRole('button', { name: /upload and parse/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Upload failed', {
        description: errorMessage,
      });
    });
  });

  it('should save filename to localStorage after successful upload', async () => {
    const filename = `${faker.word.noun()}-${faker.date.recent().getFullYear()}.xlsx`;

    mockedService.upload.mockResolvedValue({
      total: 100,
      imported: 95,
      skipped: 5,
    });

    const user = userEvent.setup();
    renderWithQueryClient(<RequestTagsUpload />);

    const file = new File(['test content'], filename, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    const uploadButton = await screen.findByRole('button', { name: /upload and parse/i });
    await user.click(uploadButton);

    await waitFor(() => {
      expect(localStorage.getItem('lastUploadedRequestTagsFile')).toBe(filename);
    });
  });
});
