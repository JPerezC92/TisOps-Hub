import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { ParentTicketSection } from '@/modules/analytics-dashboard/components/parent-ticket-section';
import type { Application } from '@/modules/analytics-dashboard/types';

const mockApplications: Application[] = [
  { id: 1, code: 'CD', name: 'Canales Digitales', description: null, isActive: true },
];

const mockFetchData = vi.fn();

const defaultProps = {
  title: 'Distribution of Missing Scope by Parent Ticket',
  selectedApp: 'all',
  selectedMonth: '2025-01',
  isMonthlyMode: false,
  applications: mockApplications,
  fetchData: mockFetchData,
  colorScheme: 'amber' as const,
};

function createRow(overrides?: Record<string, unknown>) {
  return {
    createdDate: (overrides?.createdDate as string) ?? '2025-01-10',
    linkedRequestId: (overrides?.linkedRequestId as string) ?? 'REQ-001',
    linkedRequestIdLink: 'linkedRequestIdLink' in (overrides ?? {}) ? (overrides!.linkedRequestIdLink as string | null) : 'https://example.com/REQ-001',
    additionalInfo: (overrides?.additionalInfo as string) ?? 'Some additional info',
    totalLinkedTickets: (overrides?.totalLinkedTickets as number) ?? 5,
    linkedTicketsInMonth: (overrides?.linkedTicketsInMonth as number) ?? 3,
    requestStatus: (overrides?.requestStatus as string) ?? 'Open',
    eta: (overrides?.eta as string) ?? '2025-02-01',
  };
}

describe('ParentTicketSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state', () => {
    mockFetchData.mockReturnValue(new Promise(() => {}));
    renderWithQueryClient(<ParentTicketSection {...defaultProps} />);

    expect(screen.getByText('Distribution of Missing Scope by Parent Ticket')).toBeInTheDocument();
  });

  it('should show empty state when no data', async () => {
    mockFetchData.mockResolvedValue(null);
    renderWithQueryClient(<ParentTicketSection {...defaultProps} />);

    expect(await screen.findByText(/No missing scope incidents found/)).toBeInTheDocument();
  });

  it('should show bug empty state for bug title', async () => {
    mockFetchData.mockResolvedValue(null);
    renderWithQueryClient(
      <ParentTicketSection {...defaultProps} title="Distribution of Bugs by Parent Ticket" colorScheme="red" />,
    );

    expect(await screen.findByText(/No bug incidents found/)).toBeInTheDocument();
  });

  it('should display data in table', async () => {
    mockFetchData.mockResolvedValue({
      data: [
        createRow({ linkedRequestId: 'REQ-001', additionalInfo: 'Network issue' }),
        createRow({ linkedRequestId: 'REQ-002', additionalInfo: 'DB timeout' }),
      ],
      monthName: 'January',
      totalIncidents: 6,
    });

    renderWithQueryClient(<ParentTicketSection {...defaultProps} />);

    expect(await screen.findByText('REQ-001')).toBeInTheDocument();
    expect(screen.getByText('REQ-002')).toBeInTheDocument();
    expect(screen.getByText('Network issue')).toBeInTheDocument();
  });

  it('should show total row', async () => {
    mockFetchData.mockResolvedValue({
      data: [createRow()],
      monthName: 'January',
      totalIncidents: 42,
    });

    renderWithQueryClient(<ParentTicketSection {...defaultProps} />);

    expect(await screen.findByText('TOTAL')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should show section count in header', async () => {
    mockFetchData.mockResolvedValue({
      data: [createRow()],
      monthName: 'January',
      totalIncidents: 15,
    });

    renderWithQueryClient(<ParentTicketSection {...defaultProps} />);

    expect(await screen.findByText('(15 total in January)')).toBeInTheDocument();
  });

  it('should render linked request ID as link', async () => {
    mockFetchData.mockResolvedValue({
      data: [createRow({ linkedRequestId: 'REQ-100', linkedRequestIdLink: 'https://example.com/100' })],
      monthName: 'Jan',
      totalIncidents: 1,
    });

    renderWithQueryClient(<ParentTicketSection {...defaultProps} />);

    const link = await screen.findByText('REQ-100');
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com/100');
  });

  it('should render linked request ID as text when no link', async () => {
    mockFetchData.mockResolvedValue({
      data: [createRow({ linkedRequestId: 'REQ-200', linkedRequestIdLink: null })],
      monthName: 'Jan',
      totalIncidents: 1,
    });

    renderWithQueryClient(<ParentTicketSection {...defaultProps} />);

    const text = await screen.findByText('REQ-200');
    expect(text.closest('a')).toBeNull();
  });

  it('should render table header columns', async () => {
    mockFetchData.mockResolvedValue({
      data: [createRow()],
      monthName: 'Jan',
      totalIncidents: 1,
    });

    renderWithQueryClient(<ParentTicketSection {...defaultProps} />);

    await screen.findByText('REQ-001');
    expect(screen.getByText('Created Date')).toBeInTheDocument();
    expect(screen.getByText('Linked Request ID')).toBeInTheDocument();
    expect(screen.getByText('Additional Information')).toBeInTheDocument();
    expect(screen.getByText('Total Linked')).toBeInTheDocument();
    expect(screen.getByText('In Month')).toBeInTheDocument();
    expect(screen.getByText('Request Status')).toBeInTheDocument();
    expect(screen.getByText('ETA')).toBeInTheDocument();
  });

  it('should call fetchData with correct params', async () => {
    mockFetchData.mockResolvedValue(null);

    renderWithQueryClient(
      <ParentTicketSection {...defaultProps} selectedApp="CD" selectedMonth="2025-06" />,
    );

    await waitFor(() => {
      expect(mockFetchData).toHaveBeenCalledWith('CD', '2025-06');
    });
  });

  it('should display ETA value from API', async () => {
    mockFetchData.mockResolvedValue({
      data: [createRow({ eta: '31-Mar' })],
      monthName: 'Mar',
      totalIncidents: 1,
    });

    renderWithQueryClient(<ParentTicketSection {...defaultProps} />);

    expect(await screen.findByText('31-Mar')).toBeInTheDocument();
  });

  it('should show empty cells for unassigned rows (no linkedRequestId)', async () => {
    mockFetchData.mockResolvedValue({
      data: [
        createRow({ linkedRequestId: 'REQ-100', createdDate: '10-Jan-2025', eta: '31-Mar' }),
        createRow({ linkedRequestId: '', additionalInfo: 'To be evaluated', createdDate: '', eta: '', requestStatus: '', totalLinkedTickets: 0 }),
      ],
      monthName: 'Jan',
      totalIncidents: 5,
    });

    const { container } = renderWithQueryClient(<ParentTicketSection {...defaultProps} />);

    await screen.findByText('REQ-100');
    expect(screen.getByText('To be evaluated')).toBeInTheDocument();

    // The unassigned row should NOT show dashes for empty fields
    const rows = container.querySelectorAll('tbody tr');
    // Row 1 = normal, Row 2 = unassigned, Row 3 = TOTAL
    const unassignedRow = rows[1];
    const cells = unassignedRow.querySelectorAll('td');
    // createdDate (cell 0), linkedRequestId (cell 1) should be empty
    expect(cells[0].textContent).toBe('');
    expect(cells[1].textContent).toBe('');
  });

  it('should show filter info', async () => {
    mockFetchData.mockResolvedValue({ data: [createRow()], monthName: 'Mar', totalIncidents: 1 });

    renderWithQueryClient(
      <ParentTicketSection {...defaultProps} selectedApp="CD" selectedMonth="2025-03" />,
    );

    await screen.findByText(/Canales Digitales/);
    expect(screen.getByText(/March 2025/)).toBeInTheDocument();
  });
});
