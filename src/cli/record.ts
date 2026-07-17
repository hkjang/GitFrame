import { recordInteractiveScenario } from '../scenario/recorder';
import { logger } from '../common/logger';
import { loadConfig } from '../config/loader';
import * as path from 'path';

export async function runRecordCommand(options: { url?: string; output?: string; config?: string }): Promise<void> {
  const config = loadConfig(options.config);
  
  const startUrl = options.url || (config.project?.port ? `http://localhost:${config.project.port}` : 'http://localhost:3000');
  const outputPath = options.output || config.scenarioFile || '.gitframe/demo.yaml';

  logger.info(`Starting scenario recording session...`);
  try {
    await recordInteractiveScenario(startUrl, path.resolve(outputPath));
  } catch (err: any) {
    logger.error(`Recording session failed: ${err.message}`);
    process.exit(1);
  }
}
