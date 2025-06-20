#!/bin/bash
# Simple wrapper script to run the find person test

# Ensure search query is provided
if [ -z "$1" ]; then
  echo "Error: No search query provided"
  echo "Usage: ./find-person.sh \"search query\""
  exit 1
fi

# Run the test with the provided search query
node dist/test-runner/find_person.js "$1"