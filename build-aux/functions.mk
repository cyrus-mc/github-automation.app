# desc: get file on specified branch
#
# inputs:
#      1: file to retrieve
#      2: target branch
#      3: current branch
#
# output $(tmp_dir)/$(1)
define git_get
	file=$$(basename $(1))
	
	if [[ -f $(1) ]]; then
		git diff $(3) $(2) -- $(1) > $(tmp_dir)/$${file}.patch
		patch $(1) $(tmp_dir)/$${file}.patch -o $(tmp_dir)/$${file}
	fi
endef