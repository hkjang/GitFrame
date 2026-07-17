import * as fs from 'fs';
import * as path from 'path';
import { ComposeDetector } from '../detector/compose-detector';
import { NodeDetector, DetectorResult } from '../detector/node-detector';
import { PythonDetector } from '../detector/python-detector';
import { GoDetector } from '../detector/go-detector';
import { JavaDetector } from '../detector/java-detector';
import { logger } from '../common/logger';
import { getTempWorkspaceDir } from '../common/paths';
import { cloneRepository } from './git-source';
import { copyDirectory } from './local-source';

export class Workspace {
  constructor(public readonly dir: string, public readonly isTemporary: boolean) {}

  detectProject(): DetectorResult {
    const detectors = [
      new ComposeDetector(),
      new NodeDetector(),
      new PythonDetector(),
      new GoDetector(),
      new JavaDetector()
    ];

    for (const detector of detectors) {
      if (detector.detect(this.dir)) {
        const recommendation = detector.getRecommendation(this.dir);
        logger.info(`Detected project type: ${recommendation.language} in ${this.dir}`);
        return recommendation;
      }
    }

    logger.info(`No specific project type detected. Defaulting to static web server.`);
    return {
      language: 'static',
      install: '',
      build: '',
      start: 'npx http-server -p 8080',
      port: 8080
    };
  }

  cleanup(): void {
    if (this.isTemporary) {
      logger.info(`Cleaning up temporary workspace at ${this.dir}...`);
      try {
        fs.rmSync(this.dir, { recursive: true, force: true });
        logger.info(`Workspace cleaned up successfully.`);
      } catch (err: any) {
        logger.warn(`Failed to clean up temporary workspace: ${err.message}`);
      }
    }
  }
}

export function createWorkspaceFromGit(repoUrl: string): Workspace {
  const tempDir = getTempWorkspaceDir();
  fs.mkdirSync(tempDir, { recursive: true });
  try {
    cloneRepository(repoUrl, tempDir);
    return new Workspace(tempDir, true);
  } catch (err) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (_) {}
    throw err;
  }
}

export function createWorkspaceFromLocal(localPath: string, useTemp: boolean = true): Workspace {
  if (!useTemp) {
    return new Workspace(path.resolve(localPath), false);
  }

  const tempDir = getTempWorkspaceDir();
  fs.mkdirSync(tempDir, { recursive: true });
  try {
    logger.info(`Copying project from ${localPath} to temp workspace ${tempDir}...`);
    copyDirectory(path.resolve(localPath), tempDir);
    return new Workspace(tempDir, true);
  } catch (err) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (_) {}
    throw err;
  }
}
