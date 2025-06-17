import { Command } from 'commander';
import { StatusBar } from '../ui/StatusBar.js';
import { ConfigManager } from '../config/ConfigManager.js';
import { JavaGenerator } from '../generators/JavaGenerator.js';
import fs from 'fs-extra';
import path from 'path';

export class TransformCommand {
  constructor(program: Command, statusBar: StatusBar, configManager: ConfigManager) {
    program
      .command('transform <service>')
      .description('Transform C++ service candidate into Java Spring Boot microservice')
      .option('-o, --output <path>', 'Output directory for generated code')
      .action(async (service, options) => {
        try {
          statusBar.info(`Transforming service: ${service}`);
          
          const outputDir = options.output || configManager.getOutputPath();
          await configManager.ensureOutputDirectory();
          
          statusBar.progress('Generating Java Spring Boot code', 20);
          
          // Create Java generator instance
          const javaGenerator = new JavaGenerator();
          
          // Generate the service structure
          const servicePath = path.join(outputDir, service);
          await javaGenerator.generateService(service, servicePath);
          
          statusBar.progress('Creating project structure', 60);
          
          // Generate additional files
          await javaGenerator.generateDockerfile(servicePath);
          await javaGenerator.generateApplicationYaml(servicePath);
          await javaGenerator.generatePomXml(servicePath, service);
          
          statusBar.progress('Finalizing project', 90);
          
          // Create README
          await javaGenerator.generateReadme(servicePath, service);
          
          statusBar.success(`✅ Service '${service}' transformed successfully!`);
          
          console.log(`\n📁 Generated files at: ${servicePath}`);
          console.log(`\n📋 Project structure:`);
          console.log(`   ├── src/main/java/`);
          console.log(`   │   └── com/migrated/${service.toLowerCase()}/`);
          console.log(`   │       ├── controller/`);
          console.log(`   │       ├── service/`);
          console.log(`   │       ├── repository/`);
          console.log(`   │       └── entity/`);
          console.log(`   ├── src/main/resources/`);
          console.log(`   │   └── application.yml`);
          console.log(`   ├── Dockerfile`);
          console.log(`   ├── pom.xml`);
          console.log(`   └── README.md`);
          
          console.log(`\n🚀 Next steps:`);
          console.log(`   1. cd ${servicePath}`);
          console.log(`   2. mvn spring-boot:run`);
          console.log(`   3. Or build with: mvn clean package`);
          
        } catch (error) {
          statusBar.error(`Failed to transform service: ${error}`);
          console.error('Error details:', error);
        }
      });
  }
} 