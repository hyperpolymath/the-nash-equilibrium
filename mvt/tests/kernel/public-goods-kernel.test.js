import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateEndgame,
  crisisCheck,
  initializeKernelGame,
  predictedCrisisDamage,
  resolveTurn,
  selectAction,
  setPledge
} from "../../src/kernel/index.js";

test("initializes the public-goods kernel state", () => {
  const game = initializeKernelGame();
  assert.equal(game.ruleset, "mvt-public-goods-kernel");
  assert.equal(game.turn, 1);
  assert.equal(game.phase, "PLEDGE");
  assert.equal(game.systemStress, 3);
  assert.equal(game.players.length, 4);
  assert.ok(game.players.every((player) => player.prosperity === 5));
});

test("crisis bands are deterministic", () => {
  assert.equal(predictedCrisisDamage(4), 0);
  assert.equal(predictedCrisisDamage(5), 1);
  assert.equal(predictedCrisisDamage(8), 2);
  assert.equal(predictedCrisisDamage(11), 3);
  assert.equal(predictedCrisisDamage(12), Infinity);
});

test("broken stewardship pledge creates defection and stress", () => {
  const game = initializeKernelGame();
  setPledge(game, "capitalist", true);
  setPledge(game, "socialist", false);
  setPledge(game, "green", true);
  setPledge(game, "techno_utopian", false);
  selectAction(game, "capitalist", "develop");
  selectAction(game, "socialist", "hedge");
  selectAction(game, "green", "steward");
  selectAction(game, "techno_utopian", "hedge");
  resolveTurn(game);

  const capitalist = game.players.find((player) => player.id === "capitalist");
  assert.equal(capitalist.defectionMarks, 1);
  assert.equal(capitalist.stressAddedThisTurn, 4);
  assert.equal(game.systemStress, 4);
});

test("collective stewardship bonus rewards coordinated fulfillment", () => {
  const game = initializeKernelGame();
  for (const player of game.players) setPledge(game, player.id, player.id === "capitalist" ? false : true);
  selectAction(game, "capitalist", "hedge");
  selectAction(game, "socialist", "steward");
  selectAction(game, "green", "steward");
  selectAction(game, "techno_utopian", "steward");
  resolveTurn(game);

  assert.equal(game.systemStress, 0);
  assert.equal(game.players.find((player) => player.id === "green").prosperity, 8);
});

test("collapse produces no winner and historical rankings", () => {
  const game = initializeKernelGame();
  game.systemStress = 11;
  for (const player of game.players) setPledge(game, player.id, false);
  for (const player of game.players) selectAction(game, player.id, "develop");
  resolveTurn(game);
  crisisCheck(game);

  assert.equal(game.phase, "ENDGAME");
  assert.equal(game.collapse, true);
  assert.equal(game.endgame.winner, null);
  assert.equal(game.endgame.outcome, "Collapse");
  assert.equal(game.endgame.rankings.length, 4);
});

test("final score subtracts two points per defection mark", () => {
  const game = initializeKernelGame();
  const capitalist = game.players.find((player) => player.id === "capitalist");
  capitalist.prosperity = 10;
  capitalist.defectionMarks = 2;
  const endgame = calculateEndgame(game);
  const rank = endgame.rankings.find((item) => item.playerId === "capitalist");
  assert.equal(rank.finalScore, 6);
});
