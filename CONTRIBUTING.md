# Contributing to C++ to Java Migration CLI

Thank you for your interest in contributing to the C++ to Java Migration CLI! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/cpp-to-java-migrator.git
   cd cpp-to-java-migrator
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment**
   ```bash
   cp env.example .env
   # Edit .env with your API keys
   ```

4. **Build Project**
   ```bash
   npm run build
   ```

## 🛠️ Development Workflow

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Linting and Formatting
```bash
npm run lint
npm run format
```

### Building for Production
```bash
npm run build
```

## 📝 Code Style Guidelines

### TypeScript
- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### File Structure
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

### Naming Conventions
- Use PascalCase for classes and interfaces
- Use camelCase for variables and functions
- Use kebab-case for file names
- Use UPPER_SNAKE_CASE for constants

## 🧪 Testing

### Writing Tests
- Place tests in `src/__tests__/` directory
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## 🔧 Adding New Features

### 1. Create Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 2. Implement Feature
- Follow the existing code patterns
- Add appropriate tests
- Update documentation if needed

### 3. Test Your Changes
```bash
npm run build
npm test
npm run lint
```

### 4. Commit Changes
Use conventional commit messages:
```bash
git commit -m "feat: add new transformation feature"
git commit -m "fix: resolve parsing issue with nested classes"
git commit -m "docs: update README with new examples"
```

### 5. Push and Create Pull Request
```bash
git push origin feature/amazing-feature
```

## 🐛 Reporting Bugs

### Before Submitting
1. Check existing issues
2. Try to reproduce the bug
3. Check if it's a configuration issue

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Run command '...'
2. See error

**Expected behavior**
A clear description of what you expected to happen.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Node.js version: [e.g. 18.17.0]
- CLI version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

## 💡 Feature Requests

### Before Submitting
1. Check existing feature requests
2. Consider if it aligns with project goals
3. Think about implementation complexity

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
A clear description of any alternative solutions.

**Additional context**
Add any other context or screenshots about the feature request.
```

## 📚 Documentation

### Updating Documentation
- Keep README.md up to date
- Update API documentation for new features
- Add examples for new functionality
- Update installation instructions if needed

### Documentation Standards
- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Keep table of contents updated

## 🔄 Pull Request Process

### Before Submitting PR
1. Ensure all tests pass
2. Run linting and formatting
3. Update documentation
4. Add tests for new features
5. Update CHANGELOG.md if needed

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## 🏷️ Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps
1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release tag
4. Publish to npm (if applicable)

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow project conventions

### Communication
- Use GitHub Issues for bugs and features
- Use GitHub Discussions for questions
- Be patient with responses
- Help others when possible

## 📞 Getting Help

- **Issues**: [GitHub Issues](https://github.com/yourusername/cpp-to-java-migrator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/cpp-to-java-migrator/discussions)
- **Documentation**: [README.md](README.md)

## 🙏 Acknowledgments

Thank you to all contributors who help make this project better!

---

**Happy Contributing! 🚀** 