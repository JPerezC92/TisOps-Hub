export interface Application {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationPattern {
  id: number;
  applicationId: number;
  pattern: string;
  priority: number;
  matchType: string;
  isActive: boolean;
}

export interface ApplicationWithPatterns extends Application {
  patterns: ApplicationPattern[];
}
