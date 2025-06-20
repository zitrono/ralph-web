#!/bin/bash

# Enable parameter debugging
export DEBUG_PARAMS=true

# Clear any existing output
rm -rf ./src/test-client/output/parameter-formats

# Build the project first (if needed)
echo "Building the project..."
npm run build

# Run the parameter format test
echo "Running parameter format tests..."
npm run test:parameter-formats

# Show summary if available
if [ -f "./src/test-client/output/parameter-formats/summary-report.json" ]; then
  echo "Test results:"
  cat ./src/test-client/output/parameter-formats/summary-report.json | jq
  
  echo "Successfully detected formats:"
  cat ./src/test-client/output/parameter-formats/summary-report.json | jq '.successfulFormats'
fi

echo ""
echo "Detailed logs are available in ./src/test-client/output/parameter-formats/"
echo "Use this information to determine which parameter format to use with Claude Desktop."