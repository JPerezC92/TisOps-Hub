import { CorrectiveStatus } from '../entities/corrective-status.entity';

export interface CreateCorrectiveStatusDto {
  rawStatus: string;
  displayStatus: string;
  isActive?: boolean;
}

export interface UpdateCorrectiveStatusDto {
  rawStatus?: string;
  displayStatus?: string;
  isActive?: boolean;
}

export interface ICorrectiveStatusRegistryRepository {
  findAll(): Promise<CorrectiveStatus[]>;
  findById(id: number): Promise<CorrectiveStatus | null>;
  findByRawStatus(rawStatus: string): Promise<CorrectiveStatus | null>;
  findDistinctDisplayStatuses(): Promise<string[]>;
  create(data: CreateCorrectiveStatusDto): Promise<CorrectiveStatus>;
  update(id: number, data: UpdateCorrectiveStatusDto): Promise<CorrectiveStatus>;
  delete(id: number): Promise<void>;
}

export const CORRECTIVE_STATUS_REGISTRY_REPOSITORY = Symbol(
  'CORRECTIVE_STATUS_REGISTRY_REPOSITORY',
);
