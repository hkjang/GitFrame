import * as fs from 'fs';
import * as path from 'path';
import { ProjectDetector, DetectorResult } from './node-detector';

export class JavaDetector implements ProjectDetector {
  detect(workspaceDir: string): boolean {
    return fs.existsSync(path.join(workspaceDir, 'pom.xml')) ||
           fs.existsSync(path.join(workspaceDir, 'build.gradle')) ||
           fs.existsSync(path.join(workspaceDir, 'build.gradle.kts'));
  }

  getRecommendation(workspaceDir: string): DetectorResult {
    const isGradle = fs.existsSync(path.join(workspaceDir, 'build.gradle')) || 
                      fs.existsSync(path.join(workspaceDir, 'build.gradle.kts'));
    
    if (isGradle) {
      const gradlewExists = fs.existsSync(path.join(workspaceDir, 'gradlew'));
      const gradleCmd = gradlewExists ? './gradlew' : 'gradle';
      return {
        language: 'java',
        install: `${gradleCmd} build -x test`,
        build: `${gradleCmd} assemble`,
        start: `${gradleCmd} bootRun`,
        port: 8080
      };
    } else {
      return {
        language: 'java',
        install: 'mvn clean install -DskipTests',
        build: 'mvn package -DskipTests',
        start: 'mvn spring-boot:run',
        port: 8080
      };
    }
  }
}
