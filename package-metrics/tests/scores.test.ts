import { describe, expect, test } from '@jest/globals';
import { get_weighted_sum, ScoresWithNet, ScoresWithoutNet } from '../src/index'

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

describe('Get weighted sum test', () => {
	test('all 1', () => {
		var no_net:ScoresWithoutNet = new ScoresWithoutNet('https://github.com/cloudinary/cloudinary_npm',
		1, 1, 1, 1, 1, 1);
		const nscore = get_weighted_sum(no_net);
		expect(nscore.net_score).toEqual(1);
	});
});

describe('Get weighted sum test', () => {
	test('license 0', () => {
		var no_net:ScoresWithoutNet = new ScoresWithoutNet('https://github.com/cloudinary/cloudinary_npm',
		0, 1, 1, 1, 1, 1);
		const nscore = get_weighted_sum(no_net);
		expect(nscore.net_score).toEqual(0);
	});
});

describe('Get weighted sum test', () => {
	test('all 0', () => {
		var no_net:ScoresWithoutNet = new ScoresWithoutNet('https://github.com/cloudinary/cloudinary_npm',
		0, 0, 0, 0, 0, 0);
		const nscore = get_weighted_sum(no_net);
		expect(nscore.net_score).toEqual(0);
	});
});

describe('Get weighted sum test', () => {
	test('null implemented score', () => {
		var no_net:ScoresWithoutNet = new ScoresWithoutNet('https://github.com/cloudinary/cloudinary_npm',
		null, 0, 0, 0, 0, 0);
		const nscore = get_weighted_sum(no_net);
		expect(nscore.license_score).toEqual(0);
	});
});

//PRIYANKA come back to this ir responsive maintainer is implemented
describe('Get weighted sum test', () => {
	test('null unimplemented score', () => {
		var no_net:ScoresWithoutNet = new ScoresWithoutNet('https://github.com/cloudinary/cloudinary_npm',
		0, 0, 0, 0, null, 0);
		const nscore = get_weighted_sum(no_net);
		expect(nscore.responsive_maintainer_score).toEqual(-1);
	});
});
