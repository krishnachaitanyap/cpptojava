import fs from 'fs-extra';
import path from 'path';
import OpenAI from 'openai';
import { ConfigManager } from '../config/ConfigManager.js';
import { PineconeService } from '../services/PineconeService.js';

// Types for React UI migration
interface ReactArchitecturePlan {
  uiFramework: 'react' | 'nextjs' | 'gatsby';
  styling: 'css' | 'scss' | 'styled-components' | 'tailwind' | 'material-ui' | 'antd';
  stateManagement: 'context' | 'redux' | 'zustand' | 'recoil' | 'none';
  routing: 'react-router' | 'next-router' | 'none';
  testing: 'jest' | 'cypress' | 'playwright' | 'none';
  buildTool: 'vite' | 'webpack' | 'create-react-app' | 'nextjs';
  deployment: 'vercel' | 'netlify' | 'aws' | 'docker';
  reason: string;
}

interface UIComponent {
  name: string;
  type: 'form' | 'table' | 'modal' | 'navigation' | 'chart' | 'custom';
  cppPattern: string;
  reactPattern: string;
  props: string[];
  state: string[];
  dependencies: string[];
}

interface UIFeature {
  name: string;
  type: 'authentication' | 'authorization' | 'validation' | 'internationalization' | 'theming' | 'responsive';
  implementation: string;
}

export class ReactGenerator {
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

  async generateReactApp(appName: string, outputPath: string): Promise<void> {
    console.log(`🎨 Starting React UI migration for ${appName}...`);
    
    // Step 1: Analyze C++ UI code and create React architecture plan
    const reactPlan = await this.createReactArchitecturePlan(appName);
    
    // Step 2: Generate React project structure
    await this.createReactProjectStructure(appName, outputPath, reactPlan);
    
    // Step 3: Generate React components based on C++ UI patterns
    await this.generateReactComponents(appName, outputPath, reactPlan);
    
    console.log(`✅ React app ${appName} generated successfully with intelligent UI migration!`);
  }

  private async createReactArchitecturePlan(appName: string): Promise<ReactArchitecturePlan> {
    console.log(`🔍 Analyzing C++ UI code to create React architecture plan...`);
    
    const cppUIContext = await this.getCppUIContext(appName);
    
    const planningPrompt = `You are an expert frontend architect specializing in migrating C++ UI applications to React.

Analyze the following C++ UI code and create a comprehensive React architecture plan.

C++ UI Code Context:
${cppUIContext}

App Name: ${appName}

Based on the C++ UI code analysis, determine the optimal React architecture including:

1. UI FRAMEWORK:
   - Should we use React, Next.js, or Gatsby?
   - Consider SSR/SSG needs, routing complexity, and performance requirements

2. STYLING APPROACH:
   - CSS, SCSS, Styled Components, Tailwind CSS, Material-UI, or Ant Design?
   - Consider design system needs, component library requirements

3. STATE MANAGEMENT:
   - Context API, Redux, Zustand, Recoil, or none?
   - Consider state complexity, data flow patterns, and performance needs

4. ROUTING:
   - React Router or Next.js routing?
   - Consider navigation complexity and SPA vs MPA needs

5. TESTING STRATEGY:
   - Jest, Cypress, Playwright, or none?
   - Consider testing requirements and CI/CD needs

6. BUILD TOOL:
   - Vite, Webpack, Create React App, or Next.js?
   - Consider development experience and build performance

7. DEPLOYMENT:
   - Vercel, Netlify, AWS, or Docker?
   - Consider hosting requirements and deployment complexity

8. UI COMPONENTS:
   - What types of components are needed? (forms, tables, modals, charts, etc.)
   - Consider component complexity and reusability

9. UI FEATURES:
   - Authentication, authorization, validation, i18n, theming, responsive design?
   - Consider user experience requirements

Respond with a JSON object containing the React architecture plan. Be specific and provide reasoning for each decision based on the C++ UI patterns you identify.

Return ONLY the JSON object:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: planningPrompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const plan = this.parseReactArchitecturePlan(content);
    
    console.log(`📋 React architecture plan created for ${appName}:`);
    console.log(`   Framework: ${plan.uiFramework} (${plan.reason})`);
    console.log(`   Styling: ${plan.styling}`);
    console.log(`   State Management: ${plan.stateManagement}`);
    console.log(`   Routing: ${plan.routing}`);
    console.log(`   Testing: ${plan.testing}`);
    console.log(`   Build Tool: ${plan.buildTool}`);
    console.log(`   Deployment: ${plan.deployment}`);
    
    return plan;
  }

  private parseReactArchitecturePlan(content: string): ReactArchitecturePlan {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('Failed to parse React architecture plan, using default:', error);
    }

    // Default React architecture plan
    return {
      uiFramework: 'react',
      styling: 'css',
      stateManagement: 'context',
      routing: 'react-router',
      testing: 'jest',
      buildTool: 'vite',
      deployment: 'vercel',
      reason: 'Default React setup for simple UI migration'
    };
  }

  private async getCppUIContext(appName: string): Promise<string> {
    try {
      const pineconeService = await this.getPineconeService();
      const searchResults = await pineconeService.semanticSearch(
        `C++ UI code GUI interface forms windows dialogs ${appName}`,
        20
      );

      let context = `C++ UI Code Context for ${appName}:\n\n`;
      
      if (searchResults && searchResults.length > 0) {
        context += 'Relevant C++ UI Components Found:\n';
        searchResults.forEach((result: any, index: number) => {
          context += `${index + 1}. ${result.metadata.type}: ${result.metadata.filename}\n`;
          context += `   File: ${result.metadata.path}\n`;
          context += `   Content: ${result.metadata.content}\n\n`;
        });
      } else {
        // Search for general UI patterns
        const generalResults = await pineconeService.semanticSearch(
          'C++ GUI interface forms buttons windows dialogs',
          15
        );
        
        if (generalResults && generalResults.length > 0) {
          context += 'General C++ UI Components Found:\n';
          generalResults.forEach((result: any, index: number) => {
            context += `${index + 1}. ${result.metadata.type}: ${result.metadata.filename}\n`;
            context += `   File: ${result.metadata.path}\n`;
            context += `   Content: ${result.metadata.content}\n\n`;
          });
        }
      }

      return context;
    } catch (error) {
      console.warn('Failed to retrieve C++ UI context from Pinecone:', error);
      return `C++ UI Code Context for ${appName}: No specific UI context available.`;
    }
  }

  private async createReactProjectStructure(appName: string, outputPath: string, plan: ReactArchitecturePlan): Promise<void> {
    console.log(`📁 Creating React project structure based on architecture plan...`);
    
    await fs.ensureDir(outputPath);
    
    // Base React structure
    const srcPath = path.join(outputPath, 'src');
    const publicPath = path.join(outputPath, 'public');
    
    // Source directories
    await fs.ensureDir(path.join(srcPath, 'components'));
    await fs.ensureDir(path.join(srcPath, 'pages'));
    await fs.ensureDir(path.join(srcPath, 'hooks'));
    await fs.ensureDir(path.join(srcPath, 'utils'));
    await fs.ensureDir(path.join(srcPath, 'types'));
    await fs.ensureDir(path.join(srcPath, 'styles'));
    await fs.ensureDir(path.join(srcPath, 'services'));
    await fs.ensureDir(path.join(srcPath, 'context'));
    
    // Component categories
    await fs.ensureDir(path.join(srcPath, 'components', 'ui'));
    await fs.ensureDir(path.join(srcPath, 'components', 'forms'));
    await fs.ensureDir(path.join(srcPath, 'components', 'layout'));
    await fs.ensureDir(path.join(srcPath, 'components', 'charts'));
    await fs.ensureDir(path.join(srcPath, 'components', 'modals'));
    
    // State management
    if (plan.stateManagement === 'redux') {
      await fs.ensureDir(path.join(srcPath, 'store'));
      await fs.ensureDir(path.join(srcPath, 'store', 'slices'));
    }
    
    // Testing
    if (plan.testing !== 'none') {
      await fs.ensureDir(path.join(outputPath, '__tests__'));
      await fs.ensureDir(path.join(outputPath, '__tests__', 'components'));
      await fs.ensureDir(path.join(outputPath, '__tests__', 'pages'));
    }
    
    // Public assets
    await fs.ensureDir(publicPath);
    await fs.ensureDir(path.join(publicPath, 'images'));
    await fs.ensureDir(path.join(publicPath, 'icons'));
  }

  private async generateReactComponents(appName: string, outputPath: string, plan: ReactArchitecturePlan): Promise<void> {
    console.log(`🔧 Generating React components based on architecture plan...`);
    
    const cppUIContext = await this.getCppUIContext(appName);
    const srcPath = path.join(outputPath, 'src');
    
    // Generate main App component
    await this.generateAppComponent(appName, srcPath, cppUIContext, plan);
    
    // Generate package.json
    await this.generatePackageJson(appName, outputPath, plan);
    
    // Generate configuration files
    await this.generateConfigFiles(appName, outputPath, plan);
    
    // Generate sample components based on C++ patterns
    await this.generateSampleComponents(appName, srcPath, cppUIContext, plan);
    
    // Generate routing setup
    if (plan.routing !== 'none') {
      await this.generateRoutingSetup(appName, srcPath, plan);
    }
    
    // Generate state management setup
    if (plan.stateManagement !== 'none') {
      await this.generateStateManagement(appName, srcPath, plan);
    }
    
    // Generate styling setup
    await this.generateStylingSetup(appName, srcPath, plan);
    
    // Generate deployment configuration
    await this.generateDeploymentConfig(appName, outputPath, plan);
  }

  private async generateAppComponent(appName: string, srcPath: string, cppUIContext: string, plan: ReactArchitecturePlan): Promise<void> {
    const prompt = `Generate a React App component for ${appName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

C++ UI Context:
${cppUIContext}

Generate ONLY the React/TypeScript code with:
- Main App component structure
- Routing setup if routing is enabled
- State management provider if state management is enabled
- Theme provider if theming is enabled
- Layout structure based on C++ UI patterns
- Proper TypeScript types
- Modern React patterns (hooks, functional components)

Return ONLY the React/TypeScript code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const cleanContent = this.cleanReactCode(content);
    const filePath = path.join(srcPath, 'App.tsx');
    await fs.writeFile(filePath, cleanContent);
  }

  private async generatePackageJson(appName: string, outputPath: string, plan: ReactArchitecturePlan): Promise<void> {
    const prompt = `Generate package.json for ${appName} based on the React architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the JSON content with:
- Project name and description
- React and TypeScript dependencies
- Styling dependencies based on styling choice
- State management dependencies based on state management choice
- Routing dependencies based on routing choice
- Testing dependencies based on testing choice
- Build tool dependencies based on build tool choice
- Development dependencies
- Scripts for development, build, test, and deployment

Return ONLY the JSON content:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const filePath = path.join(outputPath, 'package.json');
    await fs.writeFile(filePath, content);
  }

  private async generateConfigFiles(appName: string, outputPath: string, plan: ReactArchitecturePlan): Promise<void> {
    // Generate TypeScript config
    const tsConfigPrompt = `Generate tsconfig.json for ${appName} based on the React architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the JSON content with:
- TypeScript configuration for React
- Strict type checking
- Module resolution settings
- Build tool compatibility
- Path mapping if needed

Return ONLY the JSON content:`;

    const tsResponse = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: tsConfigPrompt }],
      temperature: 0.1,
    });

    const tsContent = tsResponse.choices[0]?.message?.content || '';
    const tsConfigPath = path.join(outputPath, 'tsconfig.json');
    await fs.writeFile(tsConfigPath, tsContent);

    // Generate build tool config based on choice
    if (plan.buildTool === 'vite') {
      await this.generateViteConfig(appName, outputPath, plan);
    } else if (plan.buildTool === 'webpack') {
      await this.generateWebpackConfig(appName, outputPath, plan);
    }
  }

  private async generateViteConfig(appName: string, outputPath: string, plan: ReactArchitecturePlan): Promise<void> {
    const prompt = `Generate vite.config.ts for ${appName} based on the React architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the TypeScript code with:
- Vite configuration for React
- TypeScript support
- Styling support based on styling choice
- Build optimization
- Development server configuration

Return ONLY the TypeScript code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const filePath = path.join(outputPath, 'vite.config.ts');
    await fs.writeFile(filePath, content);
  }

  private async generateWebpackConfig(appName: string, outputPath: string, plan: ReactArchitecturePlan): Promise<void> {
    const prompt = `Generate webpack.config.js for ${appName} based on the React architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the JavaScript code with:
- Webpack configuration for React
- TypeScript support
- Styling support based on styling choice
- Build optimization
- Development server configuration

Return ONLY the JavaScript code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const filePath = path.join(outputPath, 'webpack.config.js');
    await fs.writeFile(filePath, content);
  }

  private async generateSampleComponents(appName: string, srcPath: string, cppUIContext: string, plan: ReactArchitecturePlan): Promise<void> {
    const prompt = `Generate sample React components for ${appName} based on the architecture plan and C++ UI patterns.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

C++ UI Context:
${cppUIContext}

Generate ONLY the React/TypeScript code with:
- Sample form component based on C++ form patterns
- Sample table component based on C++ table patterns
- Sample modal component based on C++ dialog patterns
- Sample navigation component based on C++ menu patterns
- Sample chart component if C++ shows chart patterns
- Proper TypeScript interfaces
- Modern React patterns (hooks, functional components)
- Styling based on the chosen styling approach

Return ONLY the React/TypeScript code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const cleanContent = this.cleanReactCode(content);
    
    // Split content into multiple component files
    const components = this.splitReactComponents(cleanContent);
    
    for (const [name, code] of Object.entries(components)) {
      const filePath = path.join(srcPath, 'components', `${name}.tsx`);
      await fs.writeFile(filePath, code);
    }
  }

  private async generateRoutingSetup(appName: string, srcPath: string, plan: ReactArchitecturePlan): Promise<void> {
    const prompt = `Generate routing setup for ${appName} based on the React architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the React/TypeScript code with:
- Router configuration
- Route definitions
- Navigation components
- Route guards if authentication is needed
- Lazy loading for performance

Return ONLY the React/TypeScript code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const cleanContent = this.cleanReactCode(content);
    const filePath = path.join(srcPath, 'router.tsx');
    await fs.writeFile(filePath, cleanContent);
  }

  private async generateStateManagement(appName: string, srcPath: string, plan: ReactArchitecturePlan): Promise<void> {
    const prompt = `Generate state management setup for ${appName} based on the React architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the React/TypeScript code with:
- State management configuration based on choice (Context, Redux, Zustand, etc.)
- Store setup
- Actions and reducers if using Redux
- Custom hooks for state management
- TypeScript types for state

Return ONLY the React/TypeScript code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    const cleanContent = this.cleanReactCode(content);
    
    if (plan.stateManagement === 'redux') {
      const storePath = path.join(srcPath, 'store', 'index.ts');
      await fs.writeFile(storePath, cleanContent);
    } else {
      const contextPath = path.join(srcPath, 'context', 'AppContext.tsx');
      await fs.writeFile(contextPath, cleanContent);
    }
  }

  private async generateStylingSetup(appName: string, srcPath: string, plan: ReactArchitecturePlan): Promise<void> {
    const prompt = `Generate styling setup for ${appName} based on the React architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the CSS/SCSS/Styled Components code with:
- Global styles
- Theme configuration if theming is enabled
- Component styles based on styling choice
- Responsive design
- CSS variables or theme tokens

Return ONLY the styling code:`;

    const response = await this.openai.chat.completions.create({
      model: this.config.getConfig().openai.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content || '';
    
    if (plan.styling === 'scss') {
      const filePath = path.join(srcPath, 'styles', 'global.scss');
      await fs.writeFile(filePath, content);
    } else if (plan.styling === 'styled-components') {
      const filePath = path.join(srcPath, 'styles', 'GlobalStyles.ts');
      await fs.writeFile(filePath, content);
    } else {
      const filePath = path.join(srcPath, 'styles', 'global.css');
      await fs.writeFile(filePath, content);
    }
  }

  private async generateDeploymentConfig(appName: string, outputPath: string, plan: ReactArchitecturePlan): Promise<void> {
    if (plan.deployment === 'vercel') {
      await this.generateVercelConfig(appName, outputPath);
    } else if (plan.deployment === 'netlify') {
      await this.generateNetlifyConfig(appName, outputPath);
    } else if (plan.deployment === 'docker') {
      await this.generateDockerConfig(appName, outputPath, plan);
    }
  }

  private async generateVercelConfig(appName: string, outputPath: string): Promise<void> {
    const vercelConfig = {
      version: 2,
      builds: [
        {
          src: 'package.json',
          use: '@vercel/static-build',
          config: {
            distDir: 'dist'
          }
        }
      ],
      routes: [
        {
          src: '/(.*)',
          dest: '/index.html'
        }
      ]
    };

    const filePath = path.join(outputPath, 'vercel.json');
    await fs.writeFile(filePath, JSON.stringify(vercelConfig, null, 2));
  }

  private async generateNetlifyConfig(appName: string, outputPath: string): Promise<void> {
    const netlifyConfig = {
      build: {
        publish: 'dist',
        command: 'npm run build'
      },
      redirects: [
        {
          from: '/*',
          to: '/index.html',
          status: 200
        }
      ]
    };

    const filePath = path.join(outputPath, 'netlify.toml');
    await fs.writeFile(filePath, JSON.stringify(netlifyConfig, null, 2));
  }

  private async generateDockerConfig(appName: string, outputPath: string, plan: ReactArchitecturePlan): Promise<void> {
    const prompt = `Generate Dockerfile for React app ${appName} based on the architecture plan.

Architecture Plan:
${JSON.stringify(plan, null, 2)}

Generate ONLY the Dockerfile content with:
- Multi-stage build for optimization
- Node.js base image
- Build tool configuration based on build tool choice
- Production optimization
- Nginx for serving static files

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

  private cleanReactCode(content: string): string {
    let cleaned = content.replace(/```(tsx|jsx|typescript|javascript)\s*/g, '').replace(/```\s*$/g, '');
    cleaned = cleaned.replace(/^.*?(?=import|export|function|const|interface|type)/s, '');
    cleaned = cleaned.replace(/(?<=}).*$/s, '');
    cleaned = cleaned.replace(/Based on the.*?Return ONLY the.*?:\s*/gs, '');
    cleaned = cleaned.replace(/Please note.*$/gm, '');
    cleaned = cleaned.replace(/The above code assumes.*$/gm, '');
    return cleaned.trim();
  }

  private splitReactComponents(content: string): Record<string, string> {
    const components: Record<string, string> = {};
    const componentRegex = /(?:export\s+)?(?:function|const)\s+(\w+)\s*[:=]/g;
    let match;
    
    while ((match = componentRegex.exec(content)) !== null) {
      const componentName = match[1];
      const startIndex = match.index;
      const endIndex = content.indexOf('export', startIndex + 1);
      
      if (endIndex !== -1) {
        components[componentName] = content.substring(startIndex, endIndex).trim();
      } else {
        components[componentName] = content.substring(startIndex).trim();
      }
    }
    
    return components;
  }
} 