// Portions modified from
// CITATION: https://stackoverflow.com/questions/60967561/jest-coverage-how-can-i-get-a-total-percentage-of-coverage

import { readFile } from 'fs';
import { join } from 'path';

// Gitlab Regex: Total Coverage: (\d+\.\d+ \%)
const coverage_file = join('../../coverage', 'coverage-summary.json');
const coverage = require(coverage_file);
const totalSum = ['lines']
  .map(i => coverage.total[i].pct)
  .reduce((a, b) => a + b, 0)
const avgCoverage = totalSum
console.log(`Coverage: ${avgCoverage.toFixed(2)}%`)