import { faker } from '@faker-js/faker';
import { Module } from '@module-registry/domain/entities/module.entity';

export class ModuleFactory {
  static create(overrides?: Partial<Module>): Module {
    return new Module(
      overrides?.id ?? faker.number.int({ min: 1, max: 1000 }),
      overrides?.sourceValue ?? faker.lorem.words(3),
      overrides?.displayValue ?? faker.lorem.words(2),
      overrides?.application ?? faker.helpers.arrayElement(['SB', 'FF', 'Unete']),
      overrides?.isActive ?? true,
      overrides?.createdAt ?? faker.date.past(),
      overrides?.updatedAt ?? faker.date.recent(),
    );
  }

  static createMany(count: number, overrides?: Partial<Module>): Module[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
