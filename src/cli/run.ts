import { loadConfig } from '../config/loader';
import { runCommandAsync } from '../runtime/command-runtime';
import { checkHealth } from '../runtime/health-checker';
import { ProcessManager } from '../runtime/process-manager';
import { ComposeRuntime } from '../runtime/compose-runtime';
import { logger } from '../common/logger';
import * as path from 'path';
import * as fs from 'fs';

export async function runRunCommand(options: { config?: string }): Promise<void> {
  const config = loadConfig(options.config);
  const cwd = process.cwd();
  
  const outputDir = path.resolve(config.outputDir || 'output');
  fs.mkdirSync(outputDir, { recursive: true });
  
  const logsDir = path.join(outputDir, 'logs');
  fs.mkdirSync(logsDir, { recursive: true });
  const runtimeLog = path.join(logsDir, 'runtime.log');

  const port = config.project?.port || 3000;
  const startCmd = config.project?.start;
  const language = config.project?.language;

  if (!startCmd) {
    logger.error('No project start command defined in configuration.');
    process.exit(1);
  }

  logger.info(`Starting server: "${startCmd}"`);
  
  let serverProcess: any = null;
  try {
    if (language === 'compose') {
      serverProcess = ComposeRuntime.start(cwd, runtimeLog);
    } else {
      serverProcess = runCommandAsync(startCmd, cwd, runtimeLog, config.project?.env || {});
    }

    const healthy = await checkHealth(port, 45000);
    if (!healthy) {
      throw new Error(`Web server did not respond on port ${port}. Check details in ${runtimeLog}`);
    }

    logger.info(`🎉 Server is running at http://localhost:${port}`);
    logger.info('Press Ctrl+C to stop the server.');

    // Wait indefinitely
    await new Promise<void>(() => {
      // Keeps terminal running
    });
  } catch (err: any) {
    logger.error(`Failed to run server: ${err.message}`);
    if (serverProcess) {
      ProcessManager.killProcessGroup(serverProcess);
    }
    if (language === 'compose') {
      await ComposeRuntime.stop(cwd, runtimeLog);
    }
    process.exit(1);
  }
}
