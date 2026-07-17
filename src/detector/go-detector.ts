import * as fs from 'fs';
import * as path from 'path';
import { ProjectDetector, DetectorResult } from './node-detector';

export class GoDetector implements ProjectDetector {
  detect(workspaceDir: string): boolean {
    return fs.existsSync(path.join(workspaceDir, 'go.mod'));
  }

  getRecommendation(workspaceDir: string): DetectorResult {
    let startCmd = 'go run main.go';
    if (!fs.existsSync(path.join(workspaceDir, 'main.go'))) {
      startCmd = 'go run .';
    }
    return {
      language: 'go',
      install: 'go mod download',
      build: 'go build -o server',
      start: startCmd,
      port: 8080
    };
  }
}
