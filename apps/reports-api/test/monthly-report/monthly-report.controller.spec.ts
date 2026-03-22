import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import request from 'supertest';
import { MonthlyReportController } from '@monthly-report/infrastructure/monthly-report.controller';
import { MONTHLY_REPORT_REPOSITORY } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import { GetAllMonthlyReportsUseCase } from '@monthly-report/application/use-cases/get-all-monthly-reports.use-case';
import { DeleteAllMonthlyReportsUseCase } from '@monthly-report/application/use-cases/delete-all-monthly-reports.use-case';
import { UploadAndParseMonthlyReportUseCase } from '@monthly-report/application/use-cases/upload-and-parse-monthly-report.use-case';
import { GetCriticalIncidentsAnalyticsUseCase } from '@monthly-report/application/use-cases/get-critical-incidents-analytics.use-case';
import { GetModuleEvolutionUseCase } from '@monthly-report/application/use-cases/get-module-evolution.use-case';
import { GetStabilityIndicatorsUseCase } from '@monthly-report/application/use-cases/get-stability-indicators.use-case';
import { GetCategoryDistributionUseCase } from '@monthly-report/application/use-cases/get-category-distribution.use-case';
import { GetBusinessFlowPriorityUseCase } from '@monthly-report/application/use-cases/get-business-flow-priority.use-case';
import { GetPriorityByAppUseCase } from '@monthly-report/application/use-cases/get-priority-by-app.use-case';
import { GetIncidentsByWeekUseCase } from '@monthly-report/application/use-cases/get-incidents-by-week.use-case';
import { GetIncidentOverviewByCategoryUseCase } from '@monthly-report/application/use-cases/get-incident-overview-by-category.use-case';
import { GetL3SummaryUseCase } from '@monthly-report/application/use-cases/get-l3-summary.use-case';
import { GetL3RequestsByStatusUseCase } from '@monthly-report/application/use-cases/get-l3-requests-by-status.use-case';
import { GetMissingScopeByParentUseCase } from '@monthly-report/application/use-cases/get-missing-scope-by-parent.use-case';
import { GetBugsByParentUseCase } from '@monthly-report/application/use-cases/get-bugs-by-parent.use-case';
import { GetIncidentsByDayUseCase } from '@monthly-report/application/use-cases/get-incidents-by-day.use-case';
import { GetIncidentsByReleaseByDayUseCase } from '@monthly-report/application/use-cases/get-incidents-by-release-by-day.use-case';
import { GetChangeReleaseByModuleUseCase } from '@monthly-report/application/use-cases/get-change-release-by-module.use-case';
import { SyncSubjectTranslationsUseCase } from '@monthly-report/application/use-cases/sync-subject-translations.use-case';
import { TRANSLATION_SERVICE } from '@monthly-report/domain/services/translation.service.interface';
import type { ITranslationService } from '@monthly-report/domain/services/translation.service.interface';
import { MonthlyReportExcelParser } from '@monthly-report/infrastructure/parsers/monthly-report-excel.parser';
import { DomainErrorFilter } from '@shared/infrastructure/filters/domain-error.filter';
import { MonthlyReportFactory } from './helpers/monthly-report.factory';

describe('MonthlyReportController (Integration)', () => {
  let app: INestApplication;
  let mockRepository: MockProxy<IMonthlyReportRepository>;

  beforeEach(async () => {
    mockRepository = mock<IMonthlyReportRepository>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MulterModule.register({
          limits: { fileSize: 10 * 1024 * 1024 },
        }),
      ],
      controllers: [MonthlyReportController],
      providers: [
        MonthlyReportExcelParser,
        {
          provide: MONTHLY_REPORT_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: GetAllMonthlyReportsUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetAllMonthlyReportsUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: DeleteAllMonthlyReportsUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new DeleteAllMonthlyReportsUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: UploadAndParseMonthlyReportUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new UploadAndParseMonthlyReportUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: GetCriticalIncidentsAnalyticsUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetCriticalIncidentsAnalyticsUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: GetModuleEvolutionUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetModuleEvolutionUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: GetStabilityIndicatorsUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetStabilityIndicatorsUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: GetCategoryDistributionUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetCategoryDistributionUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: GetBusinessFlowPriorityUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetBusinessFlowPriorityUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: GetPriorityByAppUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetPriorityByAppUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: GetIncidentsByWeekUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetIncidentsByWeekUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: GetIncidentOverviewByCategoryUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetIncidentOverviewByCategoryUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: GetL3SummaryUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetL3SummaryUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: GetL3RequestsByStatusUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetL3RequestsByStatusUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: GetMissingScopeByParentUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetMissingScopeByParentUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: GetBugsByParentUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetBugsByParentUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: GetIncidentsByDayUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetIncidentsByDayUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: GetIncidentsByReleaseByDayUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetIncidentsByReleaseByDayUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: GetChangeReleaseByModuleUseCase,
          useFactory: (repo: IMonthlyReportRepository) => new GetChangeReleaseByModuleUseCase(repo),
          inject: [MONTHLY_REPORT_REPOSITORY],
        },
        {
          provide: TRANSLATION_SERVICE,
          useValue: { translateBatch: async (texts: string[]) => texts } as ITranslationService,
        },
        {
          provide: SyncSubjectTranslationsUseCase,
          useFactory: (repo: IMonthlyReportRepository, translator: ITranslationService) =>
            new SyncSubjectTranslationsUseCase(repo, translator),
          inject: [MONTHLY_REPORT_REPOSITORY, TRANSLATION_SERVICE],
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new DomainErrorFilter());
    await app.init();
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await app.close();
  });

  describe('GET /monthly-report', () => {
    it('should return all monthly reports', async () => {
      const mockData = MonthlyReportFactory.createManyMonthlyReports(3);
      mockRepository.findAll.mockResolvedValue(mockData);
      mockRepository.countAll.mockResolvedValue(3);

      const response = await request(app.getHttpServer())
        .get('/monthly-report')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toHaveLength(3);
      expect(response.body.data.total).toBe(3);
    });

    it('should return empty array when no reports exist', async () => {
      mockRepository.findAll.mockResolvedValue([]);
      mockRepository.countAll.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/monthly-report')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
      expect(response.body.data.data).toEqual([]);
      expect(response.body.data.total).toBe(0);
    });
  });

  describe('POST /monthly-report/upload', () => {
    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/monthly-report/upload')
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('No file uploaded');
    });

    it('should return 400 for invalid file type', async () => {
      const fakeBuffer = Buffer.from('not-an-excel-file');

      const response = await request(app.getHttpServer())
        .post('/monthly-report/upload')
        .attach('file', fakeBuffer, {
          filename: 'test.txt',
          contentType: 'text/plain',
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toContain('Invalid file type');
    });
  });

  describe('DELETE /monthly-report', () => {
    it('should delete all monthly reports', async () => {
      mockRepository.deleteAll.mockResolvedValue(150);

      const response = await request(app.getHttpServer())
        .delete('/monthly-report')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
    });

    it('should handle deletion when no records exist', async () => {
      mockRepository.deleteAll.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .delete('/monthly-report')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
    });
  });

  describe('GET /monthly-report/analytics', () => {
    it('should return critical incidents analytics', async () => {
      mockRepository.findCriticalIncidentsFiltered.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/monthly-report/analytics')
        .expect(HttpStatus.OK);

      expect(response.body.status).toBe('success');
    });

    it('should pass app and month filters', async () => {
      mockRepository.findCriticalIncidentsFiltered.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/monthly-report/analytics?app=FFVV&month=2025-01')
        .expect(HttpStatus.OK);

      expect(mockRepository.findCriticalIncidentsFiltered).toHaveBeenCalledWith('FFVV', '2025-01');
    });
  });
});
