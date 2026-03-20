import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { RequestIdsModal } from '@/modules/analytics-dashboard/components/request-ids-modal';
import type { RequestIdWithLink } from '@/modules/analytics-dashboard/types';

const defaultProps = {
  open: true,
  onOpenChange: () => {},
  title: 'Test Group',
  requestIds: [] as RequestIdWithLink[],
};

describe('RequestIdsModal', () => {
  it('should show title with group name', () => {
    renderWithQueryClient(<RequestIdsModal {...defaultProps} title="Parent-001" />);

    expect(screen.getByText('Request IDs - Parent-001')).toBeInTheDocument();
  });

  it('should display request IDs', () => {
    const requestIds: RequestIdWithLink[] = [
      { requestId: 101 },
      { requestId: 102 },
      { requestId: 103 },
    ];
    renderWithQueryClient(<RequestIdsModal {...defaultProps} requestIds={requestIds} />);

    expect(screen.getByText('101')).toBeInTheDocument();
    expect(screen.getByText('102')).toBeInTheDocument();
    expect(screen.getByText('103')).toBeInTheDocument();
  });

  it('should show total count', () => {
    const requestIds: RequestIdWithLink[] = [
      { requestId: 1 },
      { requestId: 2 },
    ];
    renderWithQueryClient(<RequestIdsModal {...defaultProps} requestIds={requestIds} />);

    expect(screen.getByText('Total: 2 request(s)')).toBeInTheDocument();
  });

  it('should render request ID as link when link is provided', () => {
    const requestIds: RequestIdWithLink[] = [
      { requestId: 501, requestIdLink: 'https://example.com/501' },
    ];
    renderWithQueryClient(<RequestIdsModal {...defaultProps} requestIds={requestIds} />);

    const link = screen.getByText('501');
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com/501');
  });

  it('should render request ID as text when no link', () => {
    const requestIds: RequestIdWithLink[] = [
      { requestId: 502 },
    ];
    renderWithQueryClient(<RequestIdsModal {...defaultProps} requestIds={requestIds} />);

    const text = screen.getByText('502');
    expect(text.closest('a')).toBeNull();
  });

  it('should not render content when closed', () => {
    renderWithQueryClient(
      <RequestIdsModal {...defaultProps} open={false} title="Hidden" />,
    );

    expect(screen.queryByText('Request IDs - Hidden')).not.toBeInTheDocument();
  });

  it('should show empty state with zero count', () => {
    renderWithQueryClient(<RequestIdsModal {...defaultProps} requestIds={[]} />);

    expect(screen.getByText('Total: 0 request(s)')).toBeInTheDocument();
  });
});
