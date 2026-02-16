import { faker } from '@faker-js/faker';
import type { CorrectiveStatus } from '../../services/corrective-status-registry.service';

const DISPLAY_STATUS_OPTIONS = ['In Backlog', 'Dev in Progress', 'In Testing', 'PRD Deployment'];

export class CorrectiveStatusFactory {
  static create(overrides?: Partial<CorrectiveStatus>): CorrectiveStatus {
    return {
      id: overrides?.id ?? faker.number.int({ min: 1, max: 1000 }),
      rawStatus: overrides?.rawStatus ?? faker.lorem.words(3),
      displayStatus: overrides?.displayStatus ?? faker.helpers.arrayElement(DISPLAY_STATUS_OPTIONS),
      isActive: overrides?.isActive ?? true,
      createdAt: overrides?.createdAt ?? faker.date.recent().toISOString(),
      updatedAt: overrides?.updatedAt ?? faker.date.recent().toISOString(),
    };
  }

  static createMany(count: number, overrides?: Partial<CorrectiveStatus>): CorrectiveStatus[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
