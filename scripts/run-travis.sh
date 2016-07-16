#!/bin/bash

if [[ "$MODE" == "TESTS" ]]; then
  npm run test
elif [[ "$MODE" == "VERSIONS" ]]; then
  npm run test:versions
elif [[ "$MODE" == "LINT" ]]; then
  npm run tslint
fi