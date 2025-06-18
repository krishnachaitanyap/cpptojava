import { Command } from 'commander';
import { ReactGenerator } from '../generators/ReactGenerator.js';
import chalk from 'chalk';
import ora from 'ora';

export class UICommand extends Command {
  constructor() {
    super('ui');
    
    this.description('Migrate C++ UI code to React components')
      .argument('<app-name>', 'Name of the React application')
      .option('-o, --output <path>', 'Output directory for the React app', './migrated-ui')
      .option('-f, --framework <framework>', 'React framework (react, nextjs, gatsby)', 'react')
      .option('-s, --styling <styling>', 'Styling approach (css, scss, styled-components, tailwind, material-ui, antd)', 'css')
      .option('-m, --state-management <state>', 'State management (context, redux, zustand, recoil, none)', 'context')
      .option('-r, --routing <routing>', 'Routing (react-router, next-router, none)', 'react-router')
      .option('-t, --testing <testing>', 'Testing framework (jest, cypress, playwright, none)', 'jest')
      .option('-b, --build-tool <tool>', 'Build tool (vite, webpack, create-react-app, nextjs)', 'vite')
      .option('-d, --deployment <deployment>', 'Deployment platform (vercel, netlify, aws, docker)', 'vercel')
      .option('-v, --verbose', 'Enable verbose logging')
      .action(this.execute.bind(this));
  }

  private async execute(appName: string, options: any): Promise<void> {
    const spinner = ora('🎨 Starting C++ UI to React migration...').start();
    
    try {
      console.log(chalk.blue('\n🚀 C++ to React UI Migration CLI'));
      console.log(chalk.gray('Intelligent UI migration with agentic planning\n'));

      // Validate app name
      if (!appName || appName.trim() === '') {
        throw new Error('App name is required');
      }

      // Create React generator
      const reactGenerator = new ReactGenerator();
      
      // Generate React app
      await reactGenerator.generateReactApp(appName, options.output);
      
      spinner.succeed(chalk.green(`✅ React app '${appName}' generated successfully!`));
      
      // Display next steps
      this.displayNextSteps(appName, options.output, options);
      
    } catch (error) {
      spinner.fail(chalk.red(`❌ Failed to generate React app: ${error.message}`));
      
      if (options.verbose) {
        console.error(chalk.red('\nError details:'));
        console.error(error);
      }
      
      process.exit(1);
    }
  }

  private displayNextSteps(appName: string, outputPath: string, options: any): void {
    console.log(chalk.cyan('\n📋 Next Steps:'));
    console.log(chalk.white('1. Navigate to the generated React app:'));
    console.log(chalk.gray(`   cd ${outputPath}`));
    
    console.log(chalk.white('\n2. Install dependencies:'));
    console.log(chalk.gray('   npm install'));
    
    console.log(chalk.white('\n3. Start development server:'));
    console.log(chalk.gray('   npm run dev'));
    
    console.log(chalk.white('\n4. Build for production:'));
    console.log(chalk.gray('   npm run build'));
    
    if (options.deployment === 'vercel') {
      console.log(chalk.white('\n5. Deploy to Vercel:'));
      console.log(chalk.gray('   npx vercel'));
    } else if (options.deployment === 'netlify') {
      console.log(chalk.white('\n5. Deploy to Netlify:'));
      console.log(chalk.gray('   npx netlify deploy'));
    } else if (options.deployment === 'docker') {
      console.log(chalk.white('\n5. Build and run Docker container:'));
      console.log(chalk.gray('   docker build -t ' + appName.toLowerCase() + ' .'));
      console.log(chalk.gray('   docker run -p 3000:80 ' + appName.toLowerCase()));
    }
    
    console.log(chalk.cyan('\n🎯 Generated Features:'));
    console.log(chalk.white(`   • React ${options.framework} application`));
    console.log(chalk.white(`   • ${options.styling} styling approach`));
    console.log(chalk.white(`   • ${options.stateManagement} state management`));
    console.log(chalk.white(`   • ${options.routing} routing`));
    console.log(chalk.white(`   • ${options.testing} testing setup`));
    console.log(chalk.white(`   • ${options.buildTool} build tool`));
    console.log(chalk.white(`   • ${options.deployment} deployment configuration`));
    
    console.log(chalk.cyan('\n📁 Project Structure:'));
    console.log(chalk.gray('   src/'));
    console.log(chalk.gray('   ├── components/     # React components'));
    console.log(chalk.gray('   ├── pages/          # Page components'));
    console.log(chalk.gray('   ├── hooks/          # Custom React hooks'));
    console.log(chalk.gray('   ├── utils/          # Utility functions'));
    console.log(chalk.gray('   ├── types/          # TypeScript types'));
    console.log(chalk.gray('   ├── styles/         # Styling files'));
    console.log(chalk.gray('   ├── services/       # API services'));
    console.log(chalk.gray('   └── context/        # React context'));
    
    console.log(chalk.cyan('\n🔧 Available Scripts:'));
    console.log(chalk.gray('   npm run dev          # Start development server'));
    console.log(chalk.gray('   npm run build        # Build for production'));
    console.log(chalk.gray('   npm run test         # Run tests'));
    console.log(chalk.gray('   npm run lint         # Lint code'));
    console.log(chalk.gray('   npm run preview      # Preview production build'));
    
    console.log(chalk.green('\n🎉 Your React app is ready for development!'));
  }
} 