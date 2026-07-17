import * as fs from 'fs';
import * as path from 'path';
import { ProjectDetector, DetectorResult } from './node-detector';

export class PythonDetector implements ProjectDetector {
  detect(workspaceDir: string): boolean {
    return fs.existsSync(path.join(workspaceDir, 'requirements.txt')) ||
           fs.existsSync(path.join(workspaceDir, 'pyproject.toml')) ||
           fs.existsSync(path.join(workspaceDir, 'Pipfile')) ||
           fs.existsSync(path.join(workspaceDir, 'setup.py'));
  }

  getRecommendation(workspaceDir: string): DetectorResult {
    let installCmd = 'pip install -r requirements.txt';
    let startCmd = 'python app.py';
    let port = 8000;

    if (fs.existsSync(path.join(workspaceDir, 'Pipfile'))) {
      installCmd = 'pipenv install';
      startCmd = 'pipenv run python app.py';
    } else if (fs.existsSync(path.join(workspaceDir, 'poetry.lock'))) {
      installCmd = 'poetry install';
      startCmd = 'poetry run python app.py';
    }

    // Try to auto-detect Django
    if (fs.existsSync(path.join(workspaceDir, 'manage.py'))) {
      startCmd = 'python manage.py runserver 0.0.0.0:8000';
      port = 8000;
    }
    // Try to auto-detect FastAPI or Flask entry points
    else if (fs.existsSync(path.join(workspaceDir, 'main.py'))) {
      startCmd = 'python main.py';
      port = 8000;
    } else if (fs.existsSync(path.join(workspaceDir, 'app.py'))) {
      startCmd = 'python app.py';
      port = 5000;
    }

    return {
      language: 'python',
      install: installCmd,
      build: '',
      start: startCmd,
      port
    };
  }
}
