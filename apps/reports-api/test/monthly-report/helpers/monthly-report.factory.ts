import { faker } from '@faker-js/faker';
import type { MonthlyReport, InsertMonthlyReport } from '@repo/database';
import { Priority } from '@repo/reports';
import type {
  CriticalIncidentWithMapping,
  IncidentsByDayResult,
  IncidentOverviewByCategoryResult,
  L3SummaryResult,
  L3RequestsByStatusResult,
  MissingScopeByParentResult,
  BugsByParentResult,
} from '@monthly-report/domain/repositories/monthly-report.repository.interface';

export class MonthlyReportFactory {
  static createMonthlyReport(overrides?: Partial<MonthlyReport>): MonthlyReport {
    const requestId = overrides?.requestId ?? faker.number.int({ min: 100000, max: 200000 });
    const priority = overrides?.priority ?? faker.helpers.arrayElement([
      Priority.Low,
      Priority.Medium,
      Priority.High,
      Priority.Critical,
    ]);
    const status = overrides?.requestStatus ?? faker.helpers.arrayElement([
      'Nivel 2',
      'Validado',
      'Dev in Progress',
      'En Pruebas',
      'Cerrado',
    ]);

    return {
      requestId,
      requestIdLink: overrides?.requestIdLink ?? `https://sdp.belcorp.biz/WorkOrder.do?woID=${requestId}`,
      aplicativos: overrides?.aplicativos ?? faker.helpers.arrayElement([
        'Somos Belcorp',
        'FFVV',
        'B2B',
        'MDM',
      ]),
      categorizacion: overrides?.categorizacion ?? faker.helpers.arrayElement([
        'Incidente',
        'Requerimiento',
        'Consulta',
      ]),
      createdTime: overrides?.createdTime ?? faker.date.recent({ days: 30 }),
      requestStatus: status,
      modulo: overrides?.modulo ?? faker.helpers.arrayElement([
        'Pedidos',
        'Inventario',
        'Facturación',
        'Reportes',
      ]),
      subject: overrides?.subject ?? faker.lorem.sentence(),
      priority,
      eta: overrides?.eta ?? (faker.datatype.boolean()
        ? faker.date.future().toLocaleDateString('es-ES')
        : 'No asignado'),
      informacionAdicional: overrides?.informacionAdicional ?? faker.lorem.paragraph(),
      resolvedTime: overrides?.resolvedTime ?? (status === 'Cerrado'
        ? faker.date.recent({ days: 7 }).toLocaleDateString('es-ES')
        : 'No asignado'),
      paisesAfectados: overrides?.paisesAfectados ?? faker.helpers.arrayElements([
        'Peru',
        'Colombia',
        'Chile',
        'Mexico',
      ]).join(', '),
      recurrencia: overrides?.recurrencia ?? faker.helpers.arrayElement(['Si', 'No']),
      technician: overrides?.technician ?? faker.person.fullName(),
      jira: overrides?.jira ?? `JIRA-${faker.number.int({ min: 1000, max: 9999 })}`,
      problemId: overrides?.problemId ?? (faker.datatype.boolean()
        ? `PROB-${faker.number.int({ min: 100, max: 999 })}`
        : 'No asignado'),
      linkedRequestId: overrides?.linkedRequestId ?? (faker.datatype.boolean()
        ? faker.number.int({ min: 100000, max: 200000 }).toString()
        : 'No asignado'),
      linkedRequestIdLink: overrides?.linkedRequestIdLink ?? (faker.datatype.boolean()
        ? `https://sdp.belcorp.biz/WorkOrder.do?woID=${faker.number.int({ min: 100000, max: 200000 })}`
        : null),
      requestOlaStatus: overrides?.requestOlaStatus ?? faker.helpers.arrayElement([
        'Violated',
        'Not Violated',
      ]),
      grupoEscalamiento: overrides?.grupoEscalamiento ?? faker.helpers.arrayElement([
        'Nivel 1',
        'Nivel 2',
        'Desarrollo',
      ]),
      aplicactivosAfectados: overrides?.aplicactivosAfectados ?? faker.helpers.arrayElement([
        'Portal Web',
        'App Mobile',
        'Backend',
      ]),
      nivelUno: overrides?.nivelUno ?? faker.helpers.arrayElement(['Si', 'No', 'No Validado']),
      campana: overrides?.campana ?? `C${faker.number.int({ min: 1, max: 24 })}-${new Date().getFullYear()}`,
      cuv: overrides?.cuv ?? faker.string.alphanumeric(10).toUpperCase(),
      release: overrides?.release ?? (faker.datatype.boolean()
        ? `v${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 20 })}.${faker.number.int({ min: 0, max: 10 })}`
        : 'No asignado'),
      rca: overrides?.rca ?? (faker.datatype.boolean()
        ? faker.internet.url()
        : 'No asignado'),
    };
  }

  static createManyMonthlyReports(
    count: number,
    overrides?: Partial<MonthlyReport>,
  ): MonthlyReport[] {
    return Array.from({ length: count }, (_, index) =>
      this.createMonthlyReport({ ...overrides, requestId: overrides?.requestId ?? 100000 + index + 1 }),
    );
  }

  static createInsertMonthlyReport(overrides?: Partial<InsertMonthlyReport>): InsertMonthlyReport {
    const report = this.createMonthlyReport(overrides as Partial<MonthlyReport>);
    return report;
  }

  static createUploadResponse(overrides?: {
    imported?: number;
    total?: number;
    merged?: number;
    unique?: number;
  }) {
    return {
      message: 'File uploaded and parsed successfully',
      imported: overrides?.imported ?? faker.number.int({ min: 40, max: 60 }),
      total: overrides?.total ?? faker.number.int({ min: 50, max: 70 }),
      merged: overrides?.merged ?? faker.number.int({ min: 0, max: 10 }),
      unique: overrides?.unique ?? faker.number.int({ min: 40, max: 60 }),
    };
  }

  static createDeleteResponse(overrides?: { deleted?: number }) {
    return {
      message: 'All monthly reports deleted successfully',
      deleted: overrides?.deleted ?? faker.number.int({ min: 0, max: 1000 }),
    };
  }

  static createFindAllResponse(overrides?: { count?: number }) {
    const data = this.createManyMonthlyReports(overrides?.count ?? 5);
    return {
      data,
      total: data.length,
    };
  }

  static createCriticalIncidentWithMapping(
    overrides?: Partial<MonthlyReport>,
  ): CriticalIncidentWithMapping {
    return {
      monthlyReport: this.createMonthlyReport(overrides),
      mappedModuleDisplayValue: faker.helpers.arrayElement([
        'Orders',
        'Inventory',
        'Billing',
        'Reports',
        null,
      ]),
      mappedStatusDisplayValue: faker.helpers.arrayElement([
        'Level 2',
        'Validated',
        'Development',
        'Testing',
        'Closed',
        null,
      ]),
      mappedCategorizationDisplayValue: faker.helpers.arrayElement([
        'Incident',
        'Request',
        'Query',
        null,
      ]),
    };
  }

  static createManyCriticalIncidentsWithMapping(
    count: number,
    overrides?: Partial<MonthlyReport>,
  ): CriticalIncidentWithMapping[] {
    return Array.from({ length: count }, (_, index) =>
      this.createCriticalIncidentWithMapping({
        ...overrides,
        requestId: overrides?.requestId ?? 100000 + index + 1,
      }),
    );
  }

  static createIncidentsByDayResult(overrides?: {
    days?: number;
  }): IncidentsByDayResult {
    const daysCount = overrides?.days ?? 31;
    const data = Array.from({ length: daysCount }, (_, index) => ({
      day: index + 1,
      count: faker.number.int({ min: 0, max: 20 }),
    }));
    return {
      data,
      totalIncidents: data.reduce((sum, row) => sum + row.count, 0),
    };
  }

  static createIncidentOverviewByCategoryResult(): IncidentOverviewByCategoryResult {
    const createCard = () => {
      const items = faker.helpers
        .arrayElements(['Incidente', 'Requerimiento', 'Consulta', 'Bug'], { min: 2, max: 4 })
        .map((category) => ({
          category,
          categoryDisplayValue: category,
          count: faker.number.int({ min: 5, max: 50 }),
          percentage: faker.number.float({ min: 5, max: 40, fractionDigits: 2 }),
        }));
      return {
        data: items,
        total: items.reduce((sum, item) => sum + item.count, 0),
      };
    };

    const createL3StatusCard = () => {
      const statuses = ['Dev in Progress', 'In Backlog', 'In Testing', 'PRD Deployment'];
      const items = statuses.map((status) => ({
        status,
        count: faker.number.int({ min: 1, max: 20 }),
        percentage: faker.number.float({ min: 5, max: 40, fractionDigits: 2 }),
      }));
      return {
        data: items,
        total: items.reduce((sum, item) => sum + item.count, 0),
      };
    };

    return {
      resolvedInL2: createCard(),
      pending: createCard(),
      recurrentInL2L3: createCard(),
      assignedToL3Backlog: createCard(),
      l3Status: createL3StatusCard(),
    };
  }

  static createL3SummaryResult(): L3SummaryResult {
    const statuses = [
      { status: 'dev_in_progress', statusLabel: 'Dev in Progress' },
      { status: 'in_backlog', statusLabel: 'In Backlog' },
      { status: 'in_testing', statusLabel: 'In Testing' },
      { status: 'prd_deployment', statusLabel: 'PRD Deployment' },
    ];

    const data = statuses.map(({ status, statusLabel }) => ({
      status,
      statusLabel,
      critical: faker.number.int({ min: 0, max: 10 }),
      high: faker.number.int({ min: 0, max: 15 }),
      medium: faker.number.int({ min: 0, max: 20 }),
      low: faker.number.int({ min: 0, max: 10 }),
      total: 0,
    }));

    data.forEach((row) => {
      row.total = row.critical + row.high + row.medium + row.low;
    });

    const totals = {
      critical: data.reduce((sum, row) => sum + row.critical, 0),
      high: data.reduce((sum, row) => sum + row.high, 0),
      medium: data.reduce((sum, row) => sum + row.medium, 0),
      low: data.reduce((sum, row) => sum + row.low, 0),
      total: data.reduce((sum, row) => sum + row.total, 0),
    };

    return { data, totals };
  }

  static createL3RequestsByStatusResult(): L3RequestsByStatusResult {
    const createRequests = (count: number) =>
      Array.from({ length: count }, () => ({
        requestId: faker.number.int({ min: 100000, max: 200000 }).toString(),
        requestIdLink: faker.internet.url(),
        createdTime: faker.date.recent().toLocaleDateString('es-ES'),
        modulo: faker.helpers.arrayElement(['Pedidos', 'Inventario', 'Facturación']),
        subject: faker.lorem.sentence(),
        priority: faker.helpers.arrayElement(['Crítico', 'Alto', 'Medio', 'Bajo']),
        priorityEnglish: faker.helpers.arrayElement(['Critical', 'High', 'Medium', 'Low']),
        linkedTicketsCount: faker.number.int({ min: 0, max: 10 }),
        eta: faker.datatype.boolean()
          ? faker.date.future().toLocaleDateString('es-ES')
          : 'No asignado',
      }));

    return {
      devInProgress: createRequests(faker.number.int({ min: 2, max: 5 })),
      inBacklog: createRequests(faker.number.int({ min: 3, max: 8 })),
      inTesting: createRequests(faker.number.int({ min: 1, max: 4 })),
      prdDeployment: createRequests(faker.number.int({ min: 0, max: 3 })),
    };
  }

  static createMissingScopeByParentResult(overrides?: {
    count?: number;
    monthName?: string;
  }): MissingScopeByParentResult {
    const count = overrides?.count ?? 5;
    const data = Array.from({ length: count }, () => ({
      createdDate: faker.date.recent().toLocaleDateString('es-ES'),
      linkedRequestId: faker.number.int({ min: 100000, max: 200000 }).toString(),
      linkedRequestIdLink: faker.internet.url(),
      additionalInfo: faker.lorem.sentence(),
      totalLinkedTickets: faker.number.int({ min: 1, max: 10 }),
      linkedTicketsInMonth: faker.number.int({ min: 1, max: 5 }),
      requestStatus: faker.helpers.arrayElement(['Dev in Progress', 'In Backlog', 'In Testing']),
      eta: faker.datatype.boolean()
        ? faker.date.future().toLocaleDateString('es-ES')
        : 'No asignado',
    }));

    return {
      data,
      monthName: overrides?.monthName ?? faker.date.month(),
      totalIncidents: data.reduce((sum, row) => sum + row.linkedTicketsInMonth, 0),
    };
  }

  static createBugsByParentResult(overrides?: {
    count?: number;
    monthName?: string;
  }): BugsByParentResult {
    const count = overrides?.count ?? 5;
    const data = Array.from({ length: count }, () => ({
      createdDate: faker.date.recent().toLocaleDateString('es-ES'),
      linkedRequestId: faker.number.int({ min: 100000, max: 200000 }).toString(),
      linkedRequestIdLink: faker.internet.url(),
      additionalInfo: faker.lorem.sentence(),
      totalLinkedTickets: faker.number.int({ min: 1, max: 10 }),
      linkedTicketsInMonth: faker.number.int({ min: 1, max: 5 }),
      requestStatus: faker.helpers.arrayElement(['Dev in Progress', 'In Backlog', 'In Testing']),
      eta: faker.datatype.boolean()
        ? faker.date.future().toLocaleDateString('es-ES')
        : 'No asignado',
    }));

    return {
      data,
      monthName: overrides?.monthName ?? faker.date.month(),
      totalIncidents: data.reduce((sum, row) => sum + row.linkedTicketsInMonth, 0),
    };
  }
}
