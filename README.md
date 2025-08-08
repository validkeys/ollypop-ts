# Ollypop

> **Automatic TypeScript Barrel File Generation**

## Overview

Ollypop is a CLI tool for generating TypeScript barrel files (`index.ts`) automatically. It uses a powerful variable-based template system to scan directories and files, creating export statements based on your configuration. The system supports both directory-based and file-based patterns, with intelligent file existence filtering and path resolution relative to the output file location.

## Features

- **Variable-based export templates**: Use `{dir}` or `{file}` placeholders in your export statements
- **Chained transformations**: Apply casing, singular/plural, prefix/suffix, and more
- **Automatic pattern detection**: Scans for files or directories based on your template
- **File existence filtering**: Only exports items that actually exist
- **Partial replace mode**: Update only the auto-generated section of a file
- **No `cwd` required**: All paths are resolved relative to the output file
- **Dry run mode**: Preview changes before writing

## Quick Start

1. **Install dependencies**
   ```bash
   pnpm install
   ```
2. **Create a configuration file**
   ```bash
   pnpm exec ollypop init
   # Or copy and edit barrel.config.json
   ```
3. **Generate barrels**
   ```bash
   pnpm exec ollypop generate
   ```
4. **Run examples**
   ```bash
   # Run all examples to see different patterns
   pnpm run examples
   
   # Or run individual examples
   pnpm run example:basic              # File-based without extensions
   pnpm run example:directory          # Directory-based without extensions
   pnpm run example:with-extensions    # File-based with .js extensions
   pnpm run example:directory-extensions # Directory-based with .js extensions
   ```

## Configuration

Configuration is defined in `barrel.config.json`:

```json
{
  "version": "1.0",
  "barrels": [
    {
      "name": "handlers",
      "output": "./src/handlers/index.ts",
      "template": {
        "name": "variable-template",
        "export": "export * from './{dir:raw}/index.js'"
      },
      "options": {
        "preserveExtensions": true,
        "extensions": [".ts"],
        "validateExports": false,
        "dryRun": false
      }
    },
    {
      "name": "interfaces",
      "output": "./src/index.browser.ts",
      "template": {
        "name": "variable-template",
        "export": "export * from './handlers/{dir:raw}/interface.js'",
        "mode": "partial-replace"
      },
      "options": {
        "preserveExtensions": true,
        "extensions": [".ts"],
        "validateExports": false,
        "dryRun": false
      }
    }
  ]
}
```

### Template System

- **Variables**: `{dir}` for directory names, `{file}` for file names
- **Transforms**: `{dir:raw}`, `{dir:camel}`, `{dir:pascal}`, `{dir:kebab}`, `{dir:singular}`, `{dir:plural}`, `{dir:trimPrefix:foo-}`, `{dir:addSuffix:Bar}`
- **Chaining**: `{dir:trimPrefix:foo-|pascal|plural}`
- **Partial Replace**: Use `mode: "partial-replace"` to update only the marked section of a file

## Transformations Reference

The variable template system supports a wide range of transformations for directory and file names. You can chain multiple transformations using the pipe (`|`) operator.

| Syntax                               | Description                              | Example Input        | Example Output     |
| ------------------------------------ | ---------------------------------------- | -------------------- | ------------------ |
| `{dir}`                              | PascalCase (default)                     | `user-profile`       | `UserProfile`      |
| `{dir:raw}`                          | Preserve original                        | `user-profile`       | `user-profile`     |
| `{dir:camel}`                        | camelCase                                | `user-profile`       | `userProfile`      |
| `{dir:kebab}`                        | kebab-case                               | `UserProfile`        | `user-profile`     |
| `{dir:pascal}`                       | PascalCase                               | `user-profile`       | `UserProfile`      |
| `{dir:singular}`                     | Singularize (inflection)                 | `account-balances`   | `account-balance`  |
| `{dir:plural}`                       | Pluralize (inflection)                   | `account-balance`    | `account-balances` |
| `{dir:trimPrefix:warehouse-,ops-}`   | Remove specified prefixes                | `warehouse-accounts` | `accounts`         |
| `{dir:trimSuffix:Service,Manager}`   | Remove specified suffixes                | `AccountService`     | `Account`          |
| `{dir:addPrefix:I,Base}`             | Add specified prefix                     | `Account`            | `IAccount`         |
| `{dir:addSuffix:Factory,Service}`    | Add specified suffix                     | `Account`            | `AccountFactory`   |
| `{dir:replace:old,new;acct,account}` | Replace text (semicolon-separated pairs) | `old-acct-data`      | `new-account-data` |
| `{dir:uppercase}`                    | Convert to uppercase                     | `account`            | `ACCOUNT`          |
| `{dir:lowercase}`                    | Convert to lowercase                     | `ACCOUNT`            | `account`          |
| `{dir:capitalize}`                   | Capitalize first letter                  | `account`            | `Account`          |
| `{dir:uncapitalize}`                 | Lowercase first letter                   | `Account`            | `account`          |

### Chained Transformations

You can chain multiple transformations using the pipe operator:

```json
{
  "template": {
    "name": "variable-template",
    "export": "export * as {dir:trimPrefix:warehouse-,ops-|singular|pascal}Factory from './{dir:raw}/factory.js'"
  }
}
```

**Transformation Flow:**

1. `warehouse-account-balances` → **trimPrefix** → `account-balances`
2. `account-balances` → **singular** → `account-balance`
3. `account-balance` → **pascal** → `AccountBalance`
4. Final result: `AccountBalanceFactory`

---

## Configuration Examples & Resulting Barrel Output

### 1. Directory-Based Barrel

**Config:**

```json
{
  "template": {
    "name": "variable-template",
    "export": "export * from './{dir:raw}/index.js'"
  }
}
```

**Directory Structure:**

```
src/handlers/
├── createUser/
│   └── index.ts
├── updateProfile/
│   └── index.ts
└── deleteAccount/
    └── interface.ts
```

**Resulting Barrel:**

```typescript
export * from './createUser/index.js';
export * from './updateProfile/index.js';
// deleteAccount excluded (no index.ts)
```

### 2. File-Based Barrel

**Config:**

```json
{
  "template": {
    "name": "variable-template",
    "export": "export * from './{file:raw}.ts'"
  }
}
```

**Directory Structure:**

```
src/primitives/
├── accountType.ts
├── assetType.ts
├── currency.ts
├── index.ts (barrel file, auto-excluded)
└── logging.ts
```

**Resulting Barrel:**

```typescript
export * from './accountType.ts';
export * from './assetType.ts';
export * from './currency.ts';
export * from './logging.ts';
// index.ts excluded automatically
```

### 3. Interface Barrel (Partial Replace)

**Config:**

```json
{
  "template": {
    "name": "variable-template",
    "export": "export * from './handlers/{dir:raw}/interface.js'",
    "mode": "partial-replace"
  }
}
```

**Directory Structure:**

```
src/handlers/
├── createUser/
│   ├── index.ts
│   └── interface.ts
├── updateProfile/
│   └── index.ts (no interface.ts)
└── deleteAccount/
    └── interface.ts
```

**Resulting Barrel Section:**

```typescript
// AUTO-GENERATED EXPORTS - START
export * from './handlers/createUser/interface.js';
export * from './handlers/deleteAccount/interface.js';
// AUTO-GENERATED EXPORTS - END
```

### 4. Advanced Naming with Chained Transforms

**Config:**

```json
{
  "template": {
    "name": "variable-template",
    "export": "export * as {dir:singular|pascal}Service from './{dir:raw}/service.js'"
  }
}
```

**Directory Structure:**

```
src/services/
├── accounts/
│   └── service.ts
├── payments/
│   └── service.ts
```

**Resulting Barrel:**

```typescript
export * as AccountService from './accounts/service.js';
export * as PaymentService from './payments/service.js';
```

### 5. Multi-Level Variables (Future/Advanced)

**Config:**

```json
{
  "template": {
    "name": "variable-template",
    "export": "export * as {namespace:raw}{Entity:pascal}Factory from './{namespace:raw}/{Entity:raw}/factory.js'"
  }
}
```

**Directory Structure:**

```
src/domains/
├── warehouse/
│   └── product/
│       └── factory.ts
├── retail/
│   └── customer/
│       └── factory.ts
```

**Resulting Barrel:**

```typescript
export * as warehouseProductFactory from './warehouse/product/factory.js';
export * as retailCustomerFactory from './retail/customer/factory.js';
```

---
