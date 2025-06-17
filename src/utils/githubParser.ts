import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export class GitHubParser {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), '.temp-clones');
  }

  async cloneRepository(githubUrl: string, branch: string = 'main'): Promise<string> {
    // Ensure temp directory exists
    await fs.ensureDir(this.tempDir);

    // Extract repository info from URL
    const repoInfo = this.parseGitHubUrl(githubUrl);
    if (!repoInfo) {
      throw new Error('Invalid GitHub URL. Expected format: https://github.com/owner/repo');
    }

    // Create unique directory for this clone
    const cloneDir = path.join(this.tempDir, `${repoInfo.owner}-${repoInfo.repo}-${uuidv4().slice(0, 8)}`);
    
    try {
      // Clone the repository
      const cloneCommand = `git clone -b ${branch} --depth 1 ${githubUrl} "${cloneDir}"`;
      await execAsync(cloneCommand);
      
      console.log(`✅ Cloned ${repoInfo.owner}/${repoInfo.repo} (${branch}) to ${cloneDir}`);
      return cloneDir;
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error}`);
    }
  }

  private parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    // Support various GitHub URL formats
    const patterns = [
      /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?$/,
      /^git@github\.com:([^\/]+)\/([^\/]+)(?:\.git)?$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return {
          owner: match[1],
          repo: match[2].replace('.git', '')
        };
      }
    }

    return null;
  }

  async getRepositoryInfo(githubUrl: string): Promise<{ owner: string; repo: string; defaultBranch: string }> {
    const repoInfo = this.parseGitHubUrl(githubUrl);
    if (!repoInfo) {
      throw new Error('Invalid GitHub URL');
    }

    try {
      // Try to get default branch using GitHub API (if available)
      const response = await fetch(`https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`);
      if (response.ok) {
        const data = await response.json();
        return {
          owner: repoInfo.owner,
          repo: repoInfo.repo,
          defaultBranch: data.default_branch || 'main'
        };
      }
    } catch (error) {
      // Fallback to 'main' if API call fails
      console.warn('Could not fetch repository info from GitHub API, using default branch "main"');
    }

    return {
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      defaultBranch: 'main'
    };
  }

  async cleanup(): Promise<void> {
    try {
      await fs.remove(this.tempDir);
    } catch (error) {
      console.warn('Failed to cleanup temp directory:', error);
    }
  }
} 