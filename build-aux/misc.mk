.PHONY: init
init:: install-dependencies
# https://github.com/microsoft/vscode-remote-release/issues/6683
	git config --global --add safe.directory /workspace
# set owner on docker.sock so non-roo user can access
	if [[ -s /var/run/docker.sock ]]; then
	  sudo chown $USER:$USER /var/run/docker.sock
	fi