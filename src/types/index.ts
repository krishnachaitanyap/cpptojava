export interface CppComponent {
  id: string;
  name: string;
  type: 'function' | 'class' | 'struct' | 'namespace';
  content: string;
  filePath: string;
  lineNumber: number;
  dependencies: string[];
  domain?: string;
  serviceCandidate?: string;
  complexity: number;
  metadata: Record<string, any>;
}

export interface ServiceCandidate {
  id: string;
  name: string;
  description: string;
  components: CppComponent[];
  domain: string;
  cohesion: number;
  coupling: number;
  estimatedSize: 'small' | 'medium' | 'large';
}

export interface JavaService {
  id: string;
  name: string;
  package: string;
  components: {
    controller: string;
    service: string;
    repository: string;
    entity: string;
    dto: string;
    test: string;
  };
  dependencies: string[];
  config: {
    port: number;
    database?: string;
    externalApis?: string[];
  };
}

export interface DeploymentConfig {
  serviceId: string;
  target: 'ecs' | 'lambda' | 'kubernetes';
  region: string;
  resources: {
    cpu: string;
    memory: string;
    storage?: string;
  };
  environment: Record<string, string>;
  scaling: {
    min: number;
    max: number;
    targetCpu: number;
  };
}

export interface TraceRecord {
  id: string;
  cppComponentId: string;
  javaFile: string;
  serviceName: string;
  status: 'analyzed' | 'transformed' | 'deployed' | 'error';
  deploymentTarget?: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface EmbeddingRecord {
  id: string;
  vector: number[];
  metadata: {
    filename: string;
    path: string;
    type: string;
    domain: string;
    serviceCandidateId: string;
    content: string;
  };
}

export interface AnalysisResult {
  components: CppComponent[];
  services: ServiceCandidate[];
  dependencies: Map<string, string[]>;
  metrics: {
    totalFiles: number;
    totalFunctions: number;
    totalClasses: number;
    averageComplexity: number;
    estimatedMigrationTime: number;
  };
}

export interface SearchResult {
  query: string;
  results: Array<{
    component: CppComponent;
    score: number;
    highlights: string[];
  }>;
  totalResults: number;
}

export interface TransformResult {
  service: JavaService;
  files: Map<string, string>;
  dependencies: string[];
  tests: string[];
  dockerfile: string;
  deploymentScripts: Map<string, string>;
}

export interface Config {
  openai: {
    apiKey: string;
    model: string;
    embeddingModel: string;
  };
  pinecone: {
    apiKey: string;
    environment: string;
    indexName: string;
  };
  aws: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
  };
  workspace: {
    path: string;
    outputDir: string;
    logLevel: string;
  };
}

export type StatusType = 'info' | 'success' | 'warning' | 'error' | 'progress';

export interface StatusUpdate {
  message: string;
  type: StatusType;
  progress?: number;
  details?: string;
} 