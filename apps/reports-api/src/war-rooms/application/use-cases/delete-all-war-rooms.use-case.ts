import type { IWarRoomsRepository } from '@war-rooms/domain/repositories/war-rooms.repository.interface';

export class DeleteAllWarRoomsUseCase {
  constructor(private readonly repository: IWarRoomsRepository) {}

  async execute(): Promise<{ message: string; deleted: number }> {
    const deleted = await this.repository.deleteAll();

    return {
      message: 'All war rooms records deleted successfully',
      deleted,
    };
  }
}
