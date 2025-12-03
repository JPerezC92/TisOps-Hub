import { Categorization } from '../entities/categorization.entity';

export interface CreateCategorizationDto {
  sourceValue: string;
  displayValue: string;
  isActive?: boolean;
}

export interface UpdateCategorizationDto {
  sourceValue?: string;
  displayValue?: string;
  isActive?: boolean;
}

export interface ICategorizationRegistryRepository {
  findAll(): Promise<Categorization[]>;
  findById(id: number): Promise<Categorization | null>;
  findBySourceValue(sourceValue: string): Promise<Categorization | null>;
  create(data: CreateCategorizationDto): Promise<Categorization>;
  update(id: number, data: UpdateCategorizationDto): Promise<Categorization>;
  delete(id: number): Promise<void>;
}

export const CATEGORIZATION_REGISTRY_REPOSITORY = Symbol('CATEGORIZATION_REGISTRY_REPOSITORY');
