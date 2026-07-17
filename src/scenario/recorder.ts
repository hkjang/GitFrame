import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { logger } from '../common/logger';

export async function recordInteractiveScenario(startUrl: string, outputYamlPath: string): Promise<void> {
  logger.info(`Opening headed browser to record user interactions at ${startUrl}...`);
  logger.info(`Interact with the page. Closing the browser will save the recorded scenario to ${outputYamlPath}.`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const steps: any[] = [
    {
      id: 'open-home',
      action: 'goto',
      url: '/',
      caption: 'App에 접속합니다'
    }
  ];

  await page.exposeFunction('logAction', (actionData: any) => {
    logger.info(`Recorded interaction: ${JSON.stringify(actionData)}`);
    steps.push(actionData);
  });

  await page.addInitScript(() => {
    window.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      const tag = target.tagName.toLowerCase();
      if (tag === 'body' || tag === 'html') return;

      let selector: any = '';
      if (target.id) {
        selector = `#${target.id}`;
      } else if (target.getAttribute('data-testid')) {
        selector = { testId: target.getAttribute('data-testid') };
      } else {
        const role = target.getAttribute('role');
        const text = target.innerText?.trim();
        if (role) {
          selector = { role, name: text ? text.substring(0, 30) : undefined };
        } else if (text && text.length < 50) {
          selector = { text };
        } else if (target.getAttribute('placeholder')) {
          selector = { placeholder: target.getAttribute('placeholder') };
        } else {
          selector = tag;
        }
      }

      const captionText = typeof selector === 'string' ? `Click on "${selector}"` : `Click button/link`;
      (window as any).logAction({
        action: 'click',
        selector,
        caption: captionText
      });
    }, true);

    window.addEventListener('change', (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      if (!target) return;

      const value = target.value;
      let selector: any = '';
      if (target.id) {
        selector = `#${target.id}`;
      } else if (target.getAttribute('placeholder')) {
        selector = { placeholder: target.getAttribute('placeholder') };
      } else if (target.getAttribute('data-testid')) {
        selector = { testId: target.getAttribute('data-testid') };
      } else {
        selector = target.tagName.toLowerCase();
      }

      (window as any).logAction({
        action: 'fill',
        selector,
        value,
        caption: `Input value "${value}"`
      });
    }, true);
  });

  await page.goto(startUrl);

  return new Promise<void>((resolve) => {
    browser.on('disconnected', () => {
      logger.info('Browser closed by user. Saving scenario...');
      const yamlContent = yaml.dump({
        start_url: startUrl,
        steps
      });
      fs.mkdirSync(path.dirname(outputYamlPath), { recursive: true });
      fs.writeFileSync(outputYamlPath, yamlContent, 'utf8');
      logger.info(`Scenario successfully saved to ${outputYamlPath}`);
      resolve();
    });
  });
}
