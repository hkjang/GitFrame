import { execSync } from 'child_process';
import { AutoDetectError } from '../common/errors';
import { logger } from '../common/logger';

export function cloneRepository(repoUrl: string, targetDir: string): void {
  logger.info(`Cloning repository ${repoUrl} to ${targetDir}...`);
  try {
    execSync(`git clone --depth 1 "${repoUrl}" "${targetDir}"`, {
      stdio: 'pipe',
      env: process.env
    });
    logger.info(`Successfully cloned repository.`);
  } catch (err: any) {
    const errorMsg = err.stderr?.toString() || err.message;
    throw new AutoDetectError(`Failed to clone git repository ${repoUrl}: ${errorMsg}`);
  }
}
