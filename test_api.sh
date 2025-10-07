#!/bin/bash

echo "Probando API..."
curl -X POST http://localhost:5005/api/tests/students/group-category \
  -H "Content-Type: application/json" \
  -d '{"grade": "1RO", "group": "A", "category": "vark"}' \
  -w "\n%{http_code}\n"