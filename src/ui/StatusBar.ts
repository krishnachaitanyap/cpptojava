import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { StatusType, StatusUpdate } from '../types/index.js';

export class StatusBar {
  private spinner: Ora | null = null;
  private currentStatus: StatusUpdate | null = null;
  private isVerbose: boolean = false;

  constructor() {
    this.isVerbose = process.env.LOG_LEVEL === 'debug';
  }

  update(message: string, type: StatusType = 'info', progress?: number, details?: string): void {
    const statusUpdate: StatusUpdate = { message, type, progress, details };
    this.currentStatus = statusUpdate;
    
    this.renderStatus(statusUpdate);
  }

  private renderStatus(status: StatusUpdate): void {
    const { message, type, progress, details } = status;
    
    // Clear previous line if spinner is active
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }

    const icon = this.getStatusIcon(type);
    const color = this.getStatusColor(type);
    
    let statusText = `${icon} ${color(message)}`;
    
    if (progress !== undefined) {
      const progressBar = this.createProgressBar(progress);
      statusText += ` ${progressBar}`;
    }
    
    if (details && this.isVerbose) {
      statusText += `\n   ${chalk.gray(details)}`;
    }

    // Use spinner for progress states
    if (type === 'progress' || type === 'info') {
      this.spinner = ora(statusText).start();
    } else {
      console.log(statusText);
    }
  }

  private getStatusIcon(type: StatusType): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'progress': return '🔄';
      case 'info': return 'ℹ️';
      default: return '•';
    }
  }

  private getStatusColor(type: StatusType): (text: string) => string {
    switch (type) {
      case 'success': return chalk.green;
      case 'error': return chalk.red;
      case 'warning': return chalk.yellow;
      case 'progress': return chalk.blue;
      case 'info': return chalk.cyan;
      default: return chalk.white;
    }
  }

  private createProgressBar(progress: number): string {
    const width = 20;
    const filled = Math.round((progress / 100) * width);
    const empty = width - filled;
    
    const filledBar = '█'.repeat(filled);
    const emptyBar = '░'.repeat(empty);
    
    return `[${filledBar}${emptyBar}] ${progress}%`;
  }

  success(message: string, details?: string): void {
    this.update(message, 'success', undefined, details);
  }

  error(message: string, details?: string): void {
    this.update(message, 'error', undefined, details);
  }

  warning(message: string, details?: string): void {
    this.update(message, 'warning', undefined, details);
  }

  info(message: string, details?: string): void {
    this.update(message, 'info', undefined, details);
  }

  progress(message: string, progress: number, details?: string): void {
    this.update(message, 'progress', progress, details);
  }

  stop(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }

  clear(): void {
    this.stop();
    this.currentStatus = null;
  }

  getCurrentStatus(): StatusUpdate | null {
    return this.currentStatus;
  }
} 