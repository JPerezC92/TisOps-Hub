import { faker } from '@faker-js/faker';
import type { WeeklyCorrective } from '@repo/reports/frontend';
import type { UploadResult, DeleteResult } from '../../services/weekly-corrective.service';

const APPLICATIONS = ['CD', 'FFVV', 'SB', 'UNETE'];
const PRIORITIES = ['Alta', 'Media', 'Baja'];
const STATUSES = ['En Pruebas', 'En Desarrollo', 'Cerrado', 'Pendiente', 'Asignado'];

export class WeeklyCorrectiveFactory {
  static createRecord(overrides?: Partial<WeeklyCorrective>): WeeklyCorrective {
    return {
      requestId: overrides?.requestId ?? `REQ-${faker.number.int({ min: 10000, max: 99999 })}`,
      requestIdLink: overrides?.requestIdLink ?? `https://example.com/${faker.number.int({ min: 10000, max: 99999 })}`,
      technician: overrides?.technician ?? faker.person.fullName(),
      aplicativos: overrides?.aplicativos ?? faker.helpers.arrayElement(APPLICATIONS),
      categorizacion: overrides?.categorizacion ?? faker.lorem.words(2),
      createdTime: overrides?.createdTime ?? faker.date.recent().toISOString(),
      requestStatus: overrides?.requestStatus ?? faker.helpers.arrayElement(STATUSES),
      modulo: overrides?.modulo ?? faker.lorem.word(),
      subject: overrides?.subject ?? faker.lorem.sentence(),
      priority: overrides?.priority ?? faker.helpers.arrayElement(PRIORITIES),
      eta: overrides?.eta ?? faker.date.future().toISOString(),
      rca: overrides?.rca ?? faker.helpers.arrayElement(['No asignado', `https://example.com/rca/${faker.number.int()}`]),
    } as WeeklyCorrective;
  }

  static createManyRecords(count: number, overrides?: Partial<WeeklyCorrective>): WeeklyCorrective[] {
    return Array.from({ length: count }, () => this.createRecord(overrides));
  }

  static createUploadResult(overrides?: Partial<UploadResult>): UploadResult {
    const total = overrides?.total ?? faker.number.int({ min: 50, max: 300 });
    const imported = overrides?.imported ?? faker.number.int({ min: Math.floor(total * 0.8), max: total });

    return {
      message: overrides?.message ?? 'File uploaded and parsed successfully',
      imported,
      total,
    };
  }

  static createDeleteResult(overrides?: Partial<DeleteResult>): DeleteResult {
    return {
      message: overrides?.message ?? 'All weekly corrective records deleted successfully',
      deleted: overrides?.deleted ?? faker.number.int({ min: 10, max: 500 }),
    };
  }
}
