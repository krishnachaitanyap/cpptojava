# 🚀 C++ to Java Spring Boot Migration CLI

An intelligent CLI tool that automatically migrates legacy C++ monolith codebases into modern Java Spring Boot microservices using AI-powered code analysis and transformation.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
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

This CLI tool provides an end-to-end solution for migrating C++ applications to Java Spring Boot microservices:

1. **Analyze** C++ codebases using AI-powered parsing and semantic analysis
2. **Search** through indexed code using vector-based semantic search
3. **Transform** C++ services into Java Spring Boot microservices
4. **Deploy** generated services with Docker and cloud deployment scripts

The tool leverages OpenAI for intelligent code analysis and Pinecone for vector storage to understand code relationships and generate accurate Java equivalents.

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
│  │ C++ Parser  │    │ Pinecone    │    │ Java        │         │
│  │ & Indexer   │    │ Vector DB   │    │ Generator   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│         │                   │                   │              │
│         ▼                   ▼                   ▼              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   OpenAI    │    │   OpenAI    │    │   OpenAI    │         │
│  │ Embeddings  │    │ Semantic    │    │ Code Gen    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Core Components

- **Command Layer**: CLI commands for analyze, search, transform, and deploy
- **Service Layer**: Business logic for parsing, indexing, and code generation
- **AI Layer**: OpenAI integration for embeddings, semantic search, and code generation
- **Storage Layer**: Pinecone vector database for code indexing and similarity search
- **Generator Layer**: Java Spring Boot code generation with context awareness

## 🛠️ Tech Stack

### Backend
- **Node.js** (v18+) - Runtime environment
- **TypeScript** (v5.3+) - Type-safe JavaScript
- **Commander.js** - CLI framework
- **Chalk** - Terminal styling
- **Ora** - Terminal spinners
- **Boxen** - ASCII art boxes

### AI & ML
- **OpenAI API** - Code embeddings and generation
  - `text-embedding-3-large` - Vector embeddings (3072 dimensions)
  - `gpt-4o` - Code analysis and generation
- **Pinecone** - Vector database for semantic search
  - Serverless index for scalability
  - Cosine similarity for code matching

### Code Processing
- **Regex-based C++ Parser** - Extracts classes, functions, and methods
- **Semantic Analysis** - AI-powered code understanding
- **Vector Similarity** - Code relationship mapping

### Generated Output
- **Spring Boot** - Java microservice framework
- **Spring Data JPA** - Database persistence
- **Spring Web** - REST API endpoints
- **Lombok** - Boilerplate reduction
- **Docker** - Containerization
- **Maven** - Build management

## ✨ Features

### 🔍 **Intelligent Code Analysis**
- Parses C++ classes, functions, and methods
- Extracts business logic and relationships
- Generates semantic embeddings for code understanding
- Identifies service boundaries and dependencies

### 🔎 **Vector-Based Semantic Search**
- Search C++ code using natural language queries
- Find related code components across files
- Understand code context and relationships
- High-accuracy similarity matching

### 🔄 **AI-Powered Transformation**
- Converts C++ classes to Java entities
- Maps C++ methods to REST endpoints
- Preserves business logic and validation rules
- Generates Spring Boot microservice structure

### 🚀 **Deployment Ready**
- Generates Dockerfiles for containerization
- Creates Maven build configurations
- Includes application.yml configurations
- Ready for cloud deployment

### 🎯 **Context-Aware Generation**
- Uses actual C++ code context from Pinecone
- Generates specific Java code (not generic examples)
- Maps C++ data types to appropriate Java types
- Preserves inheritance and composition patterns

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
cd cpptojava

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
# Analyze C++ repository
cpp2java analyze -g https://github.com/owner/cpp-monolith

# Search C++ code
cpp2java search "How is authentication implemented?"

# Transform service to Java
cpp2java transform ServiceName

# Deploy generated service
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
# 1. Analyze C++ banking application
cpp2java analyze -g https://github.com/shawkyebrahim2514/Banking-System-Application-CPP

# 2. Search for withdraw functionality
cpp2java search "How is the withdraw function implemented?"

# 3. Transform to Java microservices
cpp2java transform BankAccountService
cpp2java transform ClientService
cpp2java transform ApplicationService

# 4. Deploy services
cpp2java deploy BankAccountService
```

### Example 2: Custom Repository

```bash
# Analyze local C++ project
cpp2java analyze --workspace ./my-cpp-project

# Search for specific patterns
cpp2java search "database connection patterns"

# Transform identified services
cpp2java transform DatabaseService
cpp2java transform AuthService
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
│   │   │   │       └── dto/
│   │   │   │           └── ServiceNameDTO.java
│   │   │   └── resources/
│   │   │       └── application.yml
│   │   └── test/
│   │       └── java/
│   │           └── ServiceNameApplicationTests.java
│   ├── Dockerfile
│   ├── pom.xml
│   └── README.md
```

## 🧪 Development

### Project Structure
```
src/
├── commands/          # CLI command implementations
├── services/          # Business logic services
├── generators/        # Code generation logic
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

### Extending Code Generation
1. Modify `src/generators/JavaGenerator.ts`
2. Add new generation methods
3. Update prompts for better AI responses
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

- OpenAI for providing powerful AI models
- Pinecone for vector database technology
- Spring Boot team for the excellent Java framework
- The open-source community for inspiration and tools

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)

---

**Made with ❤️ for the developer community** 