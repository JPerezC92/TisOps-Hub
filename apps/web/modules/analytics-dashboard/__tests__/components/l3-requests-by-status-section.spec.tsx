import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { L3RequestsByStatusSection } from '@/modules/analytics-dashboard/components/l3-requests-by-status-section';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import type { MockProxy } from 'vitest-mock-extended';
import type { Application, L3RequestsByStatusResponse } from '@/modules/analytics-dashboard/types';

vi.mock('@/modules/analytics-dashboard/services/analytics-dashboard.service');

let mockedService: MockProxy<typeof analyticsDashboardService>;

const mockApplications: Application[] = [
  { id: 1, code: 'CD', name: 'Canales Digitales', description: null, isActive: true },
];

const defaultProps = {
  selectedApp: 'all',
  isMonthlyMode: false,
  applications: mockApplications,
};

function createRequest(overrides?: Record<string, unknown>) {
  return {
    requestId: (overrides?.requestId as string) ?? 'REQ-001',
    requestIdLink: 'requestIdLink' in (overrides ?? {}) ? (overrides!.requestIdLink as string | undefined) : 'https://example.com/REQ-001',
    createdTime: (overrides?.createdTime as string) ?? '2025-01-10',
    modulo: (overrides?.modulo as string) ?? 'Module X',
    subject: (overrides?.subject as string) ?? 'Test subject',
    priority: (overrides?.priority as string) ?? 'Alta',
    priorityEnglish: (overrides?.priorityEnglish as string) ?? 'High',
    linkedTicketsCount: (overrides?.linkedTicketsCount as number) ?? 3,
    eta: (overrides?.eta as string) ?? '2025-02-01',
  };
}

function createMockData(overrides?: Partial<L3RequestsByStatusResponse>): L3RequestsByStatusResponse {
  return {
    prdDeployment: overrides?.prdDeployment ?? [createRequest({ requestId: 'REQ-DEPLOY' })],
    inTesting: overrides?.inTesting ?? [createRequest({ requestId: 'REQ-TEST' })],
    devInProgress: overrides?.devInProgress ?? [createRequest({ requestId: 'REQ-DEV' })],
    inBacklog: overrides?.inBacklog ?? [createRequest({ requestId: 'REQ-BACKLOG' })],
  };
}

describe('L3RequestsByStatusSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedService = analyticsDashboardService as MockProxy<typeof analyticsDashboardService>;
  });

  it('should render nothing when no data', async () => {
    mockedService.getL3RequestsByStatus.mockResolvedValue(null);
    const { container } = renderWithQueryClient(<L3RequestsByStatusSection {...defaultProps} />);

    await waitFor(() => {
      expect(mockedService.getL3RequestsByStatus).toHaveBeenCalled();
    });
    // After loading, should render nothing
    await waitFor(() => {
      expect(container.querySelector('[class*="skeleton"], [data-slot="skeleton"]')).toBeNull();
    });
  });

  it('should show all 4 status section titles', async () => {
    mockedService.getL3RequestsByStatus.mockResolvedValue(createMockData());
    renderWithQueryClient(<L3RequestsByStatusSection {...defaultProps} />);

    expect(await screen.findByText('Ready to deploy')).toBeInTheDocument();
    expect(screen.getByText('In testing')).toBeInTheDocument();
    expect(screen.getByText('Dev in progress')).toBeInTheDocument();
    expect(screen.getByText('In backlog')).toBeInTheDocument();
  });

  it('should display request IDs', async () => {
    mockedService.getL3RequestsByStatus.mockResolvedValue(createMockData());
    renderWithQueryClient(<L3RequestsByStatusSection {...defaultProps} />);

    expect(await screen.findByText('REQ-DEPLOY')).toBeInTheDocument();
    expect(screen.getByText('REQ-TEST')).toBeInTheDocument();
    expect(screen.getByText('REQ-DEV')).toBeInTheDocument();
    expect(screen.getByText('REQ-BACKLOG')).toBeInTheDocument();
  });

  it('should render request ID as link when link is provided', async () => {
    mockedService.getL3RequestsByStatus.mockResolvedValue(createMockData({
      prdDeployment: [createRequest({ requestId: 'REQ-100', requestIdLink: 'https://example.com/100' })],
      inTesting: [],
      devInProgress: [],
      inBacklog: [],
    }));
    renderWithQueryClient(<L3RequestsByStatusSection {...defaultProps} />);

    const link = await screen.findByText('REQ-100');
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com/100');
  });

  it('should render request ID as text when no link', async () => {
    mockedService.getL3RequestsByStatus.mockResolvedValue(createMockData({
      prdDeployment: [createRequest({ requestId: 'REQ-200', requestIdLink: undefined })],
      inTesting: [],
      devInProgress: [],
      inBacklog: [],
    }));
    renderWithQueryClient(<L3RequestsByStatusSection {...defaultProps} />);

    const text = await screen.findByText('REQ-200');
    expect(text.closest('a')).toBeNull();
  });

  it('should show "No requests" for empty sections', async () => {
    mockedService.getL3RequestsByStatus.mockResolvedValue(createMockData({
      prdDeployment: [],
      inTesting: [],
      devInProgress: [],
      inBacklog: [],
    }));
    renderWithQueryClient(<L3RequestsByStatusSection {...defaultProps} />);

    await screen.findByText('Ready to deploy');
    const noRequests = screen.getAllByText('No requests');
    expect(noRequests.length).toBe(4);
  });

  it('should show request count per section', async () => {
    mockedService.getL3RequestsByStatus.mockResolvedValue(createMockData());
    renderWithQueryClient(<L3RequestsByStatusSection {...defaultProps} />);

    await screen.findByText('REQ-DEPLOY');
    const counts = screen.getAllByText('1');
    // Each section shows "1 request(s)" and also row number "1"
    expect(counts.length).toBeGreaterThanOrEqual(4);
  });

  it('should show table column headers', async () => {
    mockedService.getL3RequestsByStatus.mockResolvedValue(createMockData({
      prdDeployment: [createRequest()],
      inTesting: [],
      devInProgress: [],
      inBacklog: [],
    }));
    renderWithQueryClient(<L3RequestsByStatusSection {...defaultProps} />);

    await screen.findByText('REQ-001');
    expect(screen.getByText('Request ID')).toBeInTheDocument();
    expect(screen.getByText('Create Date')).toBeInTheDocument();
    expect(screen.getByText('Module')).toBeInTheDocument();
    expect(screen.getByText('Subject')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Linked Tickets')).toBeInTheDocument();
    expect(screen.getByText('ETA')).toBeInTheDocument();
  });

  it('should call getL3RequestsByStatus with correct app', async () => {
    mockedService.getL3RequestsByStatus.mockResolvedValue(null);
    renderWithQueryClient(<L3RequestsByStatusSection {...defaultProps} selectedApp="CD" />);

    await waitFor(() => {
      expect(mockedService.getL3RequestsByStatus).toHaveBeenCalledWith('CD');
    });
  });

  it('should show app filter label', async () => {
    mockedService.getL3RequestsByStatus.mockResolvedValue(createMockData());
    renderWithQueryClient(
      <L3RequestsByStatusSection {...defaultProps} selectedApp="CD" />,
    );

    const labels = await screen.findAllByText(/Canales Digitales/);
    expect(labels.length).toBeGreaterThan(0);
  });

  it('should show priority with color', async () => {
    mockedService.getL3RequestsByStatus.mockResolvedValue(createMockData({
      prdDeployment: [createRequest({ priorityEnglish: 'Critical' })],
      inTesting: [],
      devInProgress: [],
      inBacklog: [],
    }));
    renderWithQueryClient(<L3RequestsByStatusSection {...defaultProps} />);

    const priority = await screen.findByText('Critical');
    expect(priority.className).toContain('text-red-400');
  });
});
