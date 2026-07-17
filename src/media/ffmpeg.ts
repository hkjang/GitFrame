import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../common/logger';
import { MediaRenderingError } from '../common/errors';
import { PlaybackCaption } from '../browser/playwright-runner';
import { compileSrt } from './captions';
import { generateIntro } from './intro';
import { generateOutro } from './outro';

export function getFontFile(): string | null {
  const linuxFonts = [
    '/home/gaga/.fonts/NanumGothicBold.ttf',
    '/home/gaga/.fonts/NanumBarunGothicBold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/freefont/FreeSans.ttf',
    '/usr/share/fonts/fonts-go/Go-Regular.ttf'
  ];
  const winFonts = [
    'C:/Windows/Fonts/arial.ttf',
    'C:/Windows/Fonts/segoeui.ttf'
  ];

  if (process.platform === 'win32') {
    for (const f of winFonts) {
      if (fs.existsSync(f)) return f;
    }
  } else {
    for (const f of linuxFonts) {
      if (fs.existsSync(f)) return f;
    }
  }
  return null;
}

export async function runFfmpeg(args: string[], logFilePath: string, cwd?: string): Promise<void> {
  if (!ffmpegPath) {
    throw new MediaRenderingError('FFmpeg binary not found in ffmpeg-static.');
  }

  logger.info(`Running FFmpeg: ffmpeg ${args.join(' ')}`);
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
  fs.appendFileSync(logFilePath, `\n=== FFmpeg Command: ffmpeg ${args.join(' ')} ===\n`, 'utf8');

  const child = spawn(ffmpegPath, args, {
    cwd,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  child.stdout?.pipe(logStream);
  child.stderr?.pipe(logStream);

  return new Promise<void>((resolve, reject) => {
    child.on('close', (code) => {
      logStream.end();
      if (code === 0) {
        resolve();
      } else {
        reject(new MediaRenderingError(`FFmpeg failed with exit code ${code}. Check logs at ${logFilePath}`));
      }
    });
    child.on('error', (err) => {
      logStream.end();
      reject(new MediaRenderingError(`FFmpeg invocation failed: ${err.message}`));
    });
  });
}

export async function renderMergedVideo(
  outputDir: string,
  projectName: string,
  captions: PlaybackCaption[],
  options: {
    width?: number;
    height?: number;
    fps?: number;
    introTitle?: string;
    introSubtitle?: string;
    introDuration?: number;
    outroTitle?: string;
    outroSubtitle?: string;
    outroDuration?: number;
    burnCaptions?: boolean;
  }
): Promise<void> {
  const width = options.width || 1280;
  const height = options.height || 720;
  const fps = options.fps || 30;
  const introDuration = options.introDuration !== undefined ? options.introDuration : 3;
  const outroDuration = options.outroDuration !== undefined ? options.outroDuration : 2;
  const burnCaptions = options.burnCaptions !== undefined ? options.burnCaptions : true;

  const logFilePath = path.join(outputDir, 'logs', 'ffmpeg.log');
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });

  const rawWebmPath = path.join(outputDir, 'raw', 'browser-recording.webm');
  if (!fs.existsSync(rawWebmPath)) {
    throw new MediaRenderingError(`Raw browser recording file not found at ${rawWebmPath}`);
  }

  // Paths relative to outputDir to avoid path/escaping complications in FFmpeg
  const tempIntro = 'temp_intro.mp4';
  const tempMiddle = 'temp_middle.mp4';
  const tempOutro = 'temp_outro.mp4';
  const srtFilename = 'subtitles.srt';
  const finalVideoFilename = `${projectName}.mp4`;
  const thumbnailFilename = `${projectName}-thumbnail.png`;

  const fontPath = getFontFile();
  if (!fontPath) {
    logger.warn('No system font detected. Intro/outro texts will not be printed.');
  }

  try {
    // 1. Generate Intro Card
    const fullIntroPath = path.join(outputDir, tempIntro);
    await generateIntro(
      options.introTitle || 'Demo Title',
      options.introSubtitle || 'Subtitle',
      introDuration,
      fontPath,
      fullIntroPath,
      logFilePath,
      width,
      height
    );

    // 2. Transcode & Scale WebM Middle Video
    logger.info(`Transcoding raw recording into intermediate MP4...`);
    const transcodeArgs = [
      '-y',
      '-i', 'raw/browser-recording.webm',
      '-vf', `scale=${width}:${height},setsar=1,format=yuv420p`,
      '-r', String(fps),
      '-an',
      tempMiddle
    ];
    await runFfmpeg(transcodeArgs, logFilePath, outputDir);

    // 3. Generate Outro Card
    const fullOutroPath = path.join(outputDir, tempOutro);
    await generateOutro(
      options.outroTitle || 'Thank You',
      options.outroSubtitle || 'Created with GitFrame',
      outroDuration,
      fontPath,
      fullOutroPath,
      logFilePath,
      width,
      height
    );

    // 4. Compile SRT if subtitles are requested
    const hasCaptions = captions.length > 0;
    const useSrt = burnCaptions && hasCaptions;
    if (useSrt) {
      const srtContent = compileSrt(captions, introDuration * 1000);
      fs.writeFileSync(path.join(outputDir, srtFilename), srtContent, 'utf8');
      logger.info(`Compiled subtitles saved to ${path.join(outputDir, srtFilename)}`);
    }

    // 5. Concatenate and Burn Subtitles (if enabled)
    logger.info('Concatenating video files and applying subtitles if available...');
    const concatArgs = [
      '-y',
      '-i', tempIntro,
      '-i', tempMiddle,
      '-i', tempOutro,
    ];

    let filterComplex = '[0:v][1:v][2:v]concat=n=3:v=1:a=0[v]';
    if (useSrt) {
      // In FFmpeg subtitles filter, the srt path must be relative/escaped.
      // Since cwd is outputDir, we can just pass the relative srt filename.
      filterComplex += `;[v]subtitles=${srtFilename}[v_sub]`;
    }

    concatArgs.push('-filter_complex', filterComplex);
    concatArgs.push('-map', useSrt ? '[v_sub]' : '[v]');
    concatArgs.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', finalVideoFilename);

    try {
      await runFfmpeg(concatArgs, logFilePath, outputDir);
    } catch (err: any) {
      if (useSrt) {
        logger.warn(`FFmpeg concat with subtitles failed (likely no subtitles filter support). Retrying concat without subtitles...`);
        const fallbackConcatArgs = [
          '-y',
          '-i', tempIntro,
          '-i', tempMiddle,
          '-i', tempOutro,
          '-filter_complex', '[0:v][1:v][2:v]concat=n=3:v=1:a=0[v]',
          '-map', '[v]',
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          finalVideoFilename
        ];
        await runFfmpeg(fallbackConcatArgs, logFilePath, outputDir);
      } else {
        throw err;
      }
    }
    logger.info(`Final merged video created: ${path.join(outputDir, finalVideoFilename)}`);

    // 6. Generate Thumbnail
    logger.info('Extracting representative thumbnail image...');
    const thumbnailArgs = [
      '-y',
      '-ss', '00:00:01', // Extract frame at 1s of the middle recording
      '-i', tempMiddle,
      '-vframes', '1',
      thumbnailFilename
    ];
    await runFfmpeg(thumbnailArgs, logFilePath, outputDir);
    logger.info(`Thumbnail extracted: ${path.join(outputDir, thumbnailFilename)}`);

  } finally {
    // Cleanup intermediate video files
    const cleanFile = (file: string) => {
      const full = path.join(outputDir, file);
      if (fs.existsSync(full)) {
        try { fs.unlinkSync(full); } catch (_) {}
      }
    };
    cleanFile(tempIntro);
    cleanFile(tempMiddle);
    cleanFile(tempOutro);
  }
}
