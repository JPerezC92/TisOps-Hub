import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { UnassignedRecurrencyModal } from '@/modules/analytics-dashboard/components/unassigned-recurrency-modal';
import type { UnassignedRecurrencyRequest } from '@/modules/analytics-dashboard/types';

const defaultProps = {
  open: true,
  onOpenChange: () => {},
  categoryName: 'Network Issues',
  requests: [] as UnassignedRecurrencyRequest[],
};

describe('UnassignedRecurrencyModal', () => {
  it('should show title with category name', () => {
    renderWithQueryClient(<UnassignedRecurrencyModal {...defaultProps} />);

    expect(screen.getByText('Unassigned Recurrency - Network Issues')).toBeInTheDocument();
  });

  it('should display request data in table', () => {
    const requests: UnassignedRecurrencyRequest[] = [
      { requestId: 401, rawRecurrency: 'unknown_rec', requestIdLink: 'https://example.com/401' },
      { requestId: 402, rawRecurrency: 'pending_assignment' },
    ];
    renderWithQueryClient(<UnassignedRecurrencyModal {...defaultProps} requests={requests} />);

    expect(screen.getByText('401')).toBeInTheDocument();
    expect(screen.getByText('402')).toBeInTheDocument();
    expect(screen.getByText('unknown_rec')).toBeInTheDocument();
    expect(screen.getByText('pending_assignment')).toBeInTheDocument();
  });

  it('should show table column headers', () => {
    const requests: UnassignedRecurrencyRequest[] = [
      { requestId: 1, rawRecurrency: 'test' },
    ];
    renderWithQueryClient(<UnassignedRecurrencyModal {...defaultProps} requests={requests} />);

    expect(screen.getByText('Request ID')).toBeInTheDocument();
    expect(screen.getByText('Raw Recurrency')).toBeInTheDocument();
  });

  it('should show total count', () => {
    const requests: UnassignedRecurrencyRequest[] = [
      { requestId: 1, rawRecurrency: 'a' },
      { requestId: 2, rawRecurrency: 'b' },
    ];
    renderWithQueryClient(<UnassignedRecurrencyModal {...defaultProps} requests={requests} />);

    expect(screen.getByText('Total: 2 unassigned request(s)')).toBeInTheDocument();
  });

  it('should render request ID as link when link is provided', () => {
    const requests: UnassignedRecurrencyRequest[] = [
      { requestId: 501, requestIdLink: 'https://example.com/501', rawRecurrency: 'unknown' },
    ];
    renderWithQueryClient(<UnassignedRecurrencyModal {...defaultProps} requests={requests} />);

    const link = screen.getByText('501');
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com/501');
  });

  it('should render request ID as text when no link', () => {
    const requests: UnassignedRecurrencyRequest[] = [
      { requestId: 502, rawRecurrency: 'unknown' },
    ];
    renderWithQueryClient(<UnassignedRecurrencyModal {...defaultProps} requests={requests} />);

    const text = screen.getByText('502');
    expect(text.closest('a')).toBeNull();
  });

  it('should not render content when closed', () => {
    renderWithQueryClient(
      <UnassignedRecurrencyModal {...defaultProps} open={false} categoryName="Hidden" />,
    );

    expect(screen.queryByText('Unassigned Recurrency - Hidden')).not.toBeInTheDocument();
  });
});
