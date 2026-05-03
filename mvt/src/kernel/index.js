export const ROLES = {
  capitalist: {
    name: "Capitalist",
    actionText: {
      develop: "+5 Prosperity, +3 System Stress",
      steward: "+1 Prosperity, -2 System Stress",
      hedge: "+2 Prosperity, 1 Shield"
    }
  },
  socialist: {
    name: "Socialist",
    actionText: {
      develop: "+4 Prosperity, +2 System Stress",
      steward: "+1 Prosperity, -2 System Stress, +1 Prosperity to the lowest player",
      hedge: "+2 Prosperity, 1 Shield"
    }
  },
  green: {
    name: "Green",
    actionText: {
      develop: "+4 Prosperity, +2 System Stress",
      steward: "+1 Prosperity, -3 System Stress",
      hedge: "+2 Prosperity, 1 Shield"
    }
  },
  techno_utopian: {
    name: "Techno-Utopian",
    actionText: {
      develop: "+4 Prosperity, +2 System Stress",
      steward: "+1 Prosperity, -2 System Stress",
      hedge: "+2 Prosperity, 2 Shield"
    }
  }
};

export const CONSTANTS = {
  ruleset: "mvt-public-goods-kernel",
  maxTurns: 5,
  startingProsperity: 5,
  startingSystemStress: 3,
  collapseThreshold: 12,
  defectionStressPenalty: 1,
  defectionScorePenalty: 2,
  collectiveStewardshipMinimum: 2,
  collectiveStewardshipStressReduction: 2,
  collectiveStewardshipProsperityBonus: 1
};

export const ACTIONS = ["develop", "steward", "hedge"];

export function initializeKernelGame(playerNames = {}) {
  const players = Object.keys(ROLES).map((role) => ({
    id: role,
    role,
    name: playerNames[role] || ROLES[role].name,
    prosperity: CONSTANTS.startingProsperity,
    shield: 0,
    defectionMarks: 0,
    pledgedSteward: null,
    selectedAction: null,
    stressAddedThisTurn: 0,
    finalScore: null
  }));
  return {
    ruleset: CONSTANTS.ruleset,
    turn: 1,
    maxTurns: CONSTANTS.maxTurns,
    phase: "PLEDGE",
    systemStress: CONSTANTS.startingSystemStress,
    players,
    collapse: false,
    endgame: null,
    eventLog: [entry(1, "PLEDGE", "Game started. System Stress begins at 3.")],
    stressHistory: [{ turn: 0, systemStress: CONSTANTS.startingSystemStress }],
    turnHistory: []
  };
}

export function setPledge(state, playerId, pledgedSteward) {
  assertPhase(state, "PLEDGE");
  const player = findPlayer(state, playerId);
  player.pledgedSteward = Boolean(pledgedSteward);
  log(state, `${player.name} ${player.pledgedSteward ? "pledged to Steward" : "did not pledge"}.`);
  if (state.players.every((candidate) => candidate.pledgedSteward !== null)) {
    state.phase = "ACTION_SELECTION";
    log(state, "All pledges locked. Secret action selection begins.");
  }
  return state;
}

export function selectAction(state, playerId, action) {
  assertPhase(state, "ACTION_SELECTION");
  if (!ACTIONS.includes(action)) throw new Error(`Unknown action: ${action}`);
  const player = findPlayer(state, playerId);
  player.selectedAction = action;
  log(state, `${player.name} locked an action.`);
  if (state.players.every((candidate) => candidate.selectedAction)) {
    state.phase = "RESOLUTION";
    log(state, "All actions locked. Reveal and resolve.");
  }
  return state;
}

export function resolveTurn(state) {
  assertPhase(state, "RESOLUTION");
  const summary = [];
  for (const player of state.players) {
    player.shield = 0;
    player.stressAddedThisTurn = 0;
  }

  for (const player of state.players) {
    const before = snapshot(player);
    applyAction(state, player);
    const actionSummary = summarizeAction(before, player, state);
    summary.push({ playerId: player.id, action: player.selectedAction, pledgedSteward: player.pledgedSteward, ...actionSummary });
  }

  applyPledgeConsequences(state, summary);
  applyCollectiveStewardship(state, summary);

  state.systemStress = Math.max(0, state.systemStress);
  state.turnHistory.push({
    turn: state.turn,
    summary,
    systemStressAfterResolution: state.systemStress
  });
  state.stressHistory.push({ turn: state.turn, systemStress: state.systemStress });
  state.phase = "CRISIS";
  log(state, `Resolution complete. System Stress is ${state.systemStress}.`);
  return state;
}

export function crisisCheck(state) {
  assertPhase(state, "CRISIS");
  if (state.systemStress >= CONSTANTS.collapseThreshold) {
    state.collapse = true;
    state.phase = "ENDGAME";
    state.endgame = calculateEndgame(state);
    log(state, "System collapsed. No winner.");
    return state;
  }

  const damage = predictedCrisisDamage(state.systemStress);
  if (damage > 0) {
    const highestStress = Math.max(...state.players.map((player) => player.stressAddedThisTurn));
    for (const player of state.players) {
      const shieldedDamage = Math.max(0, damage - player.shield);
      player.prosperity = Math.max(0, player.prosperity - shieldedDamage);
      if (shieldedDamage > 0) log(state, `${player.name} lost ${shieldedDamage} Prosperity to crisis damage.`);
      if (highestStress > 0 && player.stressAddedThisTurn === highestStress) {
        player.prosperity = Math.max(0, player.prosperity - 1);
        log(state, `${player.name} was a highest stress contributor and lost 1 additional Prosperity.`);
      }
    }
  } else {
    log(state, "No crisis damage this turn.");
  }

  if (state.turn >= state.maxTurns) {
    state.phase = "ENDGAME";
    state.endgame = calculateEndgame(state);
    log(state, "Turn 5 complete. Final scoring resolved.");
    return state;
  }

  state.turn += 1;
  state.phase = "PLEDGE";
  for (const player of state.players) {
    player.shield = 0;
    player.pledgedSteward = null;
    player.selectedAction = null;
    player.stressAddedThisTurn = 0;
  }
  log(state, `Turn ${state.turn} begins.`);
  return state;
}

export function proceed(state) {
  if (state.phase === "RESOLUTION") return resolveTurn(state);
  if (state.phase === "CRISIS") return crisisCheck(state);
  throw new Error(`Phase ${state.phase} needs player input.`);
}

export function predictedActionEffect(player) {
  return ROLES[player.role].actionText;
}

export function predictedCrisisDamage(systemStress) {
  if (systemStress >= 12) return Infinity;
  if (systemStress === 11) return 3;
  if (systemStress >= 8) return 2;
  if (systemStress >= 5) return 1;
  return 0;
}

export function sharedOutcome(systemStress, collapse = false) {
  if (collapse || systemStress >= 12) return "Collapse";
  if (systemStress <= 4) return "Stable Transition";
  if (systemStress <= 7) return "Fragile Survival";
  return "Emergency Survival";
}

export function calculateEndgame(state) {
  const rankings = state.players
    .map((player) => ({
      playerId: player.id,
      name: player.name,
      role: player.role,
      prosperity: player.prosperity,
      defectionMarks: player.defectionMarks,
      finalScore: player.prosperity - CONSTANTS.defectionScorePenalty * player.defectionMarks
    }))
    .sort((a, b) => b.finalScore - a.finalScore);
  return {
    outcome: sharedOutcome(state.systemStress, state.collapse),
    winner: state.collapse ? null : rankings[0],
    rankings,
    stressHistory: state.stressHistory,
    turnHistory: state.turnHistory
  };
}

export function serializeGame(state) {
  return JSON.stringify(state, null, 2);
}

export function loadGame(json) {
  const state = typeof json === "string" ? JSON.parse(json) : structuredClone(json);
  if (state.ruleset !== CONSTANTS.ruleset) throw new Error("Save file is not an MVT public-goods-kernel game.");
  return state;
}

function applyAction(state, player) {
  if (player.selectedAction === "develop") {
    const prosperity = player.role === "capitalist" ? 5 : 4;
    const stress = player.role === "capitalist" ? 3 : 2;
    player.prosperity += prosperity;
    player.stressAddedThisTurn += stress;
    state.systemStress += stress;
    log(state, `${player.name} Developed: +${prosperity} Prosperity, +${stress} System Stress.`);
  }
  if (player.selectedAction === "steward") {
    const stressReduction = player.role === "green" ? 3 : 2;
    player.prosperity += 1;
    state.systemStress -= stressReduction;
    log(state, `${player.name} Stewarded: +1 Prosperity, -${stressReduction} System Stress.`);
    if (player.role === "socialist") {
      const receiver = lowestProsperityPlayer(state);
      receiver.prosperity += 1;
      log(state, `${player.name}'s Socialist stewardship gave +1 Prosperity to ${receiver.name}.`);
    }
  }
  if (player.selectedAction === "hedge") {
    const shield = player.role === "techno_utopian" ? 2 : 1;
    player.prosperity += 2;
    player.shield += shield;
    log(state, `${player.name} Hedged: +2 Prosperity, ${shield} Shield.`);
  }
}

function applyPledgeConsequences(state, summary) {
  for (const player of state.players) {
    if (player.pledgedSteward && player.selectedAction !== "steward") {
      player.defectionMarks += 1;
      player.stressAddedThisTurn += CONSTANTS.defectionStressPenalty;
      state.systemStress += CONSTANTS.defectionStressPenalty;
      log(state, `${player.name} broke a Stewardship Pledge: +1 Defection Mark, +1 System Stress.`);
      const row = summary.find((item) => item.playerId === player.id);
      if (row) row.brokePledge = true;
    }
    if (player.pledgedSteward && player.selectedAction === "steward") {
      log(state, `${player.name} fulfilled a Stewardship Pledge.`);
      const row = summary.find((item) => item.playerId === player.id);
      if (row) row.fulfilledPledge = true;
    }
  }
}

function applyCollectiveStewardship(state, summary) {
  const fulfilling = state.players.filter((player) => player.pledgedSteward && player.selectedAction === "steward");
  if (fulfilling.length < CONSTANTS.collectiveStewardshipMinimum) return;
  state.systemStress -= CONSTANTS.collectiveStewardshipStressReduction;
  for (const player of fulfilling) player.prosperity += CONSTANTS.collectiveStewardshipProsperityBonus;
  log(state, `Collective Stewardship succeeded: -2 System Stress, +1 Prosperity to ${fulfilling.map((player) => player.name).join(", ")}.`);
  for (const player of fulfilling) {
    const row = summary.find((item) => item.playerId === player.id);
    if (row) row.collectiveBonus = true;
  }
}

function lowestProsperityPlayer(state) {
  return [...state.players].sort((a, b) => a.prosperity - b.prosperity || a.name.localeCompare(b.name))[0];
}

function summarizeAction(before, player, state) {
  return {
    prosperityDelta: player.prosperity - before.prosperity,
    shieldDelta: player.shield - before.shield,
    stressAdded: player.stressAddedThisTurn,
    systemStress: state.systemStress
  };
}

function snapshot(player) {
  return {
    prosperity: player.prosperity,
    shield: player.shield,
    stressAddedThisTurn: player.stressAddedThisTurn
  };
}

function findPlayer(state, playerId) {
  const player = state.players.find((candidate) => candidate.id === playerId);
  if (!player) throw new Error(`Unknown player: ${playerId}`);
  return player;
}

function assertPhase(state, phase) {
  if (state.phase !== phase) throw new Error(`Expected ${phase}, got ${state.phase}.`);
}

function log(state, message) {
  state.eventLog.push(entry(state.turn, state.phase, message));
}

function entry(turn, phase, message) {
  return { turn, phase, message, index: crypto.randomUUID ? crypto.randomUUID() : `${turn}-${phase}-${message}` };
}
