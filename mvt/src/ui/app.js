import {
  ACTIONS,
  CONSTANTS,
  ROLES,
  initializeKernelGame,
  loadGame,
  predictedActionEffect,
  predictedCrisisDamage,
  proceed,
  selectAction,
  serializeGame,
  setPledge
} from "../kernel/index.js";

let state = initializeKernelGame();
const app = document.querySelector("#app");

function render() {
  app.innerHTML = `
    <section class="topbar">
      <div>
        <div class="muted">MVT 0.0 · ${CONSTANTS.ruleset}</div>
        <h1>Public Goods Kernel</h1>
        <div>Turn <strong>${state.turn} / ${state.maxTurns}</strong> · Phase <strong>${phaseLabel(state.phase)}</strong></div>
      </div>
      <div class="badges">
        <button data-action="new">New Game</button>
        <button class="secondary" data-action="rules">Rules</button>
        <button class="secondary" data-action="save">Save JSON</button>
        <button class="secondary" data-action="load">Load JSON</button>
        <button data-action="proceed" ${!["RESOLUTION", "CRISIS"].includes(state.phase) ? "disabled" : ""}>Resolve / Check</button>
      </div>
    </section>
    <section class="grid">
      <div>
        ${renderStress()}
        ${renderPlayers()}
        ${renderPhaseModal()}
      </div>
      <div>
        ${renderTurnSummary()}
        ${renderEndgame()}
        ${renderLog()}
      </div>
    </section>
  `;
}

function renderStress() {
  const damage = predictedCrisisDamage(state.systemStress);
  const damageText = damage === Infinity ? "Collapse" : `${damage} Prosperity`;
  return `
    <section class="panel stress">
      <h2>System Stress</h2>
      <div class="track">
        <strong>Stress</strong>
        <div class="bar"><div class="fill stress-fill" style="width:${Math.min(100, (state.systemStress / CONSTANTS.collapseThreshold) * 100)}%"></div></div>
        <span>${state.systemStress} / ${CONSTANTS.collapseThreshold}</span>
      </div>
      <p><strong>Predicted crisis damage:</strong> ${damageText}</p>
      <p class="muted">Collapse occurs immediately at 12+ System Stress.</p>
    </section>
  `;
}

function renderPlayers() {
  return `
    <section class="cards">
      ${state.players.map((player) => `
        <article class="panel player">
          <h3>${player.name}</h3>
          <div><strong>${ROLES[player.role].name}</strong></div>
          <div class="resources">
            <span class="chip">Prosperity ${player.prosperity}</span>
            <span class="chip">Shield ${player.shield}</span>
            <span class="chip">Defections ${player.defectionMarks}</span>
          </div>
          <p><strong>Pledge:</strong> ${pledgeText(player.pledgedSteward)}</p>
          <p><strong>Action:</strong> ${player.selectedAction ? label(player.selectedAction) : "Hidden / unset"}</p>
          <p><strong>Stress added this turn:</strong> ${player.stressAddedThisTurn}</p>
        </article>
      `).join("")}
    </section>
  `;
}

function renderPhaseModal() {
  if (state.phase === "PLEDGE") return renderPledgePhase();
  if (state.phase === "ACTION_SELECTION") return renderActionPhase();
  if (state.phase === "RESOLUTION") {
    return `<section class="panel"><h2>Resolution Ready</h2><p>All actions are locked. Reveal and resolve the turn.</p><button data-action="proceed">Resolve Actions</button></section>`;
  }
  if (state.phase === "CRISIS") {
    return `<section class="panel"><h2>Crisis Check Ready</h2><p>Apply deterministic crisis damage from System Stress.</p><button data-action="proceed">Run Crisis Check</button></section>`;
  }
  return `<section class="panel"><h2>Game Complete</h2><p>Review the outcome and history.</p></section>`;
}

function renderPledgePhase() {
  return `
    <section class="panel">
      <h2>Pledge Phase</h2>
      <p class="muted">Each player publicly chooses whether to commit to Steward this turn.</p>
      ${state.players.map((player) => `
        <div class="action-row">
          <span><strong>${player.name}</strong> · ${pledgeText(player.pledgedSteward)}</span>
          <span>
            <button data-action="pledge" data-player="${player.id}" data-value="true">Pledge to Steward</button>
            <button class="secondary" data-action="pledge" data-player="${player.id}" data-value="false">Do Not Pledge</button>
          </span>
        </div>
      `).join("")}
    </section>
  `;
}

function renderActionPhase() {
  return `
    <section class="panel">
      <h2>Choose Action</h2>
      <p class="muted">One secret action per player. The UI shows choices after lock-in for facilitation; use table privacy as needed.</p>
      ${state.players.map((player) => {
        const effects = predictedActionEffect(player);
        return `
          <article class="mini-card">
            <h3>${player.name}</h3>
            ${ACTIONS.map((action) => `
              <div class="action-row">
                <span><strong>${label(action)}</strong><br><span class="muted">${effects[action]}</span></span>
                <button data-action="select-action" data-player="${player.id}" data-choice="${action}" ${player.selectedAction ? "disabled" : ""}>Choose</button>
              </div>
            `).join("")}
          </article>
        `;
      }).join("")}
    </section>
  `;
}

function renderTurnSummary() {
  const current = state.turnHistory.at(-1);
  return `
    <section class="panel">
      <h2>Turn Summary</h2>
      ${current ? current.summary.map((item) => `
        <p><strong>${playerName(item.playerId)}</strong> ${item.pledgedSteward ? "pledged" : "did not pledge"} and chose ${label(item.action)}.${item.brokePledge ? " Broke pledge." : ""}${item.fulfilledPledge ? " Fulfilled pledge." : ""}${item.collectiveBonus ? " Collective bonus." : ""}</p>
      `).join("") : "<p class='muted'>No turn has resolved yet.</p>"}
    </section>
  `;
}

function renderEndgame() {
  if (state.phase !== "ENDGAME" || !state.endgame) return "";
  return `
    <section class="panel">
      <h2>${state.endgame.outcome}</h2>
      <p>${state.endgame.winner ? `Winner: ${state.endgame.winner.name}, ${state.endgame.winner.finalScore} points.` : "No winner. Ranking is historical influence only."}</p>
      ${state.endgame.rankings.map((rank) => `
        <div class="contract-row">
          <span>${rank.name} · Prosperity ${rank.prosperity} · Defections ${rank.defectionMarks}</span>
          <strong>${rank.finalScore}</strong>
        </div>
      `).join("")}
      <h3>Stress History</h3>
      <p>${state.stressHistory.map((item) => `T${item.turn}: ${item.systemStress}`).join(" · ")}</p>
    </section>
  `;
}

function renderLog() {
  return `
    <section class="panel">
      <h2>Event Log</h2>
      <ol class="log">${state.eventLog.slice().reverse().map((item) => `<li>Turn ${item.turn} ${phaseLabel(item.phase)}: ${item.message}</li>`).join("")}</ol>
    </section>
  `;
}

app.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  try {
    handle(button.dataset);
  } catch (error) {
    window.alert(error.message);
  }
  render();
});

function handle(data) {
  if (data.action === "new") state = initializeKernelGame();
  if (data.action === "rules") window.alert("Five turns. Publicly pledge or do not pledge to Steward. Secretly choose Develop, Steward, or Hedge. Develop grows you and raises System Stress. Steward repairs the system. Hedge protects you but does not help. Stress 12+ collapses the system.");
  if (data.action === "save") navigator.clipboard?.writeText(serializeGame(state));
  if (data.action === "load") state = loadGame(window.prompt("Paste MVT 0.0 save JSON") || "{}");
  if (data.action === "proceed") proceed(state);
  if (data.action === "pledge") setPledge(state, data.player, data.value === "true");
  if (data.action === "select-action") selectAction(state, data.player, data.choice);
}

function playerName(playerId) {
  return state.players.find((player) => player.id === playerId)?.name ?? playerId;
}

function pledgeText(value) {
  if (value === true) return "Pledged Steward";
  if (value === false) return "No Pledge";
  return "Unset";
}

function phaseLabel(phase) {
  return label(phase);
}

function label(value) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

render();
