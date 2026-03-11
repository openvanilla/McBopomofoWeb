# Copilot Instructions for McBopomofoWeb

## Project Overview

McBopomofoWeb is a TypeScript implementation of the McBopomofo (小麥注音) input method, porting the popular macOS Bopomofo input method to web-based platforms. The project provides automatic character selection for Chinese input using Bopomofo (注音) phonetic symbols.

### Target Platforms

- **Web browsers**: Example implementation for web pages
- **Chrome OS**: Chrome extension for input method
- **Windows**: PIME-based input method framework
- **MCP Server**: Model Context Protocol server exposing LLM tools
- **Additional utilities**: Text conversion services (Chinese to Braille, etc.)

## Architecture Overview

### Core Modules (`/src/`)

#### Main Input Method (`/src/McBopomofo/`)

- **InputController.ts**: Main input handling logic and state management
- **KeyHandler.ts**: Keyboard event processing and key mapping
- **CandidateController.ts**: Manages candidate selection and display
- **InputHelperNumber.ts**: A helper class for handling number inputs.
- **InputState.ts**: Input state machine and mode management. It defines various states like `Inputting`, `ChoosingCandidate`, and a unified `NumberInput` state.
- **Service.ts**: Core input method service interface
- **WebLanguageModel.ts**: Language model for character prediction
- **UserOverrideModel.ts**: User customization and learning
- **VariantAnnotator.ts**: Handles Bopomofo font support by annotating characters with Unicode IVS (Ideographic Variation Selectors) or PUA (Private Use Area) code points.
- **WebBpmfvsVariants.ts**, **WebBpmfvsPua.ts**: Data files for IVS and PUA mappings.
- **LocalizedStrings.ts**: Internationalization support

#### Supporting Modules

- **`/src/Mandarin/`**: Bopomofo phonetic processing, keyboard layouts, syllable parsing
- **`/src/BopomofoBraille/`**: Chinese to Braille conversion utilities
- **`/src/ChineseNumbers/`**: Chinese numeral processing (including Suzhou numerals)
- **`/src/Gramambular2/`**: Advanced text processing and reading grids (using the Viterbi algorithm for path selection)
- **`/src/LargeSync/`**: Chrome storage utilities for large data synchronization
- **`mcp.ts`**: MCP (Model Context Protocol) server exposing text and braille conversion tools to LLMs via `stdio`

### Build System

- **Primary builds**: `npm run build` (web), `npm run build:chromeos` (Chrome OS), `npm run build:pime` (Windows)
- **Webpack configurations**: Separate configs for each platform target
- **TypeScript compilation**: ES6 target with CommonJS modules

### Output Structure (`/output/`)

- **`/output/example/`**: Web demo and testing interface
- **`/output/chromeos/`**: Chrome OS extension files
- **`/output/pime/`**: Windows PIME input method files
- **`/output/mcp/`**: Compiled MCP server script and files

### Tools Directory (`/tools/`)

- Contains utilities for data management, such as `txt_to_map.py` and `encode.cpp`.
- Provides a `Makefile` to update the phrases database using `data.txt` from the upstream McBopomofo project.

## Development Practices

### Code Style

- **Language**: TypeScript with strict mode enabled
- **Testing**: Jest with comprehensive test coverage (20+ test suites, 777+ tests)
- **Linting**: ESLint with TypeScript parser
- **File naming**: PascalCase for classes, camelCase for files

## Coding Conventions

- Use modern TypeScript (target TS 5.9). Prefer `const` + arrow functions, explicit return types on exported symbols, and named exports (no default exports in this repo).
- Keep data-structure types close to their usage (e.g., interfaces in the same file). Add brief inline comments only for non-obvious logic such as Unicode range calculations in `InputTableManager`.
- When mutating state, create new objects instead of altering inputs in place—most consumers rely on immutability for predictable UI rendering.

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

### Platform Quirks & Workarounds

- **Google Docs (Chrome OS)**: Google Docs repeatedly sends `onReset` events. Workarounds are implemented (e.g., in `chromeos_ime.ts`) to prevent aggressive IME state resets by conditionally rejecting `onReset`.
- **Candidate manipulation**: Users can boost (`+`) or exclude (`-`) specific candidates dynamically during the candidate selection phrase.

### Bopomofo Font Support (Unicode IVS)

The input method supports rendering Bopomofo alongside Chinese characters using specialized fonts (e.g., from ButTaiwan). This is achieved through:

1.  **VariantAnnotator.ts**: Core logic to find and apply IVS/PUA annotations based on the character and its reading.
2.  **Data Mappings**: `WebBpmfvsVariants.ts` (IVS) and `WebBpmfvsPua.ts` (PUA).
3.  **Platform Toggle**: Platforms like Chrome OS and PIME can toggle this feature. When enabled, the committed text includes these variation selectors. Note that cursor index calculations in `pime.ts` and `chromeos_ime.ts` may need adjustments to account for these extra characters.

### Working with the MCP Server

- **Building**: Run `npm run build:mcp` to compile the MCP server to `output/mcp/index.js`.
- **Running**: The server communicates via standard input/output (`stdio`). It can be started using `node output/mcp/index.js` or the wrapper `output/mcp/run.sh`.
- **Tools**: It exposes LLM tools for text, Bopomofo, Pinyin, Bopomofo annotation font, and Braille conversion (e.g., `convertBrailleToText`, `convertTextToBraille`, `convertTextToPinyin`, `convertTextToBpmfAnnotatedText`).

### Testing Guidelines

- Run tests with: `npm run test`
- Test coverage: `npm run test:coverage`
- Focus areas: Input state transitions, phonetic parsing, character selection logic
- Mock external dependencies and platform-specific APIs

## Testing & tooling

- Always follow Kent Beck's TDD flow: write a failing test, make it pass, then refactor.
- Unit tests are required for all new or modified code. Place tests beside implementation files as `*.test.ts`.
- When code is modified, also update this copilot-instructions.md file if relevant.
- AI agents may call `test:coverage` (via agent) to find code not covered by tests and should address coverage gaps.

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
npm run build:mcp          # MCP Server definition

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
- **`CandidateController`**: Manages candidate selection and ranking (including user overrides via `+`/`-` keys)

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

## AI Coding and Test-Driven Development (TDD)

When AI is working on this project, always follow Kent Beck's Test-Driven Development (TDD) flow:

1. **Write a failing unit test first** for any new feature or bug fix.
2. **Write the minimum code** needed to make the test pass.
3. **Refactor** the code while keeping all tests green.
4. **Repeat** for each new feature or change.

**Unit tests are required for all code changes.**

When the code is modified, also update this AGENTS.md file to reflect any new rules, conventions, or requirements.

AI agents may call a subagent to run `npm run test:coverage` to find code that is not covered by tests, and should add or improve tests to increase coverage as needed.

---

## Testing & tooling

- Always follow Kent Beck's TDD flow: write a failing test, make it pass, then refactor.
- Unit tests are required for all new or modified code. Place tests beside implementation files as `*.test.ts`.
- When code is modified, also update this copilot-instructions.md file if relevant.
- Jest with `ts-jest` is configured; high-signal tests already exist beside the implementation files (`*.test.ts`).
- Use `npm run ts-build` for type-checking and `npm run eslint` to enforce the TypeScript ESLint ruleset. Keep CI-friendly scripts free of watch flags.
- AI agents may call `test:coverage` (via agent) to find code not covered by tests and should address coverage gaps.

## Documentation expectations

- Update this file when introducing new subsystems so Copilot understands how to wire things together.
- Prefer concise prose and actionable bullet points that tell Copilot _what to favor or avoid_ rather than lengthy narratives.

## Commit expectations

- Follow Conventional Commits for every commit title (e.g., `feat: add reverse lookup cache`).
- Always include 3–4 short lines after the title that summarize the change, rationale, and any testing performed so history stays self-explanatory.

## Additional Agent Notes

- **DO NOT** modify any files under the `node_modules` directory.
- Before merging, run `npm run test` and ensure Chrome OS build still compiles via `npm run build:chromeos`.
- CI now runs `npm run build:mcp` across Node 18-24; run this build locally when changing MCP-related code to mirror CI.
- New language model data must include a short note in `README.md` summarizing changes for translators.
