import { faker } from '@faker-js/faker';
import type { Problem } from '@repo/reports/frontend';
import type { UploadResult, DeleteResult } from '../../services/problems.service';

const SERVICE_CATEGORIES = [
  'Incident Management',
  'Problem Management',
  'Change Management',
  'Service Request',
];

const APPLICATIONS = ['CD', 'FFVV', 'SB', 'UNETE'];

export class ProblemFactory {
  static createProblem(overrides?: Partial<Problem>): Problem {
    return {
      requestId: overrides?.requestId ?? faker.number.int({ min: 10000, max: 99999 }),
      requestIdLink: overrides?.requestIdLink ?? `https://example.com/${faker.number.int({ min: 10000, max: 99999 })}`,
      serviceCategory: overrides?.serviceCategory ?? faker.helpers.arrayElement(SERVICE_CATEGORIES),
      requestStatus: overrides?.requestStatus ?? faker.helpers.arrayElement(['Open', 'In Progress', 'Resolved', 'Closed']),
      subject: overrides?.subject ?? faker.lorem.sentence(),
      subjectLink: overrides?.subjectLink ?? (faker.datatype.boolean() ? `https://example.com/subject/${faker.number.int()}` : null),
      createdTime: overrides?.createdTime ?? faker.date.recent().toISOString(),
      aplicativos: overrides?.aplicativos ?? faker.helpers.arrayElement(APPLICATIONS),
      createdBy: overrides?.createdBy ?? faker.person.fullName(),
      technician: overrides?.technician ?? faker.person.fullName(),
      planesDeAccion: overrides?.planesDeAccion ?? faker.helpers.arrayElement(['No asignado', faker.lorem.words(3)]),
      observaciones: overrides?.observaciones ?? faker.helpers.arrayElement(['No asignado', faker.lorem.words(5)]),
      dueByTime: overrides?.dueByTime ?? faker.date.future().toISOString(),
    } as Problem;
  }

  static createManyProblems(count: number, overrides?: Partial<Problem>): Problem[] {
    return Array.from({ length: count }, () => this.createProblem(overrides));
  }

  static createUploadResult(overrides?: Partial<UploadResult>): UploadResult {
    const total = overrides?.total ?? faker.number.int({ min: 50, max: 300 });
    const imported = overrides?.imported ?? faker.number.int({ min: Math.floor(total * 0.8), max: total });

    return {
      message: overrides?.message ?? 'File processed successfully',
      imported,
      total,
    };
  }

  static createDeleteResult(overrides?: Partial<DeleteResult>): DeleteResult {
    return {
      message: overrides?.message ?? 'All problems deleted successfully',
      deleted: overrides?.deleted ?? faker.number.int({ min: 10, max: 500 }),
    };
  }
}
