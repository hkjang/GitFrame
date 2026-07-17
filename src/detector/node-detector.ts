import * as fs from 'fs';
import * as path from 'path';

export interface DetectorResult {
  language: string;
  install: string;
  build: string;
  start: string;
  port: number;
}

export interface ProjectDetector {
  detect(workspaceDir: string): boolean;
  getRecommendation(workspaceDir: string): DetectorResult;
}

export class NodeDetector implements ProjectDetector {
  detect(workspaceDir: string): boolean {
    return fs.existsSync(path.join(workspaceDir, 'package.json'));
  }

  getRecommendation(workspaceDir: string): DetectorResult {
    const pkgPath = path.join(workspaceDir, 'package.json');
    let hasBuild = false;
    let hasStart = false;
    let installCmd = 'npm install';
    let buildCmd = '';
    let startCmd = 'npm start';

    try {
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.scripts) {
          if (pkg.scripts.build) hasBuild = true;
          if (pkg.scripts.start) hasStart = true;
        }
      }
    } catch (e) {
      // Ignore JSON parsing errors
    }

    if (fs.existsSync(path.join(workspaceDir, 'yarn.lock'))) {
      installCmd = 'yarn install';
      buildCmd = hasBuild ? 'yarn build' : '';
      startCmd = hasStart ? 'yarn start' : 'yarn start';
    } else if (fs.existsSync(path.join(workspaceDir, 'pnpm-lock.yaml'))) {
      installCmd = 'pnpm install';
      buildCmd = hasBuild ? 'pnpm build' : '';
      startCmd = hasStart ? 'pnpm start' : 'pnpm start';
    } else {
      buildCmd = hasBuild ? 'npm run build' : '';
    }

    return {
      language: 'node',
      install: installCmd,
      build: buildCmd,
      start: startCmd,
      port: 3000
    };
  }
}
