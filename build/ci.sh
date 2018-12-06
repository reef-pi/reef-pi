#!/bin/bash

set -e

if [ -n "$(goimports -local github.com/reef-pi -d ./ | tee /dev/stderr)" ]; then
  echo "Imports are not formatted. Please run 'make imports' to fix import formatting"
  exit 1
fi

echo "" > coverage.txt
for d in $(go list ./...); do \
	go test -race -coverprofile=profile.out -covermode=atomic $d
	if [ -f profile.out ]; then
			cat profile.out >> coverage.txt
			rm profile.out
	fi
done
