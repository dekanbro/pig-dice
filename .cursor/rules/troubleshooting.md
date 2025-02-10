# Troubleshooting Rules

## Common Issues & Solutions

1. Package Manager Issues:
- Use `pnpm` as the primary package manager
- For shadcn-ui installation, use manual setup instead of CLI:
  ```bash
  # Instead of using CLI tools that may fail
  1. Create components.json
  2. Set up tailwind.config.ts
  3. Configure globals.css
  4. Add utils.ts
  ```

2. Git Commit Issues:
- Avoid newlines in commit commands
- Use `-m` flag multiple times for multi-line messages:
  ```bash
  # Correct way to make multi-line commits
  git commit -m "type(scope): subject" -m "- Point 1\n- Point 2\n- Point 3"
  ```

3. Interactive CLI Issues:
- Avoid tools that require interactive prompts
- Use non-interactive alternatives with flags:
  ```bash
  # Instead of interactive prompts
  command --flag1 value1 --flag2 value2 --yes
  ```

4. Next.js Project Creation:
- Use non-interactive flags:
  ```bash
  pnpm create next-app . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --turbo --yes
  ```

## Best Practices

1. Installation Order:
- Initialize Git first
- Create project structure
- Install dependencies
- Configure tooling
- Make initial commit

2. Configuration Files:
- Create configuration files manually when CLI tools fail
- Keep configuration in version control
- Document configuration changes

3. Error Recovery:
- Document errors in this file
- Add solutions as they are discovered
- Update related configuration files

## Project-Specific Solutions

1. Shadcn UI Setup:
- Manual installation process:
  1. Create `components.json`
  2. Set up `tailwind.config.ts`
  3. Configure `globals.css`
  4. Add `utils.ts`
  5. Install components manually

2. Development Environment:
- Use `.env.local` for local environment
- Document required environment variables
- Keep sensitive values out of version control 