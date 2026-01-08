import { faker } from '@faker-js/faker';
import type { WeeklyCorrective, InsertWeeklyCorrective } from '@repo/database';

export class WeeklyCorrectiveFactory {
  static createWeeklyCorrective(overrides?: Partial<WeeklyCorrective>): WeeklyCorrective {
    const requestId = overrides?.requestId ?? `REQ-${faker.number.int({ min: 100000, max: 999999 })}`;
    const priority = overrides?.priority ?? faker.helpers.arrayElement(['Alta', 'Media', 'Baja']);
    const status = overrides?.requestStatus ?? faker.helpers.arrayElement([
      'En Pruebas',
      'Dev in Progress',
      'Cerrado',
      'Validado',
    ]);

    return {
      requestId,
      requestIdLink: overrides?.requestIdLink ?? `https://sdp.belcorp.biz/WorkOrder.do?woID=${requestId}`,
      technician: overrides?.technician ?? faker.person.fullName(),
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
      eta: overrides?.eta ?? faker.date.future().toLocaleDateString('es-ES'),
      rca: overrides?.rca ?? (faker.datatype.boolean()
        ? faker.internet.url()
        : 'No asignado'),
    };
  }

  static createManyWeeklyCorrectives(
    count: number,
    overrides?: Partial<WeeklyCorrective>,
  ): WeeklyCorrective[] {
    return Array.from({ length: count }, (_, index) =>
      this.createWeeklyCorrective({
        ...overrides,
        requestId: overrides?.requestId ?? `REQ-${100000 + index + 1}`,
      }),
    );
  }

  static createInsertWeeklyCorrective(overrides?: Partial<InsertWeeklyCorrective>): InsertWeeklyCorrective {
    const corrective = this.createWeeklyCorrective(overrides as Partial<WeeklyCorrective>);
    return corrective;
  }

  static createUploadResponse(overrides?: {
    imported?: number;
    total?: number;
  }) {
    return {
      message: 'File uploaded and parsed successfully',
      imported: overrides?.imported ?? faker.number.int({ min: 30, max: 100 }),
      total: overrides?.total ?? faker.number.int({ min: 30, max: 100 }),
    };
  }

  static createDeleteResponse(overrides?: { deleted?: number }) {
    return {
      message: 'All weekly corrective records deleted successfully',
      deleted: overrides?.deleted ?? faker.number.int({ min: 0, max: 500 }),
    };
  }

  static createFindAllResponse(overrides?: { count?: number }) {
    const data = this.createManyWeeklyCorrectives(overrides?.count ?? 5);
    return {
      data,
      total: data.length,
    };
  }
}
