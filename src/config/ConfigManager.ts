import { Config } from '../types/index.js';
import fs from 'fs-extra';
import path from 'path';

export class ConfigManager {
  private config: Config;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): Config {
    const config: Config = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: process.env.OPENAI_MODEL || 'gpt-4',
        embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-large'
      },
      pinecone: {
        apiKey: process.env.PINECONE_API_KEY || '',
        environment: process.env.PINECONE_ENVIRONMENT || '',
        indexName: process.env.PINECONE_INDEX || 'cpp2java'
      },
      aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        region: process.env.AWS_REGION || 'us-east-1'
      },
      workspace: {
        path: process.env.WORKSPACE_PATH || process.cwd(),
        outputDir: process.env.OUTPUT_DIR || './migrated-services',
        logLevel: process.env.LOG_LEVEL || 'info'
      }
    };

    return config;
  }

  getConfig(): Config {
    return this.config;
  }

  updateConfig(updates: Partial<Config>): void {
    this.config = { ...this.config, ...updates };
  }

  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.openai.apiKey) {
      errors.push('OPENAI_API_KEY is required');
    }

    if (!this.config.pinecone.apiKey) {
      errors.push('PINECONE_API_KEY is required');
    }

    if (!this.config.pinecone.environment) {
      errors.push('PINECONE_ENVIRONMENT is required');
    }

    if (!this.config.workspace.path) {
      errors.push('WORKSPACE_PATH is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async ensureOutputDirectory(): Promise<void> {
    const outputDir = path.resolve(this.config.workspace.outputDir);
    await fs.ensureDir(outputDir);
  }

  getOutputPath(subPath: string = ''): string {
    return path.join(this.config.workspace.outputDir, subPath);
  }

  getWorkspacePath(): string {
    return path.resolve(this.config.workspace.path);
  }
} 