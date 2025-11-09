#!/usr/bin/env node

/**
 * Coverage Merge Script
 *
 * Merges coverage from multiple sources:
 * 1. Vitest unit/integration tests (V8 format)
 * 2. Playwright E2E tests (Istanbul format)
 *
 * Process:
 * 1. Convert Vitest V8 coverage to Istanbul format using c8
 * 2. Merge Istanbul coverage from .nyc_output/
 * 3. Generate combined coverage reports
 *
 * Exit codes:
 * - 0: Success
 * - 1: Error during merge process
 */

import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Check if coverage data exists
 */
function checkCoverageExists() {
  const vitestCoverage = join(projectRoot, '.test-output/coverage', 'coverage-final.json');
  const nycOutput = join(projectRoot, '.nyc_output');

  const hasVitestCoverage = existsSync(vitestCoverage);
  const hasPlaywrightCoverage = existsSync(nycOutput) && readdirSync(nycOutput).length > 0;

  return { hasVitestCoverage, hasPlaywrightCoverage };
}

/**
 * Normalize file paths to be consistent
 * Converts absolute paths (both local and Docker) to relative paths from project root
 */
function normalizePaths(coverageData) {
  const normalized = {};

  for (const [filePath, data] of Object.entries(coverageData)) {
    // Convert to relative path from project root
    let normalizedPath = filePath
      .replace('/workspace/slide-bar/', '')
      .replace(projectRoot + '/', '');

    // Also normalize the .path field to match the key
    // This is required by nyc but needs to match the normalized key
    if (data && data.path) {
      data.path = normalizedPath;
    }

    // Remove inputSourceMap to avoid source map errors with changed paths
    if (data && data.inputSourceMap) {
      delete data.inputSourceMap;
    }

    normalized[normalizedPath] = data;
  }

  return normalized;
}

/**
 * Copy and normalize Vitest coverage to .nyc_output
 */
function prepareVitestCoverage() {
  console.log('📦 Preparing Vitest coverage for merge...');

  const coverageFinal = join(projectRoot, '.test-output/coverage', 'coverage-final.json');

  if (!existsSync(coverageFinal)) {
    console.log('⚠️  No Vitest coverage found - run `pnpm test:coverage` first');
    return false;
  }

  try {
    // Create .nyc_output directory if it doesn't exist
    const nycOutput = join(projectRoot, '.nyc_output');
    mkdirSync(nycOutput, { recursive: true });

    // Read and normalize Vitest coverage paths
    const vitestData = JSON.parse(readFileSync(coverageFinal, 'utf8'));
    const normalizedData = normalizePaths(vitestData);

    // Write normalized Vitest coverage
    writeFileSync(join(nycOutput, 'vitest_coverage.json'), JSON.stringify(normalizedData, null, 2));

    console.log('✅ Vitest coverage prepared');
    return true;
  } catch (error) {
    console.error('❌ Failed to prepare Vitest coverage:', error.message);
    return false;
  }
}

/**
 * Normalize all Playwright coverage files
 */
function normalizePlaywrightCoverage() {
  const nycOutput = join(projectRoot, '.nyc_output');
  const coverageFiles = readdirSync(nycOutput).filter((f) => f.startsWith('playwright_coverage_'));

  console.log(`\n🔧 Normalizing ${coverageFiles.length} Playwright coverage files...`);

  coverageFiles.forEach((file) => {
    const filePath = join(nycOutput, file);
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    const normalized = normalizePaths(data);
    writeFileSync(filePath, JSON.stringify(normalized, null, 2));
  });

  console.log('✅ Playwright coverage paths normalized');
}

/**
 * Merge all coverage data using nyc
 */
function mergeCoverage() {
  console.log('\n🔀 Merging coverage from all sources...');

  const nycOutput = join(projectRoot, '.nyc_output');

  if (!existsSync(nycOutput)) {
    console.error('❌ No coverage data found to merge');
    return false;
  }

  const coverageFiles = readdirSync(nycOutput).filter((f) => f.endsWith('.json'));

  if (coverageFiles.length === 0) {
    console.error('❌ No coverage files found in .nyc_output/');
    return false;
  }

  console.log(`   Found ${coverageFiles.length} coverage file(s):`);
  coverageFiles.forEach((file) => {
    if (file.startsWith('vitest_')) {
      console.log(`   - ${file} (Vitest unit/integration tests)`);
    } else if (file.startsWith('playwright_')) {
      console.log(`   - ${file} (Playwright E2E tests)`);
    } else {
      console.log(`   - ${file}`);
    }
  });

  try {
    // Create merged-coverage directory structure
    const mergedDir = join(projectRoot, '.test-output/merged-coverage');
    const mergedNycOutput = join(mergedDir, '.nyc_output');
    mkdirSync(mergedNycOutput, { recursive: true });

    // Merge all coverage files using nyc into .nyc_output subdirectory
    execSync(`npx nyc merge .nyc_output ${join(mergedNycOutput, 'coverage.json')}`, {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    // Generate reports from merged coverage - exclude non-src paths
    execSync(
      `npx nyc report --temp-dir=${mergedNycOutput} --reporter=json-summary --reporter=text --reporter=html --report-dir=${mergedDir} --exclude='tests/**' --exclude='scripts/**' --exclude='**/*.config.js' --exclude='**/*.config.mjs'`,
      {
        cwd: projectRoot,
        stdio: 'inherit',
      }
    );

    console.log('\n✅ Coverage merged successfully!');
    console.log(`   Merged report: ${join(mergedDir, 'index.html')}`);
    console.log(`   View with: open .test-output/merged-coverage/index.html`);
    return true;
  } catch (error) {
    console.error('❌ Failed to merge coverage:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🧪 Merging coverage from Vitest + Playwright...\n');

  const { hasVitestCoverage, hasPlaywrightCoverage } = checkCoverageExists();

  if (!hasVitestCoverage && !hasPlaywrightCoverage) {
    console.error('❌ No coverage data found!');
    console.error('   Run tests first:');
    console.error('   - Vitest: pnpm test:coverage');
    console.error('   - Playwright: E2E_COVERAGE=true pnpm test:e2e');
    process.exit(1);
  }

  console.log('📊 Coverage sources found:');
  console.log(`   - Vitest: ${hasVitestCoverage ? '✅' : '❌'}`);
  console.log(`   - Playwright: ${hasPlaywrightCoverage ? '✅' : '❌'}`);
  console.log('');

  // Prepare Vitest coverage
  if (hasVitestCoverage) {
    const prepared = prepareVitestCoverage();
    if (!prepared) {
      process.exit(1);
    }
  }

  // Normalize Playwright coverage paths
  if (hasPlaywrightCoverage) {
    normalizePlaywrightCoverage();
  }

  // Merge all coverage
  const merged = mergeCoverage();
  if (!merged) {
    process.exit(1);
  }

  console.log('\n✨ Coverage merge complete!');
  console.log('   View report: open .test-output/merged-coverage/index.html');
  console.log('   Check thresholds: node scripts/check-coverage.js');
  process.exit(0);
}

main();
