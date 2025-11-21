import type {
  IWarRoomsRepository,
  WarRoomWithApp,
} from '@war-rooms/domain/repositories/war-rooms.repository.interface';

export class GetAllWarRoomsUseCase {
  constructor(private readonly repository: IWarRoomsRepository) {}

  async execute(): Promise<{ data: WarRoomWithApp[]; total: number }> {
    const [data, total] = await Promise.all([
      this.repository.findAllWithApplication(),
      this.repository.countAll(),
    ]);

    return { data, total };
  }

  async executeWithFilters(
    app?: string,
    month?: string,
  ): Promise<{ data: WarRoomWithApp[]; total: number }> {
    const [data, total] = await Promise.all([
      this.repository.findAllWithApplicationFiltered(app, month),
      this.repository.countFiltered(app, month),
    ]);

    return { data, total };
  }
}
