#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import boxen from 'boxen';
import { config } from 'dotenv';
import { StatusBar } from './ui/StatusBar.js';
import { AnalyzeCommand } from './commands/AnalyzeCommand.js';
import { SearchCommand } from './commands/SearchCommand.js';
import { TransformCommand } from './commands/TransformCommand.js';
import { DeployCommand } from './commands/DeployCommand.js';
import { ConfigManager } from './config/ConfigManager.js';

// Load environment variables
config();

const program = new Command();
const statusBar = new StatusBar();

// ASCII Art Banner
console.log(
  boxen(
    chalk.blue(
      figlet.textSync('CPP2Java', { horizontalLayout: 'full' })
    ),
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'blue'
    }
  )
);

console.log(
  chalk.cyan.bold('🚀 Intelligent C++ to Java Spring Boot Migration CLI\n')
);

console.log(
  chalk.yellow('💡 Examples:'),
  chalk.white('\n  cpp2java analyze -g https://github.com/owner/cpp-monolith'),
  chalk.white('\n  cpp2java analyze -g https://github.com/owner/repo -b develop'),
  chalk.white('\n  cpp2java analyze --keep-clone'),
  chalk.white('\n')
);

program
  .name('cpp2java')
  .description('Intelligent CLI for migrating C++ monoliths to Java Spring Boot microservices')
  .version('1.0.0');

// Initialize configuration
const configManager = new ConfigManager();

// Register commands
new AnalyzeCommand(program, statusBar, configManager);
new SearchCommand(program, statusBar, configManager);
new TransformCommand(program, statusBar, configManager);
new DeployCommand(program, statusBar, configManager);

// Global options
program
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--workspace <path>', 'Specify workspace path', process.cwd())
  .option('--output <path>', 'Specify output directory', './migrated-services');

// Hook for status updates
program.hook('preAction', (thisCommand) => {
  const options = thisCommand.opts();
  if (options.verbose) {
    process.env.LOG_LEVEL = 'debug';
  }
  
  statusBar.update('Initializing...', 'info');
});

program.hook('postAction', () => {
  statusBar.update('Ready', 'success');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  statusBar.update('Error occurred', 'error');
  console.error(chalk.red('❌ Uncaught Exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  statusBar.update('Promise rejection', 'error');
  console.error(chalk.red('❌ Unhandled Rejection at:'), promise, chalk.red('reason:'), reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  statusBar.update('Shutting down...', 'warning');
  console.log(chalk.yellow('\n👋 Goodbye!'));
  process.exit(0);
});

// Parse arguments
program.parse(); 