#!/usr/bin/env node

/**
 * Coverage Enforcement Script
 * Enforces testing standards defined in .claude/skills/testing-standards.md
 *
 * Checks coverage from two separate targets:
 * 1. Vitest unit/integration tests - REQUIRED, enforces thresholds
 * 2. Playwright E2E tests - OPTIONAL, informational only
 *
 * Exit codes:
 * - 0: Unit test coverage thresholds met
 * - 1: Critical violations in unit tests (blocks build)
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Coverage thresholds from testing-standards.md
const THRESHOLDS = {
  // Unit test thresholds (detailed coverage including edge cases)
  UNIT_OVERALL_MIN: 85, // Absolute minimum - blocks if below
  UNIT_TSX_MIN: 90, // Individual TSX files must have at least 90% - blocks if below
  UNIT_LIB_MIN: 85, // Individual lib files must have at least 85% - blocks if below

  // E2E test thresholds (happy path coverage for major features)
  E2E_OVERALL_MIN: 60, // Minimum overall E2E coverage - blocks if below
  E2E_PAGE_MIN: 70, // Pages must be well-covered (user-facing) - blocks if below

  // Targets (warnings if below, but doesn't block)
  OVERALL_TARGET: 90,
  TSX_TARGET: 100, // Goal for TSX files
  LIB_TARGET: 95, // Goal for lib files
};

// Files to exclude from TSX coverage checks (entry points)
const TSX_EXCLUSIONS = ['App.tsx', 'main.tsx'];

interface CoverageMetrics {
  total: number;
  covered: number;
  skipped: number;
  pct: number;
}

interface FileCoverage {
  lines: CoverageMetrics;
  statements: CoverageMetrics;
  functions: CoverageMetrics;
  branches: CoverageMetrics;
}

interface CoverageSummary {
  total: FileCoverage;
  [filePath: string]: FileCoverage;
}

interface CoverageReport {
  data: CoverageSummary;
  label: string;
}

interface Violation {
  type: string;
  message: string;
  current: number;
  threshold: number;
  file?: string;
  uncoveredLines?: number;
}

interface Violations {
  critical: Violation[];
  warnings: Violation[];
}

/**
 * Load coverage data from a specific path
 */
function loadCoverageData(coveragePath: string, label: string): CoverageReport | null {
  try {
    if (!existsSync(coveragePath)) {
      return null;
    }
    const data = readFileSync(coveragePath, 'utf8');
    return { data: JSON.parse(data) as CoverageSummary, label };
  } catch {
    console.error(`⚠️  WARNING: Could not read ${label} coverage report`);
    return null;
  }
}

/**
 * Load all available coverage reports
 */
function loadAllCoverageReports(): Record<string, CoverageReport> {
  const reports: Record<string, CoverageReport> = {};

  // Vitest coverage (unit/integration tests) - REQUIRED
  const vitestPath = join(__dirname, '../.test-output/coverage/coverage-summary.json');
  const vitestCoverage = loadCoverageData(vitestPath, 'Unit Tests (Vitest)');
  if (vitestCoverage) {
    reports.vitest = vitestCoverage;
  }

  // E2E coverage (Playwright) - OPTIONAL
  const e2ePath = join(__dirname, '../.test-output/e2e-coverage/coverage-summary.json');
  const e2eCoverage = loadCoverageData(e2ePath, 'E2E Tests (Playwright)');
  if (e2eCoverage) {
    reports.e2e = e2eCoverage;
  }

  if (!reports.vitest) {
    console.error('❌ ERROR: No unit test coverage found');
    console.error('   Run `pnpm test:coverage` first');
    process.exit(1);
  }

  return reports;
}

/**
 * Check if file should be excluded from TSX coverage requirements
 */
function isExcludedTSX(filePath: string): boolean {
  return TSX_EXCLUSIONS.some((excluded) => filePath.endsWith(excluded));
}

/**
 * Check overall unit test coverage thresholds
 */
function checkUnitOverallCoverage(total: FileCoverage, violations: Violations): void {
  if (total.lines.pct < THRESHOLDS.UNIT_OVERALL_MIN) {
    violations.critical.push({
      type: 'UNIT_OVERALL_MIN',
      message: `Overall unit test coverage ${total.lines.pct.toFixed(2)}% is below minimum ${THRESHOLDS.UNIT_OVERALL_MIN}%`,
      current: total.lines.pct,
      threshold: THRESHOLDS.UNIT_OVERALL_MIN,
    });
  }

  if (total.lines.pct < THRESHOLDS.OVERALL_TARGET) {
    violations.warnings.push({
      type: 'OVERALL_TARGET',
      message: `Overall coverage ${total.lines.pct.toFixed(2)}% is below target ${THRESHOLDS.OVERALL_TARGET}%`,
      current: total.lines.pct,
      threshold: THRESHOLDS.OVERALL_TARGET,
    });
  }
}

/**
 * Check overall E2E coverage thresholds
 */
function checkE2EOverallCoverage(total: FileCoverage, violations: Violations): void {
  if (total.lines.pct < THRESHOLDS.E2E_OVERALL_MIN) {
    violations.critical.push({
      type: 'E2E_OVERALL_MIN',
      message: `E2E coverage ${total.lines.pct.toFixed(2)}% is below minimum ${THRESHOLDS.E2E_OVERALL_MIN}% - major features must have happy path coverage`,
      current: total.lines.pct,
      threshold: THRESHOLDS.E2E_OVERALL_MIN,
    });
  }
}

/**
 * Check TSX file coverage for unit tests
 */
function checkUnitTSXFileCoverage(
  filePath: string,
  fileData: FileCoverage,
  violations: Violations
): void {
  if (fileData.lines.pct === 0) {
    violations.critical.push({
      type: 'TSX_NO_TESTS',
      file: filePath,
      message: `TSX file has 0% coverage - MUST have at least a render test`,
      current: 0,
      threshold: THRESHOLDS.UNIT_TSX_MIN,
    });
  } else if (fileData.lines.pct < THRESHOLDS.UNIT_TSX_MIN) {
    violations.critical.push({
      type: 'TSX_BELOW_MIN',
      file: filePath,
      message: `TSX file has ${fileData.lines.pct.toFixed(2)}% coverage (minimum: ${THRESHOLDS.UNIT_TSX_MIN}%)`,
      current: fileData.lines.pct,
      threshold: THRESHOLDS.UNIT_TSX_MIN,
      uncoveredLines: fileData.lines.total - fileData.lines.covered,
    });
  } else if (fileData.lines.pct < THRESHOLDS.TSX_TARGET) {
    violations.warnings.push({
      type: 'TSX_BELOW_TARGET',
      file: filePath,
      message: `TSX file has ${fileData.lines.pct.toFixed(2)}% coverage (target: ${THRESHOLDS.TSX_TARGET}%)`,
      current: fileData.lines.pct,
      threshold: THRESHOLDS.TSX_TARGET,
      uncoveredLines: fileData.lines.total - fileData.lines.covered,
    });
  }
}

/**
 * Check page coverage for E2E tests (happy path focus)
 */
function checkE2EPageCoverage(
  filePath: string,
  fileData: FileCoverage,
  violations: Violations
): void {
  if (fileData.lines.pct < THRESHOLDS.E2E_PAGE_MIN) {
    violations.critical.push({
      type: 'E2E_PAGE_BELOW_MIN',
      file: filePath,
      message: `Page has ${fileData.lines.pct.toFixed(2)}% E2E coverage (minimum: ${THRESHOLDS.E2E_PAGE_MIN}%) - major user flows must be tested`,
      current: fileData.lines.pct,
      threshold: THRESHOLDS.E2E_PAGE_MIN,
      uncoveredLines: fileData.lines.total - fileData.lines.covered,
    });
  }
}

/**
 * Analyze unit test coverage and return violations
 */
function analyzeUnitCoverage(coverage: CoverageSummary): Violations {
  const violations: Violations = { critical: [], warnings: [] };

  checkUnitOverallCoverage(coverage.total, violations);

  for (const [filePath, fileData] of Object.entries(coverage)) {
    if (filePath === 'total') continue;

    const isTSX = filePath.endsWith('.tsx');
    const isExcluded = isExcludedTSX(filePath);

    if (isTSX && !isExcluded) {
      checkUnitTSXFileCoverage(filePath, fileData, violations);
    }

    if (filePath.includes('/lib/')) {
      if (fileData.lines.pct < THRESHOLDS.UNIT_LIB_MIN) {
        violations.critical.push({
          type: 'LIB_BELOW_MIN',
          file: filePath,
          message: `Lib file has ${fileData.lines.pct.toFixed(2)}% coverage (minimum: ${THRESHOLDS.UNIT_LIB_MIN}%)`,
          current: fileData.lines.pct,
          threshold: THRESHOLDS.UNIT_LIB_MIN,
        });
      } else if (fileData.lines.pct < THRESHOLDS.LIB_TARGET) {
        violations.warnings.push({
          type: 'LIB_BELOW_TARGET',
          file: filePath,
          message: `Lib file has ${fileData.lines.pct.toFixed(2)}% coverage (target: ${THRESHOLDS.LIB_TARGET}%)`,
          current: fileData.lines.pct,
          threshold: THRESHOLDS.LIB_TARGET,
        });
      }
    }
  }

  return violations;
}

/**
 * Analyze E2E coverage and return violations
 */
function analyzeE2ECoverage(coverage: CoverageSummary): Violations {
  const violations: Violations = { critical: [], warnings: [] };

  checkE2EOverallCoverage(coverage.total, violations);

  for (const [filePath, fileData] of Object.entries(coverage)) {
    if (filePath === 'total') continue;

    // Focus on pages (user-facing features) for E2E
    if (filePath.includes('/pages/')) {
      checkE2EPageCoverage(filePath, fileData, violations);
    }
  }

  return violations;
}

/**
 * Print violations to console
 */
function printViolations(violations: Violations): boolean {
  let hasIssues = false;

  // Print critical violations
  if (violations.critical.length > 0) {
    hasIssues = true;
    console.error('\n❌ CRITICAL VIOLATIONS (Build Blocked)\n');
    console.error('='.repeat(60));

    for (const violation of violations.critical) {
      console.error(`\n${violation.type}:`);
      console.error(`  ${violation.message}`);
      if (violation.file) {
        console.error(`  File: ${violation.file}`);
      }
      console.error(`  Current: ${violation.current.toFixed(2)}%`);
      console.error(`  Required: ${violation.threshold}%`);
    }

    console.error('\n' + '='.repeat(60));
    console.error('⛔ Build BLOCKED - Fix critical violations above');
  }

  // Print warnings (only if no critical violations)
  if (!hasIssues && violations.warnings.length > 0) {
    console.warn('\n⚠️  WARNINGS (Targets Not Met)\n');
    console.warn('='.repeat(60));

    for (const warning of violations.warnings) {
      console.warn(`\n${warning.type}:`);
      console.warn(`  ${warning.message}`);
      if (warning.file) {
        console.warn(`  File: ${warning.file}`);
      }
      console.warn(`  Current: ${warning.current.toFixed(2)}%`);
      console.warn(`  Target: ${warning.threshold}%`);
      if (warning.uncoveredLines) {
        console.warn(`  Uncovered lines: ${warning.uncoveredLines}`);
      }
    }

    console.warn('\n' + '='.repeat(60));
    console.warn('✅ Build PASSES with warnings - Consider adding tests to meet targets');
  }

  // Print success message
  if (!hasIssues && violations.warnings.length === 0) {
    console.log('\n✅ All coverage thresholds met!\n');
    console.log('='.repeat(60));
  }

  return hasIssues;
}

/**
 * Print coverage summary for a specific report
 */
function printCoverageSummary(label: string, total: FileCoverage): void {
  console.log(`\n📊 ${label} Coverage Summary:`);
  console.log('='.repeat(60));
  console.log(
    `   Lines:      ${total.lines.pct.toFixed(2)}% (${total.lines.covered}/${total.lines.total})`
  );
  console.log(
    `   Statements: ${total.statements.pct.toFixed(2)}% (${total.statements.covered}/${total.statements.total})`
  );
  console.log(
    `   Branches:   ${total.branches.pct.toFixed(2)}% (${total.branches.covered}/${total.branches.total})`
  );
  console.log(
    `   Functions:  ${total.functions.pct.toFixed(2)}% (${total.functions.covered}/${total.functions.total})`
  );
}

/**
 * Main execution
 */
function main(): void {
  console.log('\n🧪 Checking test coverage thresholds...\n');

  const reports = loadAllCoverageReports();

  // Show both coverage reports
  printCoverageSummary(reports.vitest.label, reports.vitest.data.total);

  if (reports.e2e) {
    printCoverageSummary(reports.e2e.label, reports.e2e.data.total);
  }

  console.log('\n' + '='.repeat(60));

  // Check unit test coverage
  console.log('\n📋 Checking Unit Test Coverage (detailed edge cases)...\n');
  const unitViolations = analyzeUnitCoverage(reports.vitest.data);
  const hasUnitErrors = printViolations(unitViolations);

  // Check E2E coverage if available
  let hasE2EErrors = false;
  if (reports.e2e) {
    console.log('\n📋 Checking E2E Coverage (happy path flows)...\n');
    const e2eViolations = analyzeE2ECoverage(reports.e2e.data);
    hasE2EErrors = printViolations(e2eViolations);
  } else {
    console.error('\n❌ ERROR: No E2E coverage found - major features must have happy path tests');
    console.error('   Run `pnpm test:e2e:coverage` first');
    process.exit(1);
  }

  // Exit with error if any critical violations
  if (hasUnitErrors || hasE2EErrors) {
    process.exit(1); // Critical violations
  } else if (unitViolations.warnings.length > 0) {
    process.exit(0); // Warnings only - pass with warnings
  } else {
    process.exit(0); // All good
  }
}

main();
