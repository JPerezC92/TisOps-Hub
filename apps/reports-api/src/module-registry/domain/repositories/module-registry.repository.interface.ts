import { Module } from '../entities/module.entity';

export interface CreateModuleDto {
  sourceValue: string;
  displayValue: string;
  application: string;
  isActive?: boolean;
}

export interface UpdateModuleDto {
  sourceValue?: string;
  displayValue?: string;
  application?: string;
  isActive?: boolean;
}

export interface IModuleRegistryRepository {
  findAll(): Promise<Module[]>;
  findById(id: number): Promise<Module | null>;
  findBySourceValue(sourceValue: string): Promise<Module | null>;
  findByApplication(application: string): Promise<Module[]>;
  create(data: CreateModuleDto): Promise<Module>;
  update(id: number, data: UpdateModuleDto): Promise<Module>;
  delete(id: number): Promise<void>;
}

export const MODULE_REGISTRY_REPOSITORY = Symbol('MODULE_REGISTRY_REPOSITORY');
