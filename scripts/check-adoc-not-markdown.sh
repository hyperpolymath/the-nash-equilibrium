#!/usr/bin/env bash
# SPDX-License-Identifier: MPL-2.0
# Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>
#
# check-adoc-not-markdown.sh — an .adoc must be AsciiDoc, not Markdown wearing
# an .adoc extension.
#
# This is the third leg of the docs gate. The other two do not catch this:
#
#   check-no-md-in-docs.sh    — extension: is the file named .adoc?
#   check-docs-render.sh      — render:    does asciidoctor parse it?
#   check-adoc-not-markdown.sh — dialect:  is the *body* actually AsciiDoc?
#
# The gap this closes is real, not theoretical. Eight files were committed as a
# `= Title` line bolted onto an unmodified Markdown body. They passed the
# extension check (named .adoc) and Asciidoctor's Markdown-compat mode rendered
# `##` headings and ``` fences without complaint — so they read as "clean" while
# their SPDX headers rendered as visible body text and their tables rendered as
# garbage.
#
# Flagged as Markdown (each renders wrong, or is the wrong dialect):
#   ATX     `## Heading`      -> AsciiDoc `== Heading`. A `#` H1 parses as a
#                                *level-0* section; a second one is a hard error
#                                ("level 0 sections can only be used when
#                                doctype is book").
#   FENCE   ```lang           -> `[source,lang]` + `----`
#   HTML    <!-- comment -->  -> `// comment`. HTML comments are NOT comments in
#                                AsciiDoc; they render as literal visible text.
#   LINK    [text](url)       -> `link:url[text]` / `xref:file.adoc[text]`.
#                                Renders as literal text otherwise.
#   TABLE   |---|---|         -> `[cols=...]` + `|===`. Renders as garbage.
#   TASK    - [ ] item        -> `* [ ] item` (AsciiDoc checklist syntax).
#
# NOT flagged (all valid AsciiDoc, despite looking Markdown-ish):
#   `**bold**`      — unconstrained bold
#   `-` bullets     — a valid list marker
#   `> quote`       — a valid blockquote
#   `* [ ]` tasks   — the correct checklist form
#   anything inside a delimited block (----, ...., ====, ++++, ****, ////),
#   so shell `# comments` in a listing block are not mistaken for headings.
#
# Exit codes:
#   0 — every .adoc is genuine AsciiDoc
#   1 — one or more contain Markdown syntax
#   2 — usage / setup error

set -euo pipefail

REPO_ROOT="${1:-.}"

if [ ! -d "$REPO_ROOT" ]; then
    echo "FAIL: not a directory: $REPO_ROOT" >&2
    exit 2
fi

# Quarantine for pre-existing offenders. Empty is the goal, and it is currently
# empty — keep it that way. Do not add a file here to make a red build green.
ALLOWED=()

mapfile -t FILES < <(find "$REPO_ROOT" -name '*.adoc' -type f -not -path '*/.git/*' | sort)

if [ ${#FILES[@]} -eq 0 ]; then
    echo "PASS: no .adoc files found (nothing to check)"
    exit 0
fi

DETECT='
BEGIN { inblock = 0; delim = "" }
{
  line = $0

  # Delimited block open/close: 4+ of the delimiter char alone on the line.
  if (line ~ /^(-{4,}|\.{4,}|={4,}|\+{4,}|\*{4,}|\/{4,})[ \t]*$/) {
      d = substr(line, 1, 1)
      if (inblock && d == delim)   { inblock = 0; delim = "" }
      else if (!inblock)           { inblock = 1; delim = d  }
      next
  }

  # A Markdown fence is itself a finding, and it also opens a block whose
  # contents must not be scanned.
  if (line ~ /^[ \t]*```/) {
      if (inblock && delim == "`")  { inblock = 0; delim = "" }
      else if (!inblock)            { inblock = 1; delim = "`"
                                      emit("FENCE", "```lang -> [source,lang] + ----") }
      next
  }

  if (inblock) next

  if (line ~ /^#{1,6} /)                       emit("ATX",   "## Heading -> == Heading")
  if (line ~ /<!--/)                           emit("HTML",  "<!-- c --> -> // c  (renders as visible text!)")
  if (line ~ /\[[^]]+\]\([^)]+\)/)             emit("LINK",  "[t](url) -> link:url[t]  (renders as literal text!)")
  if (line ~ /^\|[-: |]*-{3,}[-: |]*$/)        emit("TABLE", "|---|---| -> [cols=...] + |===")
  if (line ~ /^[ \t]*[-+] \[[ xX]\]/)          emit("TASK",  "- [ ] -> * [ ]")
}
function emit(kind, hint) {
  printf "%s\t%d\t%s\t%s\t%s\n", FILENAME, FNR, kind, hint, substr(line, 1, 72)
}
'

TMPOUT="$(mktemp)"
trap 'rm -f "$TMPOUT"' EXIT

for f in "${FILES[@]}"; do
    rel="${f#"$REPO_ROOT/"}"
    rel="${rel#./}"

    skip=0
    for allowed in ${ALLOWED[@]+"${ALLOWED[@]}"}; do
        if [ "$rel" = "$allowed" ]; then skip=1; break; fi
    done
    [ $skip -eq 1 ] && continue

    if awk "$DETECT" "$f" >> "$TMPOUT" 2>/dev/null; then :; fi
done

if [ ! -s "$TMPOUT" ]; then
    echo "PASS: ${#FILES[@]} .adoc files are genuine AsciiDoc (no Markdown syntax)"
    exit 0
fi

FOUND=$(wc -l < "$TMPOUT")
NFILES=$(cut -f1 "$TMPOUT" | sort -u | wc -l)

echo "FAIL: $FOUND instance(s) of Markdown syntax in $NFILES .adoc file(s):" >&2
echo "" >&2
while IFS=$'\t' read -r file lineno kind hint text; do
    printf '  %s:%s  [%s]\n      %s\n      fix: %s\n' \
        "${file#./}" "$lineno" "$kind" "$text" "$hint" >&2
done < "$TMPOUT"
echo "" >&2
echo "An .adoc file must be AsciiDoc, not Markdown renamed. Convert the body." >&2
exit 1
