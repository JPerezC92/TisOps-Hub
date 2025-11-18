import type { IWarRoomsRepository } from '@war-rooms/domain/repositories/war-rooms.repository.interface';
import type { WarRoom } from '@repo/database';

export class GetAllWarRoomsUseCase {
  constructor(private readonly repository: IWarRoomsRepository) {}

  async execute(): Promise<{ data: WarRoom[]; total: number }> {
    const [data, total] = await Promise.all([
      this.repository.findAll(),
      this.repository.countAll(),
    ]);

    return { data, total };
  }
}
