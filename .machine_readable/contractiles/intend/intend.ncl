# SPDX-License-Identifier: AGPL-3.0-or-later
# Intend — north-star runner (verb is `intend`, file is `Intentfile.a2ml`)
#
# Pairs with: Intentfile.a2ml (same directory)
# Verb:       intend
# Semantics:  Declares BOTH concrete committed next-actions ([[intents]]) and
#             horizon aspirations ([[wishes]]). Not a gate — reports progress.
#               intents: 'declared → 'in_progress → 'done | 'deferred | 'retired
#               wishes:  'declared → 'in_progress → 'achieved | 'abandoned
# CLI:        `contractile intend run`       → print status table (both sections)
#             `contractile intend progress`  → diff declared-vs-observed (intents)
#             `contractile intend horizon`   → group wishes by near/mid/far
#
# History:    Absorbed the deprecated `lust` contractile's [[wishes]] schema 2026-04-18.
#
# Base: ../_base.ncl provides pedigree_schema, run_defaults, probe_schema.

let base = import "../_base.ncl" in

{
  pedigree = base.pedigree_schema & {
    contractile_verb = "intend",
    semantics = "north-star (commitments + aspirations)",
    security = {
      leash = 'Kennel,
      trust_level = "read-only reporting",
      allow_network = false,
      allow_filesystem_write = false,
      allow_subprocess = true,
    },
    metadata = {
      name = "intend-runner",
      version = "2.0.0",
      description = "Reports progress toward committed next-actions and lists horizon aspirations. Non-gating. Absorbed `lust` semantics 2026-04-18.",
      paired_xfile = "Intentfile.a2ml",
      author = "Jonathan D.A. Jewell <j.d.a.jewell@open.ac.uk>",
    },
  },

  schema = {
    intents
      | Array {
          id | String,
          description | String,
          probe | String | optional,
          status | [| 'declared, 'in_progress, 'done, 'deferred, 'retired |] | default = 'declared,
          notes | String | optional,
          target_date | String | optional,
        },
    wishes
      | Array {
          id | String,
          description | String,
          horizon | [| 'near, 'mid, 'far |] | default = 'mid,
          why | String | optional,
          status | [| 'declared, 'in_progress, 'achieved, 'abandoned |] | default = 'declared,
          notes | String | optional,
        }
      | optional,
  },

  run = base.run_defaults & {
    on_pass = "continue",
    on_any_fail = "continue",
    report_format = "a2ml",
    emit_summary = true,
    emit_diff = true,
    emit_grouped_by_horizon = true,
  },
}
