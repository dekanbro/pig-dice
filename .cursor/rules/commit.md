# Commit Rules

When making commits, follow these rules:

1. Use conventional commit format:
```
type(scope): subject

body
```

2. Types must be one of:
- feat: New feature
- fix: Bug fix
- refactor: Code change that neither fixes a bug nor adds a feature
- style: Changes that do not affect the meaning of the code
- test: Adding missing tests
- docs: Documentation only changes
- chore: Changes to build process or auxiliary tools
- perf: Performance improvements

3. Scopes must be one of:
- ui: User interface components
- game: Game logic and mechanics
- auth: Authentication and wallet
- contract: Smart contract changes
- api: API endpoints
- test: Test infrastructure
- deps: Dependencies
- config: Configuration

4. Rules:
- Subject line must be <= 72 characters
- Use imperative mood ("add" not "added")
- No period at end of subject
- Separate subject from body with blank line
- Body should explain WHAT and WHY

5. Auto-commit triggers:
- After successful test runs
- After significant changes (>50 lines)
- After completing a feature
- After fixing a bug

6. Branch naming:
- feature/* for new features
- fix/* for bug fixes
- docs/* for documentation
- release/v* for releases 