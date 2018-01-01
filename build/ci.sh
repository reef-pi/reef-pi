#!/bin/bash

pushd $PWD/..
	# Set up coverage report file
	COVERAGE_REPORT_LOCATION="./profile.cov"
	echo "" > $COVERAGE_REPORT_LOCATION

	# Iterate over all packages and run tests with coverage
	for package in $(go list ./...); do \
		result=$(go test -covermode=count -coverprofile=tmp.cov $package)
		if [ $? -ne 0 ]; then
			FAIL_PACKAGES+=($package);
		fi;
			echo "$result"
		if [ -f tmp.cov ]; then
			cat tmp.cov >> profile.cov;
			rm tmp.cov;
		fi;
	done

	# exit 1 if there have been any test failures
	if [ ${#FAIL_PACKAGES[@]} -ne 0 ]; then
		exit 1
	fi;
popd
