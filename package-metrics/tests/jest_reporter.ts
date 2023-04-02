// Modified portions from
// CITATION: https://brunoscheufler.com/blog/2020-02-14-supercharging-jest-with-custom-reporters

// Those two packages supply the types we need to
// build our custom reporter
import { Reporter, TestContext } from '@jest/reporters';
import { AggregatedResult } from '@jest/test-result';

// Our reporter implements only the onRunComplete lifecycle
// function, run after all tests have completed
export default class CustomReporter implements Pick<Reporter, 'onRunComplete'> {
  async onRunComplete(_: Set<TestContext>, results: AggregatedResult) {
    console.log("\n\n\n\n\nTotal: " + results.numTotalTests);
    console.log("Passed: " + results.numPassedTests);
  }
}
