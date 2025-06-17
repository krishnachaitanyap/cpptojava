import fs from 'fs-extra';
import path from 'path';
import OpenAI from 'openai';
import { ConfigManager } from '../config/ConfigManager.js';
import { PineconeService } from '../services/PineconeService.js';

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
    await fs.ensureDir(outputPath);
    
    // Create directory structure
    const javaBasePath = path.join(outputPath, 'src', 'main', 'java', 'com', 'migrated', serviceName.toLowerCase());
    const resourcesPath = path.join(outputPath, 'src', 'main', 'resources');
    const testPath = path.join(outputPath, 'src', 'test', 'java', 'com', 'migrated', serviceName.toLowerCase());
    
    await fs.ensureDir(path.join(javaBasePath, 'controller'));
    await fs.ensureDir(path.join(javaBasePath, 'service'));
    await fs.ensureDir(path.join(javaBasePath, 'repository'));
    await fs.ensureDir(path.join(javaBasePath, 'entity'));
    await fs.ensureDir(path.join(javaBasePath, 'dto'));
    await fs.ensureDir(resourcesPath);
    await fs.ensureDir(testPath);

    // Get C++ code context from Pinecone
    const cppContext = await this.getCppContext(serviceName);

    // Generate main application class
    await this.generateMainClass(serviceName, javaBasePath, cppContext);
    
    // Generate controller
    await this.generateController(serviceName, javaBasePath, cppContext);
    
    // Generate service layer
    await this.generateServiceLayer(serviceName, javaBasePath, cppContext);
    
    // Generate repository
    await this.generateRepository(serviceName, javaBasePath, cppContext);
    
    // Generate entity
    await this.generateEntity(serviceName, javaBasePath, cppContext);
    
    // Generate DTOs
    await this.generateDTOs(serviceName, javaBasePath, cppContext);
    
    // Generate tests
    await this.generateTests(serviceName, testPath, cppContext);
  }

  private async getCppContext(serviceName: string): Promise<string> {
    try {
      // Query Pinecone for C++ code related to this service
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
        // Fallback: search for general C++ code if no specific service found
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

  private async generateMainClass(serviceName: string, javaBasePath: string, cppContext: string): Promise<void> {
    const prompt = `Based on the following C++ code context, generate a Spring Boot main application class for a ${serviceName} microservice.

${cppContext}

IMPORTANT: Generate ONLY the Java code. Do NOT include any explanations, markdown formatting, or additional text.

The class should be named ${serviceName}Application and include:
- @SpringBootApplication annotation
- @EnableDiscoveryClient for microservice discovery
- Main method with SpringApplication.run()
- Basic configuration beans if needed

Return ONLY the Java code without any markdown formatting or explanations:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    // Clean up any markdown formatting
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, `${serviceName}Application.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateController(serviceName: string, javaBasePath: string, cppContext: string): Promise<void> {
    const prompt = `Based on the following C++ code context, generate a Spring Boot REST controller for ${serviceName} service.

${cppContext}

IMPORTANT: Generate ONLY the Java code. Do NOT include any explanations, markdown formatting, or additional text.

The controller should:
- Map C++ methods to REST endpoints
- Include CRUD operations based on the C++ class methods
- Use proper Spring annotations (@RestController, @RequestMapping, etc.)
- Include proper error handling and validation
- Map C++ data types to appropriate Java types

Return ONLY the Java code without any markdown formatting or explanations:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    // Clean up any markdown formatting
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, 'controller', `${serviceName}Controller.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateServiceLayer(serviceName: string, javaBasePath: string, cppContext: string): Promise<void> {
    const prompt = `Based on the following C++ code context, generate a Spring Boot service layer for ${serviceName} service.

${cppContext}

IMPORTANT: Generate ONLY the Java code. Do NOT include any explanations, markdown formatting, or additional text.

The service should:
- Implement business logic from the C++ classes
- Include @Service annotation
- Map C++ methods to Java service methods
- Include proper dependency injection
- Handle transactions and business rules from the C++ code
- Convert C++ logic to Java patterns

Return ONLY the Java code without any markdown formatting or explanations:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    // Clean up any markdown formatting
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, 'service', `${serviceName}Service.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateRepository(serviceName: string, javaBasePath: string, cppContext: string): Promise<void> {
    const prompt = `Based on the following C++ code context, generate a Spring Data JPA repository interface for ${serviceName} service.

${cppContext}

IMPORTANT: Generate ONLY the Java code. Do NOT include any explanations, markdown formatting, or additional text.

The repository should:
- Extend JpaRepository with appropriate entity and ID types
- Include custom query methods based on C++ class methods
- Use proper Spring Data annotations
- Map C++ data access patterns to JPA patterns

Return ONLY the Java code without any markdown formatting or explanations:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    // Clean up any markdown formatting
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, 'repository', `${serviceName}Repository.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateEntity(serviceName: string, javaBasePath: string, cppContext: string): Promise<void> {
    const prompt = `Based on the following C++ code context, generate JPA entity classes for ${serviceName} service.

${cppContext}

IMPORTANT: Generate ONLY the Java code. Do NOT include any explanations, markdown formatting, or additional text.

The entities should:
- Map C++ classes to JPA entities
- Include @Entity, @Table, @Id, @GeneratedValue annotations
- Convert C++ member variables to Java fields with @Column annotations
- Map C++ inheritance to Java inheritance or composition
- Include getters, setters, constructors, and toString methods
- Use Lombok annotations where appropriate
- Convert C++ data types to appropriate Java types

Return ONLY the Java code without any markdown formatting or explanations:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    // Clean up any markdown formatting
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, 'entity', `${serviceName}.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateDTOs(serviceName: string, javaBasePath: string, cppContext: string): Promise<void> {
    const prompt = `Based on the following C++ code context, generate DTO (Data Transfer Object) classes for ${serviceName} service.

${cppContext}

IMPORTANT: Generate ONLY the Java code. Do NOT include any explanations, markdown formatting, or additional text.

The DTOs should:
- Create RequestDTO and ResponseDTO classes based on C++ class structures
- Use proper validation annotations (@NotNull, @Size, etc.)
- Map C++ data types to appropriate Java types
- Include getters, setters, and constructors
- Use Lombok annotations where appropriate

Return ONLY the Java code without any markdown formatting or explanations:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    // Clean up any markdown formatting
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(javaBasePath, 'dto', `${serviceName}DTO.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateTests(serviceName: string, testPath: string, cppContext: string): Promise<void> {
    const prompt = `Based on the following C++ code context, generate JUnit 5 test classes for ${serviceName} service.

${cppContext}

IMPORTANT: Generate ONLY the Java code. Do NOT include any explanations, markdown formatting, or additional text.

The tests should:
- Test the business logic from the C++ classes
- Include tests for controller, service, and repository layers
- Use @SpringBootTest, @WebMvcTest, @DataJpaTest as appropriate
- Include unit tests and integration tests
- Use Mockito for mocking dependencies
- Test the C++ logic converted to Java

Return ONLY the Java code without any markdown formatting or explanations:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    // Clean up any markdown formatting
    const cleanContent = this.cleanJavaCode(content);
    const filePath = path.join(testPath, `${serviceName}ApplicationTests.java`);
    await fs.writeFile(filePath, cleanContent);
  }

  // Helper method to clean up markdown formatting from generated code
  private cleanJavaCode(content: string): string {
    // Remove markdown code block markers
    let cleaned = content.replace(/```java\s*/g, '').replace(/```\s*$/g, '');
    
    // Remove explanatory text before and after code blocks
    cleaned = cleaned.replace(/^.*?(?=import|package|@|public|private|protected)/s, '');
    cleaned = cleaned.replace(/(?<=}).*$/s, '');
    
    // Remove common explanatory phrases
    cleaned = cleaned.replace(/Based on the C\+\+ code context.*?Return ONLY the Java code.*?:\s*/gs, '');
    cleaned = cleaned.replace(/Please note.*$/gm, '');
    cleaned = cleaned.replace(/The above code assumes.*$/gm, '');
    
    // Trim whitespace
    cleaned = cleaned.trim();
    
    return cleaned;
  }

  async generateDockerfile(outputPath: string): Promise<void> {
    const prompt = `Generate a Dockerfile for a Spring Boot microservice.

Generate ONLY the Dockerfile content (no explanations or markdown). The Dockerfile should:
- Use multi-stage build for optimization
- Include proper Java version (17 or 21)
- Use Maven for building
- Optimize for production deployment
- Include proper security practices

Return ONLY the Dockerfile content:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || '';
    const filePath = path.join(outputPath, 'Dockerfile');
    await fs.writeFile(filePath, content);
  }

  async generateApplicationYaml(outputPath: string): Promise<void> {
    const prompt = `Generate a Spring Boot application.yml configuration file.

Generate ONLY the YAML content (no explanations or markdown). The configuration should:
- Include server port configuration
- Include database configuration (H2 for development)
- Include logging configuration
- Include environment-specific profiles
- Include basic security settings

Return ONLY the YAML content:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || '';
    const filePath = path.join(outputPath, 'src', 'main', 'resources', 'application.yml');
    await fs.writeFile(filePath, content);
  }

  async generatePomXml(outputPath: string, serviceName: string): Promise<void> {
    const prompt = `Generate a Maven pom.xml file for a Spring Boot microservice named ${serviceName}.

Generate ONLY the XML content (no explanations or markdown). The pom.xml should:
- Include Spring Boot parent
- Include Spring Web, Spring Data JPA, Spring Cloud dependencies
- Include H2 database for development
- Include Lombok for reducing boilerplate
- Include proper Java version (17 or 21)
- Include test dependencies (JUnit 5, Mockito)

Return ONLY the XML content:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || '';
    const filePath = path.join(outputPath, 'pom.xml');
    await fs.writeFile(filePath, content);
  }

  async generateReadme(outputPath: string, serviceName: string): Promise<void> {
    const prompt = `Generate a README.md file for a Spring Boot microservice named ${serviceName}.

Generate ONLY the Markdown content (no explanations). The README should include:
- Service description and purpose
- Prerequisites and dependencies
- Installation and setup instructions
- Running the service locally
- API documentation
- Testing instructions
- Deployment information

Return ONLY the Markdown content:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || '';
    const filePath = path.join(outputPath, 'README.md');
    await fs.writeFile(filePath, content);
  }
} 