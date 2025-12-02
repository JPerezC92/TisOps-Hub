import { faker } from '@faker-js/faker';
import { MonthlyReportStatus } from '@monthly-report-status-registry/domain/entities/monthly-report-status.entity';

export class MonthlyReportStatusFactory {
  static create(overrides?: Partial<{
    id: number;
    rawStatus: string;
    displayStatus: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>): MonthlyReportStatus {
    return new MonthlyReportStatus(
      overrides?.id ?? faker.number.int({ min: 1, max: 10000 }),
      overrides?.rawStatus ?? faker.helpers.arrayElement([
        'Pendiente',
        'En Progreso',
        'Resuelto',
        'Cerrado',
        'En Espera',
        'Cancelado',
      ]),
      overrides?.displayStatus ?? faker.helpers.arrayElement([
        'In L3 Backlog',
        'In Progress',
        'Resolved',
        'Closed',
        'On Hold',
        'Cancelled',
      ]),
      overrides?.isActive ?? true,
      overrides?.createdAt ?? faker.date.recent(),
      overrides?.updatedAt ?? faker.date.recent(),
    );
  }

  static createMany(count: number, overrides?: Partial<{
    id: number;
    rawStatus: string;
    displayStatus: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>): MonthlyReportStatus[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({ ...overrides, id: overrides?.id ?? index + 1 })
    );
  }
}
