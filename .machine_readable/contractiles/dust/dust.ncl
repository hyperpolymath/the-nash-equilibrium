# SPDX-License-Identifier: AGPL-3.0-or-later
# Dust — exnovation / code-removal runner
#
# Pairs with: Dustfile.a2ml (same directory)
# Verb:       dust
# Semantics:  exnovation. Identifies code, docs, files, dependencies that are
#             candidates for REMOVAL. Advisory by default; can be flipped to
#             active delete via `contractile dust sweep --apply`.
# CLI:        `contractile dust find`   → list removal candidates
#             `contractile dust sweep`  → dry-run removals
#             `contractile dust sweep --apply` → actually delete (gated)
#
# Base: ../_base.ncl provides pedigree_schema, run_defaults, probe_schema.

let base = import "../_base.ncl" in

{
  pedigree = base.pedigree_schema & {
    contractile_verb = "dust",
    semantics = "exnovation / removal",
    security = {
      leash = 'Kennel,
      trust_level = "proposes deletion; --apply required to execute",
      allow_network = false,
      allow_filesystem_write = true,
      allow_subprocess = true,
      destructive_mode_requires_flag = "--apply",
    },
    metadata = {
      name = "dust-runner",
      version = "1.0.0",
      description = "Identifies and optionally removes exnovation targets listed in Dustfile.a2ml. Destructive mode gated behind --apply.",
      paired_xfile = "Dustfile.a2ml",
      author = "Jonathan D.A. Jewell <j.d.a.jewell@open.ac.uk>",
    },
  },

  schema = {
    removal_candidates
      | Array {
          id | String,
          description | String,
          target | String,
          reason | String,
          probe | String | optional,
          status | [| 'declared, 'proposed, 'approved, 'removed |] | default = 'declared,
          approver | String | optional,
          notes | String | optional,
        },
  },

  run = base.run_defaults & {
    on_any_fail = "continue-with-warnings",
    report_format = "a2ml",
    emit_summary = true,
    apply_requires_approval = true,
  },
}
