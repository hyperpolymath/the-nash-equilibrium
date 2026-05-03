import { resolveActions, registerStress } from "./actions.js";
import { resolveContracts } from "./contracts.js";
import { resolveCrisisPhase } from "./crisis.js";
import { advancePhase, initializeGame } from "./gameState.js";
import { calculateScores, checkCollapse } from "./scoring.js";
import { event } from "./utils.js";

export * from "./actions.js";
export * from "./contracts.js";
export * from "./crisis.js";
export * from "./gameState.js";
export * from "./scoring.js";
export * from "./utils.js";

export function resolveTurn(state) {
  if (state.phase !== "RESOLUTION") throw new Error("Turn can only resolve in Resolution phase.");
  resolveActions(state);
  resolveContracts(state);
  const stressResult = registerStress(state);
  state.stressHistory.push({ turn: state.turn, stress: { ...state.stress } });
  state.telemetry.push(collectTurnTelemetry(state));
  if (checkCollapse(state, stressResult.pending)) {
    state.collapse = true;
    state.phase = "ENDGAME";
    state.endgame = calculateScores(state);
    event(state, "Systemic Collapse triggered during stress registration.");
    return state;
  }
  state.phase = "CRISIS";
  return state;
}

export function proceed(state) {
  if (state.phase === "RESOLUTION") return resolveTurn(state);
  if (state.phase === "CRISIS") return resolveCrisisPhase(state);
  return advancePhase(state);
}

export function createDemoGame(seed = 12345) {
  return initializeGame(seed, [
    { name: "Capitalist" },
    { name: "Socialist" },
    { name: "Green" },
    { name: "Techno-Utopian" }
  ]);
}

function collectTurnTelemetry(state) {
  return {
    turn: state.turn,
    actionsChosen: state.players.map((player) => ({ playerId: player.id, actions: player.turnIntent.map((intent) => intent.actionId) })),
    stressAdded: state.players.map((player) => ({ playerId: player.id, ...player.turnStressQueued })),
    stressReduced: state.players.map((player) => ({ playerId: player.id, ...player.stressReduced })),
    contractsProposed: state.proposals.filter((contract) => contract.createdTurn === state.turn).length,
    activeContracts: state.activeContracts.length,
    finalStress: { ...state.stress }
  };
}
