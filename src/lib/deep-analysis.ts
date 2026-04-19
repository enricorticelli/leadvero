export type AnalysisPreset = "light" | "standard" | "deep";

export interface AnalysisAdvancedConfig {
  maxPages: number;
  runTimeoutMs: number;
  includeBlogAndProductPaths: boolean;
}

export const ANALYSIS_PRESET_DEFAULTS: Record<AnalysisPreset, AnalysisAdvancedConfig> = {
  light: {
    maxPages: 10,
    runTimeoutMs: 60_000,
    includeBlogAndProductPaths: true,
  },
  standard: {
    maxPages: 25,
    runTimeoutMs: 120_000,
    includeBlogAndProductPaths: true,
  },
  deep: {
    maxPages: 50,
    runTimeoutMs: 180_000,
    includeBlogAndProductPaths: true,
  },
};

export const ANALYSIS_PRESET_LABELS: Record<AnalysisPreset, string> = {
  light: "Leggera (10 pagine)",
  standard: "Standard (25 pagine)",
  deep: "Profonda (50 pagine)",
};

export type AnalysisIssueSeverity = "high" | "medium" | "low";

export interface AnalysisIssue {
  code: string;
  severity: AnalysisIssueSeverity;
  message: string;
}

export interface AnalysisSummary {
  generatedAt: string;
  pagesScanned: number;
  issueCounts: {
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  issuesByCode: Record<string, number>;
  topFindings: string[];
}
