import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { UnmappedRequestsModal } from '@/modules/analytics-dashboard/components/unmapped-requests-modal';
import type { UnmappedRequest } from '@/modules/analytics-dashboard/types';

const defaultProps = {
  open: true,
  onOpenChange: () => {},
  applicationName: 'Canales Digitales',
  requests: [] as UnmappedRequest[],
};

describe('UnmappedRequestsModal', () => {
  it('should show title with application name', () => {
    renderWithQueryClient(<UnmappedRequestsModal {...defaultProps} />);

    expect(screen.getByText('Unmapped Requests - Canales Digitales')).toBeInTheDocument();
  });

  it('should display request data in table', () => {
    const requests: UnmappedRequest[] = [
      { requestId: 201, rawStatus: 'unknown_status', requestIdLink: 'https://example.com/201' },
      { requestId: 202, rawStatus: 'pending_review' },
    ];
    renderWithQueryClient(<UnmappedRequestsModal {...defaultProps} requests={requests} />);

    expect(screen.getByText('201')).toBeInTheDocument();
    expect(screen.getByText('202')).toBeInTheDocument();
    expect(screen.getByText('unknown_status')).toBeInTheDocument();
    expect(screen.getByText('pending_review')).toBeInTheDocument();
  });

  it('should show table column headers', () => {
    const requests: UnmappedRequest[] = [
      { requestId: 1, rawStatus: 'test' },
    ];
    renderWithQueryClient(<UnmappedRequestsModal {...defaultProps} requests={requests} />);

    expect(screen.getByText('Request ID')).toBeInTheDocument();
    expect(screen.getByText('Raw Status')).toBeInTheDocument();
  });

  it('should show total count', () => {
    const requests: UnmappedRequest[] = [
      { requestId: 1, rawStatus: 'a' },
      { requestId: 2, rawStatus: 'b' },
      { requestId: 3, rawStatus: 'c' },
    ];
    renderWithQueryClient(<UnmappedRequestsModal {...defaultProps} requests={requests} />);

    expect(screen.getByText('Total: 3 unmapped request(s)')).toBeInTheDocument();
  });

  it('should render request ID as link when link is provided', () => {
    const requests: UnmappedRequest[] = [
      { requestId: 301, requestIdLink: 'https://example.com/301', rawStatus: 'unknown' },
    ];
    renderWithQueryClient(<UnmappedRequestsModal {...defaultProps} requests={requests} />);

    const link = screen.getByText('301');
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com/301');
  });

  it('should render request ID as text when no link', () => {
    const requests: UnmappedRequest[] = [
      { requestId: 302, rawStatus: 'unknown' },
    ];
    renderWithQueryClient(<UnmappedRequestsModal {...defaultProps} requests={requests} />);

    const text = screen.getByText('302');
    expect(text.closest('a')).toBeNull();
  });

  it('should not render content when closed', () => {
    renderWithQueryClient(
      <UnmappedRequestsModal {...defaultProps} open={false} applicationName="Hidden App" />,
    );

    expect(screen.queryByText('Unmapped Requests - Hidden App')).not.toBeInTheDocument();
  });
});
