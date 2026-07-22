import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Scenario } from './schema';
import { ValidationError } from '../common/errors';

export function parseScenario(filePath: string): Scenario {
  if (!fs.existsSync(filePath)) {
    throw new ValidationError(`Scenario file does not exist at ${filePath}`);
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const parsed = yaml.load(fileContent) as any;

    if (!parsed || typeof parsed !== 'object') {
      throw new ValidationError('Scenario must be a valid YAML/JSON object');
    }

    if (typeof parsed.start_url !== 'string') {
      throw new ValidationError('Scenario start_url must be a string');
    }

    if (!Array.isArray(parsed.steps)) {
      throw new ValidationError('Scenario steps must be an array');
    }

    const validActions = ['goto', 'click', 'fill', 'pause', 'assertVisible', 'assertText', 'waitFor', 'screenshot', 'scroll', 'dragAndDrop'];
    for (let i = 0; i < parsed.steps.length; i++) {
      const step = parsed.steps[i];
      if (!step || typeof step !== 'object') {
        throw new ValidationError(`Scenario step at index ${i} is not an object`);
      }
      if (!validActions.includes(step.action)) {
        throw new ValidationError(`Scenario step at index ${i} has invalid action: "${step.action}". Valid actions are: ${validActions.join(', ')}`);
      }
    }

    return parsed as Scenario;
  } catch (err: any) {
    if (err instanceof ValidationError) {
      throw err;
    }
    throw new ValidationError(`Failed to parse scenario file: ${err.message}`);
  }
}
