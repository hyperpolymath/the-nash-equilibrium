import { content } from "./content.js";
import { checkCollapse, calculateScores } from "./scoring.js";
import { clamp, event, findPlayer, spendResources, STRESS_TRACKS } from "./utils.js";

export function calculateCrisisDraws(stress, state = null) {
  let draws = 1;
  for (const track of STRESS_TRACKS) {
    if (stress[track] >= 8) draws += 1;
    if (stress[track] >= 11) draws += 1;
  }
  if (state && !state.flags.climateModelingUsed && state.players.some((player) => player.breakthroughs.includes("climate_modeling"))) {
    draws -= 1;
    state.flags.climateModelingUsed = true;
    event(state, "Climate Modeling reduced crisis draws by 1.");
  }
  return clamp(draws, 1, 4);
}

export function resolveCrisisPhase(state) {
  const draws = calculateCrisisDraws(state.stress, state);
  event(state, `Crisis forecast resolves: ${draws} card(s).`);
  for (let index = 0; index < draws; index += 1) {
    const crisisId = drawCrisis(state);
    resolveCrisis(state, content.crises.find((crisis) => crisis.id === crisisId));
  }
  const collapse = checkCollapse(state);
  if (collapse) {
    state.collapse = true;
    state.phase = "ENDGAME";
    state.endgame = calculateScores(state);
    event(state, "Systemic Collapse triggered. No winner.");
  } else if (state.turn >= content.constants.maxTurns) {
    state.phase = "ENDGAME";
    state.endgame = calculateScores(state);
    event(state, "Turn 6 ended. Final scoring complete.");
  } else {
    state.phase = "UPKEEP";
  }
  return state;
}

export function resolveCrisis(state, crisis) {
  event(state, `Crisis drawn: ${crisis.name}.`, { crisis });
  applyEffect(state, crisis.baseEffect, crisis);
  const condition = crisis.escalatedCondition;
  if (condition && (condition.track === "any" ? Math.max(...STRESS_TRACKS.map((track) => state.stress[track])) >= condition.min : state.stress[condition.track] >= condition.min)) {
    applyEffect(state, crisis.escalatedEffect, crisis);
    event(state, `${crisis.name} escalated.`);
  }
  state.crisisDiscard.push(crisis.id);
}

function drawCrisis(state) {
  if (state.crisisDeck.length === 0) {
    state.crisisDeck = [...state.crisisDiscard];
    state.crisisDiscard = [];
  }
  return state.crisisDeck.shift();
}

function applyEffect(state, effect = {}, crisis) {
  if (effect.allPlayersLose) {
    for (const player of state.players) spendResourcesPartial(player, effect.allPlayersLose);
  }
  if (effect.highestContributorLose) {
    spendResourcesPartial(selectTarget(state, crisis.targetingRule), effect.highestContributorLose);
  }
  if (effect.stress) {
    for (const [track, amount] of Object.entries(effect.stress)) state.stress[track] = clamp(state.stress[track] + amount, 0, content.constants.stressCap);
  }
  if (effect.reduceHighestStress) {
    const track = [...STRESS_TRACKS].sort((a, b) => state.stress[b] - state.stress[a])[0];
    state.stress[track] = clamp(state.stress[track] - effect.reduceHighestStress, 0, content.constants.stressCap);
  }
  if (effect.lose) spendResourcesPartial(selectTarget(state, crisis.targetingRule), effect.lose);
}

function spendResourcesPartial(player, cost) {
  for (const [resource, amount] of Object.entries(cost)) {
    spendResources(player, { [resource]: Math.min(amount, player.resources[resource] ?? 0) });
  }
}

function selectTarget(state, rule = "highest_total_contributor_this_turn") {
  if (rule === "none") return state.players[0];
  const track = rule.includes("climate") ? "climate" : rule.includes("biosphere") ? "biosphere" : rule.includes("social") ? "social" : null;
  return [...state.players].sort((a, b) => contribution(b, track) - contribution(a, track))[0];
}

function contribution(player, track) {
  if (track) return player.turnStressQueued[track] ?? 0;
  return STRESS_TRACKS.reduce((sum, candidate) => sum + (player.turnStressQueued[candidate] ?? 0), 0);
}
