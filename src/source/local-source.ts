import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../common/logger';

export const SENSITIVE_EXCLUSIONS = [
  /^\.env(\..*)?$/i,                // .env, .env.local, .env.development, etc.
  /\.(pem|crt|p12)$/i,              // certificates
  /^id_(rsa|dsa|ecdsa|ed25519)/i,   // ssh private keys
];

export const GENERAL_EXCLUSIONS = [
  /^node_modules$/i,
  /^\.git$/i,
  /^dist$/i,
  /^build$/i,
  /^out$/i,
  /^target$/i,
  /^\.gradle$/i,
  /^\.mvn$/i,
];

export function shouldExclude(name: string): boolean {
  for (const regex of SENSITIVE_EXCLUSIONS) {
    if (regex.test(name)) {
      return true;
    }
  }
  for (const regex of GENERAL_EXCLUSIONS) {
    if (regex.test(name)) {
      return true;
    }
  }
  return false;
}

export function copyDirectory(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (shouldExclude(entry.name)) {
      logger.debug(`Excluding ${entry.name} from workspace copy.`);
      continue;
    }

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (err: any) {
        logger.warn(`Failed to copy file ${srcPath}: ${err.message}`);
      }
    }
  }
}
