export const RESOURCES = ["labour", "capital", "nature", "knowledge", "energy"];
export const STRESS_TRACKS = ["climate", "biosphere", "social"];
export const PHASES = ["UPKEEP", "PLANNING", "NEGOTIATION", "COMMITMENT", "RESOLUTION", "CRISIS", "ENDGAME"];

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function sumResources(resources = {}) {
  return Object.values(resources).reduce((sum, value) => sum + value, 0);
}

export function addMap(target, delta = {}, cap = Infinity) {
  for (const [key, value] of Object.entries(delta)) {
    target[key] = clamp((target[key] ?? 0) + value, 0, cap);
  }
}

export function hasResources(player, cost = {}) {
  return Object.entries(cost).every(([resource, amount]) => (player.resources[resource] ?? 0) >= amount);
}

export function spendResources(player, cost = {}) {
  if (!hasResources(player, cost)) return false;
  for (const [resource, amount] of Object.entries(cost)) {
    player.resources[resource] -= amount;
  }
  return true;
}

export function gainResources(player, gain = {}, cap = 10) {
  for (const [resource, amount] of Object.entries(gain)) {
    player.resources[resource] = clamp((player.resources[resource] ?? 0) + amount, 0, cap);
  }
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function event(state, message, data = {}) {
  state.eventLog.push({
    turn: state.turn,
    phase: state.phase,
    message,
    data,
    index: state.eventLog.length
  });
}

export function findPlayer(state, playerId) {
  const player = state.players.find((candidate) => candidate.id === playerId);
  if (!player) throw new Error(`Unknown player: ${playerId}`);
  return player;
}

export function reputation(defectionMarks) {
  if (defectionMarks >= 2) return "Untrusted";
  if (defectionMarks === 1) return "Questionable";
  return "Reliable";
}

export function stressBand(value) {
  if (value >= 11) return "Breached";
  if (value >= 8) return "Dangerous";
  if (value >= 4) return "Strained";
  return "Safe";
}
