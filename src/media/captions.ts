import { PlaybackCaption } from '../browser/playwright-runner';

export function formatSrtTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const milliseconds = ms % 1000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number, size: number) => num.toString().padStart(size, '0');
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(milliseconds, 3)}`;
}

export function compileSrt(captions: PlaybackCaption[], offsetMs: number = 3000): string {
  let srt = '';
  captions.forEach((caption, index) => {
    const start = formatSrtTime(caption.startMs + offsetMs);
    const end = formatSrtTime(caption.endMs + offsetMs);
    srt += `${index + 1}\n${start} --> ${end}\n${caption.text}\n\n`;
  });
  return srt;
}
