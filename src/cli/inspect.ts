import { Workspace } from '../source/workspace';
import { logger } from '../common/logger';

export function runInspectCommand(): void {
  const rootDir = process.cwd();
  logger.info(`Inspecting workspace codebase at: ${rootDir}...`);
  
  const ws = new Workspace(rootDir, false);
  const rec = ws.detectProject();

  console.log('\n--- CODEBASE ANALYSIS REPORT ---');
  console.log(`Language/Platform : ${rec.language.toUpperCase()}`);
  console.log(`Install Command   : ${rec.install || '(none)'}`);
  console.log(`Build Command     : ${rec.build || '(none)'}`);
  console.log(`Start Command     : ${rec.start}`);
  console.log(`Suggested Port    : ${rec.port}`);
  console.log('--------------------------------\n');
}
