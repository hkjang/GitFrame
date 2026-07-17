import * as fs from 'fs';
import * as path from 'path';
import { runFfmpeg } from './ffmpeg';
import { logger } from '../common/logger';

export async function generateOutro(
  title: string,
  subtitle: string,
  duration: number,
  fontPath: string | null,
  outputPath: string,
  logFilePath: string,
  width: number = 1280,
  height: number = 720
): Promise<void> {
  logger.info(`Generating outro card of ${duration}s (${width}x${height}) to ${outputPath}`);
  
  const args = [
    '-y',
    '-f', 'lavfi',
    '-i', `color=c=0x0f172a:s=${width}x${height}:d=${duration}`,
  ];

  if (fontPath) {
    const escapedFont = fontPath.replace(/\\/g, '/').replace(/:/g, '\\:');
    const escapedTitle = title.replace(/'/g, "'\\'").replace(/:/g, '\\:');
    const escapedSub = subtitle.replace(/'/g, "'\\'").replace(/:/g, '\\:');

    const drawTextFilter = `drawtext=fontfile='${escapedFont}':text='${escapedTitle}':x=(w-text_w)/2:y=(h-text_h)/2-40:fontsize=44:fontcolor=white,` +
      `drawtext=fontfile='${escapedFont}':text='${escapedSub}':x=(w-text_w)/2:y=(h-text_h)/2+40:fontsize=22:fontcolor=0x94a3b8`;
    
    args.push('-vf', drawTextFilter);
  }

  try {
    await runFfmpeg(args, logFilePath);
  } catch (err: any) {
    if (fontPath) {
      logger.warn(`FFmpeg drawtext failed (likely no drawtext filter support). Retrying with plain solid color card...`);
      const fallbackArgs = [
        '-y',
        '-f', 'lavfi',
        '-i', `color=c=0x0f172a:s=${width}x${height}:d=${duration}`,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-r', '30',
        '-an',
        outputPath
      ];
      await runFfmpeg(fallbackArgs, logFilePath);
    } else {
      throw err;
    }
  }
}
