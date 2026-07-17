import { GitFrameConfig } from './schema';
import { ValidationError } from '../common/errors';

export function validateConfig(config: any): GitFrameConfig {
  if (!config || typeof config !== 'object') {
    throw new ValidationError('Configuration must be an object.');
  }

  // Project validation
  if (config.project !== undefined) {
    if (typeof config.project !== 'object' || config.project === null) {
      throw new ValidationError('project section must be an object');
    }
    const p = config.project;
    if (p.language !== undefined && typeof p.language !== 'string') {
      throw new ValidationError('project.language must be a string');
    }
    if (p.install !== undefined && typeof p.install !== 'string') {
      throw new ValidationError('project.install must be a string');
    }
    if (p.build !== undefined && typeof p.build !== 'string') {
      throw new ValidationError('project.build must be a string');
    }
    if (p.start !== undefined && typeof p.start !== 'string') {
      throw new ValidationError('project.start must be a string');
    }
    if (p.port !== undefined) {
      const port = Number(p.port);
      if (isNaN(port) || port <= 0 || port > 65535) {
        throw new ValidationError('project.port must be a valid port number (1-65535)');
      }
    }
    if (p.env !== undefined) {
      if (typeof p.env !== 'object' || p.env === null) {
        throw new ValidationError('project.env must be an object');
      }
      for (const [key, val] of Object.entries(p.env)) {
        if (typeof val !== 'string' && typeof val !== 'number' && typeof val !== 'boolean') {
          throw new ValidationError(`project.env.${key} must be a primitive value (string/number/boolean)`);
        }
      }
    }
  }

  // Other configurations validation
  if (config.scenarioFile !== undefined && typeof config.scenarioFile !== 'string') {
    throw new ValidationError('scenarioFile must be a string');
  }

  if (config.outputDir !== undefined && typeof config.outputDir !== 'string') {
    throw new ValidationError('outputDir must be a string');
  }

  if (config.video !== undefined) {
    if (typeof config.video !== 'object' || config.video === null) {
      throw new ValidationError('video section must be an object');
    }
    const v = config.video;
    if (v.width !== undefined && (typeof v.width !== 'number' || v.width <= 0)) {
      throw new ValidationError('video.width must be a positive number');
    }
    if (v.height !== undefined && (typeof v.height !== 'number' || v.height <= 0)) {
      throw new ValidationError('video.height must be a positive number');
    }
    if (v.fps !== undefined && (typeof v.fps !== 'number' || v.fps <= 0)) {
      throw new ValidationError('video.fps must be a positive number');
    }
  }

  if (config.intro !== undefined) {
    if (typeof config.intro !== 'object' || config.intro === null) {
      throw new ValidationError('intro section must be an object');
    }
    const intro = config.intro;
    if (intro.title !== undefined && typeof intro.title !== 'string') {
      throw new ValidationError('intro.title must be a string');
    }
    if (intro.subtitle !== undefined && typeof intro.subtitle !== 'string') {
      throw new ValidationError('intro.subtitle must be a string');
    }
    if (intro.duration !== undefined && (typeof intro.duration !== 'number' || intro.duration < 0)) {
      throw new ValidationError('intro.duration must be a non-negative number');
    }
  }

  if (config.outro !== undefined) {
    if (typeof config.outro !== 'object' || config.outro === null) {
      throw new ValidationError('outro section must be an object');
    }
    const outro = config.outro;
    if (outro.title !== undefined && typeof outro.title !== 'string') {
      throw new ValidationError('outro.title must be a string');
    }
    if (outro.subtitle !== undefined && typeof outro.subtitle !== 'string') {
      throw new ValidationError('outro.subtitle must be a string');
    }
    if (outro.duration !== undefined && (typeof outro.duration !== 'number' || outro.duration < 0)) {
      throw new ValidationError('outro.duration must be a non-negative number');
    }
  }

  if (config.captions !== undefined && typeof config.captions !== 'boolean') {
    throw new ValidationError('captions must be a boolean');
  }

  return config as GitFrameConfig;
}
