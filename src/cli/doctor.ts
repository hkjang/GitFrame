import { execSync } from 'child_process';
import { logger } from '../common/logger';
import ffmpegPath from 'ffmpeg-static';

function checkCommandVersion(cmd: string): string | null {
  try {
    const stdout = execSync(cmd, { stdio: 'pipe' }).toString().trim();
    return stdout.split('\n')[0];
  } catch (e) {
    return null;
  }
}

export function runDoctorCommand(): void {
  logger.info('Running GitFrame CLI dependency checks...');

  const gitVer = checkCommandVersion('git --version');
  const nodeVer = checkCommandVersion('node --version');
  const dockerVer = checkCommandVersion('docker --version');
  const composeVer = checkCommandVersion('docker compose version');
  const playwrightVer = checkCommandVersion('npx playwright --version');
  
  let ffmpegVer = checkCommandVersion('ffmpeg -version');
  if (!ffmpegVer && ffmpegPath) {
    const staticFfmpegVer = checkCommandVersion(`"${ffmpegPath}" -version`);
    if (staticFfmpegVer) {
      ffmpegVer = `${staticFfmpegVer.split('\n')[0]} (via ffmpeg-static)`;
    }
  }

  console.log('\n==================================================');
  console.log('🩺 GITFRAME CLI SYSTEM DIAGNOSTICS');
  console.log('==================================================');
  console.log(`Git            : ${gitVer ? `✅ ${gitVer}` : '❌ Not Found'}`);
  console.log(`Node.js        : ${nodeVer ? `✅ ${nodeVer}` : '❌ Not Found'}`);
  console.log(`FFmpeg         : ${ffmpegVer ? `✅ ${ffmpegVer}` : '❌ Not Found (Required for video rendering)'}`);
  console.log(`Playwright     : ${playwrightVer ? `✅ ${playwrightVer}` : '❌ Not Found (Run "npm run install-browsers")'}`);
  console.log(`Docker         : ${dockerVer ? `✅ ${dockerVer}` : '⚠️ Not Found (Optional, required for docker compose projects)'}`);
  console.log(`Docker Compose : ${composeVer ? `✅ ${composeVer}` : '⚠️ Not Found (Optional, required for docker compose projects)'}`);
  console.log('==================================================\n');

  if (gitVer && nodeVer && ffmpegVer && playwrightVer) {
    logger.info('🎉 All core dependencies are successfully installed and active!');
  } else {
    logger.warn('⚠️ Missing core dependencies detected. Please install them to ensure complete workflow functionality.');
  }
}
