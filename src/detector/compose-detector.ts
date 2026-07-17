import * as fs from 'fs';
import * as path from 'path';
import { ProjectDetector, DetectorResult } from './node-detector'; // we can export/import detector types from node-detector or another file. Let's make node-detector define them first, or keep them consistent.

export class ComposeDetector implements ProjectDetector {
  detect(workspaceDir: string): boolean {
    return fs.existsSync(path.join(workspaceDir, 'docker-compose.yml')) ||
           fs.existsSync(path.join(workspaceDir, 'docker-compose.yaml'));
  }

  getRecommendation(workspaceDir: string): DetectorResult {
    return {
      language: 'compose',
      install: 'docker compose pull',
      build: 'docker compose build',
      start: 'docker compose up',
      port: 80
    };
  }
}
