import { Pinecone } from '@pinecone-database/pinecone';
import { ConfigManager } from '../config/ConfigManager.js';
import { CppComponent, EmbeddingRecord } from '../types/index.js';
import { OpenAI } from 'openai';

export class PineconeService {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private config: ConfigManager;
  private index: any;

  constructor() {
    this.config = new ConfigManager();
    const config = this.config.getConfig();
    
    this.pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });
    
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async initialize(): Promise<void> {
    const config = this.config.getConfig();
    let indexName = config.pinecone.indexName || process.env.PINECONE_INDEX;
    if (!indexName) {
      console.warn('Pinecone index name is not set!');
      indexName = '';
    }
    console.log(`🔗 Connecting to Pinecone Serverless index: ${indexName}`);
    this.index = this.pinecone.index(indexName);
    console.log('✅ Connected to Pinecone Serverless index');
  }

  async embedComponent(component: CppComponent): Promise<number[]> {
    const text = `${component.name} (${component.type}): ${component.content}`;
    
    const response = await this.openai.embeddings.create({
      model: this.config.getConfig().openai.embeddingModel,
      input: text,
    });

    return response.data[0].embedding;
  }

  async upsertComponents(components: CppComponent[]): Promise<void> {
    console.log(`📊 Upserting ${components.length} components to Pinecone...`);
    
    const vectors = [];
    for (const component of components) {
      const embedding = await this.embedComponent(component);
      
      vectors.push({
        id: component.id,
        values: embedding,
        metadata: {
          name: component.name,
          type: component.type,
          filePath: component.filePath,
          lineNumber: component.lineNumber,
          content: component.content.substring(0, 1000), // Limit content size
          domain: component.domain || 'unknown',
          serviceCandidate: component.serviceCandidate || 'unknown',
          complexity: component.complexity,
          timestamp: new Date().toISOString()
        }
      });
    }

    // Upsert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await this.index.upsert(batch);
      console.log(`✅ Upserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectors.length / batchSize)}`);
    }
  }

  async semanticSearch(query: string, topK: number = 10, filter?: any): Promise<EmbeddingRecord[]> {
    // Generate embedding for the query
    const queryEmbedding = await this.openai.embeddings.create({
      model: this.config.getConfig().openai.embeddingModel,
      input: query,
    });

    // Search in Pinecone
    const searchResponse = await this.index.query({
      vector: queryEmbedding.data[0].embedding,
      topK,
      includeMetadata: true,
      filter
    });

    return searchResponse.matches?.map((match: any) => ({
      id: match.id,
      vector: match.values || [],
      metadata: {
        filename: match.metadata?.name || '',
        path: match.metadata?.filePath || '',
        type: match.metadata?.type || '',
        domain: match.metadata?.domain || '',
        serviceCandidateId: match.metadata?.serviceCandidate || '',
        content: match.metadata?.content || '',
      },
      score: match.score || 0
    })) || [];
  }

  async findSimilarComponents(componentId: string, topK: number = 5): Promise<EmbeddingRecord[]> {
    // First, get the component's vector
    const fetchResponse = await this.index.fetch([componentId]);
    const component = fetchResponse.records[componentId];
    
    if (!component) {
      throw new Error(`Component ${componentId} not found in index`);
    }

    // Search for similar components
    const searchResponse = await this.index.query({
      vector: component.values,
      topK: topK + 1, // +1 to exclude the component itself
      includeMetadata: true,
      filter: {
        id: { $ne: componentId }
      }
    });

    return searchResponse.matches?.map((match: any) => ({
      id: match.id,
      vector: match.values || [],
      metadata: {
        filename: match.metadata?.name || '',
        path: match.metadata?.filePath || '',
        type: match.metadata?.type || '',
        domain: match.metadata?.domain || '',
        serviceCandidateId: match.metadata?.serviceCandidate || '',
        content: match.metadata?.content || '',
      },
      score: match.score || 0
    })) || [];
  }

  async getServiceComponents(serviceName: string): Promise<EmbeddingRecord[]> {
    const searchResponse = await this.index.query({
      vector: new Array(1536).fill(0), // Dummy vector for metadata-only search
      topK: 1000,
      includeMetadata: true,
      filter: {
        serviceCandidate: { $eq: serviceName }
      }
    });

    return searchResponse.matches?.map((match: any) => ({
      id: match.id,
      vector: match.values || [],
      metadata: {
        filename: match.metadata?.name || '',
        path: match.metadata?.filePath || '',
        type: match.metadata?.type || '',
        domain: match.metadata?.domain || '',
        serviceCandidateId: match.metadata?.serviceCandidate || '',
        content: match.metadata?.content || '',
      },
      score: match.score || 0
    })) || [];
  }

  async deleteComponent(componentId: string): Promise<void> {
    await this.index.delete([componentId]);
  }

  async clearIndex(): Promise<void> {
    await this.index.deleteAll();
  }

  async getIndexStats(): Promise<any> {
    return await this.index.describeIndexStats();
  }
} 