import { faker } from '@faker-js/faker';
import type { WarRoom } from '../../services/war-rooms.service';

const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES = ['Closed', 'Open', 'In Progress'];
const APPLICATIONS = ['FFVV', 'B2B', 'SB', 'APP', 'WEB'];

export function createWarRoom(overrides: Partial<WarRoom> = {}): WarRoom {
  return {
    requestId: faker.number.int({ min: 100000, max: 999999 }),
    requestIdLink: faker.internet.url(),
    application: faker.helpers.arrayElement(APPLICATIONS),
    date: faker.date.recent().toISOString(),
    summary: faker.lorem.sentence(),
    initialPriority: faker.helpers.arrayElement(PRIORITIES),
    startTime: faker.date.recent().toISOString(),
    durationMinutes: faker.number.int({ min: 15, max: 300 }),
    endTime: faker.date.recent().toISOString(),
    participants: faker.number.int({ min: 2, max: 20 }),
    status: faker.helpers.arrayElement(STATUSES),
    priorityChanged: faker.helpers.arrayElement(['Yes', 'No']),
    resolutionTeamChanged: faker.helpers.arrayElement(['Yes', 'No']),
    notes: faker.lorem.paragraph(),
    rcaStatus: faker.helpers.arrayElement(['Completed', 'Pending', 'N/A']),
    urlRca: faker.internet.url(),
    ...overrides,
  } as WarRoom;
}

export function createManyWarRooms(
  count: number,
  overrides: Partial<WarRoom> = {}
): WarRoom[] {
  return Array.from({ length: count }, () => createWarRoom(overrides));
}
