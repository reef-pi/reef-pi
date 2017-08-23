#!/bin/bash
set -e
for f in `ls test/*.js`
do
  echo "Executing test: 'node ${f}'"
  node $f
done
