import { Module, Global } from '@nestjs/common';
import { db, DATABASE_CONNECTION } from '@repo/database';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useValue: db,
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
