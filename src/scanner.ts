import { promises as fs } from 'fs'
import { glob } from 'glob'
import path from 'path'
import type { FileInfo, ProcessingOptions, SourceConfig } from './types.js'

export class FileScanner {
  private options: ProcessingOptions

  constructor(options: Partial<ProcessingOptions> = {}) {
    this.options = {
      followSymlinks: false,
      preserveExtensions: false,
      extensions: ['.ts', '.tsx'],
      validateExports: false,
      dryRun: false,
      ...options
    }
  }

  async scanSources(
    sources: SourceConfig[],
    excludePatterns: string[] = []
  ): Promise<FileInfo[]> {
    const allFiles: FileInfo[] = []

    for (const source of sources) {
      const files = await this.scanSource(source, excludePatterns)
      allFiles.push(...files)
    }

    // Remove duplicates based on path
    const uniqueFiles = allFiles.filter(
      (file, index, array) =>
        array.findIndex(f => f.path === file.path) === index
    )

    return uniqueFiles
  }

  private async scanSource(
    source: SourceConfig,
    excludePatterns: string[]
  ): Promise<FileInfo[]> {
    const {
      path: sourcePath,
      recursive = false,
      maxDepth,
      pattern = '*.ts',
      directoryPattern = false,
      indexFile = 'index.js'
    } = source

    // Handle directory-based patterns
    if (directoryPattern) {
      return this.scanDirectories(
        sourcePath,
        indexFile,
        excludePatterns,
        recursive,
        maxDepth
      )
    }

    // Original file-based scanning logic
    // Build glob pattern
    let globPattern: string
    if (recursive) {
      const depthPattern = maxDepth ? `{,${'/'.repeat(maxDepth - 1)}}` : '**'
      globPattern = path.join(sourcePath, depthPattern, pattern)
    } else {
      globPattern = path.join(sourcePath, pattern)
    }

    // Find files
    const files = await glob(globPattern, {
      ignore: excludePatterns,
      absolute: false
    })

    // Filter by extensions if specified
    const filteredFiles = files.filter(file => {
      const ext = path.extname(file)
      return this.options.extensions!.includes(ext)
    })

    // Convert to FileInfo objects
    const fileInfos: FileInfo[] = []
    for (const file of filteredFiles) {
      const fileInfo = await this.createFileInfo(file)
      if (fileInfo) {
        fileInfos.push(fileInfo)
      }
    }

    return fileInfos
  }

  /**
   * Scan for directories containing a specific index file
   */
  private async scanDirectories(
    sourcePath: string,
    indexFile: string,
    excludePatterns: string[],
    recursive = false,
    maxDepth?: number
  ): Promise<FileInfo[]> {
    const directories: FileInfo[] = []

    try {
      const entries = await fs.readdir(sourcePath, { withFileTypes: true })

      for (const entry of entries) {
        if (!entry.isDirectory()) continue

        const dirPath = path.join(sourcePath, entry.name)
        const indexPath = path.join(dirPath, indexFile)

        // Check if this directory should be excluded
        const isExcluded = excludePatterns.some(pattern => {
          const globPattern = pattern.replace(/\*\*/g, '**')
          return path
            .relative(process.cwd(), dirPath)
            .includes(globPattern.replace('**/', ''))
        })

        if (isExcluded) continue

        // Check if the index file exists
        try {
          await fs.access(indexPath)

          // Create a FileInfo that represents the directory export
          const relativeIndexPath = path.relative(process.cwd(), indexPath)
          const relativeFromOutput = path.relative(
            path.dirname(indexPath.replace(entry.name + '/' + indexFile, '')),
            indexPath
          )

          directories.push({
            path: indexPath,
            name: entry.name, // Use directory name as the identifier
            extension: path.extname(indexFile),
            relativePath: relativeIndexPath,
            directory: dirPath
          })
        } catch {
          // Index file doesn't exist, skip this directory
        }
      }

      // Handle recursive scanning if needed
      if (recursive) {
        for (const entry of entries) {
          if (!entry.isDirectory()) continue

          const dirPath = path.join(sourcePath, entry.name)
          const currentDepth = 1

          if (!maxDepth || currentDepth < maxDepth) {
            const nestedDirs = await this.scanDirectories(
              dirPath,
              indexFile,
              excludePatterns,
              true,
              maxDepth ? maxDepth - 1 : undefined
            )
            directories.push(...nestedDirs)
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Could not scan directory: ${sourcePath}`)
    }

    return directories
  }

  private async createFileInfo(filePath: string): Promise<FileInfo | null> {
    try {
      const stats = await fs.stat(filePath)
      if (!stats.isFile()) {
        return null
      }

      const parsed = path.parse(filePath)
      const relativePath = path.relative(process.cwd(), filePath)

      return {
        path: filePath,
        name: parsed.name,
        extension: parsed.ext,
        relativePath,
        directory: parsed.dir
      }
    } catch (error) {
      console.warn(`⚠️ Could not process file: ${filePath}`)
      return null
    }
  }

  async validateFile(filePath: string): Promise<boolean> {
    if (!this.options.validateExports) {
      return true
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8')

      // Basic check for export statements
      const hasExports = /export\s+/.test(content)

      if (!hasExports) {
        console.warn(`⚠️ File has no exports: ${filePath}`)
        return false
      }

      return true
    } catch (error) {
      console.warn(`⚠️ Could not validate file: ${filePath}`)
      return false
    }
  }
}
