import { content, assetById } from "./content.js";
import { shuffle } from "./rng.js";
import { clone, event, gainResources, reputation, RESOURCES, STRESS_TRACKS } from "./utils.js";

export function initializeGame(seed = 12345, playerConfigs = []) {
  const startingPlayers = content.startingState.players;
  const players = startingPlayers.map((base, index) => {
    const override = playerConfigs[index] ?? {};
    const role = content.roles[override.role ?? base.role];
    return {
      id: base.id,
      name: override.name || base.name,
      role: override.role ?? base.role,
      resources: clone(role.startingResources),
      resourceCap: content.constants.resourceCap,
      actionPoints: 0,
      assets: [...base.assets],
      breakthroughs: [],
      licensedBreakthroughs: [],
      researchQueue: [],
      defectionMarks: 0,
      fulfilledContracts: 0,
      fulfilledTradeContracts: 0,
      fulfilledMultilateralPacts: 0,
      fulfilledTechnologyLicenses: 0,
      stressContribution: { climate: 0, biosphere: 0, social: 0 },
      stressReduced: { climate: 0, biosphere: 0, social: 0 },
      socialReduced: 0,
      ecologicalReduced: 0,
      turnStressQueued: { climate: 0, biosphere: 0, social: 0 },
      turnStressOffset: { climate: 0, biosphere: 0, social: 0 },
      turnIntent: [],
      negotiatedThisTurn: 0,
      researchedThisTurn: 0,
      marketMultiplierUsedTurn: false
    };
  });
  const assetDeck = shuffle(content.assets.map((asset) => asset.id), seed + 11).filter(
    (assetId) => !players.some((player) => player.assets.includes(assetId))
  );
  const crisisDeck = shuffle(content.crises.map((crisis) => crisis.id), seed + 23);
  const breakthroughDeck = shuffle(content.breakthroughs.map((breakthrough) => breakthrough.id), seed + 37);
  const state = {
    gameId: `alpha-0-1-seed-${seed}`,
    version: content.constants.version,
    seed,
    turn: 0,
    phase: "UPKEEP",
    players,
    stress: clone(content.startingState.stress),
    stressHistory: [],
    assetMarket: assetDeck.splice(0, content.constants.visibleAssetCount),
    assetDeck,
    crisisDeck,
    crisisDiscard: [],
    breakthroughDeck,
    activeContracts: [],
    proposals: [],
    contractHistory: [],
    eventLog: [],
    telemetry: [],
    collapse: false,
    endgame: null,
    flags: { climateModelingUsed: false }
  };
  event(state, `Game initialized with seed ${seed}.`);
  return advancePhase(state);
}

export function serializeGame(state) {
  return JSON.stringify(state, null, 2);
}

export function loadGame(json) {
  const state = typeof json === "string" ? JSON.parse(json) : clone(json);
  validateState(state);
  return state;
}

export function validateState(state) {
  if (!state || !Array.isArray(state.players) || state.players.length !== 4) {
    throw new Error("Invalid game state: expected exactly 4 players.");
  }
  for (const track of STRESS_TRACKS) {
    if (!Number.isInteger(state.stress[track])) throw new Error(`Invalid stress track: ${track}`);
  }
  return true;
}

export function advancePhase(state) {
  if (state.phase === "ENDGAME") return state;
  if (state.phase === "UPKEEP") return runUpkeep(state);
  if (state.phase === "PLANNING") {
    state.phase = "NEGOTIATION";
    event(state, "Negotiation phase started.");
    return state;
  }
  if (state.phase === "NEGOTIATION") {
    state.phase = "COMMITMENT";
    event(state, "Commitment phase started.");
    return state;
  }
  if (state.phase === "COMMITMENT") {
    state.phase = "RESOLUTION";
    event(state, "Resolution phase started.");
    return state;
  }
  if (state.phase === "RESOLUTION") {
    state.phase = "CRISIS";
    event(state, "Crisis phase started.");
    return state;
  }
  state.phase = "UPKEEP";
  return runUpkeep(state);
}

export function runUpkeep(state) {
  if (state.turn >= content.constants.maxTurns || state.collapse) {
    state.phase = "ENDGAME";
    return state;
  }
  state.turn += 1;
  state.phase = "PLANNING";
  for (const player of state.players) {
    const role = content.roles[player.role];
    player.actionPoints = content.constants.actionPointsPerTurn;
    player.turnIntent = [];
    player.turnStressQueued = { climate: 0, biosphere: 0, social: 0 };
    player.turnStressOffset = { climate: 0, biosphere: 0, social: 0 };
    player.negotiatedThisTurn = 0;
    player.researchedThisTurn = 0;
    player.marketMultiplierUsedTurn = false;
    gainResources(player, role.income, player.resourceCap);
  }
  for (const contract of state.activeContracts) {
    if (!contract.permanent && contract.duration > 0) contract.duration -= 1;
  }
  event(state, `Turn ${state.turn} upkeep: AP refreshed and role income paid.`);
  return state;
}

export function drawAsset(state) {
  if (state.assetDeck.length === 0) {
    state.assetDeck = shuffle(content.assets.map((asset) => asset.id), state.seed + state.turn + state.eventLog.length);
  }
  return state.assetDeck.shift();
}

export function replaceMarketAsset(state, assetId) {
  const index = state.assetMarket.indexOf(assetId);
  if (index >= 0) state.assetMarket.splice(index, 1, drawAsset(state));
}

export function getPublicPlayer(player) {
  return {
    ...player,
    reputation: reputation(player.defectionMarks),
    assetNames: player.assets.map((assetId) => assetById[assetId]?.name ?? assetId)
  };
}

export { content };
