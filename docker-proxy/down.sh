#!/bin/sh
docker-compose -f proxy.yml -p proxy down --remove-orphans
docker network rm renonbill
