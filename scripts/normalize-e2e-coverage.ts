#!/usr/bin/env node

/**
 * Normalize E2E Coverage Paths
 * Converts absolute Docker paths to relative paths for NYC report generation
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface CoverageData {
  path?: string;
  inputSourceMap?: unknown;
  [key: string]: unknown;
}

const projectRoot = process.cwd();
const nycOutput = join(projectRoot, '.nyc_output');

// Get all Playwright coverage files
const coverageFiles = readdirSync(nycOutput).filter((f) => f.startsWith('playwright_coverage_'));

console.log(`🔧 Normalizing ${coverageFiles.length} E2E coverage files...`);

coverageFiles.forEach((file) => {
  const filePath = join(nycOutput, file);
  const data = JSON.parse(readFileSync(filePath, 'utf8')) as Record<string, CoverageData>;

  const normalized: Record<string, CoverageData> = {};

  for (const [absPath, coverage] of Object.entries(data)) {
    // Convert absolute Docker path to relative path
    const relativePath = absPath
      .replace('/workspace/slide-bar/', '')
      .replace(projectRoot + '/', '');

    // Update .path field to match the key
    if (coverage && coverage.path) {
      coverage.path = relativePath;
    }

    // Remove inputSourceMap to avoid errors
    if (coverage && coverage.inputSourceMap) {
      delete coverage.inputSourceMap;
    }

    normalized[relativePath] = coverage;
  }

  writeFileSync(filePath, JSON.stringify(normalized, null, 2));
});

console.log('✅ E2E coverage paths normalized');
