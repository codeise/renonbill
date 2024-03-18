#!/bin/sh

if [ -z "$1" ]
  then
    echo "You need to provide a tag name for the images to be built"
    exit 1
fi

echo "Pre build setup..."
./pre_build_setup.sh

echo "Building the images..."
docker build -t renon_backend:"$1" backend/

echo "Post build cleanup..."
#./post_build_cleanup.sh