import { Page } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';
import { logger } from '../common/logger';

export async function takePageScreenshot(page: Page, outputDir: string, filename: string): Promise<string> {
  const screenshotDir = path.join(outputDir, 'screenshots');
  fs.mkdirSync(screenshotDir, { recursive: true });
  
  // Ensure the filename ends with .png
  const safeFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
  const targetPath = path.join(screenshotDir, safeFilename);

  logger.info(`Taking screenshot and saving to ${targetPath}`);
  await page.screenshot({ path: targetPath, fullPage: true });
  return targetPath;
}
