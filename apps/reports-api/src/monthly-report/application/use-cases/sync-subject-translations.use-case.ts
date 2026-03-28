import type { IMonthlyReportRepository } from '@monthly-report/domain/repositories/monthly-report.repository.interface';
import type { ITranslationService } from '@monthly-report/domain/services/translation.service.interface';

// Patterns used to identify SB and FFVV apps from the aplicativos field
const APP_PATTERNS: Record<string, string[]> = {
  SB: ['somos belcorp'],
  FFVV: ['ffvv', 'crecer es ganar', 'gestiona tu negocio'],
};

interface TranslatableRecord {
  requestId: number;
  aplicativos: string;
  subject: string;
}

export class SyncSubjectTranslationsUseCase {
  constructor(
    private readonly repository: IMonthlyReportRepository,
    private readonly translationService: ITranslationService,
  ) {}

  private matchesTranslatableApp(aplicativos: string): boolean {
    const lower = aplicativos.toLowerCase();
    return Object.values(APP_PATTERNS).some((patterns) =>
      patterns.some((pattern) => lower.includes(pattern)),
    );
  }

  async execute(records: TranslatableRecord[]): Promise<{ translated: number; skipped: number }> {
    // Filter records that belong to SB or FFVV
    const translatableRecords = records.filter((r) =>
      this.matchesTranslatableApp(r.aplicativos),
    );

    if (translatableRecords.length === 0) {
      return { translated: 0, skipped: 0 };
    }

    const requestIds = translatableRecords.map((r) => r.requestId);

    // Get existing translations
    const existingTranslations = await this.repository.findSubjectTranslations(requestIds);
    const existingMap = new Map(
      existingTranslations.map((t) => [t.requestId, t]),
    );

    // Find records that need translation (new or subject changed)
    const needsTranslation: { requestId: number; subject: string }[] = [];

    for (const record of translatableRecords) {
      const existing = existingMap.get(record.requestId);
      if (!existing || existing.subject !== record.subject) {
        needsTranslation.push({
          requestId: record.requestId,
          subject: record.subject,
        });
      }
    }

    if (needsTranslation.length === 0) {
      return { translated: 0, skipped: translatableRecords.length };
    }

    // Translate missing/changed subjects
    const subjects = needsTranslation.map((r) => r.subject);
    const translated = await this.translationService.translateBatch(subjects, 'es', 'en');

    // Upsert translations
    const upserts = needsTranslation.map((r, i) => ({
      requestId: r.requestId,
      subject: r.subject,
      subjectEnglish: translated[i],
    }));

    await this.repository.upsertSubjectTranslations(upserts);

    return {
      translated: needsTranslation.length,
      skipped: translatableRecords.length - needsTranslation.length,
    };
  }
}
