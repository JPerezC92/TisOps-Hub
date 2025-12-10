import { faker } from '@faker-js/faker';
import { CorrectiveStatus } from '@corrective-status-registry/domain/entities/corrective-status.entity';

export class CorrectiveStatusFactory {
  static create(overrides?: Partial<{
    id: number;
    rawStatus: string;
    displayStatus: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>): CorrectiveStatus {
    return new CorrectiveStatus(
      overrides?.id ?? faker.number.int({ min: 1, max: 10000 }),
      overrides?.rawStatus ?? faker.helpers.arrayElement([
        'Dev in Progress',
        'In Backlog',
        'In Testing',
        'PRD Deployment',
        'Nivel 2',
        'Validado',
        'Cerrado',
      ]),
      overrides?.displayStatus ?? faker.helpers.arrayElement([
        'Development in Progress',
        'In Backlog',
        'In Testing',
        'Production Deployment',
        'Level 2',
        'Validated',
        'Closed',
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
  }>): CorrectiveStatus[] {
    return Array.from({ length: count }, (_, index) =>
      this.create({ ...overrides, id: overrides?.id ?? index + 1 })
    );
  }
}
