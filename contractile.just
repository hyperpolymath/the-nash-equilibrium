# Manually updated: contractile gen-just + hand-expanded to match Xfile.a2ml checks
# Source directory: .machine_readable/contractiles
# Re-generate with: contractile gen-just --dir .machine_readable/contractiles
# Last updated: 2026-04-24
#
# SPDX-License-Identifier: AGPL-3.0-or-later

# ============================================================================
# MUST — Physical state checks (hard gates)
# Source: must/Mustfile.a2ml
# ============================================================================

# Run all must checks
must-check: must-license must-readme must-security must-ai-manifest must-readiness must-audit must-explainme must-state-not-template must-contractile-index must-spdx-source must-spdx-ncl must-no-believe-me must-no-template-residue
    @echo 'All must checks passed'

must-license:
    test -f LICENSE

must-readme:
    test -f README.adoc || test -f README.md

must-security:
    test -f SECURITY.md

must-ai-manifest:
    test -f 0-AI-MANIFEST.a2ml

must-contributing:
    test -f CONTRIBUTING.md

must-editorconfig:
    test -f .editorconfig

must-readiness:
    test -f READINESS.md

must-audit:
    test -f AUDIT.adoc

must-explainme:
    test -f EXPLAINME.adoc

must-state-not-template:
    test -f .machine_readable/6a2/STATE.a2ml
    ! grep -q 'project = "rsr-template-repo"' .machine_readable/6a2/STATE.a2ml

must-contractile-index:
    test -f .machine_readable/contractiles/INDEX.a2ml

must-spdx-source:
    ! find src/ -name '*.idr' -o -name '*.zig' 2>/dev/null | head -20 | xargs grep -L 'SPDX-License-Identifier' 2>/dev/null | head -1 | grep -q .

must-spdx-ncl:
    ! find .machine_readable/contractiles -name '*.ncl' 2>/dev/null | xargs grep -L 'SPDX-License-Identifier' 2>/dev/null | head -1 | grep -q .

must-no-believe-me:
    ! grep -r 'believe_me' --include='*.idr' --exclude-dir='.git' . 2>/dev/null | head -1 | grep -q .

must-no-admitted:
    ! grep -r 'Admitted' --include='*.v' --exclude-dir='.git' --exclude-dir='node_modules' . 2>/dev/null | head -1 | grep -q .

must-no-template-residue:
    ! grep -q 'project := "rsr-template-repo"' Justfile 2>/dev/null

# ============================================================================
# TRUST — Integrity and provenance verification (hard gates)
# Source: trust/Trustfile.a2ml
# ============================================================================

# Run all trust verifications
trust-verify: trust-no-secrets trust-no-private-keys trust-agpl-license trust-agpl-spdx trust-no-dockerfile trust-container-pinned trust-no-banned-proofs trust-no-open-bindings
    @echo 'All trust verifications passed'

trust-no-secrets:
    test ! -f .env && test ! -f credentials.json && test ! -f .env.local && test ! -f .env.production

trust-no-private-keys:
    ! find . -name '*.pem' -o -name '*.key' -o -name 'id_rsa' -o -name 'id_ed25519' 2>/dev/null | grep -v '.git/' | head -1 | grep -q .

trust-agpl-license:
    grep -q 'AGPL' LICENSE

trust-agpl-spdx:
    grep -q 'SPDX-License-Identifier: AGPL-3.0-or-later' LICENSE

trust-no-dockerfile:
    test ! -f Dockerfile

trust-container-pinned:
    test ! -f Containerfile || grep -q 'cgr.dev\|@sha256:' Containerfile

trust-no-banned-proofs:
    ! grep -rE 'believe_me|assert_total|Admitted|sorry|unsafeCoerce|Obj\.magic' --include='*.idr' --include='*.lean' --include='*.v' --exclude-dir='.git' . 2>/dev/null | head -1 | grep -q .

trust-no-open-bindings:
    ! grep -rE 'bind\("0\.0\.0\.0' --include='*.rs' --include='*.gleam' --exclude-dir='.git' . 2>/dev/null | head -1 | grep -q .

# ============================================================================
# BUST — Failure mode checks
# Source: bust/Bustfile.a2ml
# ============================================================================

# Check all failure modes have recovery paths documented
bust-check: bust-no-pmpl-in-source bust-state-not-template bust-no-leaked-secrets
    @echo 'Bust checks passed (recovery paths documented)'

bust-no-pmpl-in-source:
    ! grep -rl 'SPDX-License-Identifier: PMPL-1.0-or-later' src/ .machine_readable/ 2>/dev/null | head -1 | grep -q .

bust-state-not-template:
    ! grep -q 'project = "rsr-template-repo"' .machine_readable/6a2/STATE.a2ml 2>/dev/null

bust-no-leaked-secrets:
    ! git log --all --oneline -- '*.pem' '*.key' '.env' 'credentials.json' 2>/dev/null | head -1 | grep -q .

# ============================================================================
# DUST — Cleanup and hygiene (advisory)
# Source: dust/Dustfile.a2ml
# ============================================================================

# Run all dust checks (advisory — won't fail build)
dust-check: dust-no-stale-snapshots dust-no-ai-djot dust-no-scm-files dust-no-placeholder-tokens dust-no-tracked-artifacts dust-no-pmpl-drift
    @echo 'Dust checks complete (advisory)'

dust-no-stale-snapshots:
    ! ls *-STATUS-*.md *-COMPLETION-*.md *-COMPLETE.md 2>/dev/null | head -1 | grep -q .

dust-no-ai-djot:
    test ! -f AI.djot

dust-no-scm-files:
    ! find .machine_readable/ -name '*.scm' 2>/dev/null | head -1 | grep -q .

dust-no-placeholder-tokens:
    ! grep -rl '{{[A-Z_]*}}' --include='*.a2ml' --include='*.adoc' --exclude-dir='.git' . 2>/dev/null | head -1 | grep -q .

dust-no-tracked-artifacts:
    ! git ls-files lib/bs/ lib/ocaml/ target/release/ _build/ zig-cache/ zig-out/ 2>/dev/null | head -1 | grep -q .

dust-no-pmpl-drift:
    ! grep -rl 'SPDX-License-Identifier: PMPL-1.0-or-later' src/ .machine_readable/ 2>/dev/null | head -1 | grep -q .

# ============================================================================
# ADJUST — Accessibility checks (advisory)
# Source: adjust/Adjustfile.a2ml
# ============================================================================

# Run all adjust checks (advisory)
adjust-check: adjust-colourblind-documented adjust-pattern-not-colour adjust-complexity-documented adjust-glossary
    @echo 'Adjust checks complete (advisory)'

adjust-colourblind-documented:
    grep -qi 'colourblind\|color-blind\|Okabe' docs/game-design/board-design.adoc 2>/dev/null || echo 'ADVISORY: colourblind palette not yet documented in board-design.adoc'

adjust-pattern-not-colour:
    grep -q 'pattern\|icon\|symbol' docs/game-design/board-design.adoc 2>/dev/null || echo 'ADVISORY: pattern-not-colour differentiation not documented'

adjust-complexity-documented:
    grep -qi 'complexity\|weight\|difficulty' docs/game-design/OVERVIEW.adoc 2>/dev/null || echo 'ADVISORY: game complexity level not documented in OVERVIEW.adoc'

adjust-glossary:
    grep -qi 'glossary\|Glossary' docs/game-design/OVERVIEW.adoc 2>/dev/null || echo 'ADVISORY: game theory glossary not yet present'

# ============================================================================
# INTEND — North-star status report (non-gating)
# Source: intend/Intentfile.a2ml
# ============================================================================

# Display all declared intents with their current status
intend-status:
    @echo '=== The Nash Equilibrium — Declared Intents ==='
    @echo ''
    @echo 'DONE:'
    @echo '  ✓ rsr-scaffolding-complete (launcher, 6-verb contractiles, READINESS.md, template residue cleared)'
    @echo ''
    @echo 'IN PROGRESS:'
    @echo '  ⟳ game-design-docs-complete (event-cards, playtesting-plan stubs remain)'
    @echo ''
    @echo 'DECLARED (not started):'
    @echo '  ○ game-engine-language-decision (ADR-002 pending)'
    @echo '  ○ nash-equilibrium-solver-spec (docs/architecture/SOLVER-SPEC.adoc)'
    @echo '  ○ first-family-playtest'
    @echo '  ○ core-game-loop-implemented'
    @echo '  ○ create-dogfood-log (required for CRG grade C)'
    @echo '  ○ abi-validation-complete'
    @echo ''
    @echo '=== Horizon Wishes ==='
    @echo '  near  physical-prototype-release'
    @echo '  mid   game-theory-educational-layer'
    @echo '  mid   digital-companion-app (Tauri 2.0+)'
    @echo '  far   open-source-community'
    @echo '  far   formal-game-mechanics-proofs (Idris2 dependent types)'

# Probe rsr-scaffolding-complete intent
intend-probe-scaffolding:
    test -f .machine_readable/contractiles/INDEX.a2ml
    test -f .machine_readable/contractiles/_base.ncl
    test -f READINESS.md
    test -f .machine_readable/6a2/STATE.a2ml
    test -f .machine_readable/launcher/the-nash-equilibrium.launcher.a2ml
    ! grep -q 'project = "rsr-template-repo"' .machine_readable/6a2/STATE.a2ml
    @echo 'rsr-scaffolding-complete probe: PASS'

