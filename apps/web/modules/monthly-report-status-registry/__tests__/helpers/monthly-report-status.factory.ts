import { faker } from '@faker-js/faker';
import type { MonthlyReportStatus } from '../../services/monthly-report-status-registry.service';

const DISPLAY_STATUS_OPTIONS = ['Closed', 'On going L2', 'On going L3', 'In L3 Backlog'] as const;

export class MonthlyReportStatusFactory {
  static create(overrides?: Partial<MonthlyReportStatus>): MonthlyReportStatus {
    return {
      id: overrides?.id ?? faker.number.int({ min: 1, max: 1000 }),
      rawStatus: overrides?.rawStatus ?? faker.lorem.words(3),
      displayStatus: overrides?.displayStatus ?? faker.helpers.arrayElement(DISPLAY_STATUS_OPTIONS),
      isActive: overrides?.isActive ?? true,
      createdAt: overrides?.createdAt ?? faker.date.recent().toISOString(),
      updatedAt: overrides?.updatedAt ?? faker.date.recent().toISOString(),
    };
  }

  static createMany(count: number, overrides?: Partial<MonthlyReportStatus>): MonthlyReportStatus[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
