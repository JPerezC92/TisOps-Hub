import { faker } from '@faker-js/faker';
import type { MonthlyReport } from '../../services/monthly-report.service';

const CATEGORIZATIONS = ['Error por Cambio', 'Error de Plataforma', 'Requerimiento', 'Mejora', 'Bug'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Cerrado', 'Validado', 'Dev in Progress', 'In Backlog', 'Nivel 2'];
const APPLICATIONS = ['Somos Belcorp', 'FFVV', 'B2B', 'APP GTN', 'My Online Store'];
const TECHNICIANS = ['Juan Perez', 'Maria Garcia', 'Carlos Lopez', 'Ana Torres'];

export function createMonthlyReport(overrides: Partial<MonthlyReport> = {}): MonthlyReport {
  return {
    requestId: faker.number.int({ min: 100000, max: 999999 }),
    requestIdLink: faker.internet.url(),
    aplicativos: faker.helpers.arrayElement(APPLICATIONS),
    categorizacion: faker.helpers.arrayElement(CATEGORIZATIONS),
    createdTime: faker.date.recent().getTime(),
    requestStatus: faker.helpers.arrayElement(STATUSES),
    modulo: faker.commerce.department(),
    subject: faker.lorem.sentence(),
    priority: faker.helpers.arrayElement(PRIORITIES),
    eta: faker.helpers.arrayElement(['No asignado', faker.date.future().toISOString()]),
    informacionAdicional: faker.lorem.paragraph(),
    resolvedTime: faker.helpers.arrayElement(['No asignado', faker.date.recent().toISOString()]),
    paisesAfectados: faker.helpers.arrayElement(['Peru', 'Colombia', 'Ecuador']),
    recurrencia: faker.helpers.arrayElement(['Si', 'No', 'N/A']),
    technician: faker.helpers.arrayElement(TECHNICIANS),
    jira: `JIRA-${faker.number.int({ min: 1000, max: 9999 })}`,
    problemId: faker.helpers.arrayElement(['No asignado', `PRB-${faker.number.int({ min: 100, max: 999 })}`]),
    linkedRequestId: String(faker.number.int({ min: 100000, max: 999999 })),
    linkedRequestIdLink: faker.internet.url(),
    requestOlaStatus: faker.helpers.arrayElement(['Violated', 'Not Violated']),
    grupoEscalamiento: faker.helpers.arrayElement(['L2', 'L3']),
    aplicactivosAfectados: faker.helpers.arrayElement(APPLICATIONS),
    nivelUno: faker.helpers.arrayElement(['Si', 'No', 'No Validado']),
    campana: faker.commerce.productName(),
    cuv: `CUV-${faker.number.int({ min: 100, max: 999 })}`,
    release: `v${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 9 })}`,
    rca: faker.helpers.arrayElement(['Completed', 'Pending', 'N/A']),
    ...overrides,
  } as MonthlyReport;
}

export function createManyMonthlyReports(
  count: number,
  overrides: Partial<MonthlyReport> = {}
): MonthlyReport[] {
  return Array.from({ length: count }, () => createMonthlyReport(overrides));
}
