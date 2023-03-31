import { Repository } from "./repository"
import { Issue, Contributor, Contributions } from "./github_repository"
import { ESLint } from "eslint";

import fs from "fs"
import path from "path"

type NullNum = number|null;

export class GroupMetric {
	url:string;
	metric_name:string;
	metric_val:NullNum;
	constructor(url:string, metric_name:string, metric_val:NullNum) {
		this.url = url;
		this.metric_name = metric_name;
		this.metric_val = metric_val;
	}
}
/* Metric Class
 * Abstract class to be extended for all current and future metric subclass
 * 
 * Subclasses:
 * License, BusFactor, RampUp, ResponsiveMaintainer, Correctness
*/
export abstract class Metric {
    abstract get_metric(repo: Repository):Promise<GroupMetric>;
}

/* License Metric Class
 * Finds compatibility of repository license with GNU Lesser General Public License v2.1
 * Compatible if MIT or lgpl-v2.1 is the spdx_id IN THIS FORMAT.
 * @Robert use get_license function that returns spdx_id of license file
 * if that doesn't exist, use get_readme function to download the README
 * and parse for regex MIT or LGPL v2.1 or lgpl-v2.1
*/
export class LicenseMetric extends Metric {
    async get_metric(repo: Repository):Promise<GroupMetric> {
		var final_score:number = 0;
		let regex = new RegExp('((LGPL-2\.1)(\w+\b)?)|((LGPL-2\.0)(\w+\b)?)|((MIT)(\w+\b)?)');
        var license: string|null = await repo.get_license(); // ask for license file
        if (license == null) {
            logger.log('info', "No license file, retreiving README");
            const readme = await repo.get_readme(); // ask for readme
            if (readme == null) {
                logger.log('info', "No license or readme found");
                final_score = 0;
            }
            else {
				fs.readFileSync(readme, 'utf-8').split(/\r?\n/).forEach(function(line){
					const upper_line = line.toUpperCase();
					if (regex.test(upper_line)) {
						final_score = 1;
					}
				})
			}
        }
        else {
			//license spdx-id found
			logger.log('info', "license found with spdx_id " + license);
	        if(regex.test(license as string)) {
	            final_score = 1;
	        }
		}

        return new Promise((resolve) => {
			resolve(new GroupMetric(repo.url, "LICENSE_SCORE", final_score));
		});
    }
}


/* Ramp Up Metric Class
 * Uses two sub scores to calc final metric score: The readme quality and the percentage of comments
 * 
*/
export class RampUpMetric extends Metric {
    async get_metric(repo: Repository):Promise<GroupMetric> {
        let readmeScore:number =  0; // subscore for readme
        let commentScore: number = 0; // subscore for comment ratio
        let total_score: number = 0; //total ramp up score
        let read_me:string|null = await repo.get_readme(); //get the readme
        let clonedRepo: string|null = await repo.get_local_clone("RampUp"); //get the clone

        //read me calcs
        if(read_me == null){
            logger.log('info', "No Readme found");
            readmeScore = 0;
        }
        else{
            readmeScore = await readmeCalc(read_me); //calc the readme score
        }

        //percent lines calc
        if(clonedRepo == null){
            logger.log('info', "No Clone found");
            commentScore = 0;
        }
        else{
            let percentLines: number = await countCommentToSLOCRatioInRepo(clonedRepo);

            if(percentLines > .5){
                commentScore = .5
            }
            else if(percentLines > .35){
                commentScore = .4
            }
             else if(percentLines > .25){
                commentScore = .3
            }
             else if(percentLines > .15){
                commentScore = .2
            }
            else if(percentLines > .5){
                commentScore = .1
            }
            else{
                commentScore = 0
            }
        }

        total_score = readmeScore + commentScore;
        logger.log('info', "Rampup score: " + total_score);
        return new Promise((resolve) => {
            resolve(new GroupMetric(repo.url, "RAMP_UP_SCORE", total_score));
        });
    }
}

//Function returns percent of code that is commented

async function countCommentToSLOCRatioInRepo(repoName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      
      // Get a list of all files in the repository
      const array_of_files = getAllFiles(repoName,[]);
      let totalComments = 0;
      let totalSLOC = 0;
  
      // Iterate over the list of files
      for (const file of array_of_files) {
        const fileContent = fs.readFileSync(file, "utf-8");
        const commentRegex = /\/\/.*|\/\*[\s\S]*?\*\//g;
        const commentMatches = fileContent.match(commentRegex) || [];
        totalComments += commentMatches.length;
        totalSLOC += fileContent.split("\n").filter((line) => line.trim() !== "").length;
      }
  
      resolve(totalComments / totalSLOC);
    } catch (error) {
		logger.log('error',"reject error in count comments " + error);
      reject(error);
    }
  });
}


async function readmeCalc(filePath: string): Promise<number> {
        let readmeScore: number =  0; // subscore for readme
        const fileContent = fs.readFileSync(filePath, "utf-8");
        //readmeScore calcs
        if (fileContent == null) {
			readmeScore = 0;
		}  
        else{
            let stringLength: number = fileContent.length;
            //checks readme length and assigns a score based on its length
            if (stringLength > 0) {
                if(stringLength > 15000){
                    readmeScore = .5;
                }
                else if(stringLength > 10000){
                    readmeScore = .4;
                }
                else if(stringLength > 7500){
                    readmeScore = .3;
                }
                else if(stringLength > 5000){
                    readmeScore = .2;
                }
                else if(stringLength > 2500){
                    readmeScore = .1;
                }
                else{
                    readmeScore =.05;
                }
            }
            else{  
                readmeScore = 0;
            }
        }
        logger.log('info', "Rampup Readme score " + readmeScore);
        return readmeScore;
}

/* Bus Factor Metric Class
	@ANDY skeleton for how you will do your calls
*/
export class BusFactorMetric extends Metric {
    async get_metric(repo: Repository):Promise<GroupMetric> {
		// returns a string filepath to the clone location (directory)
		var contributions:Contributions = await repo.get_contributors_stats();
		var final_score:NullNum = null;
		
		// do null checking for every data point
		// do an empty check for contributors.length == 0
        if ((contributions == null) || (contributions.total_commits_1yr == null) || (contributions.total_commits_alltime == null)) {
			logger.log('info', "null check fail in BusFactor" + repo.url);
            return new Promise((resolve) => {
                resolve(new GroupMetric(repo.url, "BUS_FACTOR_SCORE", 0));
            });
        }
	   
	   // Priyanka is fixing to something new that doesn't return negative values
	   // get length of contributors array to see total number of contributors
	   var ratio_contributors_to_commits = contributions.contributors.length / contributions.total_commits_alltime;
	   // ratio of commits in the last year compared to all time
	   var ratio_commits_score = 0;
	   var ratio_commits = contributions.total_commits_1yr / contributions.total_commits_alltime;
	   if (ratio_commits > 1) {
		   // not possible most likely unless theres an error w/graphql fetches
		   ratio_commits_score = 0;
	   }
	   // for ratios that are from .1 to 1 the resulting score will be from .4 to 1
	   else if ((ratio_commits >= 0.1) && (ratio_commits <= 1)){
		   ratio_commits_score = .4 + (.6* ratio_commits);
	    }
		// for ratios that are from .01 to .1 the resulting score will be from .2 to 4
		else if ((ratio_commits >= 0.01) && (ratio_commits <= 0.1)) {
			ratio_commits_score = .2 + (.2 *ratio_commits * 10);
		}
		// for ratios that are from .001 to .01 the resulting score will be from 0 to .2
		else if ((ratio_commits >= 0.001) && (ratio_commits <= 0.01)) {
			ratio_commits_score = (.2 * (ratio_commits * 100));
		}
		else {
			ratio_commits_score = 0;
		}
		final_score = (ratio_commits_score * 0.8) + (ratio_contributors_to_commits * 0.2);
        return new Promise((resolve) => {
			resolve(new GroupMetric(repo.url, "BUS_FACTOR_SCORE", final_score));
		});
    }
}

class LintResults {
	fileCount:NullNum;
	lineCount:NullNum;
	errorCount:NullNum;
	fixableErrorCount:NullNum;
	fatalErrorCount:NullNum;
	constructor(fileCount:NullNum, lineCount:NullNum, errorCount:NullNum, fixableErrorCount:NullNum, fatalErrorCount:NullNum) {
		this.fileCount = fileCount;
		this.lineCount = lineCount;
		this.errorCount = errorCount;
		this.fixableErrorCount = fixableErrorCount;
		this.fatalErrorCount = fatalErrorCount;
	}
}

// Modified from https://coderrocketfuel.com/article/recursively-list-all-the-files-in-a-directory-using-node-js
const getAllFiles = function(dirPath:string, arrayOfFiles:string[]) {
	const files = fs.readdirSync(dirPath)
	var arrayOfFiles = arrayOfFiles || []
	
	files.forEach(function(file) {
		if (fs.statSync(dirPath + "/" + file).isDirectory()) {
			arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
		} else {
			if (file.endsWith(".js") || file.endsWith(".ts")) {
				arrayOfFiles.push(path.join(dirPath, "/", file));
			}
		}
	})
	return arrayOfFiles
}


export class CorrectnessMetric extends Metric {
	
	private async get_eslint_on_clone(dir:string[]):Promise<LintResults|null> {
		var error_count:NullNum = null;
		var fixable_error_count:NullNum = null;
		var fatal_error_count:NullNum = null;
		var file_count:NullNum = null;
		var line_count:NullNum = null;
		const eslint = new ESLint({
			useEslintrc: false,
			overrideConfig: {
				root: true,
				parser: "@typescript-eslint/parser",
				"plugins": [
					'@typescript-eslint',
				],
				extends: [
				"eslint:recommended",
				"plugin:@typescript-eslint/recommended",
				],
				"rules": {
					// enable additional rules
					"no-duplicate-imports": ["error", { "includeExports": true } ],
					// disable rules from base configurations
					"no-irregular-whitespace": "off",
					"no-mixed-spaces-and-tabs": "off",
					"indent": "off",
				},
			},
			extensions: [".js", ".ts"]
		});
		try {
			let results = await eslint.lintFiles(dir);
			var file_count_success:number = 0;
			var error_count_success:number = 0;
			var fixable_error_count_success:number = 0;
			var fatal_error_count_success:number = 0;
			var line_count_success:NullNum = 0;
			for (const result of results) {
				if (result.source != undefined) {
					line_count_success += result.source.split("\n").length - 1;
				}
				else {
					logger.log ('debug', 'In ESLint parsing: SOURCE UNDEFINED');
				}
				file_count_success++;
				error_count_success += result.errorCount;
				fixable_error_count_success += result.fixableErrorCount;
				fatal_error_count_success += result.fatalErrorCount;
			}
			if (line_count_success == 0) {
				logger.log('debug', "Could not find any source files to count lines eslint ");
				line_count_success = null;
			}
			return new Promise((resolve) => {
				resolve(new LintResults(file_count_success, line_count_success, 
				error_count_success, fixable_error_count_success, fatal_error_count_success))
			});
		} catch (error) {
			logger.log('debug', "error fetching eslint! " + error);
			return new Promise((resolve) => {
				resolve(null)
			});
		}
	}
	
    async get_metric(repo: Repository):Promise<GroupMetric> {
		// returns a string filepath to the clone location (directory)
		// or null if it failed
		var cloned_dir:string|null = await repo.get_local_clone("Correctness");
		var final_score:NullNum = 0.25;
		if (cloned_dir != null) {
			// do clone work here
			const array_of_files = getAllFiles(cloned_dir,[]);
			var lint_results:LintResults|null;
			try {
				lint_results = await this.get_eslint_on_clone(array_of_files);
				if (lint_results == null) {
					logger.log('debug', "lint results for repo null" + repo.url);
					return new Promise((resolve) => {
						resolve(new GroupMetric(repo.url, "CORRECTNESS_SCORE", final_score));
					});
				}
				else if (lint_results.fileCount == null) {
					logger.log('debug', "lint results for repo null" + repo.url);
					return new Promise((resolve) => {
						resolve(new GroupMetric(repo.url, "CORRECTNESS_SCORE", final_score));
					});
				}
			} catch (error) {
				logger.log('error', "Error calling ESLINT! " + error);
				return new Promise((resolve) => {
					resolve(new GroupMetric(repo.url, "CORRECTNESS_SCORE", final_score));
				});
			}
			if ((lint_results.errorCount != null) && (lint_results.lineCount != null)) {
				final_score = (1 - (lint_results.errorCount / lint_results.lineCount));
			}
			else {
				final_score = 0.5;
			}
		}
		// @PRIYANKA todo
		// fix with .finally process instead of try/catch

        return new Promise((resolve) => {
			resolve(new GroupMetric(repo.url, "CORRECTNESS_SCORE", final_score));
		});
    }
}

/* Responsive Maintenance Metric Class
 * Get average amount of time before an issue or bug is resolved
 * @Robert TODO fix with new get_issues return value, make sure to error check
 * and log errors with logger.log('info', "message");
*/

export class ResponsiveMetric extends Metric {
    async get_metric(repo: Repository):Promise<GroupMetric> {
        var final_score:NullNum = null;
        
        const issue_arr:Issue[] = await repo.get_issues(); // get all issues

		const issueCount = issue_arr.length;
		const responsiveIssues = issue_arr.filter((issue) => issue.created_at !== issue.updated_at);
		const responsiveIssueCount = responsiveIssues.length;

        // get avg response time, then score, round to 2 digits
        if(final_score == null) {
            // get avg response time for repo Ex: originally in ms, the average response time for cloudbinary is 967.4 hours
            logger.log('debug', "Issue Count: %d", issueCount);
            logger.log("debug", "Responsive Issue Count: %d", responsiveIssueCount);
			logger.log("debug", "Responsiveness: %d", responsiveIssueCount / issueCount);

            // round final score calc Ex: That will result in a score so low it rounds to 0
            final_score = issueCount === 0 ? 0 : responsiveIssueCount / issueCount;
        }
        
        return new Promise((resolve) => {
			resolve(new GroupMetric(repo.url, "RESPONSIVE_SCORE", final_score));
		});
    }
}

export class VersionMetric extends Metric {
    async get_metric(repo: Repository):Promise<GroupMetric> {
        let score:number =  0; // subscore for readme
        let packages:any = await repo.get_package_json(); //get the readme

        //read me calcs
        if(packages == null){
            logger.log('info', "No Package found");
            score = 1;
        }
        else{
            score = await versionCalc(packages); //calc the readme score
        }

        return new Promise((resolve) => {
            resolve(new GroupMetric(repo.url, "RAMP_UP_SCORE", score));
        });
    }
}

async function versionCalc(packages: any): Promise<number> {
	let score: number =  0; // subscore for readme
	let numberPinnedToMajorMinor: number = 0;
	let totalNumberOfDependencies = 0;

	if (packages?.dependencies) {
		totalNumberOfDependencies += Object.keys(packages.dependencies).length;
	}
	if (packages?.devDependencies) {
		totalNumberOfDependencies += Object.keys(packages.devDependencies).length;
	}
	if (packages?.peerDependencies) {
		totalNumberOfDependencies += Object.keys(packages.peerDependencies).length;
	}
	if (packages?.optionalDependencies) {
		totalNumberOfDependencies += Object.keys(packages.optionalDependencies).length;
	}

	numberPinnedToMajorMinor += await countPinnedToMajorMinor(packages?.dependencies);
	numberPinnedToMajorMinor += await countPinnedToMajorMinor(packages?.devDependencies);
	numberPinnedToMajorMinor += await countPinnedToMajorMinor(packages?.peerDependencies);
	numberPinnedToMajorMinor += await countPinnedToMajorMinor(packages?.optionalDependencies);

	score = numberPinnedToMajorMinor / totalNumberOfDependencies;

	logger.log('info', "Version pinning score " + score);
	return score;
}

async function countPinnedToMajorMinor(dependencies: any): Promise<number> {
	let count: number = 0;
	const re = /^\d+\.\d+\.(x|X)$/

	for (const dependency in dependencies) {
		if (re.test(dependencies[dependency])) {
			count++;
		}
	}

	return count;
}
