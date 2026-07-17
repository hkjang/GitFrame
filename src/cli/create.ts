import { loadConfig } from '../config/loader';
import { createWorkspaceFromGit } from '../source/workspace';
import { executeScenarioPipeline } from '../scenario/executor';
import { renderMergedVideo } from '../media/ffmpeg';
import { generateHtmlReport } from '../report/html-report';
import { logger } from '../common/logger';
import * as path from 'path';
import * as readline from 'readline';

function askApproval(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise<boolean>((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === 'y' || normalized === 'yes');
    });
  });
}

export async function runCreateCommand(
  repoUrl: string,
  options: { config?: string; output?: string; yes?: boolean; approve?: boolean }
): Promise<void> {
  if (!repoUrl) {
    logger.error('Error: Git repository URL is required.');
    process.exit(1);
  }

  const config = loadConfig(options.config);
  const outputDir = path.resolve(options.output || config.outputDir || 'output');

  logger.info(`Starting GitFrame Create for remote repo: ${repoUrl}`);

  // 1. Create Workspace from Git (clones repository into temp workspace)
  const workspace = createWorkspaceFromGit(repoUrl);

  try {
    // 2. Perform Auto-Detection to show user what commands will be executed
    const recommendation = workspace.detectProject();
    const language = config.project?.language || recommendation.language;
    const installCmd = config.project?.install !== undefined ? config.project.install : recommendation.install;
    const buildCmd = config.project?.build !== undefined ? config.project.build : recommendation.build;
    const startCmd = config.project?.start !== undefined ? config.project.start : recommendation.start;
    const port = config.project?.port !== undefined ? Number(config.project.port) : recommendation.port;

    console.log('\n==================================================');
    console.log('🚨 SECURITY WARNING: AUTO-DETECTED BUILD COMMANDS 🚨');
    console.log('==================================================');
    console.log(`Repository: ${repoUrl}`);
    console.log(`Language  : ${language}`);
    console.log(`Install   : ${installCmd || '(none)'}`);
    console.log(`Build     : ${buildCmd || '(none)'}`);
    console.log(`Start     : ${startCmd || '(none)'}`);
    console.log(`Port      : ${port}`);
    console.log('==================================================\n');

    // MVP-SEC-001, MVP-SEC-002, MVP-SEC-003 Command Execution Check
    const bypassApproval = options.yes || options.approve;
    if (!bypassApproval) {
      const approved = await askApproval('Do you approve running these commands? [y/N]: ');
      if (!approved) {
        logger.warn('Execution aborted by user. Cleaning up workspace.');
        process.exit(1);
      }
    } else {
      logger.info('Bypassing security approval prompt due to CLI flag.');
    }

    // 3. Execute scenario pipeline (record video, trace)
    // Pass approveCommands: true to bypass any nested checks
    const result = await executeScenarioPipeline(workspace, config, {
      recordVideo: true,
      recordTrace: true,
      headless: true,
      outputDir,
      approveCommands: true
    });

    if (!result.success) {
      logger.error(`❌ Scenario execution failed in isolated workspace. Error: ${result.error}`);
      
      const report = {
        success: false,
        projectName: result.projectName,
        error: result.error,
        playbackCaptions: result.captions,
        screenshots: result.screenshots.map(s => path.relative(outputDir, s)),
        durationMs: 0,
        timestamp: new Date().toISOString()
      };
      generateHtmlReport(outputDir, report);
      process.exit(1);
    }

    logger.info('🎉 Scenario executed successfully! Proceeding to render final demo video...');

    // 4. Render merged video
    await renderMergedVideo(outputDir, result.projectName, result.captions, {
      width: config.video?.width,
      height: config.video?.height,
      fps: config.video?.fps,
      introTitle: config.intro?.title,
      introSubtitle: config.intro?.subtitle,
      introDuration: config.intro?.duration,
      outroTitle: config.outro?.title,
      outroSubtitle: config.outro?.subtitle,
      outroDuration: config.outro?.duration,
      burnCaptions: config.captions
    });

    // 5. Generate HTML Report
    const report = {
      success: true,
      projectName: result.projectName,
      playbackCaptions: result.captions,
      screenshots: result.screenshots.map(s => path.relative(outputDir, s)),
      durationMs: 0,
      timestamp: new Date().toISOString()
    };
    generateHtmlReport(outputDir, report);

    logger.info(`🎉 One-stop creation complete! Outputs generated in ${outputDir}`);

  } catch (err: any) {
    logger.error(`Create pipeline failed: ${err.message}`);
    process.exit(1);
  } finally {
    workspace.cleanup();
  }
}
