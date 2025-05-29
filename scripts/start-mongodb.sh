#!/bin/bash

# Check if MongoDB container is already running
if [ "$(docker ps -q -f name=mongodb)" ]; then
    echo "MongoDB is already running"
    exit 0
fi

# Check if MongoDB container exists but is stopped
if [ "$(docker ps -aq -f status=exited -f name=mongodb)" ]; then
    echo "Starting existing MongoDB container..."
    docker start mongodb
    exit 0
fi

# Create and start new MongoDB container
echo "Creating and starting new MongoDB container..."
docker run -d \
    --name mongodb \
    -p 27017:27017 \
    -v mongodb_data:/data/db \
    mongo:latest

echo "MongoDB is now running on port 27017" 