# SPDX-License-Identifier: AGPL-3.0-or-later
# Must — invariants runner
#
# Pairs with: Mustfile.a2ml (same directory)
# Verb:       must (invariant assertion)
# Semantics:  every check is a hard gate. A single failure blocks merge.
# CLI:        `contractile must run` → reads Mustfile.a2ml, evaluates each check,
#             emits pass/fail verdict per item, exits non-zero if any failed.
#
# Base: ../_base.ncl provides pedigree_schema, run_defaults, probe_schema.

let base = import "../_base.ncl" in

{
  pedigree = base.pedigree_schema & {
    contractile_verb = "must",
    semantics = "invariant",
    security = {
      leash = 'Kennel,
      trust_level = "read-only verification",
      allow_network = false,
      allow_filesystem_write = false,
      allow_subprocess = true,
    },
    metadata = {
      name = "must-runner",
      version = "1.0.0",
      description = "Evaluates every invariant in the adjacent Mustfile.a2ml as a hard gate.",
      paired_xfile = "Mustfile.a2ml",
      author = "Jonathan D.A. Jewell <j.d.a.jewell@open.ac.uk>",
    },
  },

  schema = {
    invariants
      | Array {
          id | String,
          description | String,
          probe | String,
          status | [| 'declared, 'verified, 'failing |] | default = 'declared,
          severity | [| 'critical, 'high, 'medium |] | default = 'critical,
          notes | String | optional,
          fix | String | optional,
        },
  },

  run = base.run_defaults & {
    on_any_fail = "exit-nonzero",
    report_format = "a2ml",
    emit_summary = true,
  },
}
