import { Issue, Contributor, Contributions } from "./github_repository"

/* Repository Class
 * Abstract class to be extendedd for all current and future Repository subclass
 * 
 * Subclasses:
 * GithubRepository, NpmRepository
*/

export abstract class Repository {
	url:string;
	owner: string; // for use in github APIs
	repo: string; // for use in github APIs
	cloning_url:string; // for use in cloning
	constructor(url:string, owner:string, repo:string, cloning_url:string) {
		this.url = url;
		this.owner = owner;
		this.repo = repo;
		this.cloning_url = cloning_url;
	}
	
	abstract get_local_clone(dirAppend:string):Promise<string | null>;
	
	/* get_license() function
		returns license file spdx_id as string or null
		a valid spdx-id will be lgpl-2.1 or MIT
		make sure to error check for null string return.
		Some repositories don't have a license file!!
		Should also call get_readme and regex for license
		MIT and LGPL in the readme in the license metric.
	*/
    abstract get_license():Promise<string | null>;
    
    // Commenting out because unused - Responsive Maintainer task incomplete by Robert.
    
    abstract get_issues():Promise<Issue[]>;
    
   
	/* get_readme() function
		returns absolute filepath of downloaded readme in this project
		make sure to error check for null string return.
		Some will download readme as txt files, but if readme.md in
		the source, the downloaded file will be in markdown.
		Suggest the use of a markdown parsing library
	*/
    abstract get_readme():Promise<string | null>;
    abstract get_contributors_stats():Promise<Contributions>;

	abstract get_package_json():Promise<any | null>;
}
