/* eslint-disable no-var */
import { Octokit } from "octokit";
import {
  GetResponseTypeFromEndpointMethod,
  GetResponseDataTypeFromEndpointMethod,
} from "@octokit/types";
import Downloader from "nodejs-file-downloader";
import { graphql, GraphqlResponseError,  } from "@octokit/graphql"
import type { GraphQlQueryResponseData } from "@octokit/graphql";
import git from "isomorphic-git";
import fs from "fs";
import path from "path"
import http from "isomorphic-git/http/node";

import { Repository } from "./repository";

 /* Issue Class
 */
export class Issue {
	created_at:string|null;
	updated_at:string|null;
	closed_at:string|null;
	constructor(created_at: string|null, updated_at: string|null, closed_at: string|null) {
		this.created_at = created_at;
		this.updated_at = updated_at;
		this.closed_at = closed_at;
	}
}

 /* Contributor Class
 */
export class Contributor {
	login:string;
	total_contributions:number;
	constructor(login:string, total_contributions:number) {
		this.login = login;
		this.total_contributions = total_contributions;
	}
}

export class Contributions {
	total_commits_1yr:number|null;
	total_commits_alltime:number|null;
	last_release_date:string|null;
	last_pushed_date:string|null;
	contributors:Contributor[];
	constructor(total_commits_1yr:number|null, total_commits_alltime:number|null, last_release_date:string|null, last_pushed_date:string|null, contributors:Contributor[]) {
		this.total_commits_1yr = total_commits_1yr;
		this.total_commits_alltime = total_commits_alltime;
		this.last_release_date = last_release_date;
		this.last_pushed_date = last_pushed_date;
		this.contributors = contributors;
	}
}

 /* GithubRepository Class
 */
export class GithubRepository extends Repository {
	private octokit = new Octokit({
    	auth: process.env.GITHUB_TOKEN,
	});
  
	constructor(url:string, owner: string, repo: string, cloning_url:string) {
		super(url, owner, repo, cloning_url);
		logger.log('debug', "Cloning URL in GithubRepository constructor: " + cloning_url);
	}

	// took from example code in nodejs-file-downloader
	// https://www.npmjs.com/package/nodejs-file-downloader?activeTab=readme#basic
	private async download_file_content(url:string):Promise<string | null> {
		const downloader = new Downloader({
		  url: url, 
		  directory: "./downloads/" + this.repo, //This folder will be created, if it doesn't exist.
		});
		try {
		  const {filePath,downloadStatus} = await downloader.download(); //Downloader.download() resolves with some useful properties.
		    logger.log('debug', "All done " + filePath);	
		    return filePath;
		} catch (error) {
		  //IMPORTANT: Handle a possible error. An error is thrown in case of network errors, or status codes of 400 and above.
		  //Note that if the maxAttempts is set to higher than 1, the error is thrown only if all attempts fail.
		  logger.log('debug', "Download failed " + error);
		}
		return null;
	}
	
	async get_local_clone(dirAppend:string):Promise<string | null> {
		var rv:string|null = null;
		// const dir = path.join(process.cwd(), 'local_clones/' + this.owner + "_" + this.repo);
		// remove local_clones/this.repo if it exists
		const dir = path.join(process.cwd(), 'local_clones', this.repo + dirAppend);
		fs.rmSync(dir, {recursive:true, force:true});
		const url = this.cloning_url;
		try {
			await git.clone({ fs, http, dir, url: url, singleBranch:true, depth:1 })
			.catch((error) => {
				logger.log('error',"error cloning catch! " + this.owner + " " + this.repo + " " + error);
				return new Promise((resolve) => {
					resolve(rv);
				});
			}).finally(() => {
				logger.log('info', "Done cloning " + this.cloning_url);
				rv = dir;
				return new Promise((resolve) => {
					resolve(rv);
				});
			});
		} catch (error) {
			logger.log('error', "error cloning! " + this.owner + " " + this.repo + " " + error);
			return new Promise((resolve) => {
				resolve(rv);
			});
		}
		return new Promise((resolve) => {
			resolve(rv);
		});
	}
	
	// Commenting out because unused - Responsive Maintainer task incomplete by Robert.
	
	async get_issues():Promise<Issue[]> {
		type IssueResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.rest.issues.get>;
		


		var rv:Issue[] = [];
		let response
		try {
			response = await this.octokit.request('GET /repos/{owner}/{repo}/issues', {
				owner: this.owner,
				repo: this.repo,
				per_page: 100,
			});
		} catch (error) {
			logger.log('info', "Fetching issue failed 1x");
		}

		if (response) {
			const issueData = response?.data;
			for (const issue of issueData) {
				rv.push(new Issue(issue.created_at, issue.updated_at, issue.closed_at))
			}
		}

		// uses octokit REST API to fetch issues list
		/* const iterator:IteratorResponseType = this.octokit.paginate.iterator(this.octokit.rest.issues.listForRepo, {
		  owner: this.owner,
		  repo: this.repo,
		  per_page: 100,
		});
		// iterate through each response and error check null response
		try {
			for await (const { data: issues } of iterator) {
				for (const issue of issues) {
					var eventcontent:EventsResponseType|null = null;
					try {
						eventcontent = await this.octokit.rest.issues.listEvents({
							owner: this.owner,
							repo: this.repo,
							issue_number: issue.number
						});
					} catch (error) {
						logger.log('info', "Fetching issue failed 1x");
					}
					if (eventcontent != null) {
						var eventcdata:EventsResponseDataType = eventcontent.data;
						var curr_issue = new Issue(issue.created_at, issue.updated_at, issue.closed_at, eventcdata.length);
						rv.push(curr_issue);
					}
			  	}
			}
		} catch (error) {
			logger.log('info', "Fetching iterator of issues failed!");
		} */
	
		return new Promise((resolve) => {
			resolve(rv);
		});
	} 
	
	
	async get_license():Promise<string | null> {
		type ContentResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.rest.licenses.getForRepo>;
		type ContentResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.rest.licenses.getForRepo>; 
		var cdata:ContentResponseDataType;
		var rv:string|null = null;

		// uses octokit REST API to fetch license data
		try {
			var content:ContentResponseType = await this.octokit.rest.licenses.getForRepo({
			  owner: this.owner,
			  repo: this.repo,
			});
			cdata = content.data;
			logger.log('info', "Fetched license file from " + this.owner + "/" + this.repo);
		} catch (error) {
			logger.log('debug', "Could not fetch license file from " + this.owner + "/" + this.repo);
			return new Promise((resolve) => {
				resolve(rv);
			});	
		}

		// this is a workaround since we cannot seem to access object properties of cdata above
		var jdata = JSON.parse(JSON.stringify(cdata));		
		return new Promise((resolve) => {
			resolve(jdata.license.spdx_id);
		});
	}   
	
	async get_readme():Promise<string | null> {
		type ContentResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.getReadme>;
		type ContentResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.getReadme>; 
		var cdata:ContentResponseDataType;
		var rv:string|null = null;

		// uses octokit REST API to fetch license data
		try {
			var content:ContentResponseType = await this.octokit.rest.repos.getReadme({
			  owner: this.owner,
			  repo: this.repo,
			});
			cdata = content.data;
			logger.log('info', "Fetched readme file from " + this.owner + "/" + this.repo);
		} catch (error) {
			logger.log('debug', "Could not fetch readme file from " + this.owner + "/" + this.repo);
			return new Promise((resolve) => {
				resolve(rv);
			});	
		}

		// this does not work for some reason - debug
		// this is a workaround since we cannot seem to access object properties of cdata above
		var jdata = JSON.parse(JSON.stringify(cdata));
		var download_url:string = jdata.download_url;
		const downloaded_file:string|null = await this.download_file_content(download_url);		
		if (downloaded_file == null) {
			logger.log('info', "Could not resolve location of downloaded file");
		}
		return new Promise((resolve) => {
			resolve(downloaded_file);
		});	
	}     
	
	async get_contributors_stats():Promise<Contributions> {
		var contributors:Contributor[] = [];
		type ContentResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.listContributors>;
		type ContentResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.listContributors>;
		var cdata:ContentResponseDataType|null = null;
		var rv:Contributions;

		try {
			var content:ContentResponseType = await this.octokit.rest.repos.listContributors({
			  owner: this.owner,
			  repo: this.repo,
			  anon: "false",
			});
			cdata = content.data;
			logger.log('info', "Fetched contributors list from " + this.owner + "/" + this.repo);
		} catch (error) {
			logger.log('debug', "Could not fetch contributors list from " + this.owner + "/" + this.repo);
		}

		// this does not work for some reason - debug
		// this is a workaround since we cannot seem to access object properties of cdata above
		if (cdata != null) {
			var jdata = JSON.parse(JSON.stringify(cdata));
			for (const data of jdata) {
				contributors.push(new Contributor(data.login, data.contributions));
			}
		}
		
		
		// GRAPHQL CALLS
		// get the string Date of 1 year ago
		let set_date = new Date();
		set_date.setMonth(set_date.getMonth() - 12);
		var lastContributions:GraphQlQueryResponseData|null = null;
		var allContributions:GraphQlQueryResponseData|null = null;
		try {
			lastContributions = await graphql({
				query: `query ContributionsQuery($owner: String!, $repo: String!, $since: GitTimestamp!) {
				  repository(owner: $owner, name: $repo) {
				    object(expression: "master") {
				      ... on Commit {
				        history(since: $since) {
				          totalCount
				        }
				      }
				    }
				    latestRelease {
				      publishedAt
				    }
				    pushedAt
				  }
				}`,
				owner: this.owner,
				repo: this.repo,
				since: set_date,
				headers: {
			    authorization: 'bearer ' + process.env.GITHUB_TOKEN,
			  },
			});
			allContributions = await graphql({
				query: `query NewQuery($repo: String!, $owner: String!) {
				  repository(owner: $owner, name: $repo) {
				    object(expression: "master") {
				      ... on Commit {
				        history {
				          totalCount
				        }
				      }
				    }
				  }
				}`,
				owner: this.owner,
				repo: this.repo,
				headers: {
			    authorization: 'bearer ' + process.env.GITHUB_TOKEN,
			  },
			});
		} catch (error) {
			if (error instanceof GraphqlResponseError) {
				logger.log('error', "GraphQL call failed: " + error.message);
			}
			else {
				logger.log('error', "GraphQL call failed for reason unknown!");
			}
		}
		if ((lastContributions == null) || (allContributions == null)) {
			logger.log('error', "GraphQL null check failed" + lastContributions + allContributions);
			rv = new Contributions(null, null, null, null, contributors);
		}
		else {
			jdata = JSON.parse(JSON.stringify(lastContributions));
			var jdata2 = JSON.parse(JSON.stringify(allContributions));
			rv = new Contributions(jdata.repository.object.history.totalCount, jdata2.repository.object.history.totalCount, jdata.repository.latestRelease.publishedAt,
			jdata.repository.pushedAt, contributors);
			logger.log('info', "Results of graphql needed for BusFactor 1yr: " + jdata.repository.object.history.totalCount + " alltime: " + jdata2.repository.object.history.totalCount);
		}

		return new Promise((resolve) => {
			resolve(rv);
		});
	}

	async get_package_json():Promise<any | null> {
		type ContentResponseType = GetResponseTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.getContent>;
		type ContentResponseDataType = GetResponseDataTypeFromEndpointMethod<
		typeof this.octokit.rest.repos.getContent>; 
		var cdata:ContentResponseDataType;
		var rv:any|null = null;

		// uses octokit REST API to fetch license data
		try {
			var content:ContentResponseType = await this.octokit.rest.repos.getContent({
			  owner: this.owner,
			  repo: this.repo,
			  path: 'package.json',
			});
			cdata = content.data;
			logger.log('info', "Fetched package file from " + this.owner + "/" + this.repo);
		} catch (error) {
			logger.log('debug', "Could not fetch package file from " + this.owner + "/" + this.repo);
			return new Promise((resolve) => {
				resolve(rv);
			});	
		}

		// this does not work for some reason - debug
		// this is a workaround since we cannot seem to access object properties of cdata above
		var jdata = JSON.parse(JSON.stringify(cdata));
		var decoded:string = Buffer.from(jdata.content, 'base64').toString('ascii')
		var pkg = JSON.parse(decoded)

		return new Promise((resolve) => {
			resolve(pkg);
		});	
	}
 }                                                                                            
 
 