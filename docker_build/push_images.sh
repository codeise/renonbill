#!/bin/sh

if [ -z "$1" ]
  then
    echo "You need to provide a tag name for the images to be pushed"
    exit 1
fi

echo "Tagging images as: ikimio/renon_backend:$1"
docker tag renon_backend:"$1" ikimio/renon_backend:"$1"

echo "Pushing images..."
docker push ikimio/renon_backend:"$1"
