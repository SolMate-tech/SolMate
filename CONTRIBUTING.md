# Contributing to SolMate

Thank you for your interest in contributing to SolMate! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue on our GitHub repository with the following information:

- A clear, descriptive title
- A detailed description of the bug
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment information (browser, OS, etc.)

### Suggesting Features

We welcome feature suggestions! To suggest a feature, please create an issue on our GitHub repository with the following information:

- A clear, descriptive title
- A detailed description of the feature
- Why this feature would be beneficial
- Any implementation ideas you have

### Pull Requests

We welcome pull requests! To submit a pull request:

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes
4. Write tests for your changes (if applicable)
5. Run the existing tests to ensure they pass
6. Submit a pull request

Please ensure your pull request:

- Has a clear, descriptive title
- Includes a description of the changes
- References any related issues
- Follows the coding style of the project
- Includes tests (if applicable)
- Updates documentation (if applicable)

## Development Setup

### Prerequisites

- Node.js (v16+)
- npm (v8+)
- Rust (v1.65+)
- Solana CLI (v1.16+)
- Anchor Framework (v0.27+)

### Installation

```bash
# Clone the repository
git clone https://github.com/SolMate-tech/SolMate.git
cd SolMate

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start the development services
npm start
```

### Project Structure

- `/frontend` - React frontend application
- `/backend` - Node.js backend server
- `/contracts` - Solana smart contracts
- `/shared` - Shared code between frontend and backend
- `/docs` - Documentation
- `/scripts` - Utility scripts

### Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test

# Run contract tests
cd contracts
anchor test
```

## Coding Standards

- Use ESLint and Prettier for JavaScript/TypeScript code
- Follow Rust style guidelines for Solana contracts
- Write meaningful commit messages
- Document your code with comments
- Write tests for your code

## License

By contributing to SolMate, you agree that your contributions will be licensed under the project's MIT license.
