import { faker } from '@faker-js/faker';
import type { Module } from '../../services/module-registry.service';
import { APPLICATIONS } from '../../services/module-registry.service';

export class ModuleFactory {
  static create(overrides?: Partial<Module>): Module {
    return {
      id: overrides?.id ?? faker.number.int({ min: 1, max: 1000 }),
      sourceValue: overrides?.sourceValue ?? `${faker.helpers.arrayElement([...APPLICATIONS])}${faker.number.int({ min: 1, max: 9 })} ${faker.lorem.word()}`,
      displayValue: overrides?.displayValue ?? faker.lorem.word(),
      application: overrides?.application ?? faker.helpers.arrayElement([...APPLICATIONS]),
      isActive: overrides?.isActive ?? true,
      createdAt: overrides?.createdAt ?? faker.date.recent().toISOString(),
      updatedAt: overrides?.updatedAt ?? faker.date.recent().toISOString(),
    };
  }

  static createMany(count: number, overrides?: Partial<Module>): Module[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
