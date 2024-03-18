#!/bin/sh

if [ -z "$1" ]
  then
    echo "You need to provide a tag name for the images to be built and pushed"
    exit 1
fi

./build_images.sh "$1"
./push_images.sh "$1"