import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';

import { AppModule } from './app.module';
import { DatabaseExceptionFilter } from './error-logs/infrastructure/filters/database-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // Global Exception Filters (DomainErrorFilter is registered via APP_FILTER in AppModule)
  const databaseExceptionFilter = app.get(DatabaseExceptionFilter);
  app.useGlobalFilters(databaseExceptionFilter);

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('TisOps Hub API')
    .setDescription('Task management API with Belcorp Reports integration')
    .setVersion('1.0')
    .addTag('tasks')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, cleanupOpenApiDoc(document));

  await app.listen(3000);
  console.log(`🚀 Application is running on: http://localhost:3000`);
  console.log(`📚 Swagger API docs available at: http://localhost:3000/api`);
}

void bootstrap();
