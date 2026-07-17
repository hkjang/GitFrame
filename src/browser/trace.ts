import { BrowserContext } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { logger } from '../common/logger';

export async function startTracing(context: BrowserContext): Promise<void> {
  logger.info('Starting Playwright tracing...');
  await context.tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true
  });
}

export async function stopTracing(context: BrowserContext, outputDir: string): Promise<string> {
  logger.info('Stopping Playwright tracing...');
  const traceDir = path.join(outputDir, 'trace');
  fs.mkdirSync(traceDir, { recursive: true });
  const tracePath = path.join(traceDir, 'playwright-trace.zip');
  
  await context.tracing.stop({ path: tracePath });
  logger.info(`Playwright trace saved to ${tracePath}`);
  return tracePath;
}
