import * as fs from 'fs';
import * as path from 'path';
import { TestResultReport } from './result';
import { logger } from '../common/logger';

export function generateHtmlReport(outputDir: string, report: TestResultReport): void {
  const htmlPath = path.join(outputDir, 'report.html');
  logger.info(`Generating HTML report at ${htmlPath}...`);

  const readLog = (name: string): string => {
    const logPath = path.join(outputDir, 'logs', name);
    if (!fs.existsSync(logPath)) return '(No log file found)';
    try {
      const content = fs.readFileSync(logPath, 'utf8');
      if (content.length > 100000) {
        return content.substring(content.length - 100000) + '\n\n[Log truncated: showing last 100KB]';
      }
      return content;
    } catch (e) {
      return `Error reading log: ${e}`;
    }
  };

  const browserLog = readLog('browser.log');
  const installLog = readLog('install.log');
  const runtimeLog = readLog('runtime.log');
  const ffmpegLog = readLog('ffmpeg.log');

  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  let screenshotsHtml = '';
  if (report.screenshots.length > 0) {
    screenshotsHtml = report.screenshots.map(s => {
      const basename = path.basename(s);
      const relPath = `screenshots/${basename}`;
      return `
      <div class="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-md">
        <a href="${relPath}" target="_blank">
          <img src="${relPath}" class="w-full h-auto max-h-60 object-contain bg-black" alt="${basename}"/>
        </a>
        <div class="p-3">
          <p class="text-xs text-gray-400 font-mono break-all">${basename}</p>
        </div>
      </div>`;
    }).join('\n');
  } else {
    screenshotsHtml = `<p class="text-gray-500 italic col-span-full">No screenshots captured.</p>`;
  }

  const videoFile = `${report.projectName}.mp4`;
  const videoPath = fs.existsSync(path.join(outputDir, videoFile)) ? videoFile : '';

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GitFrame - ${report.projectName} Report</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      background-color: #0b0f19;
      color: #e2e8f0;
    }
    .tab-content {
      display: none;
    }
    .tab-content.active {
      display: block;
    }
  </style>
</head>
<body class="font-sans min-h-screen">
  <div class="max-w-6xl mx-auto px-4 py-8">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-gray-800">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-white mb-2">GitFrame Pipeline Report</h1>
        <div class="flex items-center gap-3">
          <span class="text-sm font-mono text-gray-400 bg-gray-900 px-3 py-1 rounded-md border border-gray-800">${report.projectName}</span>
          <span class="text-xs text-gray-500">${new Date(report.timestamp).toLocaleString()}</span>
        </div>
      </div>
      <div class="mt-4 md:mt-0 flex items-center gap-4">
        <div>
          <span class="text-xs text-gray-500 block text-right font-mono">Duration</span>
          <span class="text-lg font-bold text-gray-300 font-mono">${(report.durationMs / 1000).toFixed(2)}s</span>
        </div>
        <div>
          ${report.success 
            ? '<span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-green-500/10 text-green-400 border border-green-500/20">🎉 Success</span>'
            : '<span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-red-500/10 text-red-400 border border-red-500/20">❌ Failed</span>'
          }
        </div>
      </div>
    </header>

    ${report.error ? `
    <div class="bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl p-4 mb-8">
      <h3 class="font-bold text-lg mb-1">Execution Error</h3>
      <p class="font-mono text-sm whitespace-pre-wrap break-all">${escapeHtml(report.error)}</p>
    </div>
    ` : ''}

    <main class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
      <section class="lg:col-span-2 space-y-8">
        <div class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
          <div class="bg-gray-800/50 px-4 py-3 border-b border-gray-800 flex justify-between items-center">
            <h3 class="font-bold text-white text-sm">🎥 Final Demo Video</h3>
            ${videoPath ? `<a href="${videoPath}" download class="text-xs text-blue-400 hover:text-blue-300 font-medium">Download MP4</a>` : ''}
          </div>
          <div class="aspect-video bg-black flex items-center justify-center">
            ${videoPath ? `
            <video class="w-full h-full" controls>
              <source src="${videoPath}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
            ` : `
            <div class="text-center p-6">
              <p class="text-gray-500 italic mb-2">Video rendering was skipped or failed.</p>
              ${fs.existsSync(path.join(outputDir, 'raw', 'browser-recording.webm')) 
                ? `<a href="raw/browser-recording.webm" class="text-xs text-blue-400 hover:underline">View Raw WebM Recording</a>`
                : ''
              }
            </div>
            `}
          </div>
        </div>

        <div>
          <h2 class="text-xl font-bold text-white mb-4">📸 Screenshots Gallery</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            ${screenshotsHtml}
          </div>
        </div>
      </section>

      <section class="space-y-8">
        <div class="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          <h3 class="font-bold text-white text-lg border-b border-gray-800 pb-3">📦 Pipeline Artifacts</h3>
          <ul class="space-y-3 text-sm font-mono">
            <li class="flex justify-between items-center">
              <span class="text-gray-400">Result JSON</span>
              <a href="result.json" target="_blank" class="text-blue-400 hover:underline">result.json</a>
            </li>
            <li class="flex justify-between items-center">
              <span class="text-gray-400">Scenario JSON</span>
              <a href="scenario.json" target="_blank" class="text-blue-400 hover:underline">scenario.json</a>
            </li>
            <li class="flex justify-between items-center">
              <span class="text-gray-400">Playwright Trace</span>
              ${fs.existsSync(path.join(outputDir, 'trace', 'playwright-trace.zip'))
                ? '<a href="trace/playwright-trace.zip" class="text-blue-400 hover:underline">playwright-trace.zip</a>'
                : '<span class="text-gray-600">N/A</span>'
              }
            </li>
            <li class="flex justify-between items-center">
              <span class="text-gray-400">Raw WebM Recording</span>
              ${fs.existsSync(path.join(outputDir, 'raw', 'browser-recording.webm'))
                ? '<a href="raw/browser-recording.webm" class="text-blue-400 hover:underline">browser-recording.webm</a>'
                : '<span class="text-gray-600">N/A</span>'
              }
            </li>
          </ul>
        </div>

        <div class="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          <h3 class="font-bold text-white text-lg border-b border-gray-800 pb-3">💬 Subtitle Timeline</h3>
          <div class="max-h-72 overflow-y-auto pr-2 space-y-3">
            ${report.playbackCaptions.length > 0 
              ? report.playbackCaptions.map((cap, i) => `
                <div class="bg-gray-800/40 p-3 rounded border border-gray-800">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-xs font-bold text-gray-500 font-mono">Step #${i + 1}</span>
                    <span class="text-[10px] text-blue-400 font-mono font-medium">${(cap.startMs / 1000).toFixed(1)}s - ${(cap.endMs / 1000).toFixed(1)}s</span>
                  </div>
                  <p class="text-sm text-gray-300">${escapeHtml(cap.text)}</p>
                </div>
              `).join('\n')
              : '<p class="text-gray-500 italic text-sm">No subtitle captions recorded.</p>'
            }
          </div>
        </div>
      </section>
    </main>

    <section class="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl mb-12">
      <div class="flex border-b border-gray-800 bg-gray-950 font-medium">
        <button onclick="switchTab('browser-log')" id="tab-btn-browser-log" class="tab-btn px-6 py-4 text-sm text-blue-400 border-b-2 border-blue-500 focus:outline-none">Browser Log</button>
        <button onclick="switchTab('runtime-log')" id="tab-btn-runtime-log" class="tab-btn px-6 py-4 text-sm text-gray-400 hover:text-gray-200 border-b-2 border-transparent focus:outline-none">Runtime Server Log</button>
        <button onclick="switchTab('install-log')" id="tab-btn-install-log" class="tab-btn px-6 py-4 text-sm text-gray-400 hover:text-gray-200 border-b-2 border-transparent focus:outline-none">Install Log</button>
        <button onclick="switchTab('ffmpeg-log')" id="tab-btn-ffmpeg-log" class="tab-btn px-6 py-4 text-sm text-gray-400 hover:text-gray-200 border-b-2 border-transparent focus:outline-none">FFmpeg Log</button>
      </div>

      <div class="p-6">
        <div id="tab-browser-log" class="tab-content active">
          <pre class="bg-black/40 p-4 rounded border border-gray-800 text-xs font-mono text-gray-300 overflow-auto max-h-96 whitespace-pre-wrap">${escapeHtml(browserLog)}</pre>
        </div>
        <div id="tab-runtime-log" class="tab-content">
          <pre class="bg-black/40 p-4 rounded border border-gray-800 text-xs font-mono text-gray-300 overflow-auto max-h-96 whitespace-pre-wrap">${escapeHtml(runtimeLog)}</pre>
        </div>
        <div id="tab-install-log" class="tab-content">
          <pre class="bg-black/40 p-4 rounded border border-gray-800 text-xs font-mono text-gray-300 overflow-auto max-h-96 whitespace-pre-wrap">${escapeHtml(installLog)}</pre>
        </div>
        <div id="tab-ffmpeg-log" class="tab-content">
          <pre class="bg-black/40 p-4 rounded border border-gray-800 text-xs font-mono text-gray-300 overflow-auto max-h-96 whitespace-pre-wrap">${escapeHtml(ffmpegLog)}</pre>
        </div>
      </div>
    </section>
  </div>

  <script>
    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
      document.getElementById('tab-' + tabId).classList.add('active');

      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('text-blue-400', 'border-blue-500');
        btn.classList.add('text-gray-400', 'border-transparent');
      });
      document.getElementById('tab-btn-' + tabId).classList.remove('text-gray-400', 'border-transparent');
      document.getElementById('tab-btn-' + tabId).classList.add('text-blue-400', 'border-blue-500');
    }
  </script>
</body>
</html>
  `;

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  logger.info(`HTML report successfully generated.`);
}
