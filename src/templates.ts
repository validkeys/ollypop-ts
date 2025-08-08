import fs from 'fs';
import inflection from 'inflection';
import path from 'path';
import type { FileInfo, GenerationOptions } from './types.js';

export interface TemplateContext {
  files: FileInfo[];
  options: GenerationOptions;
  outputPath?: string;
  templateConfig?: any; // Will contain the template configuration
  banner?: string;
  metadata: {
    generatedAt: string;
    fileCount: number;
  };
}

export class TemplateEngine {
  private templates: Map<string, (context: TemplateContext) => string> = new Map();

  constructor() {
    this.registerDefaultTemplates();
  }

  private registerDefaultTemplates(): void {
    // Revolutionary variable-based template system
    this.templates.set('variable-template', (ctx) => this.generateVariableTemplate(ctx));
  }

  generate(templateName: string, context: TemplateContext): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    let content = template(context);

    // Add banner if provided
    if (context.banner) {
      content = this.addBanner(context.banner, content);
    }

    return content;
  }

  registerTemplate(name: string, template: (context: TemplateContext) => string): void {
    this.templates.set(name, template);
  }

  private toPascalCase(str: string): string {
    return str
      .replace(/[-_.]/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  private toCamelCase(str: string): string {
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  private toSingular(str: string): string {
    return inflection.singularize(str);
  }

  private toPlural(str: string): string {
    return inflection.pluralize(str);
  }

  private trimPrefix(str: string, prefixes?: string): string {
    // Parse prefixes parameter or use default
    const prefixList = prefixes ? prefixes.split(',').map((p) => p.trim()) : ['warehouse-', 'ops-']; // Default for backward compatibility

    for (const prefix of prefixList) {
      if (str.startsWith(prefix)) {
        return str.substring(prefix.length);
      }
    }
    return str;
  }

  private trimSuffix(str: string, suffixes?: string): string {
    // Parse suffixes parameter - no default, require explicit specification
    if (!suffixes) {
      console.warn('trimSuffix requires suffixes parameter, e.g., trimSuffix:Service,Manager');
      return str;
    }

    const suffixList = suffixes.split(',').map((s) => s.trim());

    for (const suffix of suffixList) {
      if (str.endsWith(suffix)) {
        return str.substring(0, str.length - suffix.length);
      }
    }
    return str;
  }

  private addPrefix(str: string, prefix?: string): string {
    if (!prefix) {
      console.warn('addPrefix requires prefix parameter, e.g., addPrefix:I,Base');
      return str;
    }

    return prefix + str;
  }

  private addSuffix(str: string, suffix?: string): string {
    if (!suffix) {
      console.warn('addSuffix requires suffix parameter, e.g., addSuffix:Factory,Service');
      return str;
    }

    return str + suffix;
  }

  private replaceText(str: string, replaceParams?: string): string {
    if (!replaceParams) {
      console.warn(
        'replace requires parameters, e.g., replace:old,new or replace:pattern1,replacement1;pattern2,replacement2'
      );
      return str;
    }

    // Support multiple replacements separated by semicolon
    const replacements = replaceParams.split(';');
    let result = str;

    for (const replacement of replacements) {
      const [search, replace] = replacement.split(',').map((s) => s.trim());
      if (search && replace !== undefined) {
        // Simple string replacement (not regex for security/simplicity)
        result = result.split(search).join(replace);
      }
    }

    return result;
  }

  private capitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private uncapitalize(str: string): string {
    if (!str) return str;
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  private addBanner(banner: string, content: string): string {
    const bannerLines = banner.split('\n').map((line) => `// ${line}`);
    return bannerLines.join('\n') + '\n\n' + content;
  }

  /**
   * Apply a single transformation to a string value
   * Supports parameterized transforms like: trimPrefix:warehouse-,ops- or addSuffix:Factory,Service
   */
  private applyTransform(value: string, transform: string): string {
    // Parse transform and parameters
    const [transformName, ...paramParts] = transform.split(':');
    const params = paramParts.join(':'); // Rejoin in case there were multiple colons

    switch (transformName.toLowerCase()) {
      case 'raw':
        return value;
      case 'camel':
        return this.toCamelCase(value);
      case 'kebab':
        return this.toKebabCase(value);
      case 'pascal':
        return this.toPascalCase(value);
      case 'singular':
        return this.toSingular(value);
      case 'plural':
        return this.toPlural(value);
      case 'trimprefix':
      case 'trim-prefix':
        return this.trimPrefix(value, params);
      case 'trimsuffix':
      case 'trim-suffix':
        return this.trimSuffix(value, params);
      case 'addprefix':
      case 'add-prefix':
        return this.addPrefix(value, params);
      case 'addsuffix':
      case 'add-suffix':
        return this.addSuffix(value, params);
      case 'replace':
        return this.replaceText(value, params);
      case 'uppercase':
        return value.toUpperCase();
      case 'lowercase':
        return value.toLowerCase();
      case 'capitalize':
        return this.capitalize(value);
      case 'uncapitalize':
        return this.uncapitalize(value);
      default:
        console.warn(
          `Unknown transformation: ${transformName}. Available: raw, camel, kebab, pascal, singular, plural, trimPrefix, trimSuffix, addPrefix, addSuffix, replace, uppercase, lowercase, capitalize, uncapitalize`
        );
        return value;
    }
  }

  /**
   * Revolutionary variable-based template system
   * Extracts variables from the path template and applies them to generate exports
   */
  private generateVariableTemplate(ctx: TemplateContext): string {
    const { templateConfig, outputPath } = ctx;

    if (!templateConfig?.export) {
      throw new Error('Variable template requires an "export" configuration');
    }

    const exportTemplate = templateConfig.export;

    // Extract path variables from the template
    const pathVariables = this.extractPathVariables(exportTemplate);

    if (pathVariables.length === 0) {
      throw new Error(
        'No path variables found in export template. Use {variableName} in the path portion.'
      );
    }

    // Determine working directory from the export template pattern
    // Extract the base path before the first variable
    // Support both "export * from" and "export * as Name from" patterns
    // Use a more flexible regex to find the 'from' clause and extract the path before variables
    const exportPathMatch = exportTemplate.match(/from ['"]([^'"]*)\{/);
    
    if (!exportPathMatch) {
      throw new Error(
        'Cannot determine path from export template. Expected format: export * from "./path/{variable}/..." or export * as Name from "./path/{variable}/..."'
      );
    }

    let exportPath = exportPathMatch[1];

    // Remove the final slash if present
    if (exportPath.endsWith('/')) {
      exportPath = exportPath.slice(0, -1);
    }

    // Resolve the export path relative to the output file's directory
    let workingDirectory: string;

    if (exportPath.startsWith('./')) {
      // Path is relative to the output file's directory
      const outputDir = path.dirname(outputPath || '.');
      const relativePath = exportPath.substring(2); // Remove './'

      if (!relativePath || relativePath === '.' || relativePath === '') {
        // export * from './{variable}/...' - scan from output directory
        workingDirectory = outputDir;
      } else {
        // export * from './some/path/{variable}/...' - resolve relative to output directory
        workingDirectory = path.join(outputDir, relativePath);
      }
    } else if (exportPath.startsWith('../')) {
      throw new Error('Export templates cannot use parent directory references (../)');
    } else {
      // Absolute path or no leading ./
      // For cases like "." (current directory), use the output directory instead
      if (exportPath === '.') {
        workingDirectory = path.dirname(outputPath || '.');
      } else {
        workingDirectory = exportPath || '.';
      }
    }

    // Scan for matching directory structures or files
    const matchingPaths = this.findMatchingPaths(
      workingDirectory,
      pathVariables,
      exportTemplate,
      outputPath
    );

    // Filter to only include paths where the target file actually exists
    const filteredPaths = this.filterExistingFiles(
      matchingPaths,
      exportTemplate,
      outputPath || '.'
    );

    // Generate export statements
    const lines: string[] = [];

    for (const pathMatch of filteredPaths) {
      const resolvedExport = this.resolveVariableTemplate(exportTemplate, pathMatch.variables);
      lines.push(resolvedExport);
    }

    return lines.join('\n') + '\n';
  }

  /**
   * Extract variable names from the path portion of the template
   * e.g., "./{namespace}/{handler}/index.ts" → ["namespace", "handler"]
   */
  private extractPathVariables(template: string): string[] {
    const pathPattern = /\{([^}:]+)(?::(\w+))?\}/g;
    const variables: string[] = [];
    let match;

    while ((match = pathPattern.exec(template)) !== null) {
      const varName = match[1];
      if (!variables.includes(varName)) {
        variables.push(varName);
      }
    }

    return variables;
  }

  /**
   * Detect if this is a file-based pattern by checking if variables are followed by file extensions
   * e.g., "export * from './{file}.ts'" -> true
   * e.g., "export * from './{dir}/index.ts'" -> false
   */
  private isFileBasedPattern(template: string): boolean {
    // Look for patterns like {variable}.ext where ext is a common file extension
    const fileExtensionPattern = /\{[^}:]+(?::[^}]+)?\}\.(ts|js|tsx|jsx|json|md)(?:['"`]|$)/;
    
    // Also look for patterns using the word "file" as a variable name
    const fileVariablePattern = /\{file(?::[^}]+)?\}/;
    
    return fileExtensionPattern.test(template) || fileVariablePattern.test(template);
  }

  /**
   * Find all paths (files or directories) that match the variable pattern
   */
  private findMatchingPaths(
    cwd: string,
    pathVariables: string[],
    exportTemplate: string,
    outputPath?: string
  ): Array<{
    path: string;
    variables: Map<string, { value: string; casing: string }>;
  }> {
    const results: Array<{
      path: string;
      variables: Map<string, { value: string; casing: string }>;
    }> = [];

    try {
      const entries = fs.readdirSync(cwd, { withFileTypes: true });

      // Determine if we're scanning for files or directories based on the export template
      const isFileBasedPattern = this.isFileBasedPattern(exportTemplate);

      if (isFileBasedPattern) {
        // Scan for files when pattern includes file extensions
        const files = entries
          .filter((entry: any) => entry.isFile() && entry.name.endsWith('.ts'))
          .map((entry: any) => entry.name);

        // For single variable {file}, map each file (without extension)
        if (pathVariables.length === 1) {
          for (const file of files) {
            // Skip the output file itself to avoid self-reference
            if (outputPath && path.basename(outputPath) === file) {
              continue;
            }

            const fileNameWithoutExt = path.parse(file).name;
            const variables = new Map([
              [pathVariables[0], { value: fileNameWithoutExt, casing: 'raw' }],
            ]);

            results.push({
              path: `${cwd}/${file}`,
              variables,
            });
          }
        }
      } else {
        // Original directory-based scanning
        const directories = entries
          .filter((entry: any) => entry.isDirectory())
          .map((entry: any) => entry.name);

        // For single variable {dir}, map each directory
        if (pathVariables.length === 1) {
          for (const dir of directories) {
            const variables = new Map([[pathVariables[0], { value: dir, casing: 'raw' }]]);

            results.push({
              path: `${cwd}/${dir}`,
              variables,
            });
          }
        }
      }

      // TODO: Handle multi-level variables like {parent}/{child}
      // This would require recursive directory scanning
    } catch (error) {
      console.warn(`Warning: Could not scan directory ${cwd}:`, error);
    }

    return results;
  }

  /**
   * Filter paths based on whether the target file exists
   * For directory-based templates: "export * from ./handlers/{dir:raw}/interface.js"
   * This checks if ./handlers/{dir}/interface.ts actually exists
   * For file-based templates: "export * from './{file}.ts'"
   * This checks if ./{file}.ts actually exists (always true since we scanned for existing files)
   */
  private filterExistingFiles(
    paths: Array<{
      path: string;
      variables: Map<string, { value: string; casing: string }>;
    }>,
    exportTemplate: string,
    outputPath: string
  ): Array<{
    path: string;
    variables: Map<string, { value: string; casing: string }>;
  }> {
    // For file-based patterns, we already scanned for existing files, so no additional filtering needed
    const isFileBasedPattern = this.isFileBasedPattern(exportTemplate);
    if (isFileBasedPattern) {
      return paths;
    }

    // Original directory-based filtering logic
    return paths.filter((pathMatch) => {
      // Resolve the template to get the actual import path
      let resolvedPath = exportTemplate;

      // Replace variables in the path
      for (const [varName, varData] of pathMatch.variables) {
        // Enhanced pattern matching with chained transformations
        // Supports: {var}, {var:transform}, {var:transform1|transform2|transform3}
        const variablePattern = new RegExp(`\\{${varName}(?::([^}]+))?\\}`, 'g');
        let match;

        while ((match = variablePattern.exec(resolvedPath)) !== null) {
          const fullMatch = match[0];
          const transformChain = match[1] || ''; // Empty string means default (PascalCase)

          let transformedValue = varData.value;

          if (transformChain) {
            // Split by | to get individual transforms
            const transforms = transformChain.split('|');

            for (const transform of transforms) {
              transformedValue = this.applyTransform(transformedValue, transform.trim());
            }
          } else {
            // Default transformation is PascalCase
            transformedValue = this.toPascalCase(transformedValue);
          }

          // Replace this specific occurrence
          resolvedPath = resolvedPath.replace(fullMatch, transformedValue);

          // Reset regex lastIndex to handle multiple occurrences
          variablePattern.lastIndex = 0;
        }
      }

      // Extract the file path from the export statement
      // Handle patterns like "export * from './path/to/file'"
      const importMatch = resolvedPath.match(/from\s+['"`]([^'"`]+)['"`]/);
      if (!importMatch) {
        return false;
      }

      let importPath = importMatch[1];

      // Convert relative path to absolute - resolve relative to output file's directory
      const outputDir = path.dirname(outputPath || '.');
      if (importPath.startsWith('./')) {
        importPath = path.join(outputDir, importPath.substring(2));
      } else if (importPath.startsWith('../')) {
        importPath = path.resolve(outputDir, importPath);
      }

      // Convert .js extension back to .ts for checking
      const tsPath = importPath.replace(/\.js$/, '.ts');
      const exists = fs.existsSync(tsPath);

      // Check if the file exists
      return exists;
    });
  }

  /**
   * Resolve the template by substituting variables
   */
  private resolveVariableTemplate(
    template: string,
    variables: Map<string, { value: string; casing: string }>
  ): string {
    let result = template;

    // Replace each variable with its value, applying chained transformations
    for (const [varName, varData] of variables) {
      // Enhanced pattern matching with chained transformations
      // Supports: {var}, {var:transform}, {var:transform1|transform2|transform3}
      const variablePattern = new RegExp(`\\{${varName}(?::([^}]+))?\\}`, 'g');
      let match;

      while ((match = variablePattern.exec(result)) !== null) {
        const fullMatch = match[0];
        const transformChain = match[1] || ''; // Empty string means default (PascalCase)

        let transformedValue = varData.value;

        if (transformChain) {
          // Split by | to get individual transforms
          const transforms = transformChain.split('|');

          for (const transform of transforms) {
            transformedValue = this.applyTransform(transformedValue, transform.trim());
          }
        } else {
          // Default transformation is PascalCase
          transformedValue = this.toPascalCase(transformedValue);
        }

        // Replace this specific occurrence
        result = result.replace(fullMatch, transformedValue);

        // Reset regex lastIndex to handle multiple occurrences
        variablePattern.lastIndex = 0;
      }
    }

    return result;
  }
}
