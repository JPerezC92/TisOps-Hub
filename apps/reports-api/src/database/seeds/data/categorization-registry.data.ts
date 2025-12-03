/**
 * Categorization Registry Seed Data
 * Maps source categorization values to custom display values
 * Only contains error type categorizations (9 items)
 */

export interface CategorizationMapping {
  sourceValue: string;
  displayValue: string;
}

export const categorizationMappings: CategorizationMapping[] = [
  {
    sourceValue: 'Error de codificación (Bug)',
    displayValue: 'Bugs',
  },
  {
    sourceValue: 'Error de Alcance',
    displayValue: 'Missing Scope',
  },
  {
    sourceValue: 'Error de usuario',
    displayValue: 'User Mistake',
  },
  {
    sourceValue: 'Error de datos (Data Source)',
    displayValue: 'Data Source',
  },
  {
    sourceValue: 'Informativa (Inquiries)',
    displayValue: 'Inquiry',
  },
  {
    sourceValue: 'Error por Cambio',
    displayValue: 'Change/Release',
  },
  {
    sourceValue: 'Error de Infraestructura',
    displayValue: 'Infrastructure Error',
  },
  {
    sourceValue: 'Error de interfaces (Sync Data & Integration)',
    displayValue: 'Sync Data & Integration',
  },
  {
    sourceValue: 'Error de configuración',
    displayValue: 'Configuration Error',
  },
];
