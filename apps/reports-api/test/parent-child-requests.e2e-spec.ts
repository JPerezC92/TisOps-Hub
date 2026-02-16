import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from '../src/app.module';
import { DatabaseModule } from '@database/infrastructure/database.module';
import { TestDatabaseModule } from '@database/infrastructure/test-database.module';

describe('Parent Child Requests (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(TestDatabaseModule)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Complete File Upload Flow', () => {
    it('should upload Excel file, create records, retrieve them, and clean up', async () => {
      // Step 1: Upload the real Excel file
      const filePath = join(__dirname, '../files/REP02 padre hijo.xlsx');
      const fileBuffer = readFileSync(filePath);

      const uploadResponse = await request(app.getHttpServer())
        .post('/parent-child-requests/upload')
        .attach('file', fileBuffer, {
          filename: 'REP02 padre hijo.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

      // Debug: Log the actual response
      console.log('Upload status:', uploadResponse.status);
      console.log('Upload response body:', JSON.stringify(uploadResponse.body, null, 2));

      if (uploadResponse.status !== 201) {
        console.error('Upload failed!', uploadResponse.body);
      }

      expect(uploadResponse.status).toBe(201);

      // Verify upload response (JSend format)
      expect(uploadResponse.body.status).toBe('success');
      expect(uploadResponse.body.data).toMatchObject({
        message: 'File processed successfully',
        imported: expect.any(Number),
        skipped: expect.any(Number),
        total: expect.any(Number),
      });

      const importedCount = uploadResponse.body.data.imported;
      expect(importedCount).toBeGreaterThan(0);

      // Step 2: Retrieve all records to verify they were created (JSend format)
      const getAllResponse = await request(app.getHttpServer())
        .get('/parent-child-requests')
        .expect(200);

      expect(getAllResponse.body.status).toBe('success');
      expect(getAllResponse.body.data).toMatchObject({
        data: expect.any(Array),
        total: expect.any(Number),
      });

      expect(getAllResponse.body.data.data.length).toBeGreaterThan(0);
      expect(getAllResponse.body.data.total).toBe(importedCount);

      // Verify record structure
      const firstRecord = getAllResponse.body.data.data[0];
      expect(firstRecord).toMatchObject({
        id: expect.any(Number),
        requestId: expect.any(String),
        linkedRequestId: expect.any(String),
      });

      // Step 3: Check stats (JSend format)
      const statsResponse = await request(app.getHttpServer())
        .get('/parent-child-requests/stats')
        .expect(200);

      expect(statsResponse.body.status).toBe('success');
      expect(statsResponse.body.data).toMatchObject({
        totalRecords: importedCount,
        uniqueParents: expect.any(Number),
        topParents: expect.any(Array),
      });

      expect(statsResponse.body.data.uniqueParents).toBeGreaterThan(0);
    });
  });
});
