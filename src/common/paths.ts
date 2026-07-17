import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export const DEFAULT_CONFIG_DIR = '.gitframe';
export const DEFAULT_CONFIG_FILE = 'gitframe.yaml';
export const DEFAULT_SCENARIO_FILE = 'demo.yaml';
export const DEFAULT_OUTPUT_DIR = 'output';

export function getTempWorkspaceDir(): string {
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const dir = path.join(os.tmpdir(), `gitframe-${randomSuffix}`);
  // Ensure we don't accidentally return a path that already exists
  if (fs.existsSync(dir)) {
    return getTempWorkspaceDir();
  }
  return dir;
}

export function resolveWorkspacePath(workspaceRoot: string, relativePath: string): string {
  return path.resolve(workspaceRoot, relativePath);
}

export function cleanTempWorkspaces(): void {
  const tmpDir = os.tmpdir();
  try {
    const files = fs.readdirSync(tmpDir);
    for (const file of files) {
      if (file.startsWith('gitframe-')) {
        const fullPath = path.join(tmpDir, file);
        try {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } catch (e) {
          // ignore busy/locked files
        }
      }
    }
  } catch (e) {
    // ignore readdir errors
  }
}
