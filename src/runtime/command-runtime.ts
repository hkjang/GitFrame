import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../common/logger';
import { ProcessManager, maskEnvironment } from './process-manager';
import { ProcessRuntimeError } from '../common/errors';

export async function runCommandSync(
  command: string,
  cwd: string,
  logFilePath: string,
  env: Record<string, string> = {}
): Promise<void> {
  logger.info(`Running command: "${command}" in ${cwd}`);
  const combinedEnv = { ...process.env, ...env } as Record<string, string>;
  const maskedEnv = maskEnvironment(combinedEnv);
  
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
  fs.appendFileSync(logFilePath, `\n=== Running: ${command} ===\n`, 'utf8');
  fs.appendFileSync(logFilePath, `Environment: ${JSON.stringify(maskedEnv, null, 2)}\n\n`, 'utf8');

  const child = spawn(command, {
    shell: true,
    cwd,
    detached: true,
    env: combinedEnv
  });

  ProcessManager.register(child);

  const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  child.stdout?.pipe(logStream);
  child.stderr?.pipe(logStream);

  return new Promise<void>((resolve, reject) => {
    child.on('close', (code) => {
      logStream.end();
      if (code === 0) {
        resolve();
      } else {
        reject(new ProcessRuntimeError(`Command "${command}" failed with exit status ${code}. Check details in ${logFilePath}`));
      }
    });
    child.on('error', (err) => {
      logStream.end();
      reject(new ProcessRuntimeError(`Failed to execute command "${command}": ${err.message}`));
    });
  });
}

export function runCommandAsync(
  command: string,
  cwd: string,
  logFilePath: string,
  env: Record<string, string> = {}
): ChildProcess {
  logger.info(`Starting background command: "${command}" in ${cwd}`);
  const combinedEnv = { ...process.env, ...env } as Record<string, string>;
  const maskedEnv = maskEnvironment(combinedEnv);

  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
  fs.appendFileSync(logFilePath, `\n=== Starting Background: ${command} ===\n`, 'utf8');
  fs.appendFileSync(logFilePath, `Environment: ${JSON.stringify(maskedEnv, null, 2)}\n\n`, 'utf8');

  const child = spawn(command, {
    shell: true,
    cwd,
    detached: true,
    env: combinedEnv
  });

  ProcessManager.register(child);

  const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
  child.stdout?.pipe(logStream);
  child.stderr?.pipe(logStream);

  child.on('exit', (code) => {
    logStream.end();
    logger.info(`Background command "${command}" exited with code ${code}`);
  });

  return child;
}
