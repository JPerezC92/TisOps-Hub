import { faker } from '@faker-js/faker';
import { Categorization } from '@categorization-registry/domain/entities/categorization.entity';

export class CategorizationFactory {
  static create(overrides?: Partial<Categorization>): Categorization {
    return new Categorization(
      overrides?.id ?? faker.number.int({ min: 1, max: 1000 }),
      overrides?.sourceValue ?? faker.lorem.words(3),
      overrides?.displayValue ?? faker.lorem.words(2),
      overrides?.isActive ?? true,
      overrides?.createdAt ?? faker.date.past(),
      overrides?.updatedAt ?? faker.date.recent(),
    );
  }

  static createMany(count: number, overrides?: Partial<Categorization>): Categorization[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }
}
