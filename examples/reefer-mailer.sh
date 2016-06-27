#!/bin/bash

TIME=$(date '+%Y-%m-%d %H:%M')
echo "Reef Status" | mutt -s "Reef Status at: ${TIME}" <email@domain.com> -a /var/lib/reefer/images/latest.png
