import { Command } from 'commander';
import { StatusBar } from '../ui/StatusBar.js';
import { ConfigManager } from '../config/ConfigManager.js';
import { CppParser } from '../utils/cppParser.js';
import { ServiceCandidate, CppComponent } from '../types/index.js';
import { GitHubParser } from '../utils/githubParser.js';
import { PineconeService } from '../services/PineconeService.js';
import { OpenAI } from 'openai';
import path from 'path';
import fs from 'fs-extra';

export class AnalyzeCommand {
  private openai: OpenAI;
  private config: ConfigManager;
  private pineconeService: PineconeService;

  constructor(program: Command, statusBar: StatusBar, configManager: ConfigManager) {
    this.config = configManager;
    const config = this.config.getConfig();
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.pineconeService = new PineconeService();

    program
      .command('analyze')
      .description('Analyze and decompose C++ codebase into service candidates using AI + Pinecone')
      .option('-g, --github <url>', 'GitHub repository URL to analyze')
      .option('-b, --branch <branch>', 'Git branch to analyze (default: main)', 'main')
      .option('--keep-clone', 'Keep cloned repository after analysis')
      .option('--no-vectorize', 'Skip vector storage in Pinecone')
      .action(async (options) => {
        try {
          statusBar.info('Starting AI-powered code analysis with Pinecone...');
          
          let workspacePath: string;
          
          if (options.github) {
            statusBar.progress('Cloning GitHub repository...', 10);
            const githubParser = new GitHubParser();
            workspacePath = await githubParser.cloneRepository(options.github, options.branch);
            statusBar.progress('Repository cloned successfully', 20);
          } else {
            workspacePath = configManager.getWorkspacePath();
          }
          
          statusBar.progress('Scanning for C++ files...', 25);
          const components = await CppParser.parseWorkspace(workspacePath);
          
          // Initialize Pinecone and store vectors
          if (options.vectorize !== false) {
            statusBar.progress('Initializing Pinecone vector database...', 30);
            await this.pineconeService.initialize();
            
            statusBar.progress('Generating embeddings and storing in Pinecone...', 35);
            await this.pineconeService.upsertComponents(components);
          }
          
          statusBar.progress('AI-powered classification and grouping...', 50);
          const services = await this.intelligentGrouping(components);
          
          statusBar.progress('Analyzing service boundaries and dependencies...', 70);
          const enhancedServices = await this.analyzeServiceBoundaries(services);
          
          // Update components with service assignments
          const updatedComponents = components.map(comp => {
            const service = enhancedServices.find(s => 
              s.components.some(c => c.id === comp.id)
            );
            return {
              ...comp,
              serviceCandidate: service?.name || 'unassigned'
            };
          });
          
          // Update Pinecone with service assignments
          if (options.vectorize !== false) {
            statusBar.progress('Updating vector database with service assignments...', 80);
            await this.pineconeService.upsertComponents(updatedComponents);
          }
          
          statusBar.success(`AI Analysis complete! Found ${components.length} components in ${enhancedServices.length} intelligent service candidates.`);
          
          // Print detailed AI analysis
          console.log('\n🤖 AI-Powered Analysis Summary:');
          console.log(`Repository: ${options.github || 'Local workspace'}`);
          console.log(`Total Components: ${components.length}`);
          console.log(`Intelligent Service Candidates: ${enhancedServices.length}`);
          if (options.vectorize !== false) {
            console.log(`Vector Database: ✅ Pinecone initialized and populated`);
          }
          console.log('');
          
          enhancedServices.forEach(service => {
            const classCount = service.components.filter(c => c.type === 'class').length;
            const funcCount = service.components.filter(c => c.type === 'function').length;
            console.log(`  🔧 ${service.name}:`);
            console.log(`     Description: ${service.description}`);
            console.log(`     Domain: ${service.domain}`);
            console.log(`     Classes: ${classCount}, Functions: ${funcCount}`);
            console.log(`     Cohesion: ${service.cohesion.toFixed(2)}, Coupling: ${service.coupling.toFixed(2)}`);
            console.log(`     Estimated Size: ${service.estimatedSize}`);
            console.log(`     Total: ${service.components.length} components\n`);
          });
          
          // Save analysis results
          await this.saveAnalysisResults(enhancedServices, options.github || 'local');
          
          // Show Pinecone stats if available
          if (options.vectorize !== false) {
            const stats = await this.pineconeService.getIndexStats();
            console.log(`📊 Pinecone Index Stats:`);
            console.log(`   Total Vectors: ${stats.totalVectorCount || 'N/A'}`);
            console.log(`   Index Dimension: ${stats.dimension || 'N/A'}`);
            console.log(`   Index Name: ${this.config.getConfig().pinecone.indexName}\n`);
          }
          
          // Cleanup cloned repository if not keeping it
          if (options.github && !options.keepClone) {
            statusBar.info('Cleaning up cloned repository...');
            await fs.remove(workspacePath);
            statusBar.success('Repository cleaned up');
          }
        } catch (error) {
          statusBar.error(`Analysis failed: ${error}`);
          console.error('Error details:', error);
        }
      });
  }

  private async intelligentGrouping(components: CppComponent[]): Promise<ServiceCandidate[]> {
    // Use OpenAI to intelligently classify and group components
    const componentDescriptions = components.map(comp => 
      `${comp.name} (${comp.type}): ${comp.content.substring(0, 200)}...`
    ).join('\n');

    const prompt = `Analyze the following C++ components and group them into logical microservices based on business function, coupling, and cohesion. 

Components:
${componentDescriptions}

For each group, provide:
1. Service name (e.g., UserService, AuthService, OrderService)
2. Domain description
3. List of component names that belong to this service
4. Reasoning for the grouping

Format the response as JSON:
{
  "services": [
    {
      "name": "ServiceName",
      "domain": "Domain description",
      "components": ["component1", "component2"],
      "reasoning": "Why these components belong together"
    }
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '';
    
    try {
      const result = JSON.parse(content);
      return result.services.map((service: any) => ({
        id: service.name,
        name: service.name,
        description: service.domain,
        components: components.filter(comp => 
          service.components.includes(comp.name)
        ),
        domain: service.domain,
        cohesion: 0.8, // Will be calculated later
        coupling: 0.2, // Will be calculated later
        estimatedSize: this.calculateSize(service.components.length),
      }));
    } catch (error) {
      console.warn('Failed to parse AI response, using fallback grouping');
      return this.fallbackGrouping(components);
    }
  }

  private async analyzeServiceBoundaries(services: ServiceCandidate[]): Promise<ServiceCandidate[]> {
    // Use OpenAI to analyze service boundaries and calculate metrics
    const serviceDescriptions = services.map(service => 
      `${service.name}: ${service.components.map(c => c.name).join(', ')}`
    ).join('\n');

    const prompt = `Analyze the following microservice candidates and provide metrics for cohesion and coupling:

Services:
${serviceDescriptions}

For each service, analyze:
1. Cohesion (0-1): How well the components within the service work together
2. Coupling (0-1): How dependent the service is on other services
3. Domain alignment: How well the service aligns with business domains

Provide response as JSON:
{
  "services": [
    {
      "name": "ServiceName",
      "cohesion": 0.85,
      "coupling": 0.15,
      "domainAlignment": "High/Medium/Low"
    }
  ]
}`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || '';
    
    try {
      const result = JSON.parse(content);
      return services.map(service => {
        const analysis = result.services.find((s: any) => s.name === service.name);
        return {
          ...service,
          cohesion: analysis?.cohesion || 0.5,
          coupling: analysis?.coupling || 0.5,
        };
      });
    } catch (error) {
      console.warn('Failed to parse boundary analysis, using default metrics');
      return services;
    }
  }

  private calculateSize(componentCount: number): 'small' | 'medium' | 'large' {
    if (componentCount < 10) return 'small';
    if (componentCount < 30) return 'medium';
    return 'large';
  }

  private fallbackGrouping(components: CppComponent[]): ServiceCandidate[] {
    // Fallback to simple keyword-based grouping
    const groups: Record<string, ServiceCandidate> = {};
    
    for (const comp of components) {
      const name = comp.name.toLowerCase();
      let domain = 'MiscService';
      
      if (name.includes('auth') || name.includes('login')) domain = 'AuthService';
      else if (name.includes('user')) domain = 'UserService';
      else if (name.includes('order')) domain = 'OrderService';
      else if (name.includes('db') || name.includes('database')) domain = 'DatabaseService';
      else if (name.includes('log')) domain = 'LoggingService';
      
      if (!groups[domain]) {
        groups[domain] = {
          id: domain,
          name: domain,
          description: `Service for ${domain}`,
          components: [],
          domain,
          cohesion: 0.5,
          coupling: 0.5,
          estimatedSize: 'small',
        };
      }
      groups[domain].components.push(comp);
    }
    
    return Object.values(groups);
  }

  private async saveAnalysisResults(services: ServiceCandidate[], source: string): Promise<void> {
    const results = {
      timestamp: new Date().toISOString(),
      source,
      services,
      summary: {
        totalServices: services.length,
        totalComponents: services.reduce((sum, s) => sum + s.components.length, 0),
        averageCohesion: services.reduce((sum, s) => sum + s.cohesion, 0) / services.length,
        averageCoupling: services.reduce((sum, s) => sum + s.coupling, 0) / services.length,
      }
    };

    const outputPath = this.config.getOutputPath('analysis-results.json');
    await fs.writeJson(outputPath, results, { spaces: 2 });
    console.log(`📊 Analysis results saved to: ${outputPath}`);
  }
} 