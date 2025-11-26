import { faker } from '@faker-js/faker';
import type { MonthlyReport, InsertMonthlyReport } from '@repo/database';
import { Priority } from '@repo/reports';

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
      createdTime: overrides?.createdTime ?? faker.date.recent({ days: 30 }).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
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
}
