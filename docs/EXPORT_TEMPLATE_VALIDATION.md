# Export Template Validation

This document explains the validation that ollypop-ts performs on export templates to ensure they are properly formatted.

## Common Issues and Solutions

### 1. Missing Quotes Around Path

**❌ Invalid:**
```json
{
  "template": {
    "name": "variable-template",
    "export": "export * from ./handlers/{handler}"
  }
}
```

**✅ Valid:**
```json
{
  "template": {
    "name": "variable-template", 
    "export": "export * from \"./handlers/{handler}\""
  }
}
```

**Error Message:**
```
Path in export template must be enclosed in quotes. Found: ./handlers/{handler}
Correct format: export * from "./path/{variable}" or export * from './path/{variable}'
```

### 2. Mismatched Quotes

**❌ Invalid:**
```json
{
  "template": {
    "name": "variable-template",
    "export": "export * from \"./handlers/{handler}'"
  }
}
```

**✅ Valid:**
```json
{
  "template": {
    "name": "variable-template",
    "export": "export * from \"./handlers/{handler}\""
  }
}
```

**Error Message:**
```
Mismatched quotes in export template. Opening quote '"' does not match closing quote '''.
Use matching single quotes ('...') or double quotes ("...")
```

### 3. Missing Variables

**❌ Invalid:**
```json
{
  "template": {
    "name": "variable-template",
    "export": "export * from \"./handlers\""
  }
}
```

**✅ Valid:**
```json
{
  "template": {
    "name": "variable-template",
    "export": "export * from \"./handlers/{handler}\""
  }
}
```

**Error Message:**
```
Export template path must contain at least one variable in curly braces {variable}. Found path: ./handlers
```

### 4. Invalid Export Statement

**❌ Invalid:**
```json
{
  "template": {
    "name": "variable-template",
    "export": "import { handler } from \"./handlers\""
  }
}
```

**✅ Valid:**
```json
{
  "template": {
    "name": "variable-template",
    "export": "export * from \"./handlers/{handler}\""
  }
}
```

**Error Message:**
```
Export template must be a valid export statement. Expected format: export * from "./path/{variable}" or export * as Name from "./path/{variable}"
```

## Validation Timing

The validation runs:

1. **During configuration loading** - When using `ollypop generate`
2. **During configuration validation** - When using `ollypop validate` 
3. **At schema parse time** - When the configuration file is parsed

## Testing Your Templates

Use the `validate` command to test your configuration:

```bash
ollypop validate --config your-config.json
```

This will catch template syntax errors before attempting to generate barrel files.

## Supported Template Formats

### Basic Re-export
```json
"export": "export * from \"./handlers/{handler}\""
```

### Named Export
```json  
"export": "export * as {Handler} from \"./handlers/{handler}\""
```

### With Transformations
```json
"export": "export * as {handler:pascal}Factory from \"./handlers/{handler:kebab}\""
```

All formats must:
- Use proper quotes around the path
- Include at least one variable in `{variableName}` format
- Be valid JavaScript/TypeScript export syntax
