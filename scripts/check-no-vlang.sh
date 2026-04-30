#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>
#
# check-no-vlang.sh — enforce "V-language is banned in the estate".
#
# Estate rule: V-lang (vlang.io) is banned. The connector layer is
# `zig-unified-api-adapter` (16 endpoints + transaction-firewall gating).
# Treat any v-lang reference as drift and remove it.
#
# Searches for V-lang-specific patterns in tracked files. The .v file
# extension is intentionally NOT used as a marker because Coq theorem files
# share that extension; this check looks at content patterns instead.
#
# Excludes:
#   .git/ (vcs internals)
#   affinescript/ (a separately-licensed AffineScript subtree; pattern hits
#       there are not estate-managed and false-positive on `.v` mentions in
#       linguistic / academic prose).
#
# Exit codes:
#   0 — no V-lang references found
#   1 — V-lang references found (treat as drift)
#   2 — usage / setup error

set -euo pipefail

REPO_ROOT="${1:-.}"

# Patterns that uniquely indicate V-lang code, scaffolding, or naming.
# Coq's `.v` extension and the affinescript subtree are excluded by path.
PATTERNS=(
    'gen-v-connector'
    'V-TRIPLE'
    'v-triple'
    'V-lang'
    'v-lang'
    'vlang'
    'connectors/v-'
)

PATTERN_OR=$(IFS='|'; echo "${PATTERNS[*]}")

# Build grep arguments. Use -r to recurse, -n for line numbers, -i for
# case-insensitive matching. Exclude .git, the affinescript subtree, and
# this script itself (which contains the pattern strings).
HITS=$(grep -rni -E "$PATTERN_OR" "$REPO_ROOT" \
    --exclude-dir=.git \
    --exclude-dir=affinescript \
    --exclude-dir=node_modules \
    --exclude="$(basename "$0")" \
    2>/dev/null || true)

if [ -z "$HITS" ]; then
    echo "PASS: no V-lang references"
    exit 0
fi

# Count matches
LINES=$(echo "$HITS" | wc -l | tr -d ' ')

echo "FAIL: $LINES V-lang reference(s) found (estate rule: V-language is banned):" >&2
echo "$HITS" | sed 's|^|  |' >&2
echo "" >&2
echo "V-lang has been replaced by zig-unified-api-adapter. Remove these references." >&2
exit 1
