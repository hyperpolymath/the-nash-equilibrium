#!/usr/bin/env bash
# SPDX-License-Identifier: MPL-2.0
# Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>
#
# check-docs-render.sh — every .adoc must actually render.
#
# The estate rule "AsciiDoc by default" is enforced by extension
# (check-no-md-in-docs.sh). Nothing enforced that the *content* parses. A
# malformed table, an unterminated listing block, or a stray level-0 heading
# renders to silently mangled output and ships unnoticed.
#
# This renders every .adoc with --failure-level=WARN and fails on any
# diagnostic. It is the content-side counterpart to the extension-side check.
#
# Known-bad files are quarantined in ALLOWED below rather than silently
# skipped — the list is meant to shrink, and an empty list is the goal.
#
# Exit codes:
#   0 — every non-allow-listed .adoc renders without warnings
#   1 — one or more failed to render cleanly
#   2 — usage / setup error (asciidoctor missing)

set -euo pipefail

REPO_ROOT="${1:-.}"

# Quarantine for files that cannot yet be made to render. It is empty, and an
# empty list is the goal — do not add a file here to turn a red build green.
#
# It previously held six half-converted files (a `= Title` bolted onto a
# Markdown body). All six were converted to real AsciiDoc and removed from this
# list; the dialect that put them here is now blocked at source by
# check-adoc-not-markdown.sh.
ALLOWED=()

if ! command -v asciidoctor >/dev/null 2>&1; then
    echo "FAIL: asciidoctor not found. Install with: gem install asciidoctor" >&2
    exit 2
fi

if [ ! -d "$REPO_ROOT" ]; then
    echo "FAIL: not a directory: $REPO_ROOT" >&2
    exit 2
fi

mapfile -t FILES < <(find "$REPO_ROOT" -name '*.adoc' -type f -not -path '*/.git/*' | sort)

if [ ${#FILES[@]} -eq 0 ]; then
    echo "PASS: no .adoc files found (nothing to check)"
    exit 0
fi

BROKEN=()
CLEAN=0
SKIPPED=0

for f in "${FILES[@]}"; do
    rel="${f#"$REPO_ROOT/"}"
    rel="${rel#./}"

    skip=0
    # ${a[@]+"${a[@]}"} — expanding an empty array under `set -u` is an error
    # on bash < 4.4 (still shipped by macOS). ALLOWED is empty and should stay
    # that way, so this guard is load-bearing.
    for allowed in ${ALLOWED[@]+"${ALLOWED[@]}"}; do
        if [ "$rel" = "$allowed" ]; then skip=1; break; fi
    done
    if [ $skip -eq 1 ]; then
        SKIPPED=$((SKIPPED + 1))
        continue
    fi

    if out=$(asciidoctor --failure-level=WARN -o /dev/null "$f" 2>&1) && [ -z "$out" ]; then
        CLEAN=$((CLEAN + 1))
    else
        BROKEN+=("$rel")
        BROKEN+=("$(echo "$out" | sed 's/^/      /')")
    fi
done

if [ ${#BROKEN[@]} -eq 0 ]; then
    echo "PASS: $CLEAN .adoc files render cleanly (${SKIPPED} quarantined in ALLOWED)"
    exit 0
fi

echo "FAIL: $(( ${#BROKEN[@]} / 2 )) .adoc file(s) do not render cleanly:" >&2
for ((i = 0; i < ${#BROKEN[@]}; i += 2)); do
    echo "  - ${BROKEN[i]}" >&2
    echo "${BROKEN[i + 1]}" >&2
done
echo "" >&2
echo "Fix the markup, or — only for pre-existing boilerplate — add a justified" >&2
echo "entry to the ALLOWED list in scripts/check-docs-render.sh." >&2
exit 1
