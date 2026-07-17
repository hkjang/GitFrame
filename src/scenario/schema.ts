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
  action: 'goto' | 'click' | 'fill' | 'pause' | 'assertVisible' | 'assertText' | 'waitFor' | 'screenshot';
  url?: string;
  milliseconds?: number;
  selector?: SelectorType;
  value?: string;
  text?: string;
  name?: string;
  caption?: string;
}

export interface Scenario {
  start_url: string;
  steps: ScenarioStep[];
}
