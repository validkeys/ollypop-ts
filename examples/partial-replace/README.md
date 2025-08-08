# Partial Replace Mode Example

This example demonstrates how to use `partial-replace` mode to update only a specific section of an existing file while preserving all other content.

## Overview

When using `mode: "partial-replace"`, ollypop will:

1. **Preserve existing content** - All custom code remains untouched
2. **Update marked section only** - Only content between `// AUTO-GENERATED EXPORTS - START` and `// AUTO-GENERATED EXPORTS - END` markers is replaced
3. **Skip unnecessary writes** - If generated content hasn't changed, the file won't be written

## Example Structure

```
src/services/
├── index.ts          # Mixed file with custom + generated content
├── auth.ts           # Service implementation
├── notification.ts   # Service implementation
└── user.ts           # Service implementation
```

## Configuration

```json
{
  "version": "1.0.0",
  "barrels": [
    {
      "name": "services-barrel",
      "output": "./src/services/index.ts",
      "template": {
        "name": "variable-template",
        "export": "export * from './{service}'",
        "mode": "partial-replace"
      }
    }
  ]
}
```

## Result

**Before generation**, `src/services/index.ts` contains:

```typescript
// Custom imports and utilities
import { config } from '../config';
import type { ServiceOptions } from '../types';

// Custom helper functions
export function createServiceConfig(options: ServiceOptions) {
  return {
    ...config.defaults,
    ...options,
  };
}

export const SERVICE_CONSTANTS = {
  DEFAULT_TIMEOUT: 5000,
  MAX_RETRIES: 3,
} as const;

// AUTO-GENERATED EXPORTS - START
// Placeholder content will be replaced
// AUTO-GENERATED EXPORTS - END

// More custom code after the auto-generated section
export class ServiceManager {
  constructor(private options: ServiceOptions) {}
  
  async initialize() {
    console.log('Initializing services...');
  }
}

export default ServiceManager;
```

**After generation**, only the marked section is updated:

```typescript
// Custom imports and utilities
import { config } from '../config';
import type { ServiceOptions } from '../types';

// Custom helper functions
export function createServiceConfig(options: ServiceOptions) {
  return {
    ...config.defaults,
    ...options,
  };
}

export const SERVICE_CONSTANTS = {
  DEFAULT_TIMEOUT: 5000,
  MAX_RETRIES: 3,
} as const;

// AUTO-GENERATED EXPORTS - START

export * from './auth'
export * from './notification'
export * from './user'

// AUTO-GENERATED EXPORTS - END

// More custom code after the auto-generated section
export class ServiceManager {
  constructor(private options: ServiceOptions) {}
  
  async initialize() {
    console.log('Initializing services...');
  }
}

export default ServiceManager;
```

## Usage

```bash
# Generate barrel files with partial replace
ollypop generate

# Use verbose mode to see what's happening
ollypop generate --verbose

# Run again - it will skip writing if nothing changed
ollypop generate --verbose
```

## Key Benefits

1. **Coexistence**: Mix auto-generated exports with custom code
2. **Safety**: Your custom code is never overwritten
3. **Efficiency**: Files are only written when content actually changes
4. **Clarity**: Clear markers show what section is managed by ollypop

## Use Cases

- **Service indexes**: Export services while keeping utility functions
- **API endpoints**: Generate route exports while preserving middleware
- **Component libraries**: Export components while keeping provider setup
- **Utility libraries**: Generate exports while keeping constants and helpers
