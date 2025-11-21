import { Application } from '../entities/application.entity';
import { ApplicationPattern } from '../entities/application-pattern.entity';

export interface CreateApplicationDto {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateApplicationDto {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreatePatternDto {
  applicationId: number;
  pattern: string;
  priority?: number;
  matchType?: string;
  isActive?: boolean;
}

export interface ApplicationWithPatterns extends Application {
  patterns: ApplicationPattern[];
}

export interface IApplicationRegistryRepository {
  findAll(): Promise<Application[]>;
  findById(id: number): Promise<Application | null>;
  findByPattern(applicationName: string): Promise<Application | null>;
  findAllWithPatterns(): Promise<ApplicationWithPatterns[]>;
  create(data: CreateApplicationDto): Promise<Application>;
  update(id: number, data: UpdateApplicationDto): Promise<Application>;
  delete(id: number): Promise<void>;
  createPattern(data: CreatePatternDto): Promise<ApplicationPattern>;
  deletePattern(id: number): Promise<void>;
}

export const APPLICATION_REGISTRY_REPOSITORY = Symbol(
  'APPLICATION_REGISTRY_REPOSITORY',
);
