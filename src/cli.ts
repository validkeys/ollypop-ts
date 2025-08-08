#!/usr/bin/env node

import { Command } from 'commander'
import { promises as fs } from 'fs'
import { loadConfig } from './config-loader.js'
import { BarrelGenerator } from './generator.js'

const program = new Command()

program
  .name('internal-barrel-maker')
  .description('Generate barrel files for TypeScript projects')
  .version('1.0.0')

program
  .command('generate')
  .description('Generate barrel files based on configuration')
  .option(
    '-c, --config <path>',
    'Path to configuration file',
    'barrel.config.json'
  )
  .option('-d, --dry-run', 'Show what would be generated without writing files')
  .option('--silent', 'Suppress console output')
  .option('--verbose', 'Show detailed output')
  .option(
    '-t, --task <names>',
    'Comma-separated list of barrel names to generate (default: all)'
  )
  .action(async options => {
    try {
      const { config: configPath, dryRun, silent, verbose, task } = options

      if (silent) {
        console.log = () => {} // Suppress output
      }

      if (!silent) {
        console.log(`🔧 Loading configuration from: ${configPath}`)
      }

      // Load and validate configuration
      const config = await loadConfig(configPath)

      if (verbose && !silent) {
        console.log(`📋 Configuration loaded:`)
        console.log(`   Version: ${config.version}`)
        console.log(`   Barrels: ${config.barrels.length}`)
        if (config.globalOptions) {
          console.log(
            `   Global options: ${JSON.stringify(config.globalOptions, null, 2)}`
          )
        }
      }

      // Filter barrels by task names if specified
      if (task) {
        const taskNames = task.split(',').map((name: string) => name.trim())
        const originalCount = config.barrels.length
        const originalBarrels = [...config.barrels]

        config.barrels = config.barrels.filter(barrel =>
          taskNames.includes(barrel.name)
        )

        if (!silent) {
          console.log(`🎯 Filtering to tasks: ${taskNames.join(', ')}`)
          console.log(
            `   Selected ${config.barrels.length} of ${originalCount} barrels`
          )
        }

        if (config.barrels.length === 0) {
          console.error(
            `❌ No barrels found matching task names: ${taskNames.join(', ')}`
          )
          console.error(
            `Available barrels: ${originalBarrels.map(b => b.name).join(', ')}`
          )
          process.exit(1)
        }
      }

      // Apply dry-run to all barrel definitions if specified
      if (dryRun) {
        config.barrels = config.barrels.map(barrel => ({
          ...barrel,
          options: {
            followSymlinks: false,
            preserveExtensions: false,
            extensions: ['.ts', '.tsx'],
            validateExports: false,
            ...barrel.options,
            dryRun: true
          }
        }))
      }

      // Generate barrels
      const generator = new BarrelGenerator()
      await generator.generateBarrels(config.barrels)

      if (!silent) {
        console.log(`✅ Barrel generation complete!`)
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)

      console.error(`❌ Generation failed: ${errorMessage}`)

      // Provide helpful context for common errors
      if (errorMessage.includes('Configuration file not found')) {
        console.error(`\n💡 Tip: Create a configuration file with:`)
        console.error(`   npx internal-barrel-maker init`)
      } else if (errorMessage.includes('Configuration validation failed')) {
        console.error(
          `\n💡 Tip: Check your configuration syntax and required fields`
        )
      } else if (errorMessage.includes('No files found')) {
        console.error(`\n💡 Tip: Check your source paths and patterns`)
      }

      process.exit(1)
    }
  })

program
  .command('init')
  .description('Create a sample configuration file')
  .option('-f, --force', 'Overwrite existing configuration file')
  .option('-t, --template <name>', 'Configuration template to use', 'basic')
  .action(async options => {
    try {
      const configPath = 'barrel.config.json'
      const { force, template } = options

      // Check if config already exists
      const exists = await fs
        .access(configPath)
        .then(() => true)
        .catch(() => false)

      if (exists && !force) {
        console.error(`❌ Configuration file already exists: ${configPath}`)
        console.log(`Use --force to overwrite`)
        process.exit(1)
      }

      // Generate sample configuration
      const sampleConfig = generateSampleConfig(template)

      await fs.writeFile(
        configPath,
        JSON.stringify(sampleConfig, null, 2),
        'utf-8'
      )

      console.log(`✅ Created configuration file: ${configPath}`)
      console.log(`📝 Edit the configuration to match your project structure`)
    } catch (error) {
      console.error(
        `❌ Error creating configuration: ${error instanceof Error ? error.message : String(error)}`
      )
      process.exit(1)
    }
  })

program
  .command('validate')
  .description('Validate a configuration file')
  .option(
    '-c, --config <path>',
    'Path to configuration file',
    'barrel.config.json'
  )
  .action(async options => {
    try {
      const { config: configPath } = options

      console.log(`🔍 Validating configuration: ${configPath}`)

      const config = await loadConfig(configPath)

      console.log(`✅ Configuration is valid!`)
      console.log(`📋 Summary:`)
      console.log(`   Version: ${config.version}`)
      console.log(`   Barrels: ${config.barrels.length}`)

      for (const barrel of config.barrels) {
        console.log(`   - ${barrel.name}: variable template → ${barrel.output}`)
      }
    } catch (error) {
      console.error(
        `❌ Configuration validation failed: ${error instanceof Error ? error.message : String(error)}`
      )
      process.exit(1)
    }
  })

function generateSampleConfig(template: string) {
  const baseConfig = {
    version: '1.0',
    barrels: [
      {
        name: 'main',
        output: './src/index.ts',
        sources: [
          {
            path: './src/components',
            recursive: true,
            pattern: '*.ts'
          }
        ],
        exclude: ['**/*.test.ts', '**/*.spec.ts', '**/index.ts'],
        exports: {
          style: 'named',
          defaultExports: 'ignore'
        },
        template: {
          name: 'standard',
          addBanner: true
        },
        options: {
          validateExports: true,
          dryRun: false
        }
      }
    ],
    globalOptions: {
      extensions: ['.ts', '.tsx'],
      followSymlinks: false
    }
  }

  switch (template) {
    case 'multi':
      return {
        ...baseConfig,
        barrels: [
          ...baseConfig.barrels,
          {
            name: 'types',
            output: './src/types/index.ts',
            sources: [
              {
                path: './src/types',
                pattern: '*.ts'
              }
            ],
            exclude: ['**/index.ts'],
            exports: {
              style: 'named'
            },
            template: {
              name: 'types-only'
            }
          }
        ]
      }

    case 'grouped':
      return {
        ...baseConfig,
        barrels: [
          {
            ...baseConfig.barrels[0],
            template: {
              name: 'grouped',
              addBanner: true
            }
          }
        ]
      }

    default:
      return baseConfig
  }
}

// Handle uncaught errors
process.on('uncaughtException', error => {
  console.error(`💥 Uncaught exception: ${error.message}`)
  process.exit(1)
})

process.on('unhandledRejection', reason => {
  console.error(`💥 Unhandled rejection: ${reason}`)
  process.exit(1)
})

program.parse()
