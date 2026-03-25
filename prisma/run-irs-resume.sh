#!/usr/bin/env bash
# run-irs-resume.sh
# Resumes the IRS BMF import, skipping states already fully imported.
# Confirmed done in run4: eo_al, eo_ak, eo_az, eo_ct, eo_dc
# Starts from eo_ar and processes all remaining states.
# Batch size in import-irs-single-path.ts reduced to 50 to avoid statement timeouts.
#
# Usage:  bash prisma/run-irs-resume.sh
#         bash prisma/run-irs-resume.sh 2>&1 | tee /tmp/irs-run9.log

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
CHUNK_DIR="${DOWNLOAD_DIR}/chunks"
CHUNK_SIZE=25000
IRS_BASE_URL="https://www.irs.gov/pub/irs-soi"

mkdir -p "$DOWNLOAD_DIR" "$CHUNK_DIR"

TOTAL=${#STATE_FILES[@]}
DONE=0
ERRORS=0
GRAND_TOTAL=0
START=$(date +%s)

echo "════════════════════════════════════════════════════════════"
echo "  IRS BMF Resume — ${TOTAL} remaining state files, ${CHUNK_SIZE} rows/chunk, batch=50"
echo "  Skipped (already done): eo_al eo_ak eo_az eo_ct eo_dc"
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
    echo -n " done. "
  else
    printf "  [%d/%d] %s  " "$DONE" "$TOTAL" "$KEY"
  fi

  # ── Split CSV into chunks ───────────────────────────────────────────────
  DATA_ROWS=$(( $(wc -l < "$CSV") - 1 ))
  CHUNKS=$(( (DATA_ROWS + CHUNK_SIZE - 1) / CHUNK_SIZE ))
  printf "%d rows → %d chunk(s)\n" "$DATA_ROWS" "$CHUNKS"

  rm -f "${CHUNK_DIR}/${KEY}_chunk_"*.csv

  awk -v chunk_size="$CHUNK_SIZE" -v out_dir="$CHUNK_DIR" -v key="$KEY" '
    BEGIN { prev_fname = "" }
    NR == 1 { header = $0; next }
    {
      chunk_idx = int((NR - 2) / chunk_size)
      fname = out_dir "/" key "_chunk_" chunk_idx ".csv"
      if (!(fname in seen)) {
        if (prev_fname != "") close(prev_fname)
        print header > fname
        seen[fname] = 1
        prev_fname = fname
      }
      print >> fname
    }
  ' "$CSV"

  # ── Import each chunk ───────────────────────────────────────────────────
  STATE_TOTAL=0
  for CHUNK_FILE in "${CHUNK_DIR}/${KEY}_chunk_"*.csv; do
    [ -f "$CHUNK_FILE" ] || continue
    CHUNK_LABEL=$(basename "$CHUNK_FILE" .csv)

    OUTPUT=$(NODE_OPTIONS="--max-old-space-size=1024" \
      npx tsx prisma/import-irs-single-path.ts "$CHUNK_FILE" "$CHUNK_LABEL" 2>&1)
    EXIT_CODE=$?
    if [ "$EXIT_CODE" -ne 0 ]; then
      echo "    ERROR on $CHUNK_LABEL (exit $EXIT_CODE)"
      echo "    $OUTPUT" | tr '\r' '\n' | tail -5
      ERRORS=$((ERRORS + 1))
      rm -f "$CHUNK_FILE"
      continue
    fi

    ROWS=$(echo "$OUTPUT" | tr '\r' '\n' | grep 'rows imported' \
      | grep -oE '[0-9,]+ rows imported' | tail -1 \
      | grep -oE '[0-9,]+' | tr -d ',' 2>/dev/null || echo "0")
    [ -z "$ROWS" ] && ROWS=0
    STATE_TOTAL=$((STATE_TOTAL + ROWS))
    GRAND_TOTAL=$((GRAND_TOTAL + ROWS))

    printf "    ✓ %s: %s rows\n" "$CHUNK_LABEL" "$ROWS"
    rm -f "$CHUNK_FILE"
  done

  printf "  ── %s done: %s rows ──\n\n" "$KEY" "$STATE_TOTAL"
done

END=$(date +%s)
ELAPSED=$(( (END - START) / 60 ))

echo "════════════════════════════════════════════════════════════"
printf "  Done!  ~%s rows imported in %d minutes\n" "$GRAND_TOTAL" "$ELAPSED"
if [ "$ERRORS" -gt 0 ]; then
  echo "  Errors: ${ERRORS} chunk(s) failed — re-run to retry"
fi
echo "════════════════════════════════════════════════════════════"
