export interface StructuredSelector {
  testId?: string;
  role?: string;
  name?: string;
  label?: string;
  placeholder?: string;
  text?: string;
  css?: string;
}

export type SelectorType = string | StructuredSelector;

export interface ScenarioStep {
  id?: string;
  action: 'goto' | 'click' | 'fill' | 'pause' | 'assertVisible' | 'assertText' | 'waitFor' | 'screenshot' | 'scroll' | 'dragAndDrop';
  url?: string;
  milliseconds?: number;
  selector?: SelectorType;
  value?: string;
  text?: string;
  name?: string;
  caption?: string;
  x?: number;
  y?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  optional?: boolean;
}

export interface Scenario {
  start_url: string;
  steps: ScenarioStep[];
}
