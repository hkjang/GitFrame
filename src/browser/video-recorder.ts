import { Video } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { logger } from '../common/logger';

export async function saveBrowserRecording(video: Video | null, outputDir: string): Promise<string> {
  if (!video) {
    logger.warn('No video recording found for browser context.');
    return '';
  }

  const rawDir = path.join(outputDir, 'raw');
  fs.mkdirSync(rawDir, { recursive: true });
  const targetPath = path.join(rawDir, 'browser-recording.webm');

  logger.info(`Saving raw browser recording webm to ${targetPath}...`);
  try {
    await video.saveAs(targetPath);
    logger.info('Raw browser recording saved successfully.');
    return targetPath;
  } catch (err: any) {
    logger.error(`Failed to save browser recording: ${err.message}`);
    return '';
  }
}
