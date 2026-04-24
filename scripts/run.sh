#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>
#
# scripts/run.sh — Nash Equilibrium development server
#
# Design phase: serves game-design documentation at http://localhost:4242
# Called by: the-nash-equilibrium-launcher.sh (generated from
#            .machine_readable/launcher/the-nash-equilibrium.launcher.a2ml)
#
# Lifecycle note: When the game engine is implemented this script will be
# updated to launch it instead of serving docs. The launcher config
# (the-nash-equilibrium.launcher.a2ml) will need a corresponding update.

set -euo pipefail

PORT="${NASH_PORT:-4242}"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVE_DIR="${REPO_DIR}/docs"

echo "=== The Nash Equilibrium — development docs server ==="
echo "    Serving: ${SERVE_DIR}"
echo "    URL:     http://localhost:${PORT}"
echo "    Stop:    Ctrl+C"
echo ""

if [ ! -d "${SERVE_DIR}" ]; then
    echo "ERROR: docs/ directory not found at ${SERVE_DIR}" >&2
    echo "Run: just docs" >&2
    exit 1
fi

cd "${SERVE_DIR}"

# Try servers in order of preference.
# Ruby is available system-wide (used by CI for Jekyll); Deno is preferred
# but may not be installed. Fall back to Python 3 as a last resort.
if command -v ruby >/dev/null 2>&1; then
    exec ruby -run -e httpd . -p "${PORT}" 2>&1
elif command -v deno >/dev/null 2>&1; then
    exec deno run --allow-net --allow-read \
        "https://deno.land/std@0.224.0/http/file_server.ts" \
        --port "${PORT}" . 2>&1
elif command -v python3 >/dev/null 2>&1; then
    exec python3 -m http.server "${PORT}" 2>&1
else
    echo "ERROR: No HTTP server found." >&2
    echo "Install one of: ruby (dnf install ruby), deno, or python3" >&2
    exit 1
fi
