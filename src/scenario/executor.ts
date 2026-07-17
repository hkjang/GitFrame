import * as fs from 'fs';
import * as path from 'path';
import { Workspace } from '../source/workspace';
import { GitFrameConfig } from '../config/schema';
import { parseScenario } from './parser';
import { runPlaywrightScenario, RunnerResult, PlaybackCaption } from '../browser/playwright-runner';
import { runCommandSync, runCommandAsync } from '../runtime/command-runtime';
import { ComposeRuntime } from '../runtime/compose-runtime';
import { checkHealth } from '../runtime/health-checker';
import { ProcessManager } from '../runtime/process-manager';
import { logger } from '../common/logger';

export interface ExecutionResult {
  success: boolean;
  projectName: string;
  error?: string;
  captions: PlaybackCaption[];
  screenshots: string[];
  outputDir: string;
}

export async function executeScenarioPipeline(
  workspace: Workspace,
  config: GitFrameConfig,
  options: {
    recordVideo: boolean;
    recordTrace: boolean;
    headless: boolean;
    outputDir?: string;
    approveCommands?: boolean; // MVP-SEC-001 option
    width?: number;
    height?: number;
  }
): Promise<ExecutionResult> {
  const outputDir = path.resolve(options.outputDir || config.outputDir || 'output');
  fs.mkdirSync(outputDir, { recursive: true });

  const logsDir = path.join(outputDir, 'logs');
  fs.mkdirSync(logsDir, { recursive: true });

  const installLogPath = path.join(logsDir, 'install.log');
  const runtimeLogPath = path.join(logsDir, 'runtime.log');

  // Determine Project Name
  let projectName = path.basename(workspace.dir);
  try {
    const pkgPath = path.join(workspace.dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.name) {
        projectName = pkg.name;
      }
    }
  } catch (e) {}

  logger.info(`Starting execution pipeline for project: ${projectName}`);

  // Load and Parse Scenario
  const scenarioFilePath = path.resolve(workspace.dir, config.scenarioFile || '.gitframe/demo.yaml');
  logger.info(`Loading scenario file: ${scenarioFilePath}`);
  const scenario = parseScenario(scenarioFilePath);

  // Auto-detect project commands if not specified in config
  const recommendation = workspace.detectProject();
  
  const language = config.project?.language || recommendation.language;
  const installCmd = config.project?.install !== undefined ? config.project.install : recommendation.install;
  const buildCmd = config.project?.build !== undefined ? config.project.build : recommendation.build;
  const startCmd = config.project?.start !== undefined ? config.project.start : recommendation.start;
  const port = config.project?.port !== undefined ? Number(config.project.port) : recommendation.port;
  const env = config.project?.env || {};

  logger.info(`Selected project config:
  - Language: ${language}
  - Install command: ${installCmd || '(none)'}
  - Build command: ${buildCmd || '(none)'}
  - Start command: ${startCmd || '(none)'}
  - Port: ${port}
  `);

  // MVP-SEC-001: Command Execution Check for remote / clone repos
  // We can verify approval in the CLI layer, but let's check here if option is passed.
  if (workspace.isTemporary && !options.approveCommands) {
    logger.warn('Remote/Temporary workspace command execution requires approval.');
  }

  let serverProcess: any = null;
  let success = false;
  let errorMsg: string | undefined;
  let runnerResult: RunnerResult = { success: false, captions: [], screenshots: [] };
  const startTime = Date.now();

  try {
    // 1. Install Dependencies
    if (installCmd) {
      logger.info(`Installing dependencies... logs saved to ${installLogPath}`);
      if (language === 'compose') {
        await ComposeRuntime.pull(workspace.dir, installLogPath);
      } else {
        await runCommandSync(installCmd, workspace.dir, installLogPath, env);
      }
    }

    // 2. Build Project
    if (buildCmd) {
      logger.info(`Building project... logs saved to ${runtimeLogPath}`);
      if (language === 'compose') {
        await ComposeRuntime.build(workspace.dir, runtimeLogPath);
      } else {
        await runCommandSync(buildCmd, workspace.dir, runtimeLogPath, env);
      }
    }

    // 3. Start Server (Background)
    if (startCmd) {
      logger.info(`Starting background web server... logs saved to ${runtimeLogPath}`);
      if (language === 'compose') {
        serverProcess = ComposeRuntime.start(workspace.dir, runtimeLogPath);
      } else {
        serverProcess = runCommandAsync(startCmd, workspace.dir, runtimeLogPath, env);
      }

      // Wait for port to activate
      const healthy = await checkHealth(port, 45000);
      if (!healthy) {
        throw new Error(`Web server failed to become healthy on port ${port}. Check details in ${runtimeLogPath}`);
      }
    }

    // 4. Playback Scenario using Playwright
    logger.info('Executing Playwright browser automation playback...');
    runnerResult = await runPlaywrightScenario(scenario, outputDir, {
      recordVideo: options.recordVideo,
      recordTrace: options.recordTrace,
      headless: options.headless,
      startUrlOverride: startCmd ? `http://127.0.0.1:${port}` : undefined,
      width: options.width,
      height: options.height
    });

    success = runnerResult.success;
    errorMsg = runnerResult.error;

  } catch (err: any) {
    success = false;
    errorMsg = err.message;
    logger.error(`Pipeline failure: ${err.message}`);
  } finally {
    // 5. Clean up background servers and Docker Compose if used
    if (serverProcess) {
      logger.info('Shutting down background server...');
      ProcessManager.killProcessGroup(serverProcess);
    }
    if (language === 'compose') {
      await ComposeRuntime.stop(workspace.dir, runtimeLogPath);
    }

    // Write result.json
    const durationMs = Date.now() - startTime;
    const reportPath = path.join(outputDir, 'result.json');
    const resultReport = {
      success,
      projectName,
      error: errorMsg,
      playbackCaptions: runnerResult.captions,
      screenshots: runnerResult.screenshots.map(s => path.relative(outputDir, s)),
      durationMs,
      timestamp: new Date().toISOString()
    };
    fs.writeFileSync(reportPath, JSON.stringify(resultReport, null, 2), 'utf8');
    logger.info(`Execution report saved to ${reportPath}`);

    // Write scenario.json
    const scenarioJsonPath = path.join(outputDir, 'scenario.json');
    fs.writeFileSync(scenarioJsonPath, JSON.stringify(scenario, null, 2), 'utf8');
    logger.info(`Scenario JSON structure saved to ${scenarioJsonPath}`);
  }

  return {
    success,
    projectName,
    error: errorMsg,
    captions: runnerResult.captions,
    screenshots: runnerResult.screenshots,
    outputDir
  };
}
