#!/bin/bash
set -e
for f in `ls test/*.js`
do
#  echo "Executing test: 'node ${f}'"
#  node $f
echo -n ''
done

# simulate  a typical reef-pi setup
# create outlets & jacks
# create equipments
# create lighting and setup 24 hour cycle
# enable temperature and setup control
# enable ato and pump
# 

node test/outlet.js
node test/equipment.js
node test/light.js
node test/temperature.js
node test/ato.js
