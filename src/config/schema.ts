export interface ProjectConfig {
  language?: 'node' | 'python' | 'go' | 'java' | 'compose' | 'static' | string;
  install?: string;
  build?: string;
  start?: string;
  port?: number;
  env?: Record<string, string>;
}

export interface VideoConfig {
  width?: number;
  height?: number;
  fps?: number;
}

export interface CardConfig {
  title?: string;
  subtitle?: string;
  duration?: number;
}

export interface GitFrameConfig {
  project?: ProjectConfig;
  scenarioFile?: string;
  outputDir?: string;
  video?: VideoConfig;
  intro?: CardConfig;
  outro?: CardConfig;
  captions?: boolean;
}
