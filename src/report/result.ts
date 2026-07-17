export interface TestResultReport {
  success: boolean;
  projectName: string;
  error?: string;
  playbackCaptions: Array<{ text: string; startMs: number; endMs: number }>;
  screenshots: string[];
  durationMs: number;
  timestamp: string;
}

export function createResultReport(
  success: boolean,
  projectName: string,
  error?: string,
  captions: Array<{ text: string; startMs: number; endMs: number }> = [],
  screenshots: string[] = [],
  durationMs: number = 0
): TestResultReport {
  return {
    success,
    projectName,
    error,
    playbackCaptions: captions,
    screenshots,
    durationMs,
    timestamp: new Date().toISOString()
  };
}
