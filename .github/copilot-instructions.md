# Copilot Instructions for McBopomofoWeb

## Project Overview

McBopomofoWeb is a TypeScript implementation of the McBopomofo (小麥注音) input method, porting the popular macOS Bopomofo input method to web-based platforms. The project provides automatic character selection for Chinese input using Bopomofo (注音) phonetic symbols.

### Target Platforms

- **Web browsers**: Example implementation for web pages
- **Chrome OS**: Chrome extension for input method
- **Windows**: PIME-based input method framework
- **Additional utilities**: Text conversion services (Chinese to Braille, etc.)

## Architecture Overview

### Core Modules (`/src/`)

#### Main Input Method (`/src/McBopomofo/`)

- **InputController.ts**: Main input handling logic and state management
- **KeyHandler.ts**: Keyboard event processing and key mapping
- **CandidateController.ts**: Manages candidate selection and display
- **InputState.ts**: Input state machine and mode management
- **Service.ts**: Core input method service interface
- **WebLanguageModel.ts**: Language model for character prediction
- **UserOverrideModel.ts**: User customization and learning
- **LocalizedStrings.ts**: Internationalization support

#### Supporting Modules

- **`/src/Mandarin/`**: Bopomofo phonetic processing, keyboard layouts, syllable parsing
- **`/src/BopomofoBraille/`**: Chinese to Braille conversion utilities
- **`/src/ChineseNumbers/`**: Chinese numeral processing (including Suzhou numerals)
- **`/src/Gramambular2/`**: Advanced text processing and reading grids
- **`/src/LargeSync/`**: Chrome storage utilities for large data synchronization

### Build System

- **Primary builds**: `npm run build` (web), `npm run build:chromeos` (Chrome OS), `npm run build:pime` (Windows)
- **Webpack configurations**: Separate configs for each platform target
- **TypeScript compilation**: ES6 target with CommonJS modules

### Output Structure (`/output/`)

- **`/output/example/`**: Web demo and testing interface
- **`/output/chromeos/`**: Chrome OS extension files
- **`/output/pime/`**: Windows PIME input method files

## Development Practices

### Code Style

- **Language**: TypeScript with strict mode enabled
- **Testing**: Jest with comprehensive test coverage (20+ test suites, 777+ tests)
- **Linting**: ESLint with TypeScript parser
- **File naming**: PascalCase for classes, camelCase for files

### Key Development Patterns

1. **State Management**: Centralized input state with clear transitions
2. **Event Handling**: Comprehensive key event processing with platform abstractions
3. **Modular Design**: Clear separation between phonetic processing, UI, and platform-specific code
4. **Extensive Testing**: Test-driven development with unit tests for all major components

### Working with Input Methods

- **Bopomofo phonetics**: Use `BopomofoSyllable` and `BopomofoReadingBuffer` for phonetic processing
- **Character selection**: Leverage `CandidateController` for managing selection UI
- **Keyboard layouts**: Extend `BopomofoKeyboardLayout` for different input schemes
- **Platform integration**: Implement platform-specific adapters in respective output directories

### Testing Guidelines

- Run tests with: `npm run test`
- Test coverage: `npm run test:coverage`
- Focus areas: Input state transitions, phonetic parsing, character selection logic
- Mock external dependencies and platform-specific APIs

### Building and Deployment

```bash
# Development
npm install
npm run build:dev          # Development build with source maps
npm run build:watch        # Watch mode for development

# Production builds
npm run build              # Web bundle
npm run build:chromeos     # Chrome OS extension
npm run build:pime         # Windows PIME version

# Testing
npm run test               # Run all tests
npm run eslint             # Code linting
```

## Important Files and Patterns

### Configuration Files

- **`tsconfig.json`**: TypeScript configuration (ES6 target, strict mode)
- **`jest.config.js`**: Testing configuration with ts-jest
- **`webpack.config.*.js`**: Platform-specific build configurations
- **`.eslintrc.js`**: Code style and linting rules

### Data Files

- **`WebData.ts`**: Contains large language model data (>500KB)
- Platform-specific manifests and configuration in respective output directories

### Key Interfaces

- **`Key`**: Represents keyboard input with platform abstraction
- **`InputState`**: Manages input method state and mode transitions
- **`BopomofoSyllable`**: Core phonetic representation
- **`CandidateController`**: Manages candidate selection and ranking

## Common Tasks

### Adding New Features

1. **Input processing**: Extend `KeyHandler` or `InputController`
2. **Phonetic support**: Work with `Mandarin/` module components
3. **UI components**: Update `InputUI` interfaces
4. **Platform support**: Add platform-specific implementations in output directories

### Debugging

- Use Jest tests to isolate component behavior
- Enable webpack source maps for debugging built code
- Platform-specific debugging varies (Chrome DevTools, PIME logs, etc.)

### Performance Considerations

- **Large bundle size**: Current bundle is 3.81MB (consider code splitting for web deployment)
- **Language model**: `WebData.ts` is large (500KB+) - consider lazy loading
- **Memory usage**: Optimize for resource-constrained environments like Chrome OS

## Contributing Guidelines

- Follow existing TypeScript patterns and naming conventions
- Add comprehensive tests for new functionality
- Consider cross-platform compatibility
- Update documentation for API changes
- Test on target platforms when possible

## Additional Resources

- **Main documentation**: `/README.md` (in Chinese)
- **Platform-specific guides**: Check `/output/*/README.md` files
- **Word Add-in**: See `/others/WordAddin/` for Microsoft Word integration
- **Community**: Follow Code of Conduct in `CODE_OF_CONDUCT.md`

## Additional Agent Notes

- Before merging, run `npm run test` and ensure Chrome OS build still compiles via `npm run build:chromeos`.
- New language model data must include a short note in `README.md` summarizing changes for translators.
