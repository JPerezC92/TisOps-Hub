import { faker } from '@faker-js/faker';
import type { SessionsOrder, SessionsOrdersRelease } from '@repo/database';

export class SessionsOrdersFactory {
  static createSessionsOrder(overrides?: Partial<SessionsOrder>): SessionsOrder {
    return {
      id: overrides?.id ?? faker.number.int({ min: 1, max: 10000 }),
      ano: overrides?.ano ?? faker.number.int({ min: 2020, max: 2025 }),
      mes: overrides?.mes ?? faker.number.int({ min: 1, max: 12 }),
      peak: overrides?.peak ?? faker.number.int({ min: 0, max: 1 }),
      dia: overrides?.dia ?? faker.number.int({ min: 44000, max: 46000 }),
      incidentes: overrides?.incidentes ?? faker.number.int({ min: 0, max: 100 }),
      placedOrders: overrides?.placedOrders ?? faker.number.int({ min: 0, max: 200 }),
      billedOrders: overrides?.billedOrders ?? faker.number.int({ min: 0, max: 180 }),
    };
  }

  static createManySessionsOrders(
    count: number,
    overrides?: Partial<SessionsOrder>,
  ): SessionsOrder[] {
    return Array.from({ length: count }, (_, index) =>
      this.createSessionsOrder({ ...overrides, id: overrides?.id ?? index + 1 }),
    );
  }

  static createRelease(overrides?: Partial<SessionsOrdersRelease>): SessionsOrdersRelease {
    const tickets = Array.from(
      { length: faker.number.int({ min: 1, max: 10 }) },
      () => `TICKET-${faker.string.alphanumeric(6).toUpperCase()}`,
    );

    return {
      id: overrides?.id ?? faker.number.int({ min: 1, max: 10000 }),
      semana: overrides?.semana ?? `S${faker.number.int({ min: 1, max: 52 })}`,
      aplicacion: overrides?.aplicacion ?? faker.helpers.arrayElement(['SB', 'FFVV']),
      fecha: overrides?.fecha ?? faker.number.int({ min: 44000, max: 46000 }),
      release: overrides?.release ?? `v${faker.number.int({ min: 1, max: 5 })}.${faker.number.int({ min: 0, max: 20 })}.${faker.number.int({ min: 0, max: 10 })}`,
      ticketsCount: overrides?.ticketsCount ?? tickets.length,
      ticketsData: overrides?.ticketsData ?? JSON.stringify(tickets),
    };
  }

  static createManyReleases(
    count: number,
    overrides?: Partial<SessionsOrdersRelease>,
  ): SessionsOrdersRelease[] {
    return Array.from({ length: count }, (_, index) =>
      this.createRelease({ ...overrides, id: overrides?.id ?? index + 1 }),
    );
  }

  static createUploadResponse(overrides?: {
    importedMain?: number;
    importedReleases?: number;
    totalMain?: number;
    totalReleases?: number;
  }) {
    return {
      message: 'File uploaded and parsed successfully',
      importedMain: overrides?.importedMain ?? faker.number.int({ min: 100, max: 1000 }),
      importedReleases: overrides?.importedReleases ?? faker.number.int({ min: 10, max: 100 }),
      totalMain: overrides?.totalMain ?? faker.number.int({ min: 100, max: 1000 }),
      totalReleases: overrides?.totalReleases ?? faker.number.int({ min: 10, max: 100 }),
    };
  }

  static createDeleteResponse(overrides?: {
    deletedMain?: number;
    deletedReleases?: number;
  }) {
    return {
      message: 'All sessions/orders records deleted successfully',
      deletedMain: overrides?.deletedMain ?? faker.number.int({ min: 0, max: 1000 }),
      deletedReleases: overrides?.deletedReleases ?? faker.number.int({ min: 0, max: 100 }),
    };
  }

  static createFindAllResponse(overrides?: {
    mainCount?: number;
    releasesCount?: number;
  }) {
    const mainData = this.createManySessionsOrders(overrides?.mainCount ?? 5);
    const releases = this.createManyReleases(overrides?.releasesCount ?? 3);

    return {
      data: mainData,
      releases: releases,
      total: mainData.length,
      totalReleases: releases.length,
    };
  }
}
