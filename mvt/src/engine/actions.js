import { actionById, assetById, breakthroughById, content } from "./content.js";
import { replaceMarketAsset } from "./gameState.js";
import { addMap, clamp, event, findPlayer, gainResources, hasResources, spendResources, STRESS_TRACKS } from "./utils.js";

export function getLegalActions(state, playerId) {
  const player = findPlayer(state, playerId);
  const remainingAp = remainingActionPoints(player);
  return content.actions.filter((action) => action.apCost <= remainingAp);
}

export function submitIntent(state, playerId, intent) {
  if (state.phase !== "PLANNING") throw new Error("Actions can only be queued during Planning.");
  const player = findPlayer(state, playerId);
  const action = actionById[intent.actionId];
  if (!action) throw new Error(`Unknown action: ${intent.actionId}`);
  if (remainingActionPoints(player) < action.apCost) throw new Error("Not enough AP.");
  const normalized = {
    id: intent.id ?? `intent_${state.turn}_${playerId}_${player.turnIntent.length + 1}`,
    playerId,
    actionId: intent.actionId,
    apCost: action.apCost,
    inputs: intent.inputs ?? {},
    targets: intent.targets ?? {},
    status: "QUEUED"
  };
  player.turnIntent.push(normalized);
  event(state, `${player.name} queued ${action.name}.`, { private: true, playerId, intent: normalized });
  return normalized;
}

export function clearIntent(state, playerId, intentId) {
  if (state.phase !== "PLANNING") throw new Error("Actions can only be edited during Planning.");
  const player = findPlayer(state, playerId);
  player.turnIntent = player.turnIntent.filter((intent) => intent.id !== intentId);
}

export function lockTurn(state) {
  if (state.phase !== "COMMITMENT") throw new Error("Turn can only lock during Commitment.");
  for (const player of state.players) {
    player.turnIntent = player.turnIntent.map((intent) => ({ ...intent, status: "LOCKED" }));
  }
  event(state, "All action plans locked.");
}

export function remainingActionPoints(player) {
  return player.actionPoints - player.turnIntent.reduce((sum, intent) => sum + intent.apCost, 0);
}

export function resolveActions(state) {
  const order = ["stabilize", "restore", "extract", "produce", "build", "research", "offset", "negotiate"];
  for (const actionId of order) {
    for (const player of state.players) {
      for (const intent of player.turnIntent.filter((candidate) => candidate.actionId === actionId)) {
        applyAction(state, intent);
      }
    }
  }
}

export function applyAction(state, intent) {
  const player = findPlayer(state, intent.playerId);
  if (intent.status === "FAILED") return;
  const handlers = {
    stabilize: applyStabilize,
    restore: applyRestore,
    offset: applyOffset,
    extract: applyExtract,
    produce: applyProduce,
    build: applyBuild,
    research: applyResearch,
    negotiate: applyNegotiate
  };
  const handler = handlers[intent.actionId];
  if (!handler) throw new Error(`No handler for action ${intent.actionId}`);
  const ok = handler(state, player, intent);
  intent.status = ok ? "RESOLVED" : "FAILED";
}

function applyStabilize(state, player, intent) {
  const cost = chooseCost(intent.inputs, [{ capital: 2 }, { capital: 1, labour: 1 }, { knowledge: 1, labour: 1 }]);
  if (!cost || !spendResources(player, cost)) return fail(state, player, "Stabilize failed: missing resources.");
  const amount = player.role === "socialist" ? 2 : 1;
  reduceStress(state, player, { social: amount });
  player.socialReduced += amount;
  event(state, `${player.name} stabilized society, reducing Social Strain by ${amount}.`);
  return true;
}

function applyRestore(state, player, intent) {
  const track = intent.targets.stressTrack;
  if (!["climate", "biosphere"].includes(track)) return fail(state, player, "Restore failed: target must be Climate or Biosphere.");
  const cost = chooseCost(intent.inputs, [{ labour: 2 }, { capital: 2 }, { labour: 1, knowledge: 1 }]);
  if (!cost || !spendResources(player, cost)) return fail(state, player, "Restore failed: missing resources.");
  const amount = player.role === "green" ? 2 : 1;
  reduceStress(state, player, { [track]: amount });
  player.ecologicalReduced += amount;
  event(state, `${player.name} restored ${track}, reducing it by ${amount}.`);
  return true;
}

function applyOffset(state, player, intent) {
  let remaining = 2;
  for (const track of STRESS_TRACKS) {
    const requested = Math.min(intent.targets?.[track] ?? 0, remaining, player.turnStressQueued[track]);
    const affordable = Math.min(requested, player.resources.capital);
    if (affordable > 0) {
      player.resources.capital -= affordable;
      player.turnStressQueued[track] -= affordable;
      player.turnStressOffset[track] += affordable;
      remaining -= affordable;
    }
  }
  const total = Object.values(player.turnStressOffset).reduce((sum, value) => sum + value, 0);
  event(state, `${player.name} offset ${total} queued stress.`);
  return true;
}

function applyExtract(state, player, intent) {
  if (player.role === "green" && intent.targets?.lowImpact) {
    gainResources(player, { nature: 1, energy: 1 }, player.resourceCap);
    queueStress(player, { climate: 1 });
    event(state, `${player.name} extracted carefully: +1 Nature, +1 Energy, +1 Climate.`);
    return true;
  }
  gainResources(player, { nature: 2, energy: 1 }, player.resourceCap);
  queueStress(player, { climate: 1, biosphere: 1 });
  event(state, `${player.name} extracted: +2 Nature, +1 Energy, +1 Climate, +1 Biosphere.`);
  return true;
}

function applyProduce(state, player, intent) {
  const selected = (intent.targets.assets ?? player.assets).slice(0, 2);
  let activated = 0;
  for (const assetId of selected) {
    if (!player.assets.includes(assetId)) continue;
    const asset = assetById[assetId];
    if (!asset?.produce || !spendResources(player, asset.produce.input)) continue;
    const output = { ...(asset.produce.output ?? {}) };
    if (assetId === "solar_farm" && hasBreakthrough(state, "clean_energy_grid")) output.energy = (output.energy ?? 0) + 1;
    if (hasBreakthroughForPlayer(player, "automation_platform")) output.capital = (output.capital ?? 0) + 1;
    gainResources(player, output, player.resourceCap);
    queueStress(player, asset.produce.stress ?? {});
    if (asset.produce.stressReduction) reduceStress(state, player, asset.produce.stressReduction);
    activated += 1;
  }
  if (activated === 0) return fail(state, player, "Produce failed: no selected assets could activate.");
  event(state, `${player.name} produced with ${activated} asset(s).`);
  return true;
}

function applyBuild(state, player, intent) {
  const assetId = intent.targets.assetId ?? state.assetMarket[0];
  const asset = assetById[assetId];
  if (!asset || !state.assetMarket.includes(assetId)) return fail(state, player, "Build failed: asset is not in the market.");
  if (!spendResources(player, asset.cost)) return fail(state, player, `Build failed: cannot afford ${asset.name}.`);
  player.assets.push(assetId);
  replaceMarketAsset(state, assetId);
  if (!hasBreakthrough(state, "circular_supply_chain")) queueStress(player, asset.buildStress ?? {});
  event(state, `${player.name} built ${asset.name}.`);
  return true;
}

function applyResearch(state, player, intent) {
  let cost = content.constants.researchKnowledgeCost;
  if (player.role === "techno_utopian" && player.researchedThisTurn === 0) cost = Math.max(1, cost - 1);
  if (!spendResources(player, { knowledge: cost })) return fail(state, player, "Research failed: missing Knowledge.");
  const breakthroughId = intent.targets.breakthroughId ?? player.researchQueue[0]?.breakthroughId ?? state.breakthroughDeck[0];
  if (!breakthroughById[breakthroughId]) return fail(state, player, "Research failed: unknown breakthrough.");
  let queueItem = player.researchQueue.find((item) => item.breakthroughId === breakthroughId);
  if (!queueItem) {
    queueItem = { breakthroughId, progress: 0 };
    player.researchQueue.push(queueItem);
  }
  queueItem.progress += 1;
  player.researchedThisTurn += 1;
  event(state, `${player.name} advanced ${breakthroughById[breakthroughId].name} to ${queueItem.progress}/2.`);
  if (queueItem.progress >= content.constants.breakthroughProgressRequired) completeBreakthrough(state, player, breakthroughId);
  return true;
}

function applyNegotiate(state, player) {
  player.negotiatedThisTurn += 1;
  event(state, `${player.name} spent AP to formalize a binding contract.`);
  return true;
}

export function queueStress(player, stress = {}) {
  addMap(player.turnStressQueued, stress, Infinity);
}

export function reduceStress(state, player, reduction = {}) {
  for (const [track, amount] of Object.entries(reduction)) {
    const actual = Math.min(amount, state.stress[track]);
    state.stress[track] = clamp(state.stress[track] - actual, 0, content.constants.stressCap);
    player.stressReduced[track] += actual;
  }
}

export function registerStress(state) {
  const pending = { climate: 0, biosphere: 0, social: 0 };
  for (const player of state.players) {
    for (const track of STRESS_TRACKS) {
      pending[track] += player.turnStressQueued[track];
    }
  }
  const wouldOverflow = Object.fromEntries(STRESS_TRACKS.map((track) => [track, state.stress[track] === content.constants.stressCap && pending[track] > 0]));
  for (const player of state.players) {
    for (const track of STRESS_TRACKS) {
      const amount = player.turnStressQueued[track];
      if (amount > 0) {
        player.stressContribution[track] += amount;
        state.stress[track] = clamp(state.stress[track] + amount, 0, content.constants.stressCap);
      }
    }
    const total = Object.values(player.turnStressQueued).reduce((sum, value) => sum + value, 0);
    if (total > 0) event(state, `${player.name} registered ${total} stress.`, { stress: player.turnStressQueued });
  }
  return { pending, wouldOverflow };
}

function completeBreakthrough(state, player, breakthroughId) {
  const breakthrough = breakthroughById[breakthroughId];
  player.breakthroughs.push(breakthroughId);
  player.researchQueue = player.researchQueue.filter((item) => item.breakthroughId !== breakthroughId);
  state.breakthroughDeck = state.breakthroughDeck.filter((id) => id !== breakthroughId);
  if (breakthrough.risk?.stress) queueStress(player, breakthrough.risk.stress);
  if (breakthrough.risk?.ifTrackBreached && state.stress[breakthrough.risk.ifTrackBreached] >= 11) queueStress(player, breakthrough.risk.stress);
  if (breakthrough.effect === "geoengineering") reduceStress(state, player, { climate: 3 });
  if (breakthrough.effect === "public_health_systems") reduceStress(state, player, { social: 2 });
  event(state, `${player.name} completed breakthrough: ${breakthrough.name}.`);
}

function hasBreakthrough(state, breakthroughId) {
  return state.players.some((player) => hasBreakthroughForPlayer(player, breakthroughId));
}

function hasBreakthroughForPlayer(player, breakthroughId) {
  return player.breakthroughs.includes(breakthroughId) || player.licensedBreakthroughs.includes(breakthroughId);
}

function chooseCost(inputs, legalCosts) {
  return legalCosts.find((cost) => Object.entries(cost).every(([resource, amount]) => inputs?.[resource] === amount));
}

function fail(state, player, message) {
  event(state, `${player.name}: ${message}`);
  return false;
}
