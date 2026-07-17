import { loadConfig } from '../config/loader';
import { Workspace } from '../source/workspace';
import { executeScenarioPipeline } from '../scenario/executor';
import { logger } from '../common/logger';

export async function runTestCommand(options: { config?: string; headless?: boolean }): Promise<void> {
  const config = loadConfig(options.config);
  const rootDir = process.cwd();
  
  logger.info(`Running scenario validation tests in: ${rootDir}`);
  
  const workspace = new Workspace(rootDir, false);
  try {
    const result = await executeScenarioPipeline(workspace, config, {
      recordVideo: false,
      recordTrace: false,
      headless: options.headless ?? false,
    });

    if (result.success) {
      logger.info('🎉 Scenario playback test completed successfully!');
    } else {
      logger.error(`❌ Scenario playback test failed: ${result.error}`);
      process.exit(1);
    }
  } catch (err: any) {
    logger.error(`Test execution failed: ${err.message}`);
    process.exit(1);
  }
}
