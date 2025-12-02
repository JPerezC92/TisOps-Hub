// Corrective status values for L3 tickets (English display)
export const CorrectiveStatus = {
  InBacklog: 'In Backlog',
  DevInProgress: 'Dev in Progress',
  InTesting: 'In Testing',
  PrdDeployment: 'PRD Deployment',
} as const;

export type CorrectiveStatusValue =
  (typeof CorrectiveStatus)[keyof typeof CorrectiveStatus];

// Corrective status values for L3 tickets (Spanish raw)
export const CorrectiveStatusSpanish = {
  EnMantenimientoCorrectivo: 'En Mantenimiento Correctivo',
  Nivel3: 'Nivel 3',
  DevInProgress: 'Dev  in Progress', // Note: double space in raw value
  EnPruebas: 'En Pruebas',
  PrdDeployment: 'PRD Deployment',
} as const;

export type CorrectiveStatusSpanishValue =
  (typeof CorrectiveStatusSpanish)[keyof typeof CorrectiveStatusSpanish];

// In Backlog with priority suffix
export const InBacklogByPriority = {
  Critical: 'In Backlog (Critical)',
  High: 'In Backlog (High)',
  Medium: 'In Backlog (Medium)',
  Low: 'In Backlog (Low)',
} as const;

export type InBacklogByPriorityValue =
  (typeof InBacklogByPriority)[keyof typeof InBacklogByPriority];

// All fixed columns for L3 tickets by status table
export const L3TicketsStatusColumns = [
  InBacklogByPriority.Critical,
  InBacklogByPriority.High,
  InBacklogByPriority.Medium,
  InBacklogByPriority.Low,
  CorrectiveStatus.DevInProgress,
  CorrectiveStatus.InTesting,
  CorrectiveStatus.PrdDeployment,
] as const;
