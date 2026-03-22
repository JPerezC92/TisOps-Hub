import { Injectable } from '@nestjs/common';
import translate from 'google-translate-api-x';
import type { ITranslationService } from '@monthly-report/domain/services/translation.service.interface';

@Injectable()
export class GoogleTranslationService implements ITranslationService {
  async translateBatch(
    texts: string[],
    from: string,
    to: string,
  ): Promise<string[]> {
    if (texts.length === 0) return [];

    const results: string[] = [];
    const batchSize = 30;

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      try {
        const response = await translate(batch, { from, to });
        const translatedBatch = Array.isArray(response)
          ? response.map((t: any) => t.text as string)
          : [(response as any).text as string];
        results.push(...translatedBatch);
      } catch {
        // On failure, return original texts for this batch
        results.push(...batch);
      }

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < texts.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return results;
  }
}
