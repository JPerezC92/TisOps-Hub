// Priority levels for task and incident management (English)
export const Priority = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High',
  Critical: 'Critical',
} as const;

export type PriorityValue = (typeof Priority)[keyof typeof Priority];

// Priority levels for task and incident management (Spanish)
export const PrioritySpanish = {
  Baja: 'Baja',
  Media: 'Media',
  Alta: 'Alta',
  Critica: 'Crítica',
} as const;

export type PrioritySpanishValue =
  (typeof PrioritySpanish)[keyof typeof PrioritySpanish];
