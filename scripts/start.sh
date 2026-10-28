#!/usr/bin/env bash
set -e

PORT="${PORT:-8080}"
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_BIN="/Users/akshayvangari/.gemini/antigravity/scratch/bin/node"

echo "=========================================================="
echo "    STARTING DEVSECOPS SECURITY & MONITORING PLATFORM     "
echo "=========================================================="
echo "  Platform: Secure Containerization in DevOps Environment"
echo "  Port:     http://localhost:$PORT"
echo "  Workspace: $BASE_DIR"
echo "=========================================================="

if [ -x "$NODE_BIN" ]; then
    export ELECTRON_RUN_AS_NODE=1
    exec "$NODE_BIN" "$BASE_DIR/app-server/server.js"
elif which node >/dev/null 2>&1; then
    exec node "$BASE_DIR/app-server/server.js"
else
    echo "Using Java 21 runtime..."
    JAVA_HOME_PATH="/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home"
    exec "$JAVA_HOME_PATH/bin/java" -jar "$BASE_DIR/backend/target/secure-container-devsecops-backend-1.0.0-SNAPSHOT.jar"
fi
