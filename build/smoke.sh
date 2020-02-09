#!/bin/bash

set -e

make bin
./bin/reef-pi &
npm run smoke
