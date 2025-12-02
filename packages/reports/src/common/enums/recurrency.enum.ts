// Spanish values (from Excel)
export const RecurrencySpanish = {
  Recurrente: 'Recurrente',
  Nuevo: 'Nuevo',
  NoAsignado: 'No Asignado',
} as const;

// English display values
export const Recurrency = {
  Recurring: 'Recurring',
  New: 'New',
  Unassigned: 'Unassigned',
} as const;

export type RecurrencyType = (typeof Recurrency)[keyof typeof Recurrency];

// Mapping uses enum values - NO magic strings
export const RECURRENCY_MAP: Record<string, RecurrencyType> = {
  [RecurrencySpanish.Recurrente]: Recurrency.Recurring,
  [RecurrencySpanish.Nuevo]: Recurrency.New,
  [RecurrencySpanish.NoAsignado]: Recurrency.Unassigned,
};

export function mapRecurrency(raw: string | null): RecurrencyType {
  return RECURRENCY_MAP[raw || ''] || Recurrency.Unassigned;
}
