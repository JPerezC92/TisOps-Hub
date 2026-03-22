export const TRANSLATION_SERVICE = Symbol('TRANSLATION_SERVICE');

export interface ITranslationService {
  translateBatch(texts: string[], from: string, to: string): Promise<string[]>;
}
