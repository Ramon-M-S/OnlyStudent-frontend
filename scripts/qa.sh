#!/usr/bin/env bash
set -euo pipefail
frontend_dir="$(cd "$(dirname "$0")/.." && pwd)"
backend_dir="$(cd "$frontend_dir/../OnlyStudent-backend" && pwd)"
api_pid=''
cleanup() {
  if [[ -n "$api_pid" ]]; then kill "$api_pid" 2>/dev/null || true; fi
}
trap cleanup EXIT

if ! docker exec onlystudent-postgres pg_isready -U root -d school >/dev/null 2>&1; then
  docker compose -f "$backend_dir/compose.yaml" up -d db
fi

if ! curl --silent --output /dev/null --max-time 2 http://127.0.0.1:8082/user; then
  (cd "$backend_dir" && ./mvnw -q -DskipTests package)
  (cd "$backend_dir" && java -jar target/OnlyStudent-0.0.1-SNAPSHOT.jar) > /tmp/onlystudent-qa-api.log 2>&1 &
  api_pid=$!
  for _ in {1..30}; do
    if curl --silent --output /dev/null --max-time 2 http://127.0.0.1:8082/user; then break; fi
    sleep 1
  done
fi
# (cd "$backend_dir" && node scripts/seed-demo.mjs)
# (cd "$backend_dir" && node scripts/check-permissions.mjs)
cd "$frontend_dir"
npm run test:unit
npm run build
if command -v chromium >/dev/null 2>&1; then export PLAYWRIGHT_CHROMIUM_PATH="$(command -v chromium)"; fi
npx playwright test
