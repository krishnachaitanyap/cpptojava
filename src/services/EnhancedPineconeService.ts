import { Pinecone } from '@pinecone-database/pinecone';
import { ConfigManager } from '../config/ConfigManager.js';
import { CppComponent, EmbeddingRecord } from '../types/index.js';
import { OpenAI } from 'openai';
import fs from 'fs-extra';
import path from 'path';

// Enhanced metadata structure for better search and analysis
interface EnhancedMetadata {
  // Basic component info
  name: string;
  type: 'function' | 'class' | 'struct' | 'namespace' | 'enum' | 'typedef' | 'macro' | 'ui_component';
  filePath: string;
  lineNumber: number;
  
  // Content and analysis
  content: string;
  contentHash: string; // For deduplication
  contentLength: number;
  language: 'cpp' | 'h' | 'hpp' | 'cc' | 'cxx';
  
  // Semantic analysis
  domain: string;
  serviceCandidate: string;
  complexity: number;
  cyclomaticComplexity?: number;
  cognitiveComplexity?: number;
  
  // Dependencies and relationships
  dependencies: string[];
  dependents: string[];
  imports: string[];
  includes: string[];
  
  // UI-specific metadata (for React migration)
  uiPattern?: 'form' | 'table' | 'modal' | 'navigation' | 'chart' | 'custom';
  uiFramework?: 'qt' | 'wxwidgets' | 'gtk' | 'win32' | 'cocoa';
  uiProperties?: {
    hasValidation?: boolean;
    hasState?: boolean;
    hasEvents?: boolean;
    isResponsive?: boolean;
  };
  
  // Code quality metrics
  metrics: {
    linesOfCode: number;
    commentRatio: number;
    testCoverage?: number;
    maintainabilityIndex?: number;
  };
  
  // Business context
  businessDomain?: string;
  businessFunction?: string;
  dataEntities?: string[];
  externalApis?: string[];
  
  // Migration context
  migrationPriority: 'high' | 'medium' | 'low';
  migrationComplexity: 'simple' | 'moderate' | 'complex';
  estimatedEffort: number; // in hours
  
  // Timestamps and versioning
  createdAt: string;
  updatedAt: string;
  version: string;
  
  // Custom tags and labels
  tags: string[];
  labels: string[];
  
  // Search optimization
  searchKeywords: string[];
  semanticContext: string;
}

// Enhanced embedding record with better structure
interface EnhancedEmbeddingRecord extends EmbeddingRecord {
  metadata: EnhancedMetadata;
  relationships?: {
    similarComponents: string[];
    relatedServices: string[];
    dependencies: string[];
  };
  quality?: {
    embeddingQuality: number;
    contentQuality: number;
    metadataCompleteness: number;
  };
}

// Fallback storage interface
interface FallbackStorage {
  save(records: EnhancedEmbeddingRecord[]): Promise<void>;
  load(): Promise<EnhancedEmbeddingRecord[]>;
  search(query: string, filters?: any): Promise<EnhancedEmbeddingRecord[]>;
  clear(): Promise<void>;
}

// Local JSON fallback storage
class LocalJSONStorage implements FallbackStorage {
  private filePath: string;

  constructor(storagePath: string = './.cache/embeddings.json') {
    this.filePath = storagePath;
  }

  async save(records: EnhancedEmbeddingRecord[]): Promise<void> {
    await fs.ensureDir(path.dirname(this.filePath));
    await fs.writeJson(this.filePath, records, { spaces: 2 });
  }

  async load(): Promise<EnhancedEmbeddingRecord[]> {
    try {
      return await fs.readJson(this.filePath);
    } catch (error) {
      return [];
    }
  }

  async search(query: string, filters?: any): Promise<EnhancedEmbeddingRecord[]> {
    const records = await this.load();
    const queryLower = query.toLowerCase();
    
    return records.filter(record => {
      // Basic text search
      const matchesQuery = 
        record.metadata.name.toLowerCase().includes(queryLower) ||
        record.metadata.content.toLowerCase().includes(queryLower) ||
        record.metadata.searchKeywords.some(keyword => 
          keyword.toLowerCase().includes(queryLower)
        );
      
      // Apply filters
      if (filters) {
        if (filters.type && record.metadata.type !== filters.type) return false;
        if (filters.domain && record.metadata.domain !== filters.domain) return false;
        if (filters.serviceCandidate && record.metadata.serviceCandidate !== filters.serviceCandidate) return false;
      }
      
      return matchesQuery;
    }).sort((a, b) => {
      // Simple relevance scoring
      const aScore = this.calculateRelevanceScore(a, query);
      const bScore = this.calculateRelevanceScore(b, query);
      return bScore - aScore;
    });
  }

  private calculateRelevanceScore(record: EnhancedEmbeddingRecord, query: string): number {
    const queryLower = query.toLowerCase();
    let score = 0;
    
    if (record.metadata.name.toLowerCase().includes(queryLower)) score += 10;
    if (record.metadata.content.toLowerCase().includes(queryLower)) score += 5;
    if (record.metadata.searchKeywords.some(k => k.toLowerCase().includes(queryLower))) score += 3;
    if (record.metadata.tags.some(t => t.toLowerCase().includes(queryLower))) score += 2;
    
    return score;
  }

  async clear(): Promise<void> {
    await fs.remove(this.filePath);
  }
}

export class EnhancedPineconeService {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private config: ConfigManager;
  private index: any;
  private fallbackStorage: FallbackStorage;
  private isOnline: boolean = true;

  constructor() {
    this.config = new ConfigManager();
    const config = this.config.getConfig();
    
    this.pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });
    
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });

    // Initialize fallback storage
    this.fallbackStorage = new LocalJSONStorage();
  }

  async initialize(): Promise<void> {
    const config = this.config.getConfig();
    let indexName = config.pinecone.indexName || process.env.PINECONE_INDEX;
    
    if (!indexName) {
      console.warn('⚠️ Pinecone index name is not set! Using fallback storage.');
      this.isOnline = false;
      return;
    }

    try {
      console.log(`🔗 Connecting to Pinecone Serverless index: ${indexName}`);
      this.index = this.pinecone.index(indexName);
      
      // Test connection
      await this.index.describeIndexStats();
      console.log('✅ Connected to Pinecone Serverless index');
      this.isOnline = true;
    } catch (error) {
      console.warn('⚠️ Failed to connect to Pinecone, using fallback storage:', error.message);
      this.isOnline = false;
    }
  }

  private async generateEnhancedMetadata(component: CppComponent): Promise<EnhancedMetadata> {
    // Generate content hash for deduplication
    const crypto = await import('crypto');
    const contentHash = crypto.createHash('sha256').update(component.content).digest('hex');
    
    // Analyze content for UI patterns
    const uiPattern = this.detectUIPattern(component.content);
    const uiFramework = this.detectUIFramework(component.content);
    
    // Calculate code metrics
    const metrics = this.calculateCodeMetrics(component.content);
    
    // Extract business context
    const businessContext = this.extractBusinessContext(component);
    
    // Generate search keywords
    const searchKeywords = this.generateSearchKeywords(component);
    
    return {
      // Basic info
      name: component.name,
      type: component.type,
      filePath: component.filePath,
      lineNumber: component.lineNumber,
      
      // Content
      content: component.content.substring(0, 2000), // Increased limit
      contentHash,
      contentLength: component.content.length,
      language: this.detectLanguage(component.filePath),
      
      // Semantic analysis
      domain: component.domain || 'unknown',
      serviceCandidate: component.serviceCandidate || 'unknown',
      complexity: component.complexity,
      
      // Dependencies
      dependencies: component.dependencies || [],
      dependents: [],
      imports: this.extractImports(component.content),
      includes: this.extractIncludes(component.content),
      
      // UI metadata
      uiPattern,
      uiFramework,
      uiProperties: this.analyzeUIProperties(component.content),
      
      // Metrics
      metrics,
      
      // Business context
      ...businessContext,
      
      // Migration context
      migrationPriority: this.calculateMigrationPriority(component),
      migrationComplexity: this.calculateMigrationComplexity(component),
      estimatedEffort: this.estimateMigrationEffort(component),
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      
      // Tags and labels
      tags: this.generateTags(component),
      labels: this.generateLabels(component),
      
      // Search optimization
      searchKeywords,
      semanticContext: this.generateSemanticContext(component),
    };
  }

  private detectUIPattern(content: string): EnhancedMetadata['uiPattern'] {
    const patterns = {
      form: /(QDialog|QForm|QInputDialog|QMessageBox|form|input|button)/i,
      table: /(QTable|QTableView|QTableWidget|table|grid|list)/i,
      modal: /(QDialog|QMessageBox|modal|popup|dialog)/i,
      navigation: /(QMenu|QMenuBar|QToolBar|QTabWidget|menu|navigation)/i,
      chart: /(QChart|QChartView|QGraph|chart|graph|plot)/i,
    };

    for (const [pattern, regex] of Object.entries(patterns)) {
      if (regex.test(content)) {
        return pattern as EnhancedMetadata['uiPattern'];
      }
    }
    return 'custom';
  }

  private detectUIFramework(content: string): EnhancedMetadata['uiFramework'] {
    if (/QWidget|QApplication|Qt::/i.test(content)) return 'qt';
    if (/wxWidgets|wx::/i.test(content)) return 'wxwidgets';
    if (/gtk|Gtk::/i.test(content)) return 'gtk';
    if (/Win32|Windows::/i.test(content)) return 'win32';
    if (/NSView|NSWindow|Cocoa/i.test(content)) return 'cocoa';
    return undefined;
  }

  private calculateCodeMetrics(content: string) {
    const lines = content.split('\n');
    const codeLines = lines.filter(line => line.trim() && !line.trim().startsWith('//'));
    const commentLines = lines.filter(line => line.trim().startsWith('//') || line.includes('/*'));
    
    return {
      linesOfCode: codeLines.length,
      commentRatio: commentLines.length / lines.length,
    };
  }

  private extractBusinessContext(component: CppComponent) {
    // Extract business domain from component name and content
    const businessKeywords = {
      banking: /(account|transaction|balance|withdraw|deposit|loan)/i,
      ecommerce: /(product|order|cart|payment|inventory|shipping)/i,
      iot: /(sensor|device|monitor|control|data|stream)/i,
      healthcare: /(patient|medical|diagnosis|treatment|health)/i,
    };

    for (const [domain, regex] of Object.entries(businessKeywords)) {
      if (regex.test(component.name) || regex.test(component.content)) {
        return {
          businessDomain: domain,
          businessFunction: this.extractBusinessFunction(component),
          dataEntities: this.extractDataEntities(component.content),
          externalApis: this.extractExternalAPIs(component.content),
        };
      }
    }

    return {
      businessDomain: 'general',
      businessFunction: 'unknown',
      dataEntities: [],
      externalApis: [],
    };
  }

  private extractBusinessFunction(component: CppComponent): string {
    const functionPatterns = {
      authentication: /(login|auth|password|user|session)/i,
      authorization: /(role|permission|access|admin)/i,
      dataProcessing: /(process|transform|convert|calculate)/i,
      reporting: /(report|analytics|statistics|metrics)/i,
      communication: /(api|http|socket|message|network)/i,
    };

    for (const [function, regex] of Object.entries(functionPatterns)) {
      if (regex.test(component.name) || regex.test(component.content)) {
        return function;
      }
    }
    return 'unknown';
  }

  private extractDataEntities(content: string): string[] {
    const entityPattern = /(class|struct)\s+(\w+)/g;
    const entities: string[] = [];
    let match;
    
    while ((match = entityPattern.exec(content)) !== null) {
      entities.push(match[2]);
    }
    
    return entities;
  }

  private extractExternalAPIs(content: string): string[] {
    const apiPatterns = [
      /(https?:\/\/[^\s]+)/g,
      /(curl|http|https|api)/gi,
      /(REST|SOAP|GraphQL)/gi,
    ];
    
    const apis: string[] = [];
    for (const pattern of apiPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        apis.push(...matches);
      }
    }
    
    return [...new Set(apis)];
  }

  private generateSearchKeywords(component: CppComponent): string[] {
    const keywords = [
      component.name,
      component.type,
      component.domain,
      component.serviceCandidate,
      ...component.dependencies,
      ...this.extractDataEntities(component.content),
      ...this.extractExternalAPIs(component.content),
    ];
    
    return [...new Set(keywords.filter(Boolean))];
  }

  private generateTags(component: CppComponent): string[] {
    const tags = [
      component.type,
      component.domain,
      component.serviceCandidate,
      this.detectLanguage(component.filePath),
    ];
    
    if (this.detectUIPattern(component.content)) {
      tags.push('ui-component');
    }
    
    return [...new Set(tags.filter(Boolean))];
  }

  private generateLabels(component: CppComponent): string[] {
    const labels = [];
    
    if (component.complexity > 7) labels.push('high-complexity');
    if (component.complexity < 3) labels.push('low-complexity');
    if (component.dependencies.length > 5) labels.push('high-coupling');
    if (component.dependencies.length === 0) labels.push('independent');
    
    return labels;
  }

  private generateSemanticContext(component: CppComponent): string {
    return `${component.name} is a ${component.type} in the ${component.domain} domain, part of ${component.serviceCandidate} service. ${this.extractBusinessFunction(component)} functionality.`;
  }

  private detectLanguage(filePath: string): EnhancedMetadata['language'] {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
      case '.cpp': return 'cpp';
      case '.h': return 'h';
      case '.hpp': return 'hpp';
      case '.cc': return 'cc';
      case '.cxx': return 'cxx';
      default: return 'cpp';
    }
  }

  private extractImports(content: string): string[] {
    const importPattern = /#include\s*<([^>]+)>/g;
    const imports: string[] = [];
    let match;
    
    while ((match = importPattern.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  private extractIncludes(content: string): string[] {
    const includePattern = /#include\s*"([^"]+)"/g;
    const includes: string[] = [];
    let match;
    
    while ((match = includePattern.exec(content)) !== null) {
      includes.push(match[1]);
    }
    
    return includes;
  }

  private analyzeUIProperties(content: string): EnhancedMetadata['uiProperties'] {
    return {
      hasValidation: /(validate|validation|check|verify)/i.test(content),
      hasState: /(state|status|enabled|disabled|visible)/i.test(content),
      hasEvents: /(signal|slot|event|callback|onClick|onChange)/i.test(content),
      isResponsive: /(resize|layout|responsive|adaptive)/i.test(content),
    };
  }

  private calculateMigrationPriority(component: CppComponent): EnhancedMetadata['migrationPriority'] {
    if (component.complexity > 7 || component.dependencies.length > 10) return 'high';
    if (component.complexity > 4 || component.dependencies.length > 5) return 'medium';
    return 'low';
  }

  private calculateMigrationComplexity(component: CppComponent): EnhancedMetadata['migrationComplexity'] {
    if (component.complexity > 8 || this.detectUIPattern(component.content)) return 'complex';
    if (component.complexity > 5 || component.dependencies.length > 7) return 'moderate';
    return 'simple';
  }

  private estimateMigrationEffort(component: CppComponent): number {
    let effort = component.complexity * 2;
    effort += component.dependencies.length * 0.5;
    
    if (this.detectUIPattern(component.content)) {
      effort *= 1.5; // UI components require more effort
    }
    
    return Math.round(effort);
  }

  async embedComponent(component: CppComponent): Promise<number[]> {
    // Enhanced embedding with better context
    const context = `
      Component: ${component.name} (${component.type})
      Domain: ${component.domain}
      Service: ${component.serviceCandidate}
      Content: ${component.content.substring(0, 1000)}
      Dependencies: ${component.dependencies.join(', ')}
      Business Function: ${this.extractBusinessFunction(component)}
    `;
    
    const response = await this.openai.embeddings.create({
      model: this.config.getConfig().openai.embeddingModel,
      input: context,
    });

    return response.data[0].embedding;
  }

  async upsertComponents(components: CppComponent[]): Promise<void> {
    console.log(`📊 Upserting ${components.length} components with enhanced metadata...`);
    
    const enhancedRecords: EnhancedEmbeddingRecord[] = [];
    
    for (const component of components) {
      const embedding = await this.embedComponent(component);
      const metadata = await this.generateEnhancedMetadata(component);
      
      enhancedRecords.push({
        id: component.id,
        vector: embedding,
        metadata,
        relationships: {
          similarComponents: [],
          relatedServices: [],
          dependencies: component.dependencies,
        },
        quality: {
          embeddingQuality: 1.0,
          contentQuality: this.calculateContentQuality(component),
          metadataCompleteness: this.calculateMetadataCompleteness(metadata),
        },
      });
    }

    if (this.isOnline) {
      // Upsert to Pinecone
      const vectors = enhancedRecords.map(record => ({
        id: record.id,
        values: record.vector,
        metadata: record.metadata,
      }));

      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await this.index.upsert(batch);
        console.log(`✅ Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
      }
    } else {
      // Save to fallback storage
      await this.fallbackStorage.save(enhancedRecords);
      console.log('✅ Saved to fallback storage');
    }
  }

  private calculateContentQuality(component: CppComponent): number {
    let quality = 1.0;
    
    if (component.content.length < 10) quality *= 0.5;
    if (component.content.length > 5000) quality *= 0.8;
    if (component.complexity > 10) quality *= 0.7;
    
    return Math.max(0.1, quality);
  }

  private calculateMetadataCompleteness(metadata: EnhancedMetadata): number {
    const requiredFields = [
      'name', 'type', 'filePath', 'content', 'domain', 'serviceCandidate',
      'complexity', 'dependencies', 'metrics', 'migrationPriority'
    ];
    
    let completed = 0;
    for (const field of requiredFields) {
      if (metadata[field as keyof EnhancedMetadata]) completed++;
    }
    
    return completed / requiredFields.length;
  }

  async semanticSearch(query: string, topK: number = 10, filter?: any): Promise<EnhancedEmbeddingRecord[]> {
    if (this.isOnline) {
      return await this.pineconeSearch(query, topK, filter);
    } else {
      return await this.fallbackSearch(query, topK, filter);
    }
  }

  private async pineconeSearch(query: string, topK: number, filter?: any): Promise<EnhancedEmbeddingRecord[]> {
    const queryEmbedding = await this.openai.embeddings.create({
      model: this.config.getConfig().openai.embeddingModel,
      input: query,
    });

    const searchResponse = await this.index.query({
      vector: queryEmbedding.data[0].embedding,
      topK,
      includeMetadata: true,
      filter
    });

    return searchResponse.matches?.map((match: any) => ({
      id: match.id,
      vector: match.values || [],
      metadata: match.metadata as EnhancedMetadata,
      score: match.score || 0
    })) || [];
  }

  private async fallbackSearch(query: string, topK: number, filter?: any): Promise<EnhancedEmbeddingRecord[]> {
    const results = await this.fallbackStorage.search(query, filter);
    return results.slice(0, topK);
  }

  async findSimilarComponents(componentId: string, topK: number = 5): Promise<EnhancedEmbeddingRecord[]> {
    if (this.isOnline) {
      return await this.pineconeSimilarSearch(componentId, topK);
    } else {
      return await this.fallbackSimilarSearch(componentId, topK);
    }
  }

  private async pineconeSimilarSearch(componentId: string, topK: number): Promise<EnhancedEmbeddingRecord[]> {
    const fetchResponse = await this.index.fetch([componentId]);
    const component = fetchResponse.records[componentId];
    
    if (!component) {
      throw new Error(`Component ${componentId} not found in index`);
    }

    const searchResponse = await this.index.query({
      vector: component.values,
      topK: topK + 1,
      includeMetadata: true,
      filter: {
        id: { $ne: componentId }
      }
    });

    return searchResponse.matches?.map((match: any) => ({
      id: match.id,
      vector: match.values || [],
      metadata: match.metadata as EnhancedMetadata,
      score: match.score || 0
    })) || [];
  }

  private async fallbackSimilarSearch(componentId: string, topK: number): Promise<EnhancedEmbeddingRecord[]> {
    const records = await this.fallbackStorage.load();
    const targetRecord = records.find(r => r.id === componentId);
    
    if (!targetRecord) {
      throw new Error(`Component ${componentId} not found in fallback storage`);
    }

    // Simple similarity based on metadata
    const similar = records
      .filter(r => r.id !== componentId)
      .map(record => ({
        ...record,
        score: this.calculateSimilarityScore(targetRecord, record)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return similar;
  }

  private calculateSimilarityScore(record1: EnhancedEmbeddingRecord, record2: EnhancedEmbeddingRecord): number {
    let score = 0;
    
    // Type similarity
    if (record1.metadata.type === record2.metadata.type) score += 0.3;
    
    // Domain similarity
    if (record1.metadata.domain === record2.metadata.domain) score += 0.2;
    
    // Service similarity
    if (record1.metadata.serviceCandidate === record2.metadata.serviceCandidate) score += 0.2;
    
    // Content similarity (simple keyword matching)
    const keywords1 = record1.metadata.searchKeywords;
    const keywords2 = record2.metadata.searchKeywords;
    const commonKeywords = keywords1.filter(k => keywords2.includes(k));
    score += (commonKeywords.length / Math.max(keywords1.length, keywords2.length)) * 0.3;
    
    return score;
  }

  async getServiceComponents(serviceName: string): Promise<EnhancedEmbeddingRecord[]> {
    if (this.isOnline) {
      return await this.pineconeServiceSearch(serviceName);
    } else {
      return await this.fallbackServiceSearch(serviceName);
    }
  }

  private async pineconeServiceSearch(serviceName: string): Promise<EnhancedEmbeddingRecord[]> {
    const searchResponse = await this.index.query({
      vector: new Array(1536).fill(0),
      topK: 1000,
      includeMetadata: true,
      filter: {
        serviceCandidate: { $eq: serviceName }
      }
    });

    return searchResponse.matches?.map((match: any) => ({
      id: match.id,
      vector: match.values || [],
      metadata: match.metadata as EnhancedMetadata,
      score: match.score || 0
    })) || [];
  }

  private async fallbackServiceSearch(serviceName: string): Promise<EnhancedEmbeddingRecord[]> {
    const records = await this.fallbackStorage.load();
    return records.filter(record => record.metadata.serviceCandidate === serviceName);
  }

  async deleteComponent(componentId: string): Promise<void> {
    if (this.isOnline) {
      await this.index.delete([componentId]);
    } else {
      const records = await this.fallbackStorage.load();
      const filteredRecords = records.filter(r => r.id !== componentId);
      await this.fallbackStorage.save(filteredRecords);
    }
  }

  async clearIndex(): Promise<void> {
    if (this.isOnline) {
      await this.index.deleteAll();
    } else {
      await this.fallbackStorage.clear();
    }
  }

  async getIndexStats(): Promise<any> {
    if (this.isOnline) {
      return await this.index.describeIndexStats();
    } else {
      const records = await this.fallbackStorage.load();
      return {
        totalVectorCount: records.length,
        dimension: 1536,
        indexFullness: 0,
        namespaces: {},
        dimension: 1536
      };
    }
  }

  // New methods for enhanced functionality
  async searchByUIPattern(pattern: string): Promise<EnhancedEmbeddingRecord[]> {
    return await this.semanticSearch(`UI component with ${pattern} pattern`, 50, {
      uiPattern: { $eq: pattern }
    });
  }

  async searchByComplexity(minComplexity: number, maxComplexity: number): Promise<EnhancedEmbeddingRecord[]> {
    return await this.semanticSearch(`complex code components`, 100, {
      complexity: { $gte: minComplexity, $lte: maxComplexity }
    });
  }

  async searchByMigrationPriority(priority: string): Promise<EnhancedEmbeddingRecord[]> {
    return await this.semanticSearch(`high priority migration components`, 50, {
      migrationPriority: { $eq: priority }
    });
  }

  async getComponentsByDomain(domain: string): Promise<EnhancedEmbeddingRecord[]> {
    return await this.semanticSearch(`components in ${domain} domain`, 100, {
      domain: { $eq: domain }
    });
  }

  async getUIAnalysis(): Promise<any> {
    const uiComponents = await this.semanticSearch('UI components', 1000, {
      uiPattern: { $exists: true }
    });

    const analysis = {
      totalUIComponents: uiComponents.length,
      patterns: {} as Record<string, number>,
      frameworks: {} as Record<string, number>,
      properties: {
        hasValidation: 0,
        hasState: 0,
        hasEvents: 0,
        isResponsive: 0,
      }
    };

    for (const component of uiComponents) {
      const pattern = component.metadata.uiPattern;
      const framework = component.metadata.uiFramework;
      const properties = component.metadata.uiProperties;

      if (pattern) {
        analysis.patterns[pattern] = (analysis.patterns[pattern] || 0) + 1;
      }
      if (framework) {
        analysis.frameworks[framework] = (analysis.frameworks[framework] || 0) + 1;
      }
      if (properties) {
        if (properties.hasValidation) analysis.properties.hasValidation++;
        if (properties.hasState) analysis.properties.hasState++;
        if (properties.hasEvents) analysis.properties.hasEvents++;
        if (properties.isResponsive) analysis.properties.isResponsive++;
      }
    }

    return analysis;
  }

  async getMigrationAnalysis(): Promise<any> {
    const allComponents = this.isOnline 
      ? await this.pineconeSearch('all components', 10000)
      : await this.fallbackStorage.load();

    const analysis = {
      totalComponents: allComponents.length,
      migrationPriorities: {} as Record<string, number>,
      migrationComplexities: {} as Record<string, number>,
      estimatedTotalEffort: 0,
      domains: {} as Record<string, number>,
      services: {} as Record<string, number>,
    };

    for (const component of allComponents) {
      const priority = component.metadata.migrationPriority;
      const complexity = component.metadata.migrationComplexity;
      const domain = component.metadata.domain;
      const service = component.metadata.serviceCandidate;

      analysis.migrationPriorities[priority] = (analysis.migrationPriorities[priority] || 0) + 1;
      analysis.migrationComplexities[complexity] = (analysis.migrationComplexities[complexity] || 0) + 1;
      analysis.domains[domain] = (analysis.domains[domain] || 0) + 1;
      analysis.services[service] = (analysis.services[service] || 0) + 1;
      analysis.estimatedTotalEffort += component.metadata.estimatedEffort;
    }

    return analysis;
  }
} 