#!/bin/bash

set -e

make bin
./bin/reef-pi &
node front-end/test/smoke.js
