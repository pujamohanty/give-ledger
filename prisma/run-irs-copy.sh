#!/usr/bin/env bash
# run-irs-copy.sh
# Imports all remaining IRS BMF state files using PostgreSQL COPY (IO-efficient).
# Skips the 5 states already fully imported: eo_al eo_ak eo_az eo_ct eo_dc
#
# Usage: bash prisma/run-irs-copy.sh 2>&1 | tee /tmp/irs-copy.log

set -u
cd "$(dirname "$0")/.."

STATE_FILES=(
  eo_ar eo_ca eo_co eo_de eo_fl
  eo_ga eo_hi eo_id eo_il eo_in eo_ia eo_ks eo_ky eo_la eo_me
  eo_md eo_ma eo_mi eo_mn eo_ms eo_mo eo_mt eo_ne eo_nv eo_nh
  eo_nj eo_nm eo_ny eo_nc eo_nd eo_oh eo_ok eo_or eo_pa eo_pr
  eo_ri eo_sc eo_sd eo_tn eo_tx eo_ut eo_vt eo_va eo_wa eo_wv
  eo_wi eo_wy eo1 eo2 eo3 eo4
)

DOWNLOAD_DIR="${HOME}/.webcrawler/irs-bmf"
IRS_BASE_URL="https://www.irs.gov/pub/irs-soi"

mkdir -p "$DOWNLOAD_DIR"

TOTAL=${#STATE_FILES[@]}
DONE=0
ERRORS=0
GRAND_TOTAL=0
START=$(date +%s)

echo "════════════════════════════════════════════════════════════"
echo "  IRS BMF COPY Import — ${TOTAL} state files"
echo "  Method: COPY → temp table → INSERT SELECT (IO-efficient)"
echo "  Skipped (done): eo_al eo_ak eo_az eo_ct eo_dc"
echo "════════════════════════════════════════════════════════════"

for KEY in "${STATE_FILES[@]}"; do
  DONE=$((DONE + 1))
  CSV="${DOWNLOAD_DIR}/${KEY}.csv"

  # ── Download if not cached ──────────────────────────────────────────────
  if [ ! -f "$CSV" ]; then
    printf "  [%d/%d] %s  downloading..." "$DONE" "$TOTAL" "$KEY"
    URL="${IRS_BASE_URL}/${KEY}.csv"
    if command -v curl &>/dev/null; then
      curl -sL --retry 3 "$URL" -o "$CSV" 2>/dev/null || true
    else
      wget -q --tries=3 "$URL" -O "$CSV" 2>/dev/null || true
    fi
    if [ ! -s "$CSV" ]; then
      echo "  SKIP (download failed)"
      ERRORS=$((ERRORS + 1))
      continue
    fi
    echo " done."
  fi

  DATA_ROWS=$(( $(wc -l < "$CSV") - 1 ))
  printf "  [%d/%d] %s  %d rows\n" "$DONE" "$TOTAL" "$KEY" "$DATA_ROWS"

  # ── Import via COPY ─────────────────────────────────────────────────────
  OUTPUT=$(NODE_OPTIONS="--max-old-space-size=1024" \
    npx tsx prisma/import-irs-copy.ts "$CSV" "$KEY" 2>&1)
  EXIT_CODE=$?

  if [ "$EXIT_CODE" -ne 0 ]; then
    echo "    ERROR on $KEY (exit $EXIT_CODE)"
    echo "$OUTPUT" | tr '\r' '\n' | tail -5
    ERRORS=$((ERRORS + 1))
    continue
  fi

  echo "$OUTPUT" | tr '\r' '\n'

  ROWS=$(echo "$OUTPUT" | tr '\r' '\n' | grep 'rows inserted' \
    | grep -oE '[0-9,]+ rows inserted' | tail -1 \
    | grep -oE '[0-9,]+' | tr -d ',' 2>/dev/null || echo "0")
  [ -z "$ROWS" ] && ROWS=0
  GRAND_TOTAL=$((GRAND_TOTAL + ROWS))

  printf "  ── %s done: %s new rows ──\n\n" "$KEY" "$ROWS"
done

END=$(date +%s)
ELAPSED=$(( (END - START) / 60 ))

echo "════════════════════════════════════════════════════════════"
printf "  Done!  %s new rows imported in %d minutes\n" "$GRAND_TOTAL" "$ELAPSED"
if [ "$ERRORS" -gt 0 ]; then
  echo "  Errors: ${ERRORS} state(s) failed — re-run to retry"
fi
echo "════════════════════════════════════════════════════════════"
