#!/bin/bash

echo "Copying remaining files from mindfuel-backend to backendMindfuelAi..."

# Copy all module files
echo "Copying modules..."
cp -r mindfuel-backend/src/modules/* backendMindfuelAi/src/modules/

# Copy individual route files (skip index.ts as it's already customized)
echo "Copying route files..."
for route in mindfuel-backend/src/routes/*.routes.ts; do
  cp "$route" backendMindfuelAi/src/routes/
done

# Copy lib files
echo "Copying lib files..."
cp mindfuel-backend/src/lib/firebase.ts backendMindfuelAi/src/lib/ 2>/dev/null || true
cp mindfuel-backend/src/lib/openai.ts backendMindfuelAi/src/lib/ 2>/dev/null || true
cp mindfuel-backend/src/lib/razorpay.ts backendMindfuelAi/src/lib/ 2>/dev/null || true
cp mindfuel-backend/src/lib/s3.ts backendMindfuelAi/src/lib/ 2>/dev/null || true
cp mindfuel-backend/src/lib/redis.ts backendMindfuelAi/src/lib/ 2>/dev/null || true
cp -r mindfuel-backend/src/lib/ai backendMindfuelAi/src/lib/ 2>/dev/null || true

# Copy types
echo "Copying types..."
cp mindfuel-backend/src/types/*.ts backendMindfuelAi/src/types/ 2>/dev/null || true

# Copy validation schemas
echo "Copying validation schemas..."
cp mindfuel-backend/src/validation/*.ts backendMindfuelAi/src/validation/ 2>/dev/null || true

# Copy workers
echo "Copying workers..."
cp mindfuel-backend/src/workers/*.ts backendMindfuelAi/src/workers/ 2>/dev/null || true

echo "✅ All files copied successfully!"
echo ""
echo "File counts:"
echo "Modules: $(ls -1 backendMindfuelAi/src/modules/*/**.ts 2>/dev/null | wc -l) files"
echo "Routes: $(ls -1 backendMindfuelAi/src/routes/*.ts 2>/dev/null | wc -l) files"
echo "Lib: $(ls -1 backendMindfuelAi/src/lib/*.ts 2>/dev/null | wc -l) files"
echo "Types: $(ls -1 backendMindfuelAi/src/types/*.ts 2>/dev/null | wc -l) files"
echo "Validation: $(ls -1 backendMindfuelAi/src/validation/*.ts 2>/dev/null | wc -l) files"
echo "Workers: $(ls -1 backendMindfuelAi/src/workers/*.ts 2>/dev/null | wc -l) files"
