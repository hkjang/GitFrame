import waitOn from 'wait-on';
import { logger } from '../common/logger';

export async function checkHealth(port: number, timeoutMs: number = 30000): Promise<boolean> {
  // We can support checking custom protocol if needed, default to http
  const resource = `http-get://127.0.0.1:${port}`;
  logger.info(`Waiting for service on port ${port} to become healthy...`);
  try {
    await waitOn({
      resources: [resource],
      timeout: timeoutMs,
      interval: 500,
      log: false,
    });
    logger.info(`Port ${port} is active and healthy.`);
    return true;
  } catch (err: any) {
    logger.warn(`Health check timed out or failed for port ${port}: ${err.message}`);
    return false;
  }
}
