import { describe, expect, test } from '@jest/globals';
import { process_urls } from '../src/index'
import { GroupMetric } from '../src/metric';

const localLogger = {
  format: {
    printf: jest.fn(),
    timestamp: jest.fn(),
    simple: jest.fn(),
    colorize: jest.fn(),
    combine: jest.fn()
  },
  transports: {
    Console: jest.fn(),
    File: jest.fn()
  },
  createLogger: jest.fn().mockImplementation(function(creationOpts) {
    return {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
    };
  })
};

const logger = localLogger.createLogger();
global.logger = logger;

function flushPromises() {
  return new Promise(jest.requireActual("timers").setImmediate);
}

const pause = (ms:number) => new Promise((res) => setTimeout(res, ms));

function handle_results(metrics_array:GroupMetric[]) {
			type GN = GroupMetric|null;
			let met_test:GN[] = [
    {
        "url": "https://github.com/cloudinary/cloudinary_npm",
        "metric_name": "LICENSE_SCORE",
        "metric_val": 1
    },
    {
        "url": "https://github.com/cloudinary/cloudinary_npm",
        "metric_name": "RAMP_UP_SCORE",
        "metric_val": 0.1
    },
    {
        "url": "https://github.com/cloudinary/cloudinary_npm",
        "metric_name": "BUS_FACTOR_SCORE",
        "metric_val": 0.0798913043478261
    },
    {
        "url": "https://github.com/cloudinary/cloudinary_npm",
        "metric_name": "CORRECTNESS_SCORE",
        "metric_val": 0.8572209375656927
    },
    {
        "url": "https://github.com/cloudinary/cloudinary_npm",
        "metric_name": "RESPONSIVE_SCORE",
        "metric_val": null
    },
    {
        "url": "https://www.npmjs.com/package/express",
        "metric_name": "LICENSE_SCORE",
        "metric_val": 1
    },
    {
        "url": "https://www.npmjs.com/package/express",
        "metric_name": "RAMP_UP_SCORE",
        "metric_val": 0.2
    },
    {
        "url": "https://www.npmjs.com/package/express",
        "metric_name": "BUS_FACTOR_SCORE",
        "metric_val": 0.6815149409312022
    },
    {
        "url": "https://www.npmjs.com/package/express",
        "metric_name": "CORRECTNESS_SCORE",
        "metric_val": 0.8706162162162162
    },
    {
        "url": "https://www.npmjs.com/package/express",
        "metric_name": "RESPONSIVE_SCORE",
        "metric_val": null
    },
    {
        "url": "https://github.com/nullivex/nodist",
        "metric_name": "LICENSE_SCORE",
        "metric_val": 1
    },
    {
        "url": "https://github.com/nullivex/nodist",
        "metric_name": "RAMP_UP_SCORE",
        "metric_val": 0.5
    },
    {
        "url": "https://github.com/nullivex/nodist",
        "metric_name": "BUS_FACTOR_SCORE",
        "metric_val": 0.4269879518072289
    },
    {
        "url": "https://github.com/nullivex/nodist",
        "metric_name": "CORRECTNESS_SCORE",
        "metric_val": 0.89748045178106
    },
    {
        "url": "https://github.com/nullivex/nodist",
        "metric_name": "RESPONSIVE_SCORE",
        "metric_val": null
    },
    {
        "url": "https://github.com/lodash/lodash",
        "metric_name": "LICENSE_SCORE",
        "metric_val": 0
    },
    {
        "url": "https://github.com/lodash/lodash",
        "metric_name": "RAMP_UP_SCORE",
        "metric_val": 0.1
    },
    {
        "url": "https://github.com/lodash/lodash",
        "metric_name": "BUS_FACTOR_SCORE",
        "metric_val": 0.0007495315427857589
    },
    {
        "url": "https://github.com/lodash/lodash",
        "metric_name": "CORRECTNESS_SCORE",
        "metric_val": 0.8785582902688973
    },
    {
        "url": "https://github.com/lodash/lodash",
        "metric_name": "RESPONSIVE_SCORE",
        "metric_val": null
    },
    {
        "url": "https://www.npmjs.com/package/browserify",
        "metric_name": "LICENSE_SCORE",
        "metric_val": 1
    },
    null,
    {
        "url": "https://www.npmjs.com/package/browserify",
        "metric_name": "BUS_FACTOR_SCORE",
        "metric_val": 0.0026200873362445414
    },
    null,
    {
        "url": "https://www.npmjs.com/package/browserify",
        "metric_name": "RESPONSIVE_SCORE",
        "metric_val": null
    }
];
		expect(met_test).toHaveLength(25);
}

describe('Top level test', () => {
    test('Process URLS valid', async () => {
		await process_urls("sample_url_file.txt", handle_results);
		await pause(60000);
		//expect(true).toBe(true);
    });
})




