
export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface AnalysisResult {
  suggestion: string;
  entropy: number;
  perceivedType: string;
  isPotentiallyEncrypted: boolean;
}

export enum ProcessMode {
  ENCRYPT = 'ENCRYPT',
  DECRYPT = 'DECRYPT'
}
