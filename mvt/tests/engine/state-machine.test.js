import test from "node:test";
import assert from "node:assert/strict";
import {
  acceptContract,
  calculateCrisisDraws,
  initializeGame,
  proceed,
  proposeContract,
  submitIntent
} from "../../src/engine/index.js";

test("initializes deterministic four-player game", () => {
  const game = initializeGame(12345);
  assert.equal(game.players.length, 4);
  assert.equal(game.phase, "PLANNING");
  assert.equal(game.assetMarket.length, 8);
  assert.deepEqual(game.stress, { climate: 1, biosphere: 1, social: 1 });
});

test("crisis draw formula follows stress bands", () => {
  assert.equal(calculateCrisisDraws({ climate: 5, biosphere: 4, social: 3 }), 1);
  assert.equal(calculateCrisisDraws({ climate: 8, biosphere: 5, social: 4 }), 2);
  assert.equal(calculateCrisisDraws({ climate: 9, biosphere: 8, social: 11 }), 4);
});

test("actions resolve through queued stress and crisis", () => {
  const game = initializeGame(7);
  submitIntent(game, "player_capitalist", { actionId: "produce", targets: { assets: ["factory"] } });
  proceed(game);
  proceed(game);
  proceed(game);
  assert.equal(game.phase, "RESOLUTION");
  proceed(game);
  assert.equal(game.phase, "CRISIS");
  assert.ok(game.stress.climate >= 2);
  assert.ok(game.eventLog.some((entry) => entry.message.includes("registered")));
});

test("contracts can be proposed, accepted, and defected", () => {
  const game = initializeGame(9);
  submitIntent(game, "player_capitalist", { actionId: "negotiate" });
  submitIntent(game, "player_capitalist", { actionId: "extract" });
  proceed(game);
  proposeContract(game, {
    type: "emissions_pact",
    parties: ["player_capitalist", "player_green"],
    obligations: [
      { playerId: "player_capitalist", kind: "limit_stress", track: "climate", maxIncrease: 0 },
      { playerId: "player_green", kind: "spend_resource", resource: "labour", amount: 1 }
    ],
    successEffect: { stress: { climate: -1 } }
  });
  acceptContract(game, "player_capitalist", "contract_001");
  acceptContract(game, "player_green", "contract_001");
  proceed(game);
  proceed(game);
  assert.equal(game.phase, "RESOLUTION");
  proceed(game);
  const capitalist = game.players.find((player) => player.id === "player_capitalist");
  assert.equal(capitalist.defectionMarks, 1);
});
