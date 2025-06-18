import fs from 'fs-extra';
import path from 'path';
import OpenAI from 'openai';
import { ConfigManager } from '../config/ConfigManager.js';
import { PineconeService } from '../services/PineconeService.js';

// Types for the agentic planning system
interface ArchitecturePlan {
  serviceName: string;
  database: DatabaseConfig;
  resilience: ResilienceConfig;
  caching: CacheConfig;
  security: SecurityConfig;
  monitoring: MonitoringConfig;
  deployment: DeploymentConfig;
  customComponents: CustomComponent[];
  externalIntegrations: ExternalIntegration[];
  properties: PropertyConfig;
}

interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'mongodb' | 'redis' | 'h2' | 'none';
  reason: string;
  connectionPool: boolean;
  migrations: boolean;
  auditTrail: boolean;
}

interface ResilienceConfig {
  circuitBreaker: boolean;
  retry: boolean;
  timeout: boolean;
  bulkhead: boolean;
  rateLimiting: boolean;
  reason: string;
}

interface CacheConfig {
  enabled: boolean;
  type: 'redis' | 'ehcache' | 'caffeine' | 'none';
  reason: string;
  ttl: number;
}

interface SecurityConfig {
  authentication: boolean;
  authorization: boolean;
  encryption: boolean;
  ssl: boolean;
  reason: string;
}

interface MonitoringConfig {
  metrics: boolean;
  tracing: boolean;
  logging: boolean;
  healthChecks: boolean;
  reason: string;
}

interface DeploymentConfig {
  docker: boolean;
  kubernetes: boolean;
  aws: boolean;
  ciCd: boolean;
  environmentAsCode: boolean;
  reason: string;
}

interface CustomComponent {
  name: string;
  type: 'annotation' | 'aspect' | 'interceptor' | 'validator' | 'converter';
  purpose: string;
  implementation: string;
}

interface ExternalIntegration {
  name: string;
  type: 'api' | 'message-queue' | 'database' | 'cache' | 'monitoring';
  technology: string;
  purpose: string;
}

interface PropertyConfig {
  externalized: boolean;
  profiles: string[];
  encryption: boolean;
  validation: boolean;
}

export class JavaGenerator {
  private openai: OpenAI;
  private config: ConfigManager;
  private pineconeService: PineconeService | null = null;

  constructor() {
    this.config = new ConfigManager();
    const config = this.config.getConfig();
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  private async getPineconeService(): Promise<PineconeService> {
    if (!this.pineconeService) {
      this.pineconeService = new PineconeService();
      await this.pineconeService.initialize();
    }
    return this.pineconeService;
  }

  async generateService(serviceName: string, outputPath: string): Promise<void> {
    console.log(`🤖 Starting agentic analysis for ${serviceName}...`);
    
    // Step 1: Agentic Architecture Planning
    const architecturePlan = await this.createArchitecturePlan(serviceName);
    
    // Step 2: Generate project structure based on plan
    await this.createProjectStructure(serviceName, outputPath, architecturePlan);
    
    // Step 3: Generate all components based on the plan
    await this.generateComponents(serviceName, outputPath, architecturePlan);
    
    console.log(`✅ Service ${serviceName} generated successfully with intelligent architecture!`);
  }

  private async createArchitecturePlan(serviceName: string): Promise<ArchitecturePlan> {
    console.log(`🔍 Analyzing C++ code to create intelligent architecture plan...`);
    
    const cppContext = await this.getCppContext(serviceName);
    
    const planningPrompt = `You are an expert software architect specializing in migrating C++ applications to Java Spring Boot microservices. 

Analyze the following C++ code and create a comprehensive architecture plan for the Spring Boot service.

C++ Code Context:
${cppContext}

Service Name: ${serviceName}

Based on the C++ code analysis, determine the optimal Spring Boot architecture including:

1. DATABASE REQUIREMENTS:
   - What database type is needed? (postgresql, mysql, mongodb, redis, h2, none)
   - Does it need connection pooling?
   - Are database migrations required?
   - Is audit trail needed?

2. RESILIENCE PATTERNS:
   - Does the C++ code show retry logic, error handling, or external API calls?
   - Should we include circuit breaker (Resilience4j)?
   - Do we need retry mechanisms?
   - Is timeout handling required?
   - Should we implement bulkhead pattern?
   - Is rate limiting needed?

3. CACHING STRATEGY:
   - Does the C++ code show caching patterns?
   - What type of cache is appropriate? (redis, ehcache, caffeine, none)
   - What should be the TTL?

4. SECURITY REQUIREMENTS:
   - Does the C++ code show authentication/authorization?
   - Is encryption needed?
   - Should we enable SSL?

5. MONITORING & OBSERVABILITY:
   - Does the C++ code show logging patterns?
   - Do we need metrics collection?
   - Is distributed tracing required?
   - Should we implement health checks?

6. DEPLOYMENT STRATEGY:
   - Should we generate Docker configuration?
   - Do we need Kubernetes manifests?
   - Should we include AWS-specific configurations?
   - Do we need CI/CD pipeline configurations?
   - Should we implement Infrastructure as Code?

7. CUSTOM COMPONENTS:
   - Are there C++ patterns that need custom Java annotations?
   - Do we need custom aspects or interceptors?
   - Are there custom validators needed?
   - Do we need custom converters?

8. EXTERNAL INTEGRATIONS:
   - What external APIs does the C++ code interact with?
   - Are there message queue patterns?
   - What monitoring systems should be integrated?

9. PROPERTY CONFIGURATION:
   - Should properties be externalized?
   - What environment profiles are needed?
   - Is property encryption required?
   - Do we need property validation?

Respond with a JSON object containing the architecture plan. Be specific and provide reasoning for each decision based on the C++ code patterns you identify.

Return ONLY the JSON object:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: planningPrompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const plan = this.parseArchitecturePlan(content);
    
    console.log(`📋 Architecture plan created for ${serviceName}:`);
    console.log(`   Database: ${plan.database.type} (${plan.database.reason})`);
    console.log(`   Resilience: ${plan.resilience.circuitBreaker ? 'Circuit Breaker' : ''} ${plan.resilience.retry ? 'Retry' : ''} ${plan.resilience.timeout ? 'Timeout' : ''}`);
    console.log(`   Cache: ${plan.caching.type} (${plan.caching.reason})`);
    console.log(`   Security: ${plan.security.authentication ? 'Auth' : ''} ${plan.security.encryption ? 'Encryption' : ''}`);
    console.log(`   Deployment: ${plan.deployment.docker ? 'Docker' : ''} ${plan.deployment.kubernetes ? 'K8s' : ''} ${plan.deployment.aws ? 'AWS' : ''}`);
    
    return plan;
  }

  private parseArchitecturePlan(content: string): ArchitecturePlan {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('Failed to parse architecture plan, using default:', error);
    }

    // Default architecture plan
    return {
      serviceName: 'Service',
      database: {
        type: 'h2',
        reason: 'Default development database',
        connectionPool: false,
        migrations: false,
        auditTrail: false
      },
      resilience: {
        circuitBreaker: false,
        retry: false,
        timeout: false,
        bulkhead: false,
        rateLimiting: false,
        reason: 'No resilience patterns detected'
      },
      caching: {
        enabled: false,
        type: 'none',
        reason: 'No caching patterns detected',
        ttl: 300
      },
      security: {
        authentication: false,
        authorization: false,
        encryption: false,
        ssl: false,
        reason: 'No security patterns detected'
      },
      monitoring: {
        metrics: true,
        tracing: false,
        logging: true,
        healthChecks: true,
        reason: 'Basic monitoring enabled'
      },
      deployment: {
        docker: true,
        kubernetes: false,
        aws: false,
        ciCd: false,
        environmentAsCode: false,
        reason: 'Basic Docker deployment'
      },
      customComponents: [],
      externalIntegrations: [],
      properties: {
        externalized: true,
        profiles: ['dev', 'prod'],
        encryption: false,
        validation: true
      }
    };
  }

  private async createProjectStructure(serviceName: string, outputPath: string, plan: ArchitecturePlan): Promise<void> {
    console.log(`📁 Creating project structure based on architecture plan...`);
    
    await fs.ensureDir(outputPath);
    
    // Base Java structure
    const javaBasePath = path.join(outputPath, 'src', 'main', 'java', 'com', 'migrated', serviceName.toLowerCase());
    const resourcesPath = path.join(outputPath, 'src', 'main', 'resources');
    const testPath = path.join(outputPath, 'src', 'test', 'java', 'com', 'migrated', serviceName.toLowerCase());
    
    // Standard Spring Boot structure
    await fs.ensureDir(path.join(javaBasePath, 'controller'));
    await fs.ensureDir(path.join(javaBasePath, 'service'));
    await fs.ensureDir(path.join(javaBasePath, 'repository'));
    await fs.ensureDir(path.join(javaBasePath, 'entity'));
    await fs.ensureDir(path.join(javaBasePath, 'dto'));
    await fs.ensureDir(path.join(javaBasePath, 'config'));
    await fs.ensureDir(path.join(javaBasePath, 'exception'));
    await fs.ensureDir(path.join(javaBasePath, 'util'));
    
    // Conditional directories based on architecture plan
    if (plan.resilience.circuitBreaker || plan.resilience.retry || plan.resilience.timeout) {
      await fs.ensureDir(path.join(javaBasePath, 'resilience'));
    }
    
    if (plan.caching.enabled) {
      await fs.ensureDir(path.join(javaBasePath, 'cache'));
    }
    
    if (plan.security.authentication || plan.security.authorization) {
      await fs.ensureDir(path.join(javaBasePath, 'security'));
    }
    
    if (plan.monitoring.metrics || plan.monitoring.tracing) {
      await fs.ensureDir(path.join(javaBasePath, 'monitoring'));
    }
    
    if (plan.customComponents.length > 0) {
      await fs.ensureDir(path.join(javaBasePath, 'annotation'));
      await fs.ensureDir(path.join(javaBasePath, 'aspect'));
    }
    
    if (plan.externalIntegrations.length > 0) {
      await fs.ensureDir(path.join(javaBasePath, 'integration'));
    }
    
    // Resources structure
    await fs.ensureDir(resourcesPath);
    if (plan.properties.profiles.length > 0) {
      for (const profile of plan.properties.profiles) {
        await fs.ensureDir(path.join(resourcesPath, `application-${profile}.yml`));
      }
    }
    
    // Test structure
    await fs.ensureDir(testPath);
    await fs.ensureDir(path.join(testPath, 'controller'));
    await fs.ensureDir(path.join(testPath, 'service'));
    await fs.ensureDir(path.join(testPath, 'repository'));
    
    // Deployment structure
    if (plan.deployment.docker) {
      await fs.ensureDir(path.join(outputPath, 'docker'));
    }
    
    if (plan.deployment.kubernetes) {
      await fs.ensureDir(path.join(outputPath, 'k8s'));
    }
    
    if (plan.deployment.aws) {
      await fs.ensureDir(path.join(outputPath, 'aws'));
    }
    
    if (plan.deployment.ciCd) {
      await fs.ensureDir(path.join(outputPath, '.github'));
      await fs.ensureDir(path.join(outputPath, '.github', 'workflows'));
    }
  }

  private async generateComponents(serviceName: string, outputPath: string, plan: ArchitecturePlan): Promise<void> {
    console.log(`🔧 Generating Spring Boot components based on architecture plan...`);
    
    const cppContext = await this.getCppContext(serviceName);
    const javaBasePath = path.join(outputPath, 'src', 'main', 'java', 'com', 'migrated', serviceName.toLowerCase());
    const resourcesPath = path.join(outputPath, 'src', 'main', 'resources');
    
    // Generate core Spring Boot components
    await this.generateMainClass(serviceName, javaBasePath, cppContext, plan);
    await this.generateController(serviceName, javaBasePath, cppContext, plan);
    await this.generateServiceLayer(serviceName, javaBasePath, cppContext, plan);
    await this.generateRepository(serviceName, javaBasePath, cppContext, plan);
    await this.generateEntity(serviceName, javaBasePath, cppContext, plan);
    await this.generateDTOs(serviceName, javaBasePath, cppContext, plan);
    
    // Generate configuration classes
    await this.generateConfiguration(serviceName, javaBasePath, plan);
    
    // Generate conditional components based on architecture plan
    if (plan.resilience.circuitBreaker || plan.resilience.retry || plan.resilience.timeout) {
      await this.generateResilienceConfig(serviceName, javaBasePath, plan);
    }
    
    if (plan.caching.enabled) {
      await this.generateCacheConfig(serviceName, javaBasePath, plan);
    }
    
    if (plan.security.authentication || plan.security.authorization) {
      await this.generateSecurityConfig(serviceName, javaBasePath, plan);
    }
    
    if (plan.monitoring.metrics || plan.monitoring.tracing) {
      await this.generateMonitoringConfig(serviceName, javaBasePath, plan);
    }
    
    if (plan.customComponents.length > 0) {
      await this.generateCustomComponents(serviceName, javaBasePath, plan);
    }
    
    // Generate deployment configurations
    await this.generateDeploymentConfigs(serviceName, outputPath, plan);
    
    // Generate property files
    await this.generatePropertyFiles(serviceName, resourcesPath, plan);
    
    // Generate build configuration
    await this.generateBuildConfig(serviceName, outputPath, plan);
  }

  private async getCppContext(serviceName: string): Promise<string> {
    try {
      const pineconeService = await this.getPineconeService();
      const searchResults = await pineconeService.semanticSearch(
        `C++ classes and functions related to ${serviceName}`,
        20
      );

      let context = `C++ Code Context for ${serviceName}:\n\n`;
      
      if (searchResults && searchResults.length > 0) {
        context += 'Relevant C++ Components Found:\n';
        searchResults.forEach((result: any, index: number) => {
          context += `${index + 1}. ${result.metadata.type}: ${result.metadata.filename}\n`;
          context += `   File: ${result.metadata.path}\n`;
          context += `   Content: ${result.metadata.content}\n\n`;
        });
      } else {
        const generalResults = await pineconeService.semanticSearch(
          'C++ classes functions methods',
          15
        );
        
        if (generalResults && generalResults.length > 0) {
          context += 'General C++ Components Found:\n';
          generalResults.forEach((result: any, index: number) => {
            context += `${index + 1}. ${result.metadata.type}: ${result.metadata.filename}\n`;
            context += `   File: ${result.metadata.path}\n`;
            context += `   Content: ${result.metadata.content}\n\n`;
          });
        }
      }

      return context;
    } catch (error) {
      console.warn('Failed to retrieve C++ context from Pinecone:', error);
      return `C++ Code Context for ${serviceName}: No specific context available.`;
    }
  }

  private async generateMainClass(serviceName: string, javaBasePath: string, cppContext: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate a Spring Boot main application class for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

C++ Context:
${cppContext}

Generate ONLY the Java code with appropriate annotations and configurations based on the architecture plan. Include:
- @SpringBootApplication
- @EnableDiscoveryClient if needed
- @EnableCaching if caching is enabled
- @EnableCircuitBreaker if resilience patterns are needed
- @EnableSecurity if security is enabled
- @EnableMetrics if monitoring is enabled
- Custom configuration imports based on the plan

Return ONLY the Java code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, `${serviceName}Application.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateController(serviceName: string, javaBasePath: string, cppContext: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate a Spring Boot REST controller for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

C++ Context:
${cppContext}

Generate ONLY the Java code with:
- REST endpoints based on C++ methods
- Resilience4j annotations if circuit breaker/retry is enabled
- Security annotations if authentication is enabled
- Caching annotations if caching is enabled
- Proper error handling and validation
- Monitoring annotations if metrics are enabled

Return ONLY the Java code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, 'controller', `${serviceName}Controller.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateServiceLayer(serviceName: string, javaBasePath: string, cppContext: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate a Spring Boot service layer for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

C++ Context:
${cppContext}

Generate ONLY the Java code with:
- Business logic from C++ classes
- Resilience4j annotations if resilience patterns are enabled
- Caching annotations if caching is enabled
- Transaction management
- External service integration patterns
- Monitoring and logging

Return ONLY the Java code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, 'service', `${serviceName}Service.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateRepository(serviceName: string, javaBasePath: string, cppContext: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate a Spring Data repository for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

C++ Context:
${cppContext}

Generate ONLY the Java code with:
- JPA repository interface
- Custom query methods based on C++ patterns
- Database-specific annotations based on the database type
- Caching annotations if caching is enabled
- Audit trail if enabled

Return ONLY the Java code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, 'repository', `${serviceName}Repository.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateEntity(serviceName: string, javaBasePath: string, cppContext: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate JPA entities for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

C++ Context:
${cppContext}

Generate ONLY the Java code with:
- JPA entity classes based on C++ classes
- Database-specific annotations
- Audit trail annotations if enabled
- Validation annotations
- Lombok annotations
- Proper data type mapping

Return ONLY the Java code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, 'entity', `${serviceName}.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateDTOs(serviceName: string, javaBasePath: string, cppContext: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate DTOs for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

C++ Context:
${cppContext}

Generate ONLY the Java code with:
- Request and Response DTOs
- Validation annotations
- Security annotations if authentication is enabled
- Proper data type mapping
- Lombok annotations

Return ONLY the Java code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, 'dto', `${serviceName}DTO.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateConfiguration(serviceName: string, javaBasePath: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate Spring Boot configuration classes for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the Java code with:
- Database configuration based on database type
- Cache configuration if caching is enabled
- Security configuration if security is enabled
- Monitoring configuration if monitoring is enabled
- External integration configurations
- Custom component configurations

Return ONLY the Java code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, 'config', `${serviceName}Config.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateResilienceConfig(serviceName: string, javaBasePath: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate Resilience4j configuration for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the Java code with:
- Circuit breaker configuration
- Retry configuration
- Timeout configuration
- Bulkhead configuration
- Rate limiting configuration
- Custom resilience patterns

Return ONLY the Java code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, 'resilience', `${serviceName}ResilienceConfig.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateCacheConfig(serviceName: string, javaBasePath: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate cache configuration for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the Java code with:
- Cache configuration based on cache type
- TTL configuration
- Cache key generation
- Cache eviction policies
- Cache monitoring

Return ONLY the Java code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, 'cache', `${serviceName}CacheConfig.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateSecurityConfig(serviceName: string, javaBasePath: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate security configuration for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the Java code with:
- Authentication configuration
- Authorization configuration
- SSL configuration
- Encryption configuration
- Security filters and interceptors

Return ONLY the Java code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, 'security', `${serviceName}SecurityConfig.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateMonitoringConfig(serviceName: string, javaBasePath: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate monitoring configuration for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the Java code with:
- Metrics configuration
- Tracing configuration
- Health check configuration
- Logging configuration
- Monitoring endpoints

Return ONLY the Java code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, 'monitoring', `${serviceName}MonitoringConfig.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateCustomComponents(serviceName: string, javaBasePath: string, plan: ArchitecturePlan): Promise<void> {
    for (const component of plan.customComponents) {
      const prompt = `Generate custom ${component.type} for ${serviceName} based on the architecture plan.

Component: ${JSON.stringify(component, null, 2)}

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the Java code for the custom ${component.type} with:
- Proper annotations
- Implementation logic
- Integration with Spring Boot
- Error handling

Return ONLY the Java code:`;

      const response = await this.openai.chat.completions.create({
        model: this.config.getConfig().openai.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content || '';
      const cleanContent = this.cleanJavaCode(content);
      
      let filePath: string;
      switch (component.type) {
        case 'annotation':
          filePath = path.join(javaBasePath, 'annotation', `${component.name}.java`);
          break;
        case 'aspect':
          filePath = path.join(javaBasePath, 'aspect', `${component.name}.java`);
          break;
        case 'interceptor':
          filePath = path.join(javaBasePath, 'interceptor', `${component.name}.java`);
          break;
        case 'validator':
          filePath = path.join(javaBasePath, 'validator', `${component.name}.java`);
          break;
        case 'converter':
          filePath = path.join(javaBasePath, 'converter', `${component.name}.java`);
          break;
        default:
          filePath = path.join(javaBasePath, 'util', `${component.name}.java`);
      }
      
      await fs.writeFile(filePath, cleanContent);
    }
  }

  private async generateDeploymentConfigs(serviceName: string, outputPath: string, plan: ArchitecturePlan): Promise<void> {
    if (plan.deployment.docker) {
      await this.generateDockerfile(outputPath, plan);
    }
    
    if (plan.deployment.kubernetes) {
      await this.generateKubernetesManifests(serviceName, outputPath, plan);
    }
    
    if (plan.deployment.aws) {
      await this.generateAWSConfigs(serviceName, outputPath, plan);
    }
    
    if (plan.deployment.ciCd) {
      await this.generateCICDConfigs(serviceName, outputPath, plan);
    }
  }

  private async generatePropertyFiles(serviceName: string, resourcesPath: string, plan: ArchitecturePlan): Promise<void> {
    for (const profile of plan.properties.profiles) {
      const prompt = `Generate application-${profile}.yml for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the YAML content with:
- Database configuration for ${profile} environment
- Cache configuration if enabled
- Security configuration if enabled
- Monitoring configuration if enabled
- External integrations configuration
- Environment-specific properties

Return ONLY the YAML content:`;

      const response = await this.openai.chat.completions.create({
        model: this.config.getConfig().openai.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      const content = response.choices[0]?.message?.content || '';
      const filePath = path.join(resourcesPath, `application-${profile}.yml`);
      await fs.writeFile(filePath, content);
    }
  }

  private async generateBuildConfig(serviceName: string, outputPath: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate Maven pom.xml for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the XML content with:
- Spring Boot parent
- Database dependencies based on database type
- Resilience4j dependencies if resilience patterns are enabled
- Cache dependencies if caching is enabled
- Security dependencies if security is enabled
- Monitoring dependencies if monitoring is enabled
- Custom component dependencies
- Test dependencies
- Build plugins

Return ONLY the XML content:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const filePath = path.join(outputPath, 'pom.xml');
    await fs.writeFile(filePath, content);
  }

  private async generateDockerfile(outputPath: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate a Dockerfile based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the Dockerfile content with:
- Multi-stage build for optimization
- Proper Java version
- Maven build process
- Security best practices
- Environment-specific configurations
- Health checks if monitoring is enabled

Return ONLY the Dockerfile content:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const filePath = path.join(outputPath, 'Dockerfile');
    await fs.writeFile(filePath, content);
  }

  private async generateKubernetesManifests(serviceName: string, outputPath: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate Kubernetes manifests for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the YAML content with:
- Deployment manifest
- Service manifest
- ConfigMap for externalized properties
- Secret for sensitive data if security is enabled
- Ingress if needed
- Horizontal Pod Autoscaler if monitoring is enabled
- Resource limits and requests

Return ONLY the YAML content:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const filePath = path.join(outputPath, 'k8s', `${serviceName}-deployment.yml`);
    await fs.writeFile(filePath, content);
  }

  private async generateAWSConfigs(serviceName: string, outputPath: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate AWS configuration files for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the configuration content with:
- AWS ECS task definition
- AWS ECS service definition
- AWS Application Load Balancer configuration
- AWS RDS configuration if database is needed
- AWS ElastiCache configuration if caching is enabled
- AWS CloudWatch configuration if monitoring is enabled
- AWS IAM roles and policies
- AWS Parameter Store for externalized properties

Return ONLY the configuration content:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const filePath = path.join(outputPath, 'aws', `${serviceName}-aws-config.yml`);
    await fs.writeFile(filePath, content);
  }

  private async generateCICDConfigs(serviceName: string, outputPath: string, plan: ArchitecturePlan): Promise<void> {
    const prompt = `Generate CI/CD pipeline configuration for ${serviceName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the YAML content with:
- GitHub Actions workflow
- Build and test stages
- Docker image building
- Deployment to different environments
- Infrastructure as Code deployment
- Security scanning
- Performance testing if monitoring is enabled
- Environment-specific deployments

Return ONLY the YAML content:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const filePath = path.join(outputPath, '.github', 'workflows', `${serviceName}-ci-cd.yml`);
    await fs.writeFile(filePath, content);
  }

  private cleanJavaCode(content: string): string {
    let cleaned = content.replace(/```java\s*/g, '').replace(/```\s*$/g, '');
    cleaned = cleaned.replace(/^.*?(?=import|package|@|public|private|protected)/s, '');
    cleaned = cleaned.replace(/(?<=}).*$/s, '');
    cleaned = cleaned.replace(/Based on the.*?Return ONLY the.*?:\s*/gs, '');
    cleaned = cleaned.replace(/Please note.*$/gm, '');
    cleaned = cleaned.replace(/The above code assumes.*$/gm, '');
    return cleaned.trim();
  }
} 