# Changelog

## 1.0.1

### Patch Changes

- Fixed template engine file pattern detection bug
  - Fixed `isFileBasedPattern` method to correctly detect `{file}` variables without explicit extensions
  - Fixed working directory resolution when export path is current directory (`.`)
  - Template engine now properly generates exports for patterns like `export * from './{file:raw}'`
  - Added comprehensive examples demonstrating file-based and directory-based barrel generation
  - Examples now include patterns with and without file extensions for various use cases

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed

- Fixed template engine file pattern detection for `{file}` variables without explicit extensions
- Fixed working directory resolution when export path is current directory (`.`)
- Template engine now correctly identifies file-based patterns using `{file:raw}` syntax
- Examples now generate proper barrel exports for both file-based and directory-based patterns

### Added

- Comprehensive example projects demonstrating various barrel generation patterns:
  - `basic-barrel`: File-based exports without extensions
  - `directory-barrel`: Directory-based exports without extensions
  - `with-extensions`: File-based exports with `.js` extensions for compiled output
  - `directory-with-extensions`: Directory-based exports with `.js` extensions for compiled output
- npm scripts to run all examples: `pnpm run examples`
- Individual example scripts: `example:basic`, `example:directory`, `example:with-extensions`, `example:directory-extensions`

### Changed

- Updated package name from "Internal Barrel Maker" to "Ollypop"
- CLI command renamed from `barrel-maker` to `ollypop`
- Package configured for npm publication as `@validkeys/ollypop-ts`
- TypeScript builds now output to `dist/` directory for npm distribution

### Technical

- Added Changesets for automated version management and changelog generation
- Configured prepublish hooks with linting and testing
- Added Prettier for code formatting
- Set up build pipeline for TypeScript compilation
- Created `.npmignore` to exclude development files from npm package

## [1.0.0] - 2025-08-08

### Added

- Initial release of Ollypop TypeScript barrel file generator
- Variable-based template system with `{dir}` and `{file}` placeholders
- Chained transformations (casing, singular/plural, prefix/suffix, etc.)
- Support for both file-based and directory-based export patterns
- Automatic file existence filtering
- Partial replace mode for updating sections of existing files
- CLI with `generate`, `init`, and `validate` commands
- Configuration via `barrel.config.json`
- TypeScript support with full type definitions
