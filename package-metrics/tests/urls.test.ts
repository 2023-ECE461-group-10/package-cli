import { describe, expect, test } from '@jest/globals';
import { get_real_owner_and_repo, OwnerAndRepo } from '../src/index'

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

describe('URL handling in main module, test', () => {
	test('valid github url', async () => {
		const url_val = "https://github.com/cloudinary/cloudinary_npm";
		const owner_and_repo = await get_real_owner_and_repo(url_val);
		expect(owner_and_repo).toEqual({url:"https://github.com/cloudinary/cloudinary_npm", 
		owner:"cloudinary", repo:"cloudinary_npm", cloning_url:"https://github.com/cloudinary/cloudinary_npm"});
	});
	test('valid npm url', async () => {
		const url_val = "https://www.npmjs.com/package/express";
		const owner_and_repo = await get_real_owner_and_repo(url_val);
		expect(owner_and_repo).toEqual({url:"https://www.npmjs.com/package/express", 
		owner:"expressjs", repo:"express", cloning_url:"https://github.com/expressjs/express.git"});

	});
	test('valid npm url with ssh git link', async () => {
		const url_val = "https://www.npmjs.com/package/browserify";
		const owner_and_repo = await get_real_owner_and_repo(url_val);
		expect(owner_and_repo).toEqual({url:"https://www.npmjs.com/package/browserify", 
		owner:"browserify", repo:"browserify", cloning_url:"https://github.com/browserify/browserify.git"});
	});
	test('invalid npm url', async () => {
		const url_val = "https://www.npmjs.com/package/expressss";
		const owner_and_repo = await get_real_owner_and_repo(url_val);
		expect(owner_and_repo).toEqual(null);
	});
	test('invalid git url', async () => {
		const url_val = "https://githubb.com/cloudinary/cloudinary_npm";
		const owner_and_repo = await get_real_owner_and_repo(url_val);
		expect(owner_and_repo).toEqual(null);
	});
	test('invalid url', async () => {
		const url_val = ".com/cloudinary/cloudinary_npm";
		const owner_and_repo = await get_real_owner_and_repo(url_val);
		expect(owner_and_repo).toEqual(null);
	});
});

