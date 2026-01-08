import { faker } from '@faker-js/faker';
import type { WarRoom, InsertWarRoom } from '@repo/database';
import type { WarRoomWithApp } from '../../../src/war-rooms/domain/repositories/war-rooms.repository.interface';

export class WarRoomsFactory {
  static createWarRoom(overrides?: Partial<WarRoom>): WarRoom {
    const requestId = overrides?.requestId ?? faker.number.int({ min: 1000, max: 9999 });
    const priority = overrides?.initialPriority ?? faker.helpers.arrayElement([
      'CRITICAL',
      'HIGH',
      'MEDIUM',
      'LOW',
    ]);
    const status = overrides?.status ?? faker.helpers.arrayElement(['Closed', 'Open']);

    // Generate date as Date object
    const date = overrides?.date ?? faker.date.recent({ days: 90 });

    // Generate start and end times as Date objects
    const durationMinutes = overrides?.durationMinutes ?? faker.number.int({ min: 30, max: 480 });
    const startTime = overrides?.startTime ?? faker.date.recent({ days: 30 });
    const endTime = overrides?.endTime ?? new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    return {
      requestId,
      requestIdLink: overrides?.requestIdLink ?? `https://sdp.belcorp.biz/WorkOrder.do?woMode=viewWO&woID=${requestId}`,
      application: overrides?.application ?? faker.helpers.arrayElement([
        'FFVV',
        'Somos Belcorp',
        'B2B',
        'MDM',
        'Portal Consultoras',
      ]),
      date,
      summary: overrides?.summary ?? faker.lorem.sentence(),
      initialPriority: priority,
      startTime,
      durationMinutes,
      endTime,
      participants: overrides?.participants ?? faker.number.int({ min: 3, max: 20 }),
      status,
      priorityChanged: overrides?.priorityChanged ?? faker.helpers.arrayElement(['Yes', 'No']),
      resolutionTeamChanged: overrides?.resolutionTeamChanged ?? faker.helpers.arrayElement(['Yes', 'No']),
      notes: overrides?.notes ?? faker.lorem.paragraph(),
      rcaStatus: overrides?.rcaStatus ?? faker.helpers.arrayElement([
        'Completed',
        'In Progress',
        'Pending',
        'Not Required',
      ]),
      urlRca: overrides?.urlRca ?? (faker.datatype.boolean()
        ? faker.internet.url()
        : 'No asignado'),
    };
  }

  static createManyWarRooms(
    count: number,
    overrides?: Partial<WarRoom>,
  ): WarRoom[] {
    return Array.from({ length: count }, (_, index) =>
      this.createWarRoom({ ...overrides, requestId: overrides?.requestId ?? 1000 + index + 1 }),
    );
  }

  static createInsertWarRoom(overrides?: Partial<InsertWarRoom>): InsertWarRoom {
    const warRoom = this.createWarRoom(overrides as Partial<WarRoom>);
    return warRoom;
  }

  static createUploadResponse(overrides?: {
    imported?: number;
    total?: number;
  }) {
    return {
      message: 'File uploaded and parsed successfully',
      imported: overrides?.imported ?? faker.number.int({ min: 20, max: 100 }),
      total: overrides?.total ?? faker.number.int({ min: 20, max: 100 }),
    };
  }

  static createDeleteResponse(overrides?: { deleted?: number }) {
    return {
      message: 'All war rooms deleted successfully',
      deleted: overrides?.deleted ?? faker.number.int({ min: 0, max: 500 }),
    };
  }

  static createFindAllResponse(overrides?: { count?: number }) {
    const data = this.createManyWarRooms(overrides?.count ?? 5);
    return {
      data,
      total: data.length,
    };
  }

  static createWarRoomWithApp(overrides?: Partial<WarRoomWithApp>): WarRoomWithApp {
    const warRoom = this.createWarRoom(overrides as Partial<WarRoom>);

    // Handle app override: if explicitly provided (including null), use it; otherwise random
    const app = overrides && 'app' in overrides
      ? overrides.app
      : (faker.datatype.boolean() ? {
          id: faker.number.int({ min: 1, max: 100 }),
          code: faker.helpers.arrayElement(['FFVV', 'SB', 'B2B', 'MDM', 'PORTAL']),
          name: faker.company.name(),
        } : null);

    return {
      ...warRoom,
      app,
    };
  }

  static createManyWarRoomsWithApp(
    count: number,
    overrides?: Partial<WarRoomWithApp>,
  ): WarRoomWithApp[] {
    return Array.from({ length: count }, (_, index) =>
      this.createWarRoomWithApp({
        ...overrides,
        requestId: overrides?.requestId ?? 1000 + index + 1
      }),
    );
  }

  static createAnalyticsResponse(overrides?: {
    count?: number;
    app?: { id: number; code: string; name: string } | null;
  }) {
    const data = this.createManyWarRoomsWithApp(overrides?.count ?? 5, {
      app: overrides?.app,
    });

    return {
      data,
      total: data.length,
    };
  }
}
