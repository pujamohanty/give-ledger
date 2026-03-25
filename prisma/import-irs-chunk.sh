#!/usr/bin/env bash
# import-irs-chunk.sh
# Splits a large state CSV into 30k-row chunks and imports each one separately.
# Handles large states (CA, FL, NY, TX, IL etc.) that exceed 1GB Node heap limit.
#
# Usage: bash prisma/import-irs-chunk.sh <fileKey>
#   e.g. bash prisma/import-irs-chunk.sh eo_ca

set -euo pipefail
cd "$(dirname "$0")/.."

FILE_KEY="${1:-}"
if [ -z "$FILE_KEY" ]; then
  echo "Usage: bash prisma/import-irs-chunk.sh <fileKey>"; exit 1
fi

DOWNLOAD_DIR="${HOME}/.webcrawler/irs-bmf"
CSV_PATH="${DOWNLOAD_DIR}/${FILE_KEY}.csv"
CHUNK_DIR="${DOWNLOAD_DIR}/chunks"
CHUNK_SIZE=30000

mkdir -p "$CHUNK_DIR"

# Download if needed
if [ ! -f "$CSV_PATH" ]; then
  echo "  Downloading ${FILE_KEY}.csv from IRS..."
  URL="https://www.irs.gov/pub/irs-soi/${FILE_KEY}.csv"
  curl -sL --retry 3 "$URL" -o "$CSV_PATH" || wget -q --tries=3 "$URL" -O "$CSV_PATH"
fi

TOTAL_ROWS=$(wc -l < "$CSV_PATH")
HEADER=$(head -1 "$CSV_PATH")
DATA_ROWS=$(( TOTAL_ROWS - 1 ))
CHUNKS=$(( (DATA_ROWS + CHUNK_SIZE - 1) / CHUNK_SIZE ))

echo "  [${FILE_KEY}] ${DATA_ROWS} rows → ${CHUNKS} chunks of ${CHUNK_SIZE}"

GRAND=0
for i in $(seq 1 "$CHUNKS"); do
  START_LINE=$(( (i - 1) * CHUNK_SIZE + 2 ))  # +2 skips header (line 1)
  CHUNK_FILE="${CHUNK_DIR}/${FILE_KEY}_chunk${i}.csv"

  # Write header + this chunk's data rows
  echo "$HEADER" > "$CHUNK_FILE"
  sed -n "${START_LINE},$((START_LINE + CHUNK_SIZE - 1))p" "$CSV_PATH" >> "$CHUNK_FILE"

  CHUNK_ROWS=$(( $(wc -l < "$CHUNK_FILE") - 1 ))
  printf "    chunk %d/%d (%d rows) ... " "$i" "$CHUNKS" "$CHUNK_ROWS"

  OUTPUT=$(NODE_OPTIONS="--max-old-space-size=1024" \
    npx tsx prisma/import-irs-single-path.ts "$CHUNK_FILE" "${FILE_KEY}_chunk${i}" 2>&1) || {
    echo "ERROR"
    echo "      $OUTPUT"
    continue
  }

  ROWS=$(echo "$OUTPUT" | tr '\r' '\n' | grep 'rows imported' | grep -oE '[0-9,]+ rows imported' | tail -1 | grep -oE '[0-9,]+' | tr -d ',' || echo "0")
  [ -z "$ROWS" ] && ROWS=0
  echo "${ROWS} rows"
  GRAND=$((GRAND + ROWS))

  # Clean up chunk file to save disk space
  rm -f "$CHUNK_FILE"
done

echo "  [${FILE_KEY}] total: ${GRAND} rows imported"
