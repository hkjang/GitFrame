import { runCommandSync, runCommandAsync } from './command-runtime';
import { ChildProcess } from 'child_process';
import { logger } from '../common/logger';

export class ComposeRuntime {
  static async pull(cwd: string, logFilePath: string): Promise<void> {
    logger.info('Pulling Docker Compose containers...');
    await runCommandSync('docker compose pull', cwd, logFilePath);
  }

  static async build(cwd: string, logFilePath: string): Promise<void> {
    logger.info('Building Docker Compose services...');
    await runCommandSync('docker compose build', cwd, logFilePath);
  }

  static start(cwd: string, logFilePath: string): ChildProcess {
    logger.info('Starting Docker Compose services...');
    return runCommandAsync('docker compose up', cwd, logFilePath);
  }

  static async stop(cwd: string, logFilePath: string): Promise<void> {
    logger.info('Stopping and removing Docker Compose services...');
    try {
      await runCommandSync('docker compose down', cwd, logFilePath);
    } catch (err: any) {
      logger.warn(`Failed to stop Docker Compose services: ${err.message}`);
    }
  }
}
