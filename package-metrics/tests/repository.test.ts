import { describe, expect, test } from '@jest/globals';
import { GithubRepository } from '../src/github_repository';

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

describe('GithubRepository constructor', () => {
	test('all valid inputs', () => {
		const git_repo = new GithubRepository("https://github.com/cloudinary/cloudinary_npm", 
		"cloudinary", "cloudinary_npm", "https://github.com/cloudinary/cloudinary_npm");
		expect(git_repo.url).toEqual("https://github.com/cloudinary/cloudinary_npm")
		expect(git_repo.owner).toEqual("cloudinary")
		expect(git_repo.repo).toEqual("cloudinary_npm")
		expect(git_repo.cloning_url).toEqual("https://github.com/cloudinary/cloudinary_npm");
	});
});

describe('GithubRepository test fetch license', () => {
	test('all valid inputs', () => {
		const git_repo = new GithubRepository("https://github.com/cloudinary/cloudinary_npm", 
		"cloudinary", "cloudinary_npm", "https://github.com/cloudinary/cloudinary_npm");
		expect(git_repo.url).toEqual("https://github.com/cloudinary/cloudinary_npm")
		expect(git_repo.owner).toEqual("cloudinary")
		expect(git_repo.repo).toEqual("cloudinary_npm")
		expect(git_repo.cloning_url).toEqual("https://github.com/cloudinary/cloudinary_npm");
	});
});
