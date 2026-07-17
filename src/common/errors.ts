export class GitFrameError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'GitFrameError';
  }
}

export class ConfigError extends GitFrameError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigError';
  }
}

export class AutoDetectError extends GitFrameError {
  constructor(message: string) {
    super(message, 'AUTO_DETECT_ERROR');
    this.name = 'AutoDetectError';
  }
}

export class ProcessRuntimeError extends GitFrameError {
  constructor(message: string) {
    super(message, 'PROCESS_RUNTIME_ERROR');
    this.name = 'ProcessRuntimeError';
  }
}

export class PlaywrightScenarioError extends GitFrameError {
  constructor(message: string) {
    super(message, 'PLAYWRIGHT_SCENARIO_ERROR');
    this.name = 'PlaywrightScenarioError';
  }
}

export class MediaRenderingError extends GitFrameError {
  constructor(message: string) {
    super(message, 'MEDIA_RENDERING_ERROR');
    this.name = 'MediaRenderingError';
  }
}

export class ValidationError extends GitFrameError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
