.PHONY: static-analysis
static-analysis::
	echo
	echo "---------- Lint Report ------------"
	echo
	eslint

	echo
	echo "--------- Vulnerability Report ----------"
	echo
	npm audit

.PHONY: tests
tests::
	echo
	echo "---------- Test Report ------------"
	echo
	npx jest --coverage

.PHONY: build
build::
	npx tsc

.PHONY: install-dependencies
install-dependencies:
	npm install