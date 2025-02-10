# Contributing to One More Roll

## Git Commit Conventions

We follow a structured commit message format to maintain a clean and traceable git history. Each commit message should be formatted as follows:

```
type(scope): subject

body
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `style`: Changes that do not affect the meaning of the code (formatting, etc.)
- `test`: Adding missing tests or correcting existing tests
- `docs`: Documentation only changes
- `chore`: Changes to the build process or auxiliary tools
- `perf`: Performance improvements

### Scopes
- `ui`: User interface components
- `game`: Game logic and mechanics
- `auth`: Authentication and wallet connection
- `contract`: Smart contract related changes
- `api`: API endpoints and server logic
- `test`: Test infrastructure changes
- `deps`: Dependency updates
- `config`: Configuration changes

### Commit Message Guidelines

1. Subject line should be no longer than 72 characters
2. Use imperative mood in the subject line ("add" not "added")
3. Do not end the subject line with a period
4. Separate subject from body with a blank line
5. Use the body to explain what and why vs. how

### Examples

```
feat(game): implement dice rolling animation

- Add Framer Motion animations for dice roll
- Include sound effects
- Optimize for mobile view
```

```
fix(contract): resolve payout calculation error

- Fix floating point precision issue in jackpot calculation
- Add additional test cases
```

## Development Workflow

### Branch Naming
- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`
- Release branches: `release/v1.x.x`

### Major Development Phases
Commit after completing each major phase or significant feature:

1. Project Setup
```bash
git commit -m "chore(setup): initialize Next.js project with dependencies"
```

2. Core Features
```bash
git commit -m "feat(game): implement basic dice rolling mechanism"
```

3. Testing
```bash
git commit -m "test(game): add unit tests for game logic"
```

### Code Review Process
1. Create a Pull Request with a clear description
2. Link relevant issues
3. Ensure all tests pass
4. Get approval from at least one reviewer
5. Squash and merge with a clean commit message

## Testing Requirements

- Write tests for all new features
- Maintain minimum 80% code coverage
- Run full test suite before committing

## Development Environment

### Required Tools
- Node.js 18+
- pnpm (preferred package manager)
- Git
- VS Code with recommended extensions

### Getting Started
1. Fork the repository
2. Clone your fork
3. Install dependencies: `pnpm install`
4. Create a new branch
5. Make your changes
6. Submit a Pull Request

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Create a release branch
4. Deploy to staging
5. Test thoroughly
6. Create a release tag
7. Deploy to production

## Questions?

Feel free to open an issue for any questions or concerns about the contribution process. 