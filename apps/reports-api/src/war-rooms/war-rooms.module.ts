import { Module } from '@nestjs/common';
import { WarRoomsController } from './war-rooms.controller';
import { WarRoomsService } from './war-rooms.service';
import { DatabaseModule } from '../database/infrastructure/database.module';
import { WarRoomsRepository } from './infrastructure/repositories/war-rooms.repository';
import { WarRoomsExcelParser } from './infrastructure/parsers/war-rooms-excel.parser';
import { WAR_ROOMS_REPOSITORY } from './domain/repositories/war-rooms.repository.interface';
import { GetAllWarRoomsUseCase } from './application/use-cases/get-all-war-rooms.use-case';
import { DeleteAllWarRoomsUseCase } from './application/use-cases/delete-all-war-rooms.use-case';
import { UploadAndParseWarRoomsUseCase } from './application/use-cases/upload-and-parse-war-rooms.use-case';

@Module({
  imports: [DatabaseModule],
  controllers: [WarRoomsController],
  providers: [
    WarRoomsService,
    WarRoomsExcelParser,
    {
      provide: WAR_ROOMS_REPOSITORY,
      useClass: WarRoomsRepository,
    },
    {
      provide: GetAllWarRoomsUseCase,
      useFactory: (repository: any) => new GetAllWarRoomsUseCase(repository),
      inject: [WAR_ROOMS_REPOSITORY],
    },
    {
      provide: DeleteAllWarRoomsUseCase,
      useFactory: (repository: any) => new DeleteAllWarRoomsUseCase(repository),
      inject: [WAR_ROOMS_REPOSITORY],
    },
    {
      provide: UploadAndParseWarRoomsUseCase,
      useFactory: (repository: any) => new UploadAndParseWarRoomsUseCase(repository),
      inject: [WAR_ROOMS_REPOSITORY],
    },
  ],
  exports: [WarRoomsService],
})
export class WarRoomsModule {}
