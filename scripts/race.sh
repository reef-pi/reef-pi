#!/bin/bash

echo "Cycle:$1"
for i in $(seq 1 $1)
do
  echo "Attempt: $i"
  make test
  if [[ $? -ne "0" ]]; then
    exit $?
  fi
done
