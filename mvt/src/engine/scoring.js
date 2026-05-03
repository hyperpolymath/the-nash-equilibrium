import { assetById, breakthroughById, content } from "./content.js";
import { STRESS_TRACKS, sumResources } from "./utils.js";

export function checkCollapse(state, pendingStress = null) {
  const breachedTracks = STRESS_TRACKS.filter((track) => state.stress[track] >= 11).length;
  if (breachedTracks >= 2) return true;
  if (pendingStress) return STRESS_TRACKS.some((track) => state.stress[track] === content.constants.stressCap && pendingStress[track] > 0);
  return false;
}

export function sharedOutcome(state) {
  if (state.collapse || checkCollapse(state)) return "Systemic Collapse";
  const max = Math.max(...STRESS_TRACKS.map((track) => state.stress[track]));
  if (max <= 7) return "Stable Transition";
  if (max <= 10) return "Fragile Survival";
  return "Emergency Survival";
}

export function calculateScores(state) {
  const outcome = sharedOutcome(state);
  const scores = state.players.map((player) => ({ playerId: player.id, name: player.name, role: player.role, score: scorePlayer(state, player) })).sort((a, b) => b.score - a.score);
  return {
    outcome,
    winner: outcome === "Systemic Collapse" ? null : scores[0],
    scores,
    finalStress: { ...state.stress },
    stressHistory: state.stressHistory,
    defectionLedger: state.players.map((player) => ({ playerId: player.id, name: player.name, defectionMarks: player.defectionMarks })),
    contractHistory: state.contractHistory,
    stressContribution: state.players.map((player) => ({ playerId: player.id, name: player.name, ...player.stressContribution }))
  };
}

function scorePlayer(state, player) {
  const defects = player.defectionMarks * 3;
  if (player.role === "capitalist") {
    const productiveAssets = player.assets.filter((assetId) => assetById[assetId]?.productive).length;
    const stress = Math.floor(totalStress(player) / 2);
    return player.resources.capital + productiveAssets * 2 + player.fulfilledTradeContracts - stress - defects;
  }
  if (player.role === "socialist") {
    return player.resources.labour + player.fulfilledMultilateralPacts * 2 + (state.stress.social <= 4 ? 3 : 0) + player.socialReduced - defects;
  }
  if (player.role === "green") {
    const ecologicalStress = Math.floor(((player.stressContribution.climate ?? 0) + (player.stressContribution.biosphere ?? 0)) / 2);
    return player.resources.nature + player.ecologicalReduced * 2 + (state.stress.climate <= 6 ? 3 : 0) + (state.stress.biosphere <= 6 ? 3 : 0) - ecologicalStress - defects;
  }
  const cleanTechnology = player.breakthroughs.concat(player.licensedBreakthroughs).some((id) => breakthroughById[id]?.cleanTechnology) || player.assets.some((id) => assetById[id]?.tags?.includes("clean_technology"));
  return player.breakthroughs.length * 2 + player.resources.knowledge + (cleanTechnology ? 3 : 0) + player.fulfilledTechnologyLicenses - Math.floor((player.stressContribution.social ?? 0) / 2) - defects;
}

function totalStress(player) {
  return sumResources(player.stressContribution);
}
