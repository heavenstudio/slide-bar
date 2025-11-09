#!/usr/bin/env node

/**
 * Coverage Enforcement Script
 * Enforces testing standards defined in .claude/skills/testing-standards.md
 *
 * Shows coverage from:
 * 1. Vitest unit/integration tests (individual)
 * 2. Playwright E2E tests (individual, if available)
 * 3. Combined coverage (if merged)
 *
 * Exit codes:
 * - 0: All coverage thresholds met
 * - 1: Critical violations (blocks build)
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Coverage thresholds from testing-standards.md
const THRESHOLDS = {
  // Critical blockers (exit code 1)
  OVERALL_MIN: 85, // Absolute minimum - blocks if below
  JSX_MIN: 100, // All JSX files must have 100% coverage

  // Targets (warnings if below)
  OVERALL_TARGET: 90,
  PAGES_TARGET: 95,
  COMPONENTS_TARGET: 100,
  LIB_TARGET: 95,
};

// Files to exclude from JSX coverage checks (entry points)
const JSX_EXCLUSIONS = ['App.jsx', 'main.jsx'];

/**
 * Load coverage data from a specific path
 */
function loadCoverageData(coveragePath, label) {
  try {
    if (!existsSync(coveragePath)) {
      return null;
    }
    const data = readFileSync(coveragePath, 'utf8');
    return { data: JSON.parse(data), label };
  } catch {
    console.error(`⚠️  WARNING: Could not read ${label} coverage report`);
    return null;
  }
}

/**
 * Load all available coverage reports
 */
function loadAllCoverageReports() {
  const reports = {};

  // Vitest coverage (unit/integration tests)
  const vitestPath = join(__dirname, '../.test-output/coverage/coverage-summary.json');
  const vitestCoverage = loadCoverageData(vitestPath, 'Vitest');
  if (vitestCoverage) {
    reports.vitest = vitestCoverage;
  }

  // Merged coverage (Vitest + Playwright)
  const mergedPath = join(__dirname, '../.test-output/merged-coverage/coverage-summary.json');
  const mergedCoverage = loadCoverageData(mergedPath, 'Combined');
  if (mergedCoverage) {
    reports.merged = mergedCoverage;
  }

  if (Object.keys(reports).length === 0) {
    console.error('❌ ERROR: No coverage reports found');
    console.error('   Run `pnpm test:coverage` first');
    process.exit(1);
  }

  return reports;
}

/**
 * Check if file should be excluded from JSX coverage requirements
 */
function isExcludedJSX(filePath) {
  return JSX_EXCLUSIONS.some((excluded) => filePath.endsWith(excluded));
}

/**
 * Analyze coverage and return violations
 */
function analyzeCoverage(coverage) {
  const violations = {
    critical: [],
    warnings: [],
  };

  const total = coverage.total;

  // Check overall coverage (critical)
  if (total.lines.pct < THRESHOLDS.OVERALL_MIN) {
    violations.critical.push({
      type: 'OVERALL_MIN',
      message: `Overall coverage ${total.lines.pct.toFixed(2)}% is below minimum ${THRESHOLDS.OVERALL_MIN}%`,
      current: total.lines.pct,
      threshold: THRESHOLDS.OVERALL_MIN,
    });
  }

  // Check overall coverage (warning)
  if (total.lines.pct < THRESHOLDS.OVERALL_TARGET) {
    violations.warnings.push({
      type: 'OVERALL_TARGET',
      message: `Overall coverage ${total.lines.pct.toFixed(2)}% is below target ${THRESHOLDS.OVERALL_TARGET}%`,
      current: total.lines.pct,
      threshold: THRESHOLDS.OVERALL_TARGET,
    });
  }

  // Check individual files
  for (const [filePath, fileData] of Object.entries(coverage)) {
    if (filePath === 'total') continue;

    const isJSX = filePath.endsWith('.jsx');
    const isExcluded = isExcludedJSX(filePath);

    // Check JSX files for 100% coverage (critical)
    if (isJSX && !isExcluded) {
      // Check if file has ANY coverage at all
      if (fileData.lines.pct === 0) {
        violations.critical.push({
          type: 'JSX_NO_TESTS',
          file: filePath,
          message: `JSX file has 0% coverage - MUST have at least a render test`,
          current: 0,
          threshold: THRESHOLDS.JSX_MIN,
        });
      }
      // Check if JSX file has < 100% coverage
      else if (fileData.lines.pct < THRESHOLDS.JSX_MIN) {
        violations.warnings.push({
          type: 'JSX_BELOW_TARGET',
          file: filePath,
          message: `JSX file has ${fileData.lines.pct.toFixed(2)}% coverage (target: ${THRESHOLDS.JSX_MIN}%)`,
          current: fileData.lines.pct,
          threshold: THRESHOLDS.JSX_MIN,
          uncoveredLines: fileData.lines.total - fileData.lines.covered,
        });
      }
    }

    // Check lib files for target coverage (warnings)
    if (filePath.includes('/lib/') && fileData.lines.pct < THRESHOLDS.LIB_TARGET) {
      violations.warnings.push({
        type: 'LIB_BELOW_TARGET',
        file: filePath,
        message: `Lib file has ${fileData.lines.pct.toFixed(2)}% coverage (target: ${THRESHOLDS.LIB_TARGET}%)`,
        current: fileData.lines.pct,
        threshold: THRESHOLDS.LIB_TARGET,
      });
    }
  }

  return violations;
}

/**
 * Print violations to console
 */
function printViolations(violations) {
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

  // Print warnings
  if (violations.warnings.length > 0) {
    console.warn('\n⚠️  WARNINGS (Build Passes)\n');
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
    console.warn('⚠️  Build PASSES with warnings - Consider adding tests');
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
function printCoverageSummary(label, total) {
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
function main() {
  console.log('\n🧪 Checking test coverage thresholds...\n');

  const reports = loadAllCoverageReports();

  // Show individual coverage reports
  if (reports.vitest) {
    printCoverageSummary('Vitest (Unit/Integration)', reports.vitest.data.total);
  }

  if (reports.merged) {
    printCoverageSummary('Combined (Vitest + Playwright)', reports.merged.data.total);
  }

  // Analyze coverage based on what's available
  // Use merged coverage if available, otherwise use Vitest
  const coverageToCheck = reports.merged || reports.vitest;
  console.log(`\n✅ Enforcing thresholds on: ${coverageToCheck.label} coverage\n`);

  const violations = analyzeCoverage(coverageToCheck.data);
  const hasErrors = printViolations(violations);

  if (hasErrors) {
    process.exit(1); // Critical violations
  } else if (violations.warnings.length > 0) {
    process.exit(0); // Warnings only - pass with warnings
  } else {
    process.exit(0); // All good
  }
}

main();
