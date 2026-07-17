import { ChildProcess, execSync } from 'child_process';
import { logger } from '../common/logger';

export function maskEnvironment(env: Record<string, string | undefined>): Record<string, string | undefined> {
  const masked: Record<string, string | undefined> = {};
  const secretKeywords = ['secret', 'password', 'token', 'key', 'auth', 'database_url', '.env'];

  for (const [key, val] of Object.entries(env)) {
    if (val === undefined) {
      masked[key] = undefined;
      continue;
    }
    const isSecret = secretKeywords.some(keyword => key.toLowerCase().includes(keyword));
    if (isSecret) {
      masked[key] = '********';
    } else {
      masked[key] = val;
    }
  }
  return masked;
}

export class ProcessManager {
  private static processes: Set<ChildProcess> = new Set();
  private static registeredExitHandlers = false;

  static register(child: ChildProcess) {
    this.processes.add(child);
    child.on('exit', () => {
      this.processes.delete(child);
    });

    if (!this.registeredExitHandlers) {
      this.registeredExitHandlers = true;
      const cleanAll = () => {
        this.killAll();
      };
      
      // Hook process termination events
      process.on('exit', () => this.killAll());
      process.on('SIGINT', () => {
        cleanAll();
        process.exit(130);
      });
      process.on('SIGTERM', () => {
        cleanAll();
        process.exit(143);
      });
      process.on('uncaughtException', (err) => {
        logger.error(`Uncaught exception in CLI process manager: ${err.message}`, err);
        cleanAll();
        process.exit(1);
      });
    }
  }

  static killAll() {
    if (this.processes.size === 0) return;
    logger.info(`Cleaning up ${this.processes.size} active background processes...`);
    for (const child of this.processes) {
      this.killProcessGroup(child);
    }
    this.processes.clear();
  }

  static killProcessGroup(child: ChildProcess) {
    const pid = child.pid;
    if (!pid) return;

    logger.info(`Killing process group for PID: ${pid}`);
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
      } else {
        // Send SIGKILL to negative PID for process group termination
        process.kill(-pid, 'SIGKILL');
      }
    } catch (err: any) {
      try {
        child.kill('SIGKILL');
      } catch (e) {}
    }
  }
}
