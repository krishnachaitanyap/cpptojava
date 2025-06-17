import { Command } from 'commander';
import { StatusBar } from '../ui/StatusBar.js';
import { ConfigManager } from '../config/ConfigManager.js';
import { PineconeService } from '../services/PineconeService.js';
import { CppParser } from '../utils/cppParser.js';
import { CppComponent } from '../types/index.js';
import fs from 'fs-extra';

export class SearchCommand {
  private pineconeService: PineconeService;
  private config: ConfigManager;

  constructor(program: Command, statusBar: StatusBar, configManager: ConfigManager) {
    this.config = configManager;
    this.pineconeService = new PineconeService();

    program
      .command('search <query>')
      .description('Vector-based semantic search using Pinecone + OpenAI embeddings')
      .option('-l, --limit <number>', 'Maximum number of results', '10')
      .option('-t, --type <type>', 'Filter by component type (class, function)', 'all')
      .option('-s, --service <service>', 'Filter by service name')
      .option('--similar-to <componentId>', 'Find components similar to a specific component')
      .action(async (query, options) => {
        try {
          statusBar.info(`🔍 Performing vector-based semantic search for: "${query}"`);
          
          // Initialize Pinecone
          statusBar.progress('Initializing Pinecone vector database...', 20);
          await this.pineconeService.initialize();
          
          let searchResults;
          
          if (options.similarTo) {
            // Find similar components
            statusBar.progress('Finding similar components...', 50);
            searchResults = await this.pineconeService.findSimilarComponents(
              options.similarTo, 
              parseInt(options.limit)
            );
          } else {
            // Perform semantic search
            statusBar.progress('Performing semantic search...', 50);
            const filter = this.buildFilter(options);
            searchResults = await this.pineconeService.semanticSearch(
              query, 
              parseInt(options.limit), 
              filter
            );
          }
          
          statusBar.progress('Processing and ranking results...', 80);
          
          statusBar.success(`Found ${searchResults.length} relevant components`);
          
          // Display results
          this.displaySearchResults(query, searchResults, options.similarTo);
          
          // Save search results
          await this.saveSearchResults(query, searchResults, options);
          
        } catch (error) {
          statusBar.error(`Search failed: ${error}`);
          console.error('Error details:', error);
        }
      });
  }

  private buildFilter(options: any): any {
    const filter: any = {};
    
    if (options.type !== 'all') {
      filter.type = { $eq: options.type };
    }
    
    if (options.service) {
      filter.serviceCandidate = { $eq: options.service };
    }
    
    return Object.keys(filter).length > 0 ? filter : undefined;
  }

  private displaySearchResults(query: string, results: any[], similarTo?: string): void {
    const searchType = similarTo ? 'similar components' : 'semantic search';
    console.log(`\n🔍 ${searchType.toUpperCase()} Results`);
    
    if (similarTo) {
      console.log(`Finding components similar to: ${similarTo}`);
    } else {
      console.log(`Query: "${query}"`);
    }
    
    console.log(`Found ${results.length} relevant components:\n`);
    
    results.forEach((result, index) => {
      console.log(`${index + 1}. 📄 ${result.metadata.filename} (${result.metadata.type})`);
      console.log(`   📍 File: ${result.metadata.path}`);
      console.log(`   🎯 Similarity Score: ${(result.score * 100).toFixed(1)}%`);
      console.log(`   🏷️  Domain: ${result.metadata.domain}`);
      console.log(`   🔧 Service: ${result.metadata.serviceCandidateId}`);
      console.log(`   📝 Preview: ${result.metadata.content.substring(0, 150)}...`);
      console.log('');
    });
  }

  private async saveSearchResults(query: string, results: any[], options: any): Promise<void> {
    const searchResults = {
      timestamp: new Date().toISOString(),
      query,
      options,
      results: results.map(r => ({
        id: r.id,
        name: r.metadata.filename,
        type: r.metadata.type,
        filePath: r.metadata.path,
        domain: r.metadata.domain,
        serviceCandidate: r.metadata.serviceCandidateId,
        similarityScore: r.score,
        content: r.metadata.content
      })),
      summary: {
        totalResults: results.length,
        averageSimilarity: results.reduce((sum, r) => sum + r.score, 0) / results.length
      }
    };

    const outputPath = this.config.getOutputPath(`vector-search-${Date.now()}.json`);
    await fs.writeJson(outputPath, searchResults, { spaces: 2 });
    console.log(`📊 Vector search results saved to: ${outputPath}`);
  }
} 