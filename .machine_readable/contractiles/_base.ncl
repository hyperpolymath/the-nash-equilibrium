# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (c) 2026 Jonathan D.A. Jewell (hyperpolymath) <j.d.a.jewell@open.ac.uk>
#
# _base.ncl — Shared contractile base
#
# Provides four named schema fragments imported by every verb runner:
#
#   pedigree_schema   — canonical pedigree block shape
#   status_core_doc   — documentation of the shared status trio (String list)
#   probe_schema      — target structured probe form (spec only; verb files
#                       still use probe | String with TODO comments)
#   run_defaults      — default runner behaviour
#
# Usage in a verb runner:
#
#   let base = import "../_base.ncl" in
#   {
#     pedigree = base.pedigree_schema & {
#       contractile_verb = "must",
#       semantics = "invariant",
#       security = {
#         leash = 'Kennel,
#         trust_level = "read-only verification",
#         allow_network = false,
#         allow_filesystem_write = false,
#         allow_subprocess = true,
#       },
#       metadata = {
#         name = "must-runner",
#         version = "1.0.0",
#         description = "...",
#         paired_xfile = "Mustfile.a2ml",
#         author = "Jonathan D.A. Jewell <j.d.a.jewell@open.ac.uk>",
#       },
#     },
#     schema = { ... },
#     run = base.run_defaults & { on_any_fail = "exit-nonzero" },
#   }
#
# See: docs/CONTRACTILE-SPEC.adoc §Shared Base

{
  pedigree_schema = {
    schema_version | String | default = "1.0.0",
    contractile_verb | String | default = "UNSET",
    semantics | String | default = "UNSET",
    security = {
      leash | [| 'Kennel, 'Yard, 'Hunt |] | default = 'Kennel,
      trust_level | String | default = "UNSET",
      allow_network | Bool | default = false,
      allow_filesystem_write | Bool | default = false,
      allow_subprocess | Bool | default = true,
    },
    metadata = {
      name | String | default = "UNSET",
      version | String | default = "1.0.0",
      description | String | default = "UNSET",
      paired_xfile | String | default = "UNSET",
      author | String | default = "Jonathan D.A. Jewell <j.d.a.jewell@open.ac.uk>",
    },
  },

  # Documents the shared status values. Verb files reproduce their full enum verbatim.
  status_core_doc = "status_core values: declared | verified | failing — extended per verb",

  probe_schema = {
    command | String,
    timeout_seconds | Number | default = 300,
    allowed_exit_codes | Array Number | default = [0],
    permission_class
      | [| 'read_only, 'filesystem_write, 'subprocess, 'network |]
      | default = 'read_only,
  },

  run_defaults = {
    on_pass = "continue",
    on_any_fail = "exit-nonzero",
    report_format = "a2ml",
    emit_summary = true,
  },
}
