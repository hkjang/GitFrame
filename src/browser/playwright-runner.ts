import { chromium, Page, BrowserContext, Browser, Locator } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../common/logger';
import { Scenario, ScenarioStep, SelectorType } from '../scenario/schema';
import { PlaywrightScenarioError } from '../common/errors';
import { takePageScreenshot } from './screenshot';
import { startTracing, stopTracing } from './trace';
import { saveBrowserRecording } from './video-recorder';

export interface PlaybackCaption {
  text: string;
  startMs: number;
  endMs: number;
}

export interface RunnerResult {
  success: boolean;
  error?: string;
  captions: PlaybackCaption[];
  screenshots: string[];
}

export function resolveLocator(page: Page, selector: SelectorType): Locator {
  if (typeof selector === 'string') {
    return page.locator(selector);
  }

  const { testId, role, name, label, placeholder, text, css } = selector;

  if (testId) {
    return page.getByTestId(testId);
  }
  if (role) {
    return page.getByRole(role as any, name ? { name } : undefined);
  }
  if (label) {
    return page.getByLabel(label);
  }
  if (placeholder) {
    return page.getByPlaceholder(placeholder);
  }
  if (text) {
    return page.getByText(text);
  }
  if (css) {
    return page.locator(css);
  }

  throw new Error(`Unsupported selector format: ${JSON.stringify(selector)}`);
}

export async function runPlaywrightScenario(
  scenario: Scenario,
  outputDir: string,
  options: {
    recordVideo: boolean;
    recordTrace: boolean;
    headless: boolean;
    startUrlOverride?: string;
    width?: number;
    height?: number;
  }
): Promise<RunnerResult> {
  const browserLogDir = path.join(outputDir, 'logs');
  fs.mkdirSync(browserLogDir, { recursive: true });
  const browserLogPath = path.join(browserLogDir, 'browser.log');
  
  // Clear or init browser log
  fs.writeFileSync(browserLogPath, '', 'utf8');

  logger.info(`Launching browser (headless: ${options.headless})...`);
  const browser = await chromium.launch({
    headless: options.headless,
  });

  const recordVideoDir = path.join(outputDir, 'temp_video');
  fs.mkdirSync(recordVideoDir, { recursive: true });

  const width = options.width || 1280;
  const height = options.height || 720;

  const contextOptions: any = {
    viewport: { width, height },
  };

  if (options.recordVideo) {
    contextOptions.recordVideo = {
      dir: recordVideoDir,
      size: { width, height },
    };
  }

  const context = await browser.newContext(contextOptions);

  if (options.recordTrace) {
    await startTracing(context);
  }

  const page = await context.newPage();

  // Attach logs listener
  page.on('console', (msg) => {
    const text = `[CONSOLE][${msg.type()}] ${msg.text()}`;
    fs.appendFileSync(browserLogPath, `${text}\n`, 'utf8');
  });

  page.on('pageerror', (err) => {
    const text = `[PAGE_ERROR] ${err.stack || err.message}`;
    fs.appendFileSync(browserLogPath, `${text}\n`, 'utf8');
  });

  const captions: PlaybackCaption[] = [];
  const screenshots: string[] = [];
  let success = true;
  let errorMsg: string | undefined;

  const startTime = Date.now();
  const startUrl = options.startUrlOverride || scenario.start_url;

  try {
    logger.info(`Starting scenario execution at ${startUrl}...`);

    for (let i = 0; i < scenario.steps.length; i++) {
      const step = scenario.steps[i];
      const stepId = step.id || `step-${i}`;
      logger.info(`Executing step: ${stepId} (${step.action})`);

      const stepStartMs = Date.now() - startTime;

      try {
        switch (step.action) {
          case 'goto': {
            const destUrl = step.url ? (step.url.startsWith('http') ? step.url : new URL(step.url, startUrl).toString()) : startUrl;
            logger.info(`Navigating to ${destUrl}`);
            await page.goto(destUrl, { waitUntil: 'load' });
            break;
          }
          case 'click': {
            if (!step.selector) throw new Error('Click action requires a selector');
            const loc = resolveLocator(page, step.selector).first();
            try {
              await loc.waitFor({ state: 'visible', timeout: step.optional ? 5000 : 10000 });
              await loc.click();
            } catch (e) {
              if (!step.optional) throw e;
              logger.warn(`Optional click step ${stepId} skipped: element not visible`);
            }
            break;
          }
          case 'fill': {
            if (!step.selector) throw new Error('Fill action requires a selector');
            if (step.value === undefined) throw new Error('Fill action requires a value');
            const loc = resolveLocator(page, step.selector).first();
            await loc.waitFor({ state: 'visible', timeout: 10000 });
            await loc.fill(step.value);
            break;
          }
          case 'pause': {
            const ms = step.milliseconds || 1000;
            await page.waitForTimeout(ms);
            break;
          }
          case 'assertVisible': {
            if (!step.selector) throw new Error('assertVisible action requires a selector');
            const loc = resolveLocator(page, step.selector).first();
            await loc.waitFor({ state: 'visible', timeout: 10000 });
            const visible = await loc.isVisible();
            if (!visible) {
              throw new Error(`Assertion failed: element not visible`);
            }
            break;
          }
          case 'assertText': {
            if (!step.selector) throw new Error('assertText action requires a selector');
            if (step.text === undefined) throw new Error('assertText action requires expected text');
            const loc = resolveLocator(page, step.selector).first();
            await loc.waitFor({ state: 'visible', timeout: 10000 });
            const textContent = await loc.textContent();
            if (!textContent || !textContent.includes(step.text)) {
              throw new Error(`Assertion failed: expected text "${step.text}" not found. Found: "${textContent}"`);
            }
            break;
          }
          case 'waitFor': {
            if (!step.selector) throw new Error('waitFor action requires a selector');
            const loc = resolveLocator(page, step.selector).first();
            await loc.waitFor({ state: 'visible', timeout: 10000 });
            break;
          }
          case 'screenshot': {
            const name = step.name || `screenshot-${stepId}`;
            const sPath = await takePageScreenshot(page, outputDir, name);
            screenshots.push(sPath);
            break;
          }
          case 'scroll': {
            const x = step.x || 0;
            const y = step.y || 0;
            if (step.selector) {
              const loc = resolveLocator(page, step.selector).first();
              await loc.waitFor({ state: 'visible', timeout: 10000 });
              await loc.evaluate((el, { x, y }) => {
                el.scrollBy(x, y);
              }, { x, y });
            } else {
              await page.evaluate(({ x, y }) => {
                window.scrollBy(x, y);
              }, { x, y });
            }
            break;
          }
          case 'dragAndDrop': {
            if (!step.selector) throw new Error('dragAndDrop requires a selector');
            const loc = resolveLocator(page, step.selector).first();
            await loc.waitFor({ state: 'visible', timeout: 10000 });
            // Resolve selector to a plain CSS string for page.evaluate
            const cssSelector = typeof step.selector === 'string' ? step.selector : (step.selector as any).css || '#xv-svg';
            // Use JS-dispatched mouse events to fire at the SVG's internal coordinate system,
            // bypassing scroll offset issues and .xv-dot class guards.
            await page.evaluate((sel) => {
              const svg = document.querySelector(sel) as SVGSVGElement | null;
              if (!svg) throw new Error('SVG not found: ' + sel);

              const svgBox = svg.getBoundingClientRect();
              // Start from bottom-left empty padding area
              const startClientX = svgBox.left + svgBox.width * 0.05;
              const startClientY = svgBox.top  + svgBox.height * 0.92;
              // End near top-right corner to sweep through most dots
              const endClientX   = svgBox.left + svgBox.width * 0.95;
              const endClientY   = svgBox.top  + svgBox.height * 0.08;

              function fire(type: string, clientX: number, clientY: number, target: EventTarget) {
                target.dispatchEvent(new MouseEvent(type, {
                  bubbles: true, cancelable: true,
                  clientX, clientY,
                  buttons: type === 'mouseup' ? 0 : 1,
                  button: 0,
                }));
              }

              // mousedown on SVG background (not on a dot)
              fire('mousedown', startClientX, startClientY, svg);

              // Interpolate mousemove on window (that's where the handler is attached)
              const steps = 20;
              for (let i = 1; i <= steps; i++) {
                const cx = startClientX + (endClientX - startClientX) * (i / steps);
                const cy = startClientY + (endClientY - startClientY) * (i / steps);
                window.dispatchEvent(new MouseEvent('mousemove', {
                  bubbles: true, cancelable: true, clientX: cx, clientY: cy, buttons: 1
                }));
              }

              // mouseup on window
              window.dispatchEvent(new MouseEvent('mouseup', {
                bubbles: true, cancelable: true,
                clientX: endClientX, clientY: endClientY, buttons: 0, button: 0
              }));
            }, cssSelector);
            await page.waitForTimeout(800);
            break;
          }
          default:
            throw new Error(`Unknown action: ${step.action}`);
        }

        const stepEndMs = Date.now() - startTime;
        if (step.caption) {
          captions.push({
            text: step.caption,
            startMs: stepStartMs,
            endMs: Math.max(stepEndMs, stepStartMs + 2000), // ensure it shows for at least 2s
          });
        }
      } catch (stepErr: any) {
        logger.error(`Error in step ${stepId}: ${stepErr.message}`);
        // Take screenshot of failure
        try {
          const failPath = await takePageScreenshot(page, outputDir, `failed-${stepId}`);
          screenshots.push(failPath);
        } catch (_) {}
        throw stepErr;
      }
    }
  } catch (err: any) {
    success = false;
    errorMsg = err.message;
    logger.error(`Scenario execution failed: ${err.message}`);
  } finally {
    // Keep reference to video object before closing context
    const videoObj = page.video();

    // Stop trace if active
    if (options.recordTrace) {
      try {
        await stopTracing(context, outputDir);
      } catch (e: any) {
        logger.warn(`Failed to stop tracing: ${e.message}`);
      }
    }

    // Close page and context to finalize video
    await page.close().catch(() => {});
    await context.close().catch(() => {});

    // Save video recording while browser is still open
    if (options.recordVideo && videoObj) {
      await saveBrowserRecording(videoObj, outputDir);
    }

    await browser.close().catch(() => {});

    // Remove temporary video directory if it exists
    try {
      if (fs.existsSync(recordVideoDir)) {
        fs.rmSync(recordVideoDir, { recursive: true, force: true });
      }
    } catch (_) {}
  }

  return {
    success,
    error: errorMsg,
    captions,
    screenshots,
  };
}
