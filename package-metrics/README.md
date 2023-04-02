# ECE_461
**ECE 46100 Software Engineering Group 4**

---

## Team Members:
- Priyanka Pereira
- Ryan Marchand
- Andy Lin
- Robert Sego


---

# Instructions for end use by customer

Scripts directory has helper scripts like clean.sh for cleaning the root directory and installation, initial_setup.sh for cloning nvm for setting up virtual environments of a specific version of node, setup.sh for sourcing into developer environment to pick up the installed version of node. Using that installed version of node, a series of npm installs produce the environment to compile, run, and test the code. 

This combination provides a consistent runtime environment for developers and the customer. 

The “run” executable implements a bash frontend to call these scripts to achieve installation, build, run with URL file input, and test.

**Instructions for use:**
1. Clone the repository locally.
2. Set environment variables GITHUB_TOKEN, LOG_FILE, and LOG_LEVEL.
> GITHUB_TOKEN is a Github access token for using the REST and GraphQL APIs. MUST be set for the tool to work.  
> LOG_LEVEL indicates verbosity of logs - 2 for debug, 1 for info, 0 for silent. If unset, default is 0 for silent.  
> LOG_FILE indicates the absolute filepath for where logs should go. If unset, default is logs/default.log.  
3. ./run install
>Calls scripts/initial_setup.sh to clone nvm for setting up node virtual environment.  
>Sources scripts/setup.sh to set/check for GITHUB_TOKEN environment variable.  
>Installs typescript, node, jest testing framework.  
>Installs all package.json dependencies.  
4. ./run build
> Builds the project with src/index.ts as the main program. Transpiled .js files and all compiled files go to the build/ directory.  
5. ./run sample_url_file.txt
> the argument of the run executable should be a newline-delimited list of NPM or Github URLs needing evaluation.
> A sample file is provided named as above.  
> Puts local clones of repositories in directory local_clones/   
> Puts downloaded files from repositories and REST API calls in directory downloads/   
> Output is NDJSON format. The Responsive Maintainer metric is unimplemented and shows a score of -1, and was not used in the net score calculation.
> The packages are ranked in decreasing order by NET_SCORE. Example output for the sample file is below:   

```
{"URL":"https://github.com/cloudinary/cloudinary_npm","NET_SCORE":0.31696592664357337,"RAMP_UP_SCORE":0.1,"CORRECTNESS_SCORE":0.8572209375656927,"BUS_FACTOR_SCORE":0.313804347826087,"RESPONSIVE_MAINTAINER_SCORE":-1,"LICENSE_SCORE":1}
{"URL":"https://github.com/nullivex/nodist","NET_SCORE":0.31535151204295897,"RAMP_UP_SCORE":0.5,"CORRECTNESS_SCORE":0.89748045178106,"BUS_FACTOR_SCORE":0.08963855421686749,"RESPONSIVE_MAINTAINER_SCORE":-1,"LICENSE_SCORE":1}
{"URL":"https://www.npmjs.com/package/express","NET_SCORE":0.2881023954322634,"RAMP_UP_SCORE":0.2,"CORRECTNESS_SCORE":0.8706162162162162,"BUS_FACTOR_SCORE":0.1849478804725504,"RESPONSIVE_MAINTAINER_SCORE":-1,"LICENSE_SCORE":1}
{"URL":"https://github.com/lodash/lodash","NET_SCORE":0,"RAMP_UP_SCORE":0.1,"CORRECTNESS_SCORE":0.8785582902688973,"BUS_FACTOR_SCORE":0.0007495315427857589,"RESPONSIVE_MAINTAINER_SCORE":-1,"LICENSE_SCORE":0}
{"URL":"https://www.npmjs.com/package/browserify","NET_SCORE":0,"RAMP_UP_SCORE":0,"CORRECTNESS_SCORE":0,"BUS_FACTOR_SCORE":0,"RESPONSIVE_MAINTAINER_SCORE":-1,"LICENSE_SCORE":1}
```

6. ./run test
> Runs test suite using Jest framework, test files in tests/ directory. 
> Outputs coverage reports in coverage/ directory. coverage/lcov-report/index.html is a good additional view of coverage.
> Uses custom reporter to output general summary lines as requested:

```
Total: 14
Passed: 14
----------------------|---------|----------|---------|---------|----------------------------------------------------------------------------------------------------------------------------------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                                                                                                                            
----------------------|---------|----------|---------|---------|----------------------------------------------------------------------------------------------------------------------------------------------
All files             |    75.5 |    73.65 |   76.92 |    75.5 |                                                                                                                                              
 github_repository.ts |   86.43 |    75.86 |   91.66 |   86.43 | 19-30,82-87,99-102,111-115,217-221,229-230,254-255,316-322,324-326                                                                           
 global.d.ts          |       0 |        0 |       0 |       0 | 1                                                                                                                                            
 index.ts             |   57.81 |    78.18 |   63.63 |   57.81 | 10-31,34-47,81-85,96-100,103-107,124-125,139-144,185-186,191-192,254-260,282,327-344,368-370,375-377,382-384,401-496,499-501,505-531         
 metric.ts            |   85.46 |       70 |   86.66 |   85.46 | ...7,109-110,112-113,115-116,164-165,174-175,177-178,185-187,189-191,209-213,222-224,227-228,331-333,339-343,358-362,364-368,370-374,378-380 
 repository.ts        |     100 |      100 |     100 |     100 |                                                                                                                                              
----------------------|---------|----------|---------|---------|----------------------------------------------------------------------------------------------------------------------------------------------
Coverage: 75.50%

```
7. Can repeat build and test as necessary.
8. Cleanup if necessary:
> scripts/clean.sh to remove build/ directory, coverage/ directory, local_clones/ directory, logs/ directory to rebuild starting at step 4.
> scripts/clean.sh all (argument to script is all) to force full removal of dependencies and to a full reinstall and rebuild starting at step 3.
> 
# Description of files and folders
1. src/
> contains all source files
3. test/
> contains all Jest-based .test.ts files and coverage reporter config.
5. scripts/
> contains all helper scripts for use in the run executable, and the cleanup script clean.sh described above.



---
# Setup instructions for developers:
The following assumes a default bash shell environment.

**First step is to set up your GITHUB_TOKEN environment variable**
- Follow the instructions [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) to create a new Github personal access token (CLASSIC, not the beta fine-grained tokens)
- Set it to expire in the end of the semester (I (Priyanka) did May 30th)
- The scopes I selected are as follows:
	- codespace, notifications, read:audit_log, read:discussion, read:enterprise, read:packages, read:project, 		repo, user, workflow
- Copy the token you generated to your clipboard
- Run the following at the command line

```
cd ~/.ssh
```
- Create a new file called git_token
- Paste the token into this file and save. For the scripts to run and successfully export your token, the file must be named git_token and placed in the .ssh directory.

## Each time you start working
- Must source setup script

```
source scripts/setup.sh
```

