import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ProblemsModule } from '@problems/problems.module';
import { DatabaseModule } from '@database/database.module';

describe('ProblemsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProblemsModule, DatabaseModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /problems', () => {
    it('should return all problems', async () => {
      const response = await request(app.getHttpServer())
        .get('/problems')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(typeof response.body.total).toBe('number');
    });
  });

  describe('POST /problems/upload', () => {
    it('should upload and parse Excel file successfully', async () => {
      // Create a mock Excel file buffer
      const mockExcelBuffer = Buffer.from('mock excel data');

      const response = await request(app.getHttpServer())
        .post('/problems/upload')
        .attach('file', mockExcelBuffer, 'test.xlsx')
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('imported');
      expect(response.body).toHaveProperty('total');
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/problems/upload')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('No file uploaded');
    });

    it('should return 400 when file is not Excel', async () => {
      const mockPdfBuffer = Buffer.from('mock pdf data');

      const response = await request(app.getHttpServer())
        .post('/problems/upload')
        .attach('file', mockPdfBuffer, 'test.pdf')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Invalid file type');
    });

    it('should accept .xls files', async () => {
      const mockExcelBuffer = Buffer.from('mock excel data');

      const response = await request(app.getHttpServer())
        .post('/problems/upload')
        .attach('file', mockExcelBuffer, 'test.xls')
        .expect(201);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('DELETE /problems', () => {
    it('should delete all problems successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete('/problems')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('deleted');
      expect(typeof response.body.deleted).toBe('number');
    });
  });

  describe('Integration flow', () => {
    it('should upload, retrieve, and delete problems', async () => {
      // 1. Upload problems
      const mockExcelBuffer = Buffer.from('mock excel data');
      const uploadResponse = await request(app.getHttpServer())
        .post('/problems/upload')
        .attach('file', mockExcelBuffer, 'test.xlsx')
        .expect(201);

      expect(uploadResponse.body.imported).toBeGreaterThanOrEqual(0);

      // 2. Retrieve problems
      const getResponse = await request(app.getHttpServer())
        .get('/problems')
        .expect(200);

      expect(Array.isArray(getResponse.body.data)).toBe(true);

      // 3. Delete all problems
      const deleteResponse = await request(app.getHttpServer())
        .delete('/problems')
        .expect(200);

      expect(deleteResponse.body.deleted).toBeGreaterThanOrEqual(0);

      // 4. Verify deletion
      const verifyResponse = await request(app.getHttpServer())
        .get('/problems')
        .expect(200);

      expect(verifyResponse.body.data).toHaveLength(0);
      expect(verifyResponse.body.total).toBe(0);
    });
  });
});
