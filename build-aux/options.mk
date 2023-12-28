# silent mode
.SILENT:
# https://www.gnu.org/software/make/manual/html_node/One-Shell.html
.ONESHELL:

# set shell and shell options
SHELL := /usr/bin/bash
.SHELLFLAGS = -c -e

aws_region     := "us-east-1"
aws_account_id := "827357494583"

# set via enviroment (see config.env and .devcontainer/config.env)
pkg_name        := $$PKG_NAME
go_tools        := $$NODE_TOOLS
tools           := $$TOOLS
custom_go_tools := $$CUSTOM_NODE_TOOLS
custom_tools    := $$CUSTOM_TOOLS

# see https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
github_sha := $$GITHUB_SHA

cwd        := $(shell pwd)
tmp_dir    := $(shell mktemp -d)
git_branch := $(shell git rev-parse --abbrev-ref HEAD)

# set terraform environment based on branch name
# if it contains the word release environment = prod, else stage
ifneq (,$(findstring release,$(git_branch)))
	enviroment = prod
else
	enviroment = stage
endif

docker_run_opts   =
docker_build_opts = --progress plain \
                    --cache-from type=registry,ref=docker-build-registry:5000/$(pkg_name):buildcache \
                    --cache-to type=registry,ref=docker-build-registry:5000/$(pkg_name):buildcache,mode=max