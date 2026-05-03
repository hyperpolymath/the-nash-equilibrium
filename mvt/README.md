# Econosphere MVT 0.0: Public Goods Kernel

Rollback prototype for testing only the core public-goods dilemma:

```text
private growth -> shared stress -> pledge -> defection/cooperation -> collapse or survival
```

This directory is intentionally self-contained and dependency-free. The active ruleset is `mvt-public-goods-kernel` in `src/kernel`. The larger Alpha 0.1 engine remains in `src/engine` for later reuse, but the UI now runs the simplified thesis test.

## Run

```sh
cd mvt
bun test
bun run serve
```

Then open `http://localhost:5173/`.

## Scope

Implemented:

- 4 asymmetric roles
- 5-turn deterministic state machine
- One private value: Prosperity
- One shared danger track: System Stress
- One pledge type: Stewardship Pledge
- Three actions: Develop, Steward, Hedge
- Deterministic crisis bands and highest-contributor penalty
- Save/load/export as JSON through local browser controls
- Event log, stress history, turn history, collapse gate, endgame explanation

The active kernel can be imported independently from `src/kernel/index.js`.
