import { content } from "./content.js";
import { event, findPlayer, gainResources, hasResources, spendResources, STRESS_TRACKS } from "./utils.js";
import { reduceStress, queueStress } from "./actions.js";

export function proposeContract(state, draft) {
  if (state.phase !== "NEGOTIATION") throw new Error("Contracts can only be proposed during Negotiation.");
  const template = content.contractTemplates.find((item) => item.id === draft.type);
  if (!template) throw new Error(`Unknown contract type: ${draft.type}`);
  const contract = {
    id: draft.id ?? `contract_${String(state.proposals.length + state.contractHistory.length + 1).padStart(3, "0")}`,
    type: draft.type,
    name: draft.name ?? template.name,
    parties: draft.parties,
    duration: draft.duration ?? template.duration,
    permanent: draft.permanent ?? false,
    status: "PROPOSED",
    acceptedBy: [],
    obligations: draft.obligations ?? [],
    successEffect: draft.successEffect ?? {},
    defectionPenalty: draft.defectionPenalty ?? { defectionMarks: 1, stress: { social: 1 } },
    requiresNegotiate: template.requiresNegotiate,
    createdTurn: state.turn
  };
  state.proposals.push(contract);
  event(state, `Contract proposed: ${contract.name}.`, { contract });
  return contract;
}

export function acceptContract(state, playerId, contractId) {
  const contract = state.proposals.find((proposal) => proposal.id === contractId);
  if (!contract) throw new Error(`Unknown proposal: ${contractId}`);
  if (!contract.parties.includes(playerId)) throw new Error("Only parties can accept the contract.");
  if (!contract.acceptedBy.includes(playerId)) contract.acceptedBy.push(playerId);
  event(state, `${findPlayer(state, playerId).name} accepted ${contract.name}.`);
  if (contract.acceptedBy.length === contract.parties.length) activateContract(state, contract);
}

export function activateContract(state, contract) {
  if (contract.requiresNegotiate) {
    const hasNegotiator = contract.parties.some((playerId) => {
      const player = findPlayer(state, playerId);
      return player.negotiatedThisTurn > 0 || player.turnIntent.some((intent) => intent.actionId === "negotiate");
    });
    if (!hasNegotiator) {
      event(state, `${contract.name} cannot activate: no involved player spent Negotiate.`);
      return;
    }
  }
  for (const playerId of contract.parties) {
    const player = findPlayer(state, playerId);
    if (player.defectionMarks >= 2 && !spendResources(player, { capital: content.constants.untrustedBondCapital })) {
      event(state, `${contract.name} cannot activate: ${player.name} cannot post the untrusted bond.`);
      return;
    }
  }
  contract.status = contract.duration === 0 ? "FULFILLED" : "ACTIVE";
  state.proposals = state.proposals.filter((proposal) => proposal.id !== contract.id);
  if (contract.duration === 0) {
    resolveContract(state, contract);
    state.contractHistory.push(contract);
  } else {
    state.activeContracts.push(contract);
    event(state, `${contract.name} activated.`);
  }
}

export function resolveContracts(state) {
  for (const contract of [...state.activeContracts]) {
    resolveContract(state, contract);
    if (contract.status !== "ACTIVE" || contract.duration <= 0) {
      state.activeContracts = state.activeContracts.filter((candidate) => candidate.id !== contract.id);
      state.contractHistory.push(contract);
    }
  }
}

export function resolveContract(state, contract) {
  const defects = [];
  for (const obligation of contract.obligations) {
    const player = findPlayer(state, obligation.playerId);
    if (!fulfillObligation(state, player, obligation)) defects.push(player.id);
  }
  if (defects.length > 0) {
    for (const playerId of [...new Set(defects)]) applyDefection(state, findPlayer(state, playerId), contract);
    contract.status = "DEFECTED";
    event(state, `${contract.name} defected by ${defects.map((id) => findPlayer(state, id).name).join(", ")}.`);
    return;
  }
  applyContractEffect(state, contract.successEffect, contract);
  contract.status = contract.duration <= 0 ? "FULFILLED" : "ACTIVE";
  for (const playerId of contract.parties) {
    const player = findPlayer(state, playerId);
    player.fulfilledContracts += 1;
    if (contract.type === "spot_trade") player.fulfilledTradeContracts += 1;
    if (contract.parties.length > 2) player.fulfilledMultilateralPacts += 1;
    if (contract.type === "technology_license") player.fulfilledTechnologyLicenses += 1;
  }
  event(state, `${contract.name} fulfilled.`);
}

function fulfillObligation(state, player, obligation) {
  if (obligation.kind === "give_resource" || obligation.kind === "spend_resource") {
    const cost = { [obligation.resource]: obligation.amount };
    if (!spendResources(player, cost)) return false;
    if (obligation.toPlayerId) gainResources(findPlayer(state, obligation.toPlayerId), cost, findPlayer(state, obligation.toPlayerId).resourceCap);
    return true;
  }
  if (obligation.kind === "limit_stress") {
    return (player.turnStressQueued[obligation.track] ?? 0) <= obligation.maxIncrease;
  }
  if (obligation.kind === "contribute_research") {
    return spendResources(player, { knowledge: obligation.amount });
  }
  if (obligation.kind === "license_technology") {
    if (!player.breakthroughs.includes(obligation.breakthroughId)) return false;
    const receiver = findPlayer(state, obligation.toPlayerId);
    if (!receiver.licensedBreakthroughs.includes(obligation.breakthroughId)) receiver.licensedBreakthroughs.push(obligation.breakthroughId);
    return true;
  }
  if (obligation.kind === "restore_stress") {
    const cost = obligation.cost ?? {};
    if (!hasResources(player, cost)) return false;
    spendResources(player, cost);
    reduceStress(state, player, { [obligation.track]: obligation.amount });
    return true;
  }
  return true;
}

function applyContractEffect(state, effect = {}, contract) {
  if (effect.stress) {
    const reduction = {};
    const increase = {};
    for (const [track, amount] of Object.entries(effect.stress)) {
      if (amount < 0) reduction[track] = Math.abs(amount);
      else increase[track] = amount;
    }
    if (Object.keys(reduction).length > 0) reduceStress(state, findPlayer(state, contract.parties[0]), reduction);
    if (Object.keys(increase).length > 0) queueStress(findPlayer(state, contract.parties[0]), increase);
  }
  if (effect.resources) {
    for (const [playerId, resources] of Object.entries(effect.resources)) gainResources(findPlayer(state, playerId), resources);
  }
}

function applyDefection(state, player, contract) {
  player.defectionMarks += contract.defectionPenalty?.defectionMarks ?? 1;
  for (const track of STRESS_TRACKS) {
    state.stress[track] = Math.min(content.constants.stressCap, state.stress[track] + (contract.defectionPenalty?.stress?.[track] ?? 0));
  }
}
