#!/bin/bash
set -e
for f in `ls test/*.js`
do
#  echo "Executing test: 'node ${f}'"
#  node $f
echo -n ''
done

node test/outlet.js
node test/jack.js
node test/equipment.js
node test/timer.js
node test/system.js
node test/light.js
