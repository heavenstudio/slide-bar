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

interface CoverageExists {
  hasVitestCoverage: boolean;
  hasPlaywrightCoverage: boolean;
}

interface CoverageData {
  path?: string;
  inputSourceMap?: unknown;
  [key: string]: unknown;
}

/**
 * Check if coverage data exists
 */
function checkCoverageExists(): CoverageExists {
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
function normalizePaths(coverageData: Record<string, CoverageData>): Record<string, CoverageData> {
  const normalized: Record<string, CoverageData> = {};

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
function prepareVitestCoverage(): boolean {
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
    const vitestData = JSON.parse(readFileSync(coverageFinal, 'utf8')) as Record<
      string,
      CoverageData
    >;
    const normalizedData = normalizePaths(vitestData);

    // Write normalized Vitest coverage
    writeFileSync(join(nycOutput, 'vitest_coverage.json'), JSON.stringify(normalizedData, null, 2));

    console.log('✅ Vitest coverage prepared');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to prepare Vitest coverage:', errorMessage);
    return false;
  }
}

/**
 * Normalize all Playwright coverage files
 */
function normalizePlaywrightCoverage(): void {
  const nycOutput = join(projectRoot, '.nyc_output');
  const coverageFiles = readdirSync(nycOutput).filter((f) => f.startsWith('playwright_coverage_'));

  console.log(`\n🔧 Normalizing ${coverageFiles.length} Playwright coverage files...`);

  coverageFiles.forEach((file) => {
    const filePath = join(nycOutput, file);
    const data = JSON.parse(readFileSync(filePath, 'utf8')) as Record<string, CoverageData>;
    const normalized = normalizePaths(data);
    writeFileSync(filePath, JSON.stringify(normalized, null, 2));
  });

  console.log('✅ Playwright coverage paths normalized');
}

/**
 * Merge all coverage data using nyc
 */
function mergeCoverage(): boolean {
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
    const tempE2EDir = join(projectRoot, '.test-output/temp-e2e');
    const tempFinalDir = join(projectRoot, '.test-output/temp-final');

    mkdirSync(mergedNycOutput, { recursive: true });
    mkdirSync(tempE2EDir, { recursive: true });
    mkdirSync(tempFinalDir, { recursive: true });

    // Step 1: Merge all Playwright E2E coverage files together first
    const playwrightFiles = coverageFiles.filter((f) => f.startsWith('playwright_'));
    const vitestFile = coverageFiles.find((f) => f.startsWith('vitest_'));

    if (playwrightFiles.length > 0) {
      console.log(`\n📦 Step 1: Merging ${playwrightFiles.length} E2E coverage files...`);

      // Copy playwright files to temp directory
      playwrightFiles.forEach((file) => {
        execSync(`cp ${join(nycOutput, file)} ${tempE2EDir}/`, { cwd: projectRoot });
      });

      // Merge E2E files
      execSync(`npx nyc merge ${tempE2EDir} ${join(tempFinalDir, 'e2e_merged.json')}`, {
        cwd: projectRoot,
        stdio: 'pipe',
      });
      console.log('✅ E2E coverage files merged');
    }

    // Step 2: Merge the consolidated E2E coverage with Vitest coverage
    console.log('\n📦 Step 2: Merging E2E + Vitest coverage...');

    // Copy vitest coverage to final temp directory
    if (vitestFile) {
      execSync(`cp ${join(nycOutput, vitestFile)} ${tempFinalDir}/`, { cwd: projectRoot });
    }

    // Merge E2E + Vitest
    execSync(`npx nyc merge ${tempFinalDir} ${join(mergedNycOutput, 'coverage.json')}`, {
      cwd: projectRoot,
      stdio: 'inherit',
    });

    // Clean up temp directories
    execSync(`rm -rf ${tempE2EDir} ${tempFinalDir}`, { cwd: projectRoot });

    // Generate reports from merged coverage - exclude non-src paths
    execSync(
      `npx nyc report --temp-dir=${mergedNycOutput} --reporter=json-summary --reporter=text --reporter=html --report-dir=${mergedDir} --exclude='tests/**' --exclude='scripts/**' --exclude='**/*.config.ts' --exclude='**/*.config.js' --exclude='**/*.config.mjs'`,
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Failed to merge coverage:', errorMessage);
    return false;
  }
}

/**
 * Main execution
 */
function main(): void {
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
  console.log('   Check thresholds: node scripts/check-coverage.ts');
  process.exit(0);
}

main();
