# SPDX-License-Identifier: AGPL-3.0-or-later
# Adjust — accessibility runner
#
# Pairs with: Adjustfile.a2ml (same directory)
# Verb:       adjust
# Semantics:  accessibility compliance (WCAG 2.1 AA baseline, adapted for
#             physical board-game materials and digital companion).
#             Gating where a deterministic fix exists; advisory otherwise.
# CLI:        `contractile adjust check` → run all probes, list violations
#             `contractile adjust fix`   → apply deterministic fixes where defined
#
# Base: ../_base.ncl provides pedigree_schema, run_defaults, probe_schema.

let base = import "../_base.ncl" in

{
  pedigree = base.pedigree_schema & {
    contractile_verb = "adjust",
    semantics = "accessibility compliance",
    security = {
      leash = 'Kennel,
      trust_level = "fixes allowed where deterministic",
      allow_network = false,
      allow_filesystem_write = true,
      allow_subprocess = true,
    },
    metadata = {
      name = "adjust-runner",
      version = "1.0.0",
      description = "Evaluates accessibility requirements from Adjustfile.a2ml for physical game materials and digital companion. Fixes deterministic items; flags the rest for human review.",
      paired_xfile = "Adjustfile.a2ml",
      author = "Jonathan D.A. Jewell <j.d.a.jewell@open.ac.uk>",
    },
  },

  schema = {
    requirements
      | Array {
          id | String,
          description | String,
          probe | String,
          status | [| 'declared, 'partial, 'verified, 'failing |] | default = 'declared,
          compliance | String | optional,
          notes | String | optional,
          fix | String | optional,
        },
  },

  run = base.run_defaults & {
    on_any_fail = "continue-with-warnings",
    report_format = "a2ml",
    emit_summary = true,
    auto_fix_when_available = true,
  },
}
