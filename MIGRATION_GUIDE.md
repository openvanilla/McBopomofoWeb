# Quick Start Guide After Modernization

## Installation

After pulling these changes, run:

```bash
# Remove old dependencies and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Important**: Make sure `NODE_ENV` is not set to `production` when developing:
```bash
unset NODE_ENV  # if using bash/zsh
npm install
```

## New Commands

### Code Quality

```bash
# Format code
npm run format

# Check formatting without changing files
npm run format:check

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Type check without building
npm run type-check
```

### Testing

```bash
# Run tests (existing)
npm test

# Run tests in watch mode (new)
npm run test:watch

# Run tests with coverage (existing)
npm run test:coverage
```

### Building

```bash
# Clean build artifacts (new)
npm run clean

# Build commands (existing)
npm run build              # Web
npm run build:chromeos     # Chrome OS
npm run build:pime         # Windows PIME
```

### All-in-One Validation

```bash
# Run everything (clean, type-check, format check, lint, test, build all targets)
./scripts/validate.sh
```

## Development Workflow

### Before Committing

```bash
npm run format        # Format code
npm run lint:fix      # Fix linting issues
npm test              # Ensure tests pass
```

Or run the complete validation:
```bash
./scripts/validate.sh
```

### Using Node Version Manager (nvm)

The project now includes a `.nvmrc` file:

```bash
# Use the correct Node.js version
nvm use

# Or install if not present
nvm install
```

## Editor Setup

### VS Code

The `.editorconfig` file will be automatically recognized. For best experience:

1. Install the EditorConfig extension
2. Install the Prettier extension
3. Install the ESLint extension
4. Enable "Format on Save" in VS Code settings

### Other Editors

Most modern editors support EditorConfig. Install the appropriate plugin for your editor.

## CI/CD

GitHub Actions will automatically:
- Run linting on every push/PR
- Run tests on Node.js 18, 20, and 22
- Build all three targets (web, chromeos, pime)
- Upload coverage to Codecov (if configured)

## Troubleshooting

### Tests failing with "Property used before initialization"

This was fixed in `src/Gramambular2/ReadingGrid.ts`. If you see this error:
- Make sure you've pulled the latest changes
- Run `npm run type-check` to verify

### "Multiple configuration found" error

Make sure you only have `.js` config files, not both `.js` and `.mjs`:
- Keep: `jest.config.js`, `.eslintrc.js`
- Remove: `jest.config.mjs`, `eslint.config.mjs` (if present)

### npm install only installing 10 packages

This happens when `NODE_ENV=production`. Unset it:
```bash
unset NODE_ENV
npm install
```

You should see ~560 packages installed.

## What Changed?

See [MODERNIZATION.md](./MODERNIZATION.md) for a complete list of changes.

Key highlights:
- ✅ TypeScript target upgraded to ES2022
- ✅ ESLint modernized with latest TypeScript support
- ✅ Prettier added for code formatting
- ✅ Jest enhanced with coverage thresholds
- ✅ GitHub Actions CI/CD pipeline
- ✅ EditorConfig for cross-editor consistency
- ✅ Node version specification (.nvmrc)
- ✅ All 920 tests passing
- ✅ All builds working (web, chromeos, pime)
