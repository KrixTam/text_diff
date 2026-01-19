
export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface ComparisonResult {
  file1Name: string;
  file2Name: string;
  diffs: DiffPart[];
  summary?: string;
}

export enum ViewMode {
  SPLIT = 'SPLIT',
  UNIFIED = 'UNIFIED'
}
