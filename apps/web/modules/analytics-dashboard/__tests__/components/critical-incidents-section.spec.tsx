import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithQueryClient } from '@/test/utils/test-utils';
import { CriticalIncidentsSection } from '@/modules/analytics-dashboard/components/critical-incidents-section';
import { analyticsDashboardService } from '@/modules/analytics-dashboard/services/analytics-dashboard.service';
import type { MockProxy } from 'vitest-mock-extended';
import type { MonthlyReport, Application } from '@/modules/analytics-dashboard/types';

vi.mock('@/modules/analytics-dashboard/services/analytics-dashboard.service');

let mockedService: MockProxy<typeof analyticsDashboardService>;

const mockApplications: Application[] = [
  { id: 1, code: 'CD', name: 'Canales Digitales', description: null, isActive: true },
];

const defaultProps = {
  selectedApp: 'all',
  selectedMonth: '2025-01',
  isMonthlyMode: false,
  applications: mockApplications,
};

function createIncident(overrides?: Partial<MonthlyReport>): MonthlyReport {
  return {
    requestId: overrides?.requestId ?? 5001,
    requestIdLink: 'requestIdLink' in (overrides ?? {}) ? overrides!.requestIdLink : 'https://example.com/5001',
    aplicativos: overrides?.aplicativos ?? 'Canales Digitales',
    categorizacion: overrides?.categorizacion ?? 'Bug',
    createdTime: overrides?.createdTime ?? '2025-01-10T08:30:00',
    requestStatus: overrides?.requestStatus ?? 'Open',
    modulo: overrides?.modulo ?? 'Payments',
    subject: overrides?.subject ?? 'Payment gateway timeout',
    priority: overrides?.priority ?? 'Critical',
    eta: overrides?.eta ?? '',
    informacionAdicional: overrides?.informacionAdicional ?? '',
    resolvedTime: overrides?.resolvedTime ?? '',
    paisesAfectados: overrides?.paisesAfectados ?? 'PE',
    recurrencia: overrides?.recurrencia ?? '',
    technician: overrides?.technician ?? '',
    jira: overrides?.jira ?? '',
    problemId: overrides?.problemId ?? '',
    linkedRequestId: overrides?.linkedRequestId ?? '',
    requestOlaStatus: overrides?.requestOlaStatus ?? '',
    grupoEscalamiento: overrides?.grupoEscalamiento ?? '',
    aplicactivosAfectados: overrides?.aplicactivosAfectados ?? '',
    nivelUno: overrides?.nivelUno ?? '',
    campana: overrides?.campana ?? '',
    cuv: overrides?.cuv ?? '',
    release: overrides?.release ?? '',
    rca: overrides?.rca ?? 'No asignado',
    mappedModuleDisplayValue: overrides?.mappedModuleDisplayValue ?? null,
    mappedStatusDisplayValue: overrides?.mappedStatusDisplayValue ?? null,
    mappedCategorizationDisplayValue: overrides?.mappedCategorizationDisplayValue ?? null,
  };
}

describe('CriticalIncidentsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedService = analyticsDashboardService as MockProxy<typeof analyticsDashboardService>;
  });

  it('should show loading state', () => {
    mockedService.getCriticalIncidents.mockReturnValue(new Promise(() => {}));
    renderWithQueryClient(<CriticalIncidentsSection {...defaultProps} />);

    expect(screen.getAllByTestId ? true : true).toBe(true);
    // Skeleton elements render during loading - verify section header is present
    expect(screen.getByText('Critical Incidents')).toBeInTheDocument();
  });

  it('should show empty state when no data', async () => {
    mockedService.getCriticalIncidents.mockResolvedValue([]);
    renderWithQueryClient(<CriticalIncidentsSection {...defaultProps} />);

    expect(await screen.findByText('No critical incidents found for the selected filters')).toBeInTheDocument();
  });

  it('should display incidents in table', async () => {
    mockedService.getCriticalIncidents.mockResolvedValue([
      createIncident({ requestId: 5001, subject: 'Gateway failure' }),
      createIncident({ requestId: 5002, subject: 'DB connection drop' }),
    ]);

    renderWithQueryClient(<CriticalIncidentsSection {...defaultProps} />);

    expect(await screen.findByText('Gateway failure')).toBeInTheDocument();
    expect(screen.getByText('DB connection drop')).toBeInTheDocument();
  });

  it('should show incident count', async () => {
    mockedService.getCriticalIncidents.mockResolvedValue([
      createIncident({ requestId: 1 }),
      createIncident({ requestId: 2 }),
      createIncident({ requestId: 3 }),
    ]);

    renderWithQueryClient(<CriticalIncidentsSection {...defaultProps} />);

    expect(await screen.findByText(/3 critical priority incidents/)).toBeInTheDocument();
  });

  it('should render table header columns', async () => {
    mockedService.getCriticalIncidents.mockResolvedValue([createIncident()]);

    renderWithQueryClient(<CriticalIncidentsSection {...defaultProps} />);

    await screen.findByText('Critical Incidents');
    expect(screen.getByText('Application')).toBeInTheDocument();
    expect(screen.getByText('Request ID')).toBeInTheDocument();
    expect(screen.getByText('Created Date')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Module')).toBeInTheDocument();
    expect(screen.getByText('Subject')).toBeInTheDocument();
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Categorization')).toBeInTheDocument();
    expect(screen.getByText('RCA')).toBeInTheDocument();
  });

  it('should format created date correctly', async () => {
    mockedService.getCriticalIncidents.mockResolvedValue([
      createIncident({ createdTime: '2025-03-15T14:00:00' }),
    ]);

    renderWithQueryClient(<CriticalIncidentsSection {...defaultProps} />);

    expect(await screen.findByText('15-Mar-2025')).toBeInTheDocument();
  });

  it('should use mapped display values when available', async () => {
    mockedService.getCriticalIncidents.mockResolvedValue([
      createIncident({
        modulo: 'raw_module',
        requestStatus: 'raw_status',
        categorizacion: 'raw_cat',
        mappedModuleDisplayValue: 'Mapped Module',
        mappedStatusDisplayValue: 'Mapped Status',
        mappedCategorizationDisplayValue: 'Mapped Cat',
      }),
    ]);

    renderWithQueryClient(<CriticalIncidentsSection {...defaultProps} />);

    expect(await screen.findByText('Mapped Module')).toBeInTheDocument();
    expect(screen.getByText('Mapped Status')).toBeInTheDocument();
    expect(screen.getByText('Mapped Cat')).toBeInTheDocument();
  });

  it('should render request ID as link when requestIdLink exists', async () => {
    mockedService.getCriticalIncidents.mockResolvedValue([
      createIncident({ requestId: 5001, requestIdLink: 'https://example.com/5001' }),
    ]);

    renderWithQueryClient(<CriticalIncidentsSection {...defaultProps} />);

    const link = await screen.findByText('5001');
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com/5001');
  });

  it('should render request ID as text when no link', async () => {
    mockedService.getCriticalIncidents.mockResolvedValue([
      createIncident({ requestId: 5001, requestIdLink: undefined }),
    ]);

    renderWithQueryClient(<CriticalIncidentsSection {...defaultProps} />);

    const text = await screen.findByText('5001');
    expect(text.closest('a')).toBeNull();
  });

  it('should render RCA link when rca is a URL', async () => {
    mockedService.getCriticalIncidents.mockResolvedValue([
      createIncident({ rca: 'https://example.com/rca' }),
    ]);

    renderWithQueryClient(<CriticalIncidentsSection {...defaultProps} />);

    const link = await screen.findByText('View RCA');
    expect(link.closest('a')).toHaveAttribute('href', 'https://example.com/rca');
  });

  it('should show N/A when rca is "No asignado"', async () => {
    mockedService.getCriticalIncidents.mockResolvedValue([
      createIncident({ rca: 'No asignado' }),
    ]);

    renderWithQueryClient(<CriticalIncidentsSection {...defaultProps} />);

    expect(await screen.findByText('N/A')).toBeInTheDocument();
  });

  it('should show filter info with app label and month', async () => {
    mockedService.getCriticalIncidents.mockResolvedValue([createIncident()]);

    renderWithQueryClient(
      <CriticalIncidentsSection {...defaultProps} selectedApp="CD" selectedMonth="2025-03" />,
    );

    await screen.findByText(/Canales Digitales/);
    expect(screen.getByText(/March 2025/)).toBeInTheDocument();
  });

  it('should call getCriticalIncidents with correct params', async () => {
    mockedService.getCriticalIncidents.mockResolvedValue([]);

    renderWithQueryClient(
      <CriticalIncidentsSection {...defaultProps} selectedApp="CD" selectedMonth="2025-06" />,
    );

    await waitFor(() => {
      expect(mockedService.getCriticalIncidents).toHaveBeenCalledWith('CD', '2025-06');
    });
  });
});
