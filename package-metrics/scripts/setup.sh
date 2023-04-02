#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

if [[ -z "${GITHUB_TOKEN}" ]]; then
	if [[ -e ~/.ssh/git_token ]]; then
		export GITHUB_TOKEN=$(cat ~/.ssh/git_token)
	else
		echo "GITHUB_TOKEN setup file ~/.ssh/git_token not found."
		exit
	fi
else
	echo "Found GITHUB_TOKEN in environment."
fi
