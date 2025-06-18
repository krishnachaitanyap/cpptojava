# 🚀 C++ to Java Spring Boot Migration CLI

An intelligent CLI tool that automatically migrates legacy C++ monolith codebases into modern Java Spring Boot microservices and React UI components using **AI-powered agentic architecture planning** and intelligent code transformation.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Agentic Planning System](#agentic-planning-system)
- [UI Migration](#ui-migration)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Examples](#examples)
- [API Reference](#api-reference)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This CLI tool provides an **end-to-end intelligent solution** for migrating C++ applications to Java Spring Boot microservices and React UI components:

1. **🤖 Agentic Analysis** - AI-powered C++ code analysis with intelligent architecture planning
2. **🔍 Semantic Search** - Vector-based search through indexed code using natural language
3. **🏗️ Smart Transformation** - Context-aware conversion with optimal Spring Boot architecture
4. **🎨 UI Migration** - Intelligent C++ UI to React component migration
5. **🚀 Deployment Ready** - Complete infrastructure and deployment configurations

The tool leverages **OpenAI for intelligent planning** and **Pinecone for vector storage** to understand code relationships and generate architecturally sound Java and React equivalents.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    C++ to Java Migration CLI                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   Analyze   │    │   Search    │    │ Transform   │         │
│  │   Command   │    │   Command   │    │  Command    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                   │                   │              │
│         ▼                   ▼                   ▼              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ C++ Parser  │    │ Pinecone    │    │ Agentic     │         │
│  │ & Indexer   │    │ Vector DB   │    │ Planner     │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                   │                   │              │
│         ▼                   ▼                   ▼              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   OpenAI    │    │   OpenAI    │    │   OpenAI    │         │
│  │ Embeddings  │    │ Semantic    │    │ Architecture│         │
│  └─────────────┘    └─────────────┘    │   Planning  │         │
│                                        └─────────────┘         │
│                                                 │              │
│                                                 ▼              │
│                                        ┌─────────────┐         │
│                                        │ Intelligent │         │
│                                        │ Generator   │         │
│                                        └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Core Components

- **Command Layer**: CLI commands for analyze, search, transform, and deploy
- **Agentic Planning Layer**: AI-powered architecture decision making
- **Service Layer**: Business logic for parsing, indexing, and code generation
- **AI Layer**: OpenAI integration for embeddings, semantic search, and intelligent planning
- **Storage Layer**: Pinecone vector database for code indexing and similarity search
- **Generator Layer**: Context-aware Java Spring Boot code generation

## 🤖 Agentic Planning System

The **revolutionary agentic planning system** intelligently analyzes C++ code and determines the optimal Spring Boot architecture:

### 🧠 Intelligent Decision Making

The AI agent analyzes C++ patterns and makes architectural decisions:

```json
{
  "database": {
    "type": "postgresql",
    "reason": "C++ code shows complex relational data patterns with foreign keys",
    "connectionPool": true,
    "migrations": true,
    "auditTrail": true
  },
  "resilience": {
    "circuitBreaker": true,
    "retry": true,
    "timeout": true,
    "reason": "C++ code contains external API calls and error handling patterns"
  },
  "caching": {
    "enabled": true,
    "type": "redis",
    "reason": "C++ code shows data caching patterns and performance optimizations"
  },
  "security": {
    "authentication": true,
    "authorization": true,
    "reason": "C++ code contains user authentication and role-based access control"
  },
  "monitoring": {
    "metrics": true,
    "tracing": true,
    "reason": "C++ code shows logging patterns and performance monitoring"
  },
  "deployment": {
    "docker": true,
    "kubernetes": true,
    "aws": true,
    "ciCd": true,
    "environmentAsCode": true,
    "reason": "Enterprise-grade deployment requirements detected"
  }
}
```

### 🎯 Architecture Components

#### Database Intelligence
- **Automatic Detection**: Identifies database requirements from C++ data patterns
- **Type Selection**: Chooses PostgreSQL, MySQL, MongoDB, Redis, or H2
- **Advanced Features**: Connection pooling, migrations, audit trails
- **Reasoning**: Explains why each choice was made

#### Resilience Patterns
- **Circuit Breaker**: Detects external API calls and failure patterns
- **Retry Logic**: Identifies retry mechanisms in C++ code
- **Timeout Handling**: Recognizes timeout patterns
- **Bulkhead Pattern**: Isolates failure domains
- **Rate Limiting**: Prevents service overload

#### Caching Strategy
- **Pattern Recognition**: Identifies caching needs from C++ code
- **Type Selection**: Redis, EhCache, Caffeine, or none
- **TTL Configuration**: Optimizes cache expiration
- **Performance Analysis**: Determines cache effectiveness

#### Security Requirements
- **Authentication**: Detects user authentication patterns
- **Authorization**: Identifies role-based access control
- **Encryption**: Recognizes data protection needs
- **SSL/TLS**: Determines transport security requirements

#### Monitoring & Observability
- **Metrics Collection**: Identifies performance monitoring needs
- **Distributed Tracing**: Detects microservice communication patterns
- **Health Checks**: Ensures service reliability
- **Logging Strategy**: Optimizes log levels and formats

#### Deployment Strategy
- **Containerization**: Docker with multi-stage builds
- **Orchestration**: Kubernetes manifests with resource management
- **Cloud Integration**: AWS ECS, RDS, ElastiCache configurations
- **CI/CD Pipeline**: GitHub Actions with environment-specific deployments
- **Infrastructure as Code**: Terraform/CloudFormation templates

#### Custom Components
- **Annotations**: Custom Java annotations for C++ patterns
- **Aspects**: AOP for cross-cutting concerns
- **Interceptors**: Request/response processing
- **Validators**: Custom validation logic
- **Converters**: Data transformation utilities

## 🛠️ Tech Stack

### Backend
- **Node.js** (v18+) - Runtime environment
- **TypeScript** (v5.3+) - Type-safe JavaScript
- **Commander.js** - CLI framework
- **Chalk** - Terminal styling
- **Ora** - Terminal spinners
- **Boxen** - ASCII art boxes

### AI & ML
- **OpenAI API** - Intelligent architecture planning and code generation
  - `text-embedding-3-large` - Vector embeddings (3072 dimensions)
  - `gpt-4o` - Architecture planning and code generation
- **Pinecone** - Vector database for semantic search
  - Serverless index for scalability
  - Cosine similarity for code matching

### Code Processing
- **Regex-based C++ Parser** - Extracts classes, functions, and methods
- **Agentic Analysis** - AI-powered architecture decision making
- **Vector Similarity** - Code relationship mapping

### Generated Output
- **Spring Boot** - Java microservice framework
- **Spring Data JPA** - Database persistence
- **Spring Web** - REST API endpoints
- **Resilience4j** - Circuit breaker and resilience patterns
- **Spring Security** - Authentication and authorization
- **Spring Cache** - Caching abstraction
- **Micrometer** - Metrics and monitoring
- **Lombok** - Boilerplate reduction
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **AWS** - Cloud deployment
- **Maven** - Build management

## ✨ Features

### 🤖 **Agentic Architecture Planning**
- **Intelligent Analysis**: AI analyzes C++ code patterns to determine optimal architecture
- **Database Selection**: Automatically chooses the right database type and configuration
- **Resilience Patterns**: Detects and implements circuit breakers, retry logic, and timeouts
- **Caching Strategy**: Identifies caching needs and implements appropriate solutions
- **Security Requirements**: Determines authentication, authorization, and encryption needs
- **Monitoring Setup**: Configures metrics, tracing, and health checks
- **Deployment Strategy**: Generates Docker, Kubernetes, and AWS configurations

### 🔍 **Intelligent Code Analysis**
- Parses C++ classes, functions, and methods with pattern recognition
- Extracts business logic and relationships using AI
- Generates semantic embeddings for deep code understanding
- Identifies service boundaries and dependencies
- **Pattern Recognition**: Detects architectural patterns in C++ code

### 🔎 **Vector-Based Semantic Search**
- Search C++ code using natural language queries
- Find related code components across files
- Understand code context and relationships
- High-accuracy similarity matching

### 🔄 **Context-Aware Transformation**
- Converts C++ classes to Java entities with optimal mapping
- Maps C++ methods to REST endpoints with proper annotations
- Preserves business logic and validation rules
- Generates Spring Boot microservice structure
- **Intelligent Dependencies**: Adds only necessary Spring Boot dependencies

### 🚀 **Production-Ready Deployment**
- Generates Dockerfiles with multi-stage builds
- Creates Kubernetes manifests with resource management
- Includes AWS ECS, RDS, and ElastiCache configurations
- Generates CI/CD pipelines with GitHub Actions
- Implements Infrastructure as Code patterns
- **Environment Management**: Multi-environment configuration

### 🎯 **Custom Component Generation**
- **Custom Annotations**: Generates Java annotations for C++ patterns
- **AOP Aspects**: Creates aspects for cross-cutting concerns
- **Interceptors**: Implements request/response processing
- **Validators**: Generates custom validation logic
- **Converters**: Creates data transformation utilities

### 🔧 **Advanced Configuration**
- **Externalized Properties**: Environment-specific configurations
- **Profile Management**: Dev, staging, production profiles
- **Property Encryption**: Secure configuration management
- **Validation**: Configuration validation and error handling

## 🎨 UI Migration

The CLI now supports **intelligent C++ UI to React migration** with agentic planning:

### 🧠 UI Architecture Planning

The AI analyzes C++ UI patterns and determines optimal React architecture:

```json
{
  "uiFramework": "react",
  "styling": "tailwind",
  "stateManagement": "redux",
  "routing": "react-router",
  "testing": "jest",
  "buildTool": "vite",
  "deployment": "vercel",
  "reason": "C++ code shows complex form patterns and state management needs"
}
```

### 🎯 UI Component Mapping

#### C++ UI Patterns → React Components
- **Forms & Dialogs** → React Form Components
- **Tables & Lists** → React Data Display Components
- **Navigation & Menus** → React Router & Navigation
- **Charts & Graphs** → React Chart Libraries
- **Modals & Popups** → React Modal Components
- **Custom Widgets** → React Custom Components

#### Styling Intelligence
- **CSS/SCSS** - Traditional styling approach
- **Styled Components** - CSS-in-JS for component-based styling
- **Tailwind CSS** - Utility-first CSS framework
- **Material-UI** - Google Material Design components
- **Ant Design** - Enterprise UI design system

#### State Management
- **Context API** - Simple state management
- **Redux Toolkit** - Complex state management
- **Zustand** - Lightweight state management
- **Recoil** - Facebook's experimental state management

#### Build & Deployment
- **Vite** - Fast build tool and dev server
- **Webpack** - Traditional bundler
- **Next.js** - Full-stack React framework
- **Vercel/Netlify** - Static site hosting
- **Docker** - Containerized deployment

### 🚀 UI Migration Commands

```bash
# Basic React app generation
cpp2java ui my-react-app

# Advanced configuration
cpp2java ui my-react-app \
  --framework nextjs \
  --styling tailwind \
  --state-management redux \
  --routing next-router \
  --testing cypress \
  --build-tool nextjs \
  --deployment vercel

# Custom output directory
cpp2java ui my-react-app -o ./frontend
```

### 📁 Generated React Structure

```
my-react-app/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   │   ├── forms/        # Form components
│   │   │   ├── layout/       # Layout components
│   │   │   ├── charts/       # Chart components
│   │   │   └── modals/       # Modal components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Utility functions
│   │   ├── types/            # TypeScript types
│   │   ├── styles/           # Styling files
│   │   ├── services/         # API services
│   │   ├── context/          # React context
│   │   └── store/            # State management (Redux)
│   ├── public/               # Static assets
│   ├── __tests__/            # Test files
│   ├── package.json          # Dependencies and scripts
│   ├── tsconfig.json         # TypeScript configuration
│   ├── vite.config.ts        # Build tool configuration
│   └── vercel.json           # Deployment configuration
```

### 🎯 Real-World UI Migration Examples

#### Banking Application UI
```bash
cpp2java ui banking-ui --styling material-ui --state-management redux
```

**Generated Features:**
- **Forms**: Account creation, transaction forms, loan applications
- **Tables**: Transaction history, account balances, user management
- **Charts**: Financial analytics, spending patterns, portfolio performance
- **Modals**: Confirmation dialogs, error messages, success notifications
- **Navigation**: Multi-level menu system with role-based access
- **State**: Complex financial data management with Redux
- **Styling**: Material-UI for professional banking interface

#### E-commerce Dashboard UI
```bash
cpp2java ui ecommerce-ui --styling tailwind --state-management zustand
```

**Generated Features:**
- **Product Management**: Product forms, inventory tables, category management
- **Order Processing**: Order forms, status tracking, fulfillment workflows
- **Analytics**: Sales charts, customer insights, performance metrics
- **User Management**: Customer profiles, admin panels, role management
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **State**: Lightweight state management with Zustand

#### IoT Control Panel UI
```bash
cpp2java ui iot-dashboard --styling styled-components --state-management context
```

**Generated Features:**
- **Device Management**: Device registration, status monitoring, configuration
- **Real-time Data**: Live sensor data, alerts, notifications
- **Charts**: Time-series data visualization, performance metrics
- **Maps**: Device location mapping, coverage areas
- **Responsive**: Mobile and desktop optimized interfaces
- **State**: Simple state management with React Context

### Example 3: IoT Data Processing

```bash
# Analyze C++ IoT application
cpp2java analyze -g https://github.com/owner/iot-cpp-app

# AI Agent detects:
# - MongoDB (time-series sensor data)
# - Message queues (device communication)
# - Circuit breakers (device connectivity)
# - Caching (device state)
# - Security (device authentication)
# - Monitoring (real-time metrics)

# Transform with specialized architecture
cpp2java transform DeviceService
cpp2java transform DataProcessingService
```

### Example 4: UI Migration - Banking Dashboard

```bash
# Analyze C++ banking application with UI
cpp2java analyze -g https://github.com/owner/banking-cpp-app

# AI Agent detects UI patterns:
# - Complex forms (account creation, transactions)
# - Data tables (transaction history, balances)
# - Charts (financial analytics)
# - Navigation menus (multi-level banking interface)
# - Modal dialogs (confirmations, errors)

# Generate React UI with intelligent architecture
cpp2java ui banking-dashboard \
  --styling material-ui \
  --state-management redux \
  --routing react-router \
  --testing jest \
  --build-tool vite \
  --deployment vercel

# AI Agent generates:
# - Material-UI components for professional banking interface
# - Redux store for complex financial state management
# - React Router for multi-page navigation
# - Form components with validation
# - Data table components with sorting/filtering
# - Chart components for financial analytics
# - Modal components for confirmations
# - Responsive design for mobile/desktop
```

### Example 5: UI Migration - E-commerce Admin Panel

```bash
# Analyze C++ e-commerce application
cpp2java analyze --workspace ./ecommerce-cpp-app

# Generate React admin panel
cpp2java ui ecommerce-admin \
  --framework nextjs \
  --styling tailwind \
  --state-management zustand \
  --routing next-router \
  --testing cypress \
  --build-tool nextjs \
  --deployment netlify

# AI Agent generates:
# - Next.js for SEO and performance
# - Tailwind CSS for rapid UI development
# - Zustand for lightweight state management
# - Product management forms and tables
# - Order processing workflows
# - Inventory management interfaces
# - Sales analytics dashboards
# - User management panels
# - Responsive admin interface
```

### Example 6: UI Migration - IoT Control Panel

```bash
# Analyze C++ IoT application
cpp2java analyze -g https://github.com/owner/iot-cpp-app

# Generate React IoT dashboard
cpp2java ui iot-control-panel \
  --styling styled-components \
  --state-management context \
  --routing react-router \
  --testing jest \
  --build-tool vite \
  --deployment docker

# AI Agent generates:
# - Styled Components for component-based styling
# - React Context for simple state management
# - Real-time device monitoring components
# - Sensor data visualization charts
# - Device configuration forms
# - Alert and notification components
# - Map components for device locations
# - Mobile-responsive interface
# - Docker deployment configuration
```

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Pinecone API key and index

### Install CLI Tool
```bash
# Clone the repository
git clone <repository-url>
cd cpp-to-java-migrator

# Install dependencies
npm install

# Build the project
npm run build

# Install globally (optional)
npm link
```

## ⚙️ Configuration

Create a `.env` file in the project root:

```env
# OpenAI API
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# Pinecone API
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX=your-index-name
PINECONE_ENVIRONMENT=your-environment

# Optional: AWS for deployment
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
```

### Pinecone Setup
1. Create a Pinecone index with **3072 dimensions** (for `text-embedding-3-large`)
2. Use **cosine** similarity metric
3. Choose your preferred environment (e.g., `us-east1-aws`)

## 🚀 Usage

### Basic Commands

```bash
# Analyze C++ repository with agentic planning
cpp2java analyze -g https://github.com/owner/cpp-monolith

# Search C++ code using natural language
cpp2java search "How is authentication implemented?"

# Transform service to Java with intelligent architecture
cpp2java transform ServiceName

# Deploy generated service with full infrastructure
cpp2java deploy ServiceName
```

### Advanced Options

```bash
# Analyze with specific branch
cpp2java analyze -g https://github.com/owner/repo -b develop

# Keep cloned repository
cpp2java analyze -g https://github.com/owner/repo --keep-clone

# Specify output directory
cpp2java transform ServiceName -o ./custom-output

# Verbose logging
cpp2java analyze -g https://github.com/owner/repo -v
```

## 📚 Examples

### Example 1: Banking System Migration

```bash
# 1. Analyze C++ banking application with agentic planning
cpp2java analyze -g https://github.com/shawkyebrahim2514/Banking-System-Application-CPP

# 2. Search for withdraw functionality
cpp2java search "How is the withdraw function implemented?"

# 3. Transform to Java microservices with intelligent architecture
cpp2java transform BankAccountService
# AI Agent will automatically:
# - Detect PostgreSQL database needs (complex financial data)
# - Add Resilience4j circuit breakers (external payment APIs)
# - Implement Redis caching (frequent account lookups)
# - Configure Spring Security (financial data protection)
# - Set up monitoring and health checks
# - Generate Docker and Kubernetes configurations

cpp2java transform ClientService
cpp2java transform ApplicationService

# 4. Deploy services with full infrastructure
cpp2java deploy BankAccountService
```

### Example 2: E-commerce System

```bash
# Analyze C++ e-commerce application
cpp2java analyze --workspace ./my-ecommerce-cpp

# AI Agent detects:
# - MySQL database (product catalog)
# - Redis caching (shopping cart, product cache)
# - Circuit breakers (payment gateway integration)
# - Rate limiting (inventory management)
# - Security (user authentication, payment processing)
# - Monitoring (order tracking, performance metrics)

# Transform with intelligent architecture
cpp2java transform ProductService
cpp2java transform OrderService
cpp2java transform PaymentService
```

## 🔧 API Reference

### Analyze Command
```bash
cpp2java analyze [options]
```

**Options:**
- `-g, --github <url>` - GitHub repository URL
- `-b, --branch <branch>` - Git branch (default: main)
- `--workspace <path>` - Local workspace path
- `--keep-clone` - Keep cloned repository
- `-v, --verbose` - Enable verbose logging

### Search Command
```bash
cpp2java search <query> [options]
```

**Options:**
- `--limit <number>` - Number of results (default: 10)
- `--type <type>` - Filter by type (class, function, all)

### Transform Command
```bash
cpp2java transform <service> [options]
```

**Options:**
- `-o, --output <path>` - Output directory
- `--force` - Overwrite existing files

### Deploy Command
```bash
cpp2java deploy <service> [options]
```

**Options:**
- `--platform <platform>` - Deployment platform (docker, aws, gcp)
- `--environment <env>` - Environment (dev, staging, prod)

### UI Command
```bash
cpp2java ui <app-name> [options]
```

**Options:**
- `-o, --output <path>` - Output directory for React app (default: ./migrated-ui)
- `-f, --framework <framework>` - React framework (react, nextjs, gatsby) (default: react)
- `-s, --styling <styling>` - Styling approach (css, scss, styled-components, tailwind, material-ui, antd) (default: css)
- `-m, --state-management <state>` - State management (context, redux, zustand, recoil, none) (default: context)
- `-r, --routing <routing>` - Routing (react-router, next-router, none) (default: react-router)
- `-t, --testing <testing>` - Testing framework (jest, cypress, playwright, none) (default: jest)
- `-b, --build-tool <tool>` - Build tool (vite, webpack, create-react-app, nextjs) (default: vite)
- `-d, --deployment <deployment>` - Deployment platform (vercel, netlify, aws, docker) (default: vercel)
- `-v, --verbose` - Enable verbose logging

## 🏗️ Generated Project Structure

```
migrated-services/
├── ServiceName/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/migrated/servicename/
│   │   │   │       ├── ServiceNameApplication.java
│   │   │   │       ├── controller/
│   │   │   │       │   └── ServiceNameController.java
│   │   │   │       ├── service/
│   │   │   │       │   └── ServiceNameService.java
│   │   │   │       ├── repository/
│   │   │   │       │   └── ServiceNameRepository.java
│   │   │   │       ├── entity/
│   │   │   │       │   └── ServiceName.java
│   │   │   │       ├── dto/
│   │   │   │       │   └── ServiceNameDTO.java
│   │   │   │       ├── config/
│   │   │   │       │   └── ServiceNameConfig.java
│   │   │   │       ├── resilience/
│   │   │   │       │   └── ServiceNameResilienceConfig.java
│   │   │   │       ├── cache/
│   │   │   │       │   └── ServiceNameCacheConfig.java
│   │   │   │       ├── security/
│   │   │   │       │   └── ServiceNameSecurityConfig.java
│   │   │   │       ├── monitoring/
│   │   │   │       │   └── ServiceNameMonitoringConfig.java
│   │   │   │       ├── annotation/
│   │   │   │       │   └── CustomAnnotation.java
│   │   │   │       ├── aspect/
│   │   │   │       │   └── CustomAspect.java
│   │   │   │       └── integration/
│   │   │   │           └── ExternalServiceIntegration.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       ├── application-prod.yml
│   │   │       └── application-staging.yml
│   │   └── test/
│   │       └── java/
│   │           └── ServiceNameApplicationTests.java
│   ├── docker/
│   │   └── Dockerfile
│   ├── k8s/
│   │   └── ServiceName-deployment.yml
│   ├── aws/
│   │   └── ServiceName-aws-config.yml
│   ├── .github/
│   │   └── workflows/
│   │       └── ServiceName-ci-cd.yml
│   ├── pom.xml
│   └── README.md
```

## 🧪 Development

### Project Structure
```
src/
├── commands/          # CLI command implementations
├── services/          # Business logic services
├── generators/        # Agentic code generation logic
├── config/           # Configuration management
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── ui/               # Terminal UI components
```

### Development Commands
```bash
# Build project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format
```

### Adding New Commands
1. Create command class in `src/commands/`
2. Extend base command structure
3. Register in `src/index.ts`
4. Add tests in `src/__tests__/`

### Extending Agentic Planning
1. Modify `src/generators/JavaGenerator.ts`
2. Add new architecture decision points
3. Update planning prompts for better AI responses
4. Test with different C++ codebases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation for API changes
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing powerful AI models for intelligent planning
- Pinecone for vector database technology
- Spring Boot team for the excellent Java framework
- The open-source community for inspiration and tools

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)

---

**Made with ❤️ and 🤖 AI for the developer community** 