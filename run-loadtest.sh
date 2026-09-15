#!/usr/bin/env bash
# Build, deploy, load test, and analyze the containerized student-registration app.
# Usage: ./run-loadtest.sh
set -e

RESULTS_DIR="./loadtest/results"
mkdir -p "$RESULTS_DIR"
TS=$(date +%Y%m%d_%H%M%S)

echo "== 1. Build and start containers =="
docker compose up -d --build

echo "== 2. Wait for app to be healthy =="
until curl -sf http://localhost:5000/api/health > /dev/null; do
  echo "Waiting for app..."
  sleep 2
done
echo "App is up."

echo "== 3. Start resource monitoring in background =="
# Logs CPU/mem of the app container every 2s during the test
(
  echo "timestamp,cpu_perc,mem_usage,mem_perc,net_io" > "$RESULTS_DIR/docker_stats_$TS.csv"
  while true; do
    STATS=$(docker stats student-app --no-stream --format "{{.CPUPerc}},{{.MemUsage}},{{.MemPerc}},{{.NetIO}}")
    echo "$(date +%H:%M:%S),$STATS" >> "$RESULTS_DIR/docker_stats_$TS.csv"
    sleep 2
  done
) &
MONITOR_PID=$!

echo "== 4. Run k6 load test (varying workload stages) =="
docker run --rm --network host \
  -v "$(pwd)/loadtest:/scripts" \
  -e BASE_URL=http://localhost:5000 \
  grafana/k6 run /scripts/script.js \
  --summary-export="/scripts/results/k6_summary_$TS.json" \
  | tee "$RESULTS_DIR/k6_output_$TS.txt"

echo "== 5. Stop resource monitoring =="
kill "$MONITOR_PID" 2>/dev/null || true

echo "== 6. Done. Results saved in $RESULTS_DIR =="
echo "  - k6_output_$TS.txt      (full k6 console report)"
echo "  - k6_summary_$TS.json    (machine-readable k6 summary)"
echo "  - docker_stats_$TS.csv   (CPU/memory over time during the test)"
