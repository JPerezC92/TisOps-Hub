import { Module } from '@nestjs/common';
import { WarRoomsController } from '@war-rooms/infrastructure/war-rooms.controller';
import { WarRoomsRepository } from '@war-rooms/infrastructure/repositories/war-rooms.repository';
import { WarRoomsExcelParser } from '@war-rooms/infrastructure/parsers/war-rooms-excel.parser';
import { WAR_ROOMS_REPOSITORY } from '@war-rooms/domain/repositories/war-rooms.repository.interface';
import type { IWarRoomsRepository } from '@war-rooms/domain/repositories/war-rooms.repository.interface';
import { GetAllWarRoomsUseCase } from '@war-rooms/application/use-cases/get-all-war-rooms.use-case';
import { DeleteAllWarRoomsUseCase } from '@war-rooms/application/use-cases/delete-all-war-rooms.use-case';
import { UploadAndParseWarRoomsUseCase } from '@war-rooms/application/use-cases/upload-and-parse-war-rooms.use-case';
import { DatabaseModule } from '@database/infrastructure/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WarRoomsController],
  providers: [
    WarRoomsExcelParser,
    {
      provide: WAR_ROOMS_REPOSITORY,
      useClass: WarRoomsRepository,
    },
    {
      provide: GetAllWarRoomsUseCase,
      useFactory: (repo: IWarRoomsRepository) => new GetAllWarRoomsUseCase(repo),
      inject: [WAR_ROOMS_REPOSITORY],
    },
    {
      provide: DeleteAllWarRoomsUseCase,
      useFactory: (repo: IWarRoomsRepository) => new DeleteAllWarRoomsUseCase(repo),
      inject: [WAR_ROOMS_REPOSITORY],
    },
    {
      provide: UploadAndParseWarRoomsUseCase,
      useFactory: (repo: IWarRoomsRepository) => new UploadAndParseWarRoomsUseCase(repo),
      inject: [WAR_ROOMS_REPOSITORY],
    },
  ],
})
export class WarRoomsModule {}
