import type { SessionsOrder, SessionsOrdersRelease } from '../../services/sessions-orders.service';

let idCounter = 1;

export function createSessionsOrder(
  overrides: Partial<SessionsOrder> = {}
): SessionsOrder {
  const id = idCounter++;
  return {
    id,
    ano: 2025,
    mes: 6,
    peak: 0,
    dia: Date.now(),
    incidentes: 10,
    sessions: 500,
    placedOrders: 200,
    billedOrders: 180,
    ...overrides,
  };
}

export function createRelease(
  overrides: Partial<SessionsOrdersRelease> = {}
): SessionsOrdersRelease {
  const id = idCounter++;
  return {
    id,
    semana: 'S01',
    aplicacion: 'SB',
    fecha: 45678,
    release: 'v1.0.0',
    ticketsCount: 3,
    ticketsData: JSON.stringify(['TICKET-001', 'TICKET-002', 'TICKET-003']),
    ...overrides,
  };
}

export function createManySessionsOrders(
  count: number,
  overrides: Partial<SessionsOrder> = {}
): SessionsOrder[] {
  return Array.from({ length: count }, () => createSessionsOrder(overrides));
}

export function createManyReleases(
  count: number,
  overrides: Partial<SessionsOrdersRelease> = {}
): SessionsOrdersRelease[] {
  return Array.from({ length: count }, () => createRelease(overrides));
}
