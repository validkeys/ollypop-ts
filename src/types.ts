import { z } from 'zod';

// Zod schemas for validation
export const SourceConfigSchema = z.object({
  path: z.string(),
  recursive: z.boolean().optional().default(false),
  maxDepth: z.number().optional(),
  pattern: z.string().optional().default('*.ts'),
  // New: Support for directory-based patterns
  directoryPattern: z.boolean().optional().default(false),
  indexFile: z.string().optional().default('index.js'),
});

export const MarkerConfigSchema = z.object({
  startMarker: z.string(),
  endMarker: z.string(),
  preserveContent: z.boolean().optional().default(true),
});

export const ExportConfigSchema = z.object({
  style: z.enum(['named', 'default', 'namespace', 'reexport', 'mixed']),
  defaultExports: z.enum(['ignore', 'named', 'passthrough']).optional().default('ignore'),
  naming: z
    .object({
      transform: z.enum(['kebab', 'camel', 'pascal', 'preserve']).optional().default('preserve'),
      prefix: z.string().optional(),
      suffix: z.string().optional(),
    })
    .optional(),
  groupByDirectory: z.boolean().optional().default(false),
  sort: z.boolean().optional().default(true),
});

// Helper function to validate export template syntax
function validateExportTemplate(template: string): string {
  // Check if it's an export statement
  if (!template.includes('export') || !template.includes('from')) {
    throw new Error(
      `Export template must be a valid export statement. Expected format: export * from "./path/{variable}" or export * as Name from "./path/{variable}"`
    );
  }

  // Check if the path in the 'from' clause is properly quoted
  const fromClauseMatch = template.match(/from\s+(['"]?)([^'"\s]+)(['"]?)/);
  
  if (!fromClauseMatch) {
    throw new Error(
      `Invalid export statement. Expected format: export * from "./path/{variable}" or export * as Name from "./path/{variable}"`
    );
  }

  const [, openQuote, pathContent, closeQuote] = fromClauseMatch;
  
  // Check if quotes are missing
  if (!openQuote || !closeQuote) {
    throw new Error(
      `Path in export template must be enclosed in quotes. Found: ${pathContent}\nCorrect format: export * from "./path/{variable}" or export * from './path/{variable}'`
    );
  }

  // Check if quotes match
  if (openQuote !== closeQuote) {
    throw new Error(
      `Mismatched quotes in export template. Opening quote '${openQuote}' does not match closing quote '${closeQuote}'.\nUse matching single quotes ('...') or double quotes ("...")`
    );
  }

  // Check if it contains variables
  if (!pathContent.includes('{') || !pathContent.includes('}')) {
    throw new Error(
      `Export template path must contain at least one variable in curly braces {variable}. Found path: ${pathContent}`
    );
  }

  return template;
}

// Template Configuration - New variable-based system
export const TemplateConfigSchema = z.object({
  name: z.string(),
  export: z.string().refine(validateExportTemplate, {
    message: "Invalid export template syntax"
  }), // Full export template with path variables - validated for proper quoting
  mode: z.enum(['replace', 'partial-replace']).default('replace'),
  requiredFile: z.string().optional(), // Only include directories containing this file
});

export const ProcessingOptionsSchema = z.object({
  followSymlinks: z.boolean().default(false),
  preserveExtensions: z.boolean().default(false),
  extensions: z.array(z.string()).default(['.ts', '.tsx']),
  validateExports: z.boolean().default(false),
  dryRun: z.boolean().default(false),
});

// Generation options for controlling output format
export const GenerationOptionsSchema = z
  .object({
    namedExports: z.boolean().default(true),
    preserveExtensions: z.boolean().default(false),
    sortExports: z.boolean().default(true),
    addBanner: z.boolean().default(true),
    customBanner: z.string().optional(),
    verbose: z.boolean().default(false),
  })
  .strict();

export type GenerationOptions = z.infer<typeof GenerationOptionsSchema>;

// New Variable-based Barrel Definition
export const VariableBarrelDefinitionSchema = z.object({
  name: z.string(),
  output: z.string(),
  template: TemplateConfigSchema,
  options: z
    .object({
      preserveExtensions: z.boolean().default(true),
      extensions: z.array(z.string()).default(['.ts']),
      validateExports: z.boolean().default(false),
      dryRun: z.boolean().default(false),
    })
    .optional(),
});

// Union type supporting both formats
export const BarrelDefinitionSchema = VariableBarrelDefinitionSchema;

export const BarrelConfigSchema = z.object({
  version: z.string(),
  barrels: z.array(BarrelDefinitionSchema),
  globalOptions: ProcessingOptionsSchema.optional(),
});

// TypeScript types derived from schemas
export type SourceConfig = z.infer<typeof SourceConfigSchema>;
export type ExportConfig = z.infer<typeof ExportConfigSchema>;
export type TemplateConfig = z.infer<typeof TemplateConfigSchema>;

// Variable extracted from path template
export interface PathVariable {
  name: string;
  value: string;
  casing: 'raw' | 'pascal' | 'camel' | 'kebab';
}
export type ProcessingOptions = z.infer<typeof ProcessingOptionsSchema>;
export type BarrelDefinition = z.infer<typeof BarrelDefinitionSchema>;
export type VariableBarrelDefinition = z.infer<typeof VariableBarrelDefinitionSchema>;

// Type guards
export function isVariableBarrelDefinition(def: BarrelDefinition): def is VariableBarrelDefinition {
  return def.template?.name === 'variable-template';
}
export type BarrelConfig = z.infer<typeof BarrelConfigSchema>;
export type MarkerConfig = z.infer<typeof MarkerConfigSchema>;

// Additional types for internal use
export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  relativePath: string;
  directory: string;
}

export interface ExportInfo {
  originalPath: string;
  exportPath: string;
  exportName: string;
  isDefault: boolean;
  isNamespace: boolean;
}

// Standardized Result type for consistent error handling
export type Result<T, E = Error> =
  | { success: true; data: T; warnings?: string[] }
  | { success: false; error: E; context?: Record<string, any> };

export interface GenerationResult {
  barrel: string;
  output: string;
  content: string;
  exports: ExportInfo[];
  warnings: string[];
  errors: string[];
}
