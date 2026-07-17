import * as fs from 'fs';
import * as path from 'path';

export class Logger {
  private logFile: string | null = null;

  constructor(logFile?: string) {
    if (logFile) {
      this.setLogFile(logFile);
    }
  }

  setLogFile(filePath: string) {
    this.logFile = path.resolve(filePath);
    try {
      fs.mkdirSync(path.dirname(this.logFile), { recursive: true });
    } catch (e) {
      // Ignore if directory already exists
    }
  }

  private write(level: string, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.map(arg => {
      if (arg instanceof Error) {
        return arg.stack || arg.message;
      }
      return typeof arg === 'object' ? JSON.stringify(arg) : arg;
    }).join(' ');
    const fullMessage = `[${timestamp}] [${level}] ${message}${formattedArgs ? ' ' + formattedArgs : ''}`;
    
    if (level === 'ERROR') {
      console.error(fullMessage);
    } else if (level === 'WARN') {
      console.warn(fullMessage);
    } else {
      console.log(fullMessage);
    }

    if (this.logFile) {
      try {
        fs.appendFileSync(this.logFile, fullMessage + '\n', 'utf8');
      } catch (e) {
        // Fallback or ignore
      }
    }
  }

  info(message: string, ...args: any[]) {
    this.write('INFO', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.write('WARN', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.write('ERROR', message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.write('DEBUG', message, ...args);
  }
}

export const logger = new Logger();
