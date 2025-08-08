import { promises as fs } from 'fs';
import path from 'path';
import { BarrelConfigSchema, type BarrelConfig } from './types.js';

export async function loadConfig(configPath: string): Promise<BarrelConfig> {
  const fullPath = path.resolve(configPath);

  try {
    const content = await fs.readFile(fullPath, 'utf-8');
    const rawConfig = JSON.parse(content);

    // Validate and parse the configuration using Zod
    const result = BarrelConfigSchema.safeParse(rawConfig);

    if (!result.success) {
      const errorMessages = result.error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n  ');

      throw new Error(`Configuration validation failed:\n  ${errorMessages}`);
    }

    return result.data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in configuration file: ${fullPath}`);
    }

    if ((error as any)?.code === 'ENOENT') {
      throw new Error(`Configuration file not found: ${fullPath}`);
    }

    throw error;
  }
}

export async function configExists(configPath: string = 'barrel.json'): Promise<boolean> {
  try {
    await fs.access(path.resolve(configPath));
    return true;
  } catch {
    return false;
  }
}

export async function createConfig(
  config: BarrelConfig,
  configPath: string = 'barrel.json'
): Promise<void> {
  const fullPath = path.resolve(configPath);
  const content = JSON.stringify(config, null, 2);

  await fs.writeFile(fullPath, content, 'utf-8');
}
