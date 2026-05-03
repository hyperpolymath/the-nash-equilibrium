import roles from "../content/roles.json" with { type: "json" };
import actions from "../content/actions.json" with { type: "json" };
import assets from "../content/assets.json" with { type: "json" };
import breakthroughs from "../content/breakthroughs.json" with { type: "json" };
import contractTemplates from "../content/contracts.json" with { type: "json" };
import crises from "../content/crises.json" with { type: "json" };
import constants from "../content/balance_constants.json" with { type: "json" };
import startingState from "../content/starting_state.json" with { type: "json" };

export const content = {
  roles,
  actions,
  assets,
  breakthroughs,
  contractTemplates,
  crises,
  constants,
  startingState
};

export function byId(items) {
  return Object.fromEntries(items.map((item) => [item.id, item]));
}

export const assetById = byId(assets);
export const actionById = byId(actions);
export const breakthroughById = byId(breakthroughs);
export const contractTemplateById = byId(contractTemplates);
