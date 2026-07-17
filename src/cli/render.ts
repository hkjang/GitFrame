import { loadConfig } from '../config/loader';
import { createWorkspaceFromLocal } from '../source/workspace';
import { executeScenarioPipeline } from '../scenario/executor';
import { renderMergedVideo } from '../media/ffmpeg';
import { generateHtmlReport } from '../report/html-report';
import { logger } from '../common/logger';
import * as path from 'path';

export async function runRenderCommand(options: { config?: string; output?: string }): Promise<void> {
  const config = loadConfig(options.config);
  const localDir = process.cwd();
  
  const outputDir = path.resolve(options.output || config.outputDir || 'output');
  logger.info(`Starting rendering pipeline inside isolated workspace...`);

  // Create isolated temp workspace (automatically filters out sensitive files)
  const workspace = createWorkspaceFromLocal(localDir, true);

  try {
    const result = await executeScenarioPipeline(workspace, config, {
      recordVideo: true,
      recordTrace: true,
      headless: true,
      outputDir,
      width: config.video?.width,
      height: config.video?.height
    });

    if (!result.success) {
      logger.error(`❌ Scenario execution failed in isolated workspace. Skipping video render. Error: ${result.error}`);
      
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

    logger.info('🎉 Scenario executed successfully in isolation! Proceeding to render final demo video...');

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

    const report = {
      success: true,
      projectName: result.projectName,
      playbackCaptions: result.captions,
      screenshots: result.screenshots.map(s => path.relative(outputDir, s)),
      durationMs: 0,
      timestamp: new Date().toISOString()
    };
    generateHtmlReport(outputDir, report);

    logger.info(`🎉 Rendering complete! Outputs generated in ${outputDir}`);

  } catch (err: any) {
    logger.error(`Render pipeline failed: ${err.message}`);
    process.exit(1);
  } finally {
    workspace.cleanup();
  }
}
