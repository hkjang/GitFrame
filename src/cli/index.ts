#!/usr/bin/env node
import { Command } from 'commander';
import { runInitCommand } from './init';
import { runInspectCommand } from './inspect';
import { runRunCommand } from './run';
import { runRecordCommand } from './record';
import { runTestCommand } from './test';
import { runRenderCommand } from './render';
import { runCreateCommand } from './create';
import { runDoctorCommand } from './doctor';
import { cleanTempWorkspaces } from '../common/paths';
import { logger } from '../common/logger';

const program = new Command();

program
  .name('gitframe')
  .description('Automated web project playback runner and demo video recorder CLI')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize GitFrame configuration and scenario templates in the workspace')
  .action(() => {
    runInitCommand();
  });

program
  .command('inspect')
  .description('Auto-detect workspace codebase language and recommended commands')
  .action(() => {
    runInspectCommand();
  });

program
  .command('run')
  .description('Run local project web server in background and monitor health')
  .option('-c, --config <path>', 'Path to gitframe.yaml config file')
  .action(async (options) => {
    await runRunCommand(options);
  });

program
  .command('record')
  .description('Record interactive scenario steps via a headed browser')
  .option('-u, --url <url>', 'Start URL for recording')
  .option('-o, --output <path>', 'Destination YAML path')
  .option('-c, --config <path>', 'Path to gitframe.yaml config file')
  .action(async (options) => {
    await runRecordCommand(options);
  });

program
  .command('test')
  .description('Run the browser automation playback to test scenario validation (without rendering)')
  .option('-c, --config <path>', 'Path to gitframe.yaml config file')
  .option('--headless', 'Run browser in headless mode (default is headed)', false)
  .action(async (options) => {
    await runTestCommand(options);
  });

program
  .command('render')
  .description('Execute the scenario playback and render final demo video & HTML report')
  .option('-c, --config <path>', 'Path to gitframe.yaml config file')
  .option('-o, --output <path>', 'Destination directory for final artifacts')
  .action(async (options) => {
    await runRenderCommand(options);
  });

program
  .command('create <repoUrl>')
  .description('Clone a remote repository and perform automated playback rendering in one step')
  .option('-c, --config <path>', 'Path to gitframe.yaml config file')
  .option('-o, --output <path>', 'Destination directory for final artifacts')
  .option('-y, --yes', 'Approve all detected build/start commands automatically')
  .option('--approve', 'Approve all detected build/start commands automatically')
  .action(async (repoUrl, options) => {
    await runCreateCommand(repoUrl, options);
  });

program
  .command('clean')
  .description('Clean temporary work directories and old cache files')
  .action(() => {
    logger.info('Cleaning up temp files...');
    cleanTempWorkspaces();
    logger.info('Done.');
  });

program
  .command('doctor')
  .description('Run system dependency diagnostics')
  .action(() => {
    runDoctorCommand();
  });

export function runCli(): void {
  program.parse(process.argv);
}

if (require.main === module) {
  runCli();
}
