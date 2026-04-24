# SPDX-License-Identifier: AGPL-3.0-or-later
# Trust — security + safe-hacking runner
#
# Pairs with: Trustfile.a2ml (same directory)
# Verb:       trust
# Semantics:  integrity / provenance / security verification PLUS a declared
#             "safe hacking + testing" section — authorised offensive probes
#             (pen-test harness runs, chaos-engineering probes) scoped to the
#             repo under test, NEVER touching external systems.
# CLI:        `contractile trust verify` → run all verifications (read-only)
#             `contractile trust probe`  → run declared safe-hacking probes
#
# Base: ../_base.ncl provides pedigree_schema, run_defaults, probe_schema.

let base = import "../_base.ncl" in

{
  pedigree = base.pedigree_schema & {
    contractile_verb = "trust",
    semantics = "security + provenance + safe-hacking",
    security = {
      leash = 'Kennel,
      trust_level = "verification + authorised-probe",
      allow_network = false,
      allow_filesystem_write = false,
      allow_subprocess = true,
      authorised_probes_only = true,
    },
    metadata = {
      name = "trust-runner",
      version = "1.0.0",
      description = "Security + provenance verifications plus authorised safe-hacking probes. All probes are scoped to the repo under test; never hits external systems.",
      paired_xfile = "Trustfile.a2ml",
      author = "Jonathan D.A. Jewell <j.d.a.jewell@open.ac.uk>",
    },
  },

  schema = {
    verifications
      | Array {
          id | String,
          description | String,
          probe | String,
          status | [| 'declared, 'verified, 'failing |] | default = 'declared,
          severity | [| 'critical, 'high, 'medium, 'low |] | default = 'high,
          notes | String | optional,
        },

    safe_hacking
      | {
          scope | String,
          allowed_probe_classes
            | Array [| 'fuzz, 'property_test, 'chaos, 'auth_bypass, 'injection, 'timing |]
            | default = [],
          probes
            | Array {
                id | String,
                class | [| 'fuzz, 'property_test, 'chaos, 'auth_bypass, 'injection, 'timing |],
                description | String,
                probe | String,
                expected_outcome | [| 'probe_blocks_attempt, 'probe_finds_no_issue |],
                timeout_seconds | Number | default = 300,
                notes | String | optional,
              }
            | default = [],
        }
      | default = { scope = "this-repo-only", allowed_probe_classes = [], probes = [] },
  },

  run = base.run_defaults & {
    on_any_fail = "exit-nonzero",
    safe_hacking_on_unexpected_outcome = "exit-nonzero",
    report_format = "a2ml",
    emit_summary = true,
  },
}
