#!/usr/bin/env bash
LOG=/tmp/irs-copy.log
DONE_STATES=$(grep -cE "^  ── eo_" "$LOG" 2>/dev/null || echo 0)
CURRENT=$(grep -E "^\s*\[" "$LOG" 2>/dev/null | tail -1 || echo "")
GRAND=$(grep -oE "new rows ──" "$LOG" | wc -l | tr -d ' ')
ERRORS=$(grep -c "ERROR on" "$LOG" 2>/dev/null || echo 0)
MOD=$(stat -c "%y" "$LOG" 2>/dev/null | cut -d'.' -f1)
echo "States complete:  $DONE_STATES / 56"
echo "Currently on:     $CURRENT"
echo "Total rows (new): $GRAND"
echo "Failed chunks:    $ERRORS"
echo "Log updated:      $MOD"
echo ""
echo "--- Last 20 lines ---"
tail -20 "$LOG"
