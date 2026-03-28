import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mock, MockProxy } from 'vitest-mock-extended';
import { SyncSubjectTranslationsUseCase } from '@monthly-report/application/use-cases/sync-subject-translations.use-case';
import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import type { ITranslationService } from '@monthly-report/domain/services/translation.service.interface';

describe('SyncSubjectTranslationsUseCase', () => {
  let useCase: SyncSubjectTranslationsUseCase;
  let mockRepository: MockProxy<IMonthlyReportRepository>;
  let mockTranslationService: MockProxy<ITranslationService>;

  beforeEach(() => {
    mockRepository = mock<IMonthlyReportRepository>();
    mockTranslationService = mock<ITranslationService>();
    useCase = new SyncSubjectTranslationsUseCase(mockRepository, mockTranslationService);
  });

  it('should skip records that do not match SB or FFVV', async () => {
    const records = [
      { requestId: 1, aplicativos: 'B2B', subject: 'Some issue' },
      { requestId: 2, aplicativos: 'MDM', subject: 'Another issue' },
    ];

    const result = await useCase.execute(records);

    expect(result).toEqual({ translated: 0, skipped: 0 });
    expect(mockRepository.findSubjectTranslations).not.toHaveBeenCalled();
    expect(mockTranslationService.translateBatch).not.toHaveBeenCalled();
  });

  it('should translate SB records', async () => {
    const records = [
      { requestId: 100, aplicativos: 'Somos Belcorp', subject: 'Error en pedido' },
    ];

    mockRepository.findSubjectTranslations.mockResolvedValue([]);
    mockTranslationService.translateBatch.mockResolvedValue(['Order error']);

    const result = await useCase.execute(records);

    expect(result).toEqual({ translated: 1, skipped: 0 });
    expect(mockTranslationService.translateBatch).toHaveBeenCalledWith(['Error en pedido'], 'es', 'en');
    expect(mockRepository.upsertSubjectTranslations).toHaveBeenCalledWith([
      { requestId: 100, subject: 'Error en pedido', subjectEnglish: 'Order error' },
    ]);
  });

  it('should translate FFVV records', async () => {
    const records = [
      { requestId: 200, aplicativos: 'APP - Crecer es Ganar (FFVV)', subject: 'Problema login' },
    ];

    mockRepository.findSubjectTranslations.mockResolvedValue([]);
    mockTranslationService.translateBatch.mockResolvedValue(['Login problem']);

    const result = await useCase.execute(records);

    expect(result).toEqual({ translated: 1, skipped: 0 });
  });

  it('should skip records already translated with same subject', async () => {
    const records = [
      { requestId: 100, aplicativos: 'Somos Belcorp', subject: 'Error en pedido' },
    ];

    mockRepository.findSubjectTranslations.mockResolvedValue([
      { requestId: 100, subject: 'Error en pedido', subjectEnglish: 'Order error' },
    ]);

    const result = await useCase.execute(records);

    expect(result).toEqual({ translated: 0, skipped: 1 });
    expect(mockTranslationService.translateBatch).not.toHaveBeenCalled();
  });

  it('should re-translate when subject has changed', async () => {
    const records = [
      { requestId: 100, aplicativos: 'Somos Belcorp', subject: 'Nuevo error en pedido' },
    ];

    mockRepository.findSubjectTranslations.mockResolvedValue([
      { requestId: 100, subject: 'Error en pedido', subjectEnglish: 'Order error' },
    ]);
    mockTranslationService.translateBatch.mockResolvedValue(['New order error']);

    const result = await useCase.execute(records);

    expect(result).toEqual({ translated: 1, skipped: 0 });
    expect(mockRepository.upsertSubjectTranslations).toHaveBeenCalledWith([
      { requestId: 100, subject: 'Nuevo error en pedido', subjectEnglish: 'New order error' },
    ]);
  });

  it('should handle mix of translatable and non-translatable records', async () => {
    const records = [
      { requestId: 1, aplicativos: 'B2B', subject: 'Issue A' },
      { requestId: 2, aplicativos: 'FFVV', subject: 'Problema B' },
      { requestId: 3, aplicativos: 'Somos Belcorp', subject: 'Error C' },
    ];

    mockRepository.findSubjectTranslations.mockResolvedValue([]);
    mockTranslationService.translateBatch.mockResolvedValue(['Problem B', 'Error C']);

    const result = await useCase.execute(records);

    expect(result).toEqual({ translated: 2, skipped: 0 });
    expect(mockTranslationService.translateBatch).toHaveBeenCalledWith(
      ['Problema B', 'Error C'], 'es', 'en',
    );
  });

  it('should return empty result for empty records', async () => {
    const result = await useCase.execute([]);
    expect(result).toEqual({ translated: 0, skipped: 0 });
  });
});
