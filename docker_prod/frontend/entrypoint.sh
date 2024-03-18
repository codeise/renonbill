#!/bin/sh

cd /code || exit

yarn install
FORCE_COLOR=true yarn start | cat #this instead of 'yarn run start' is to prevent clearing console on start
