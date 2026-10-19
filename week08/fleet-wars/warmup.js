// Warm-up games for L08.01, played with the same joined players as Fleet Wars.
//
//   beauty  Guess 2/3 of the class average (0 to 100)
//   matrix  2x2 normal-form games: students are randomly paired each round
//           (stranger matching) and assigned Row or Column.

const GAMES = {
  pd: {
    name: "Prisoner's dilemma",
    rowLabel: "Suspect 1", colLabel: "Suspect 2",
    actions: [["Not confess", "Confess"], ["Not confess", "Confess"]],
    // payoff[r][c] = [row player, column player], in years (negative)
    payoff: [[[-1, -1], [-10, 0]], [[0, -10], [-4, -4]]],
    unit: "years",
  },
  market: {
    name: "Marketing game",
    rowLabel: "Firm 1", colLabel: "Firm 2",
    actions: [["Low-priced", "Upscale"], ["Low-priced", "Upscale"]],
    payoff: [[[48, 12], [60, 40]], [[40, 60], [32, 8]]],
    unit: "% of profit",
  },
  pennies: {
    name: "Matching pennies",
    rowLabel: "Player 1", colLabel: "Player 2",
    actions: [["H", "T"], ["H", "T"]],
    payoff: [[[-1, 1], [1, -1]], [[1, -1], [-1, 1]]],
    unit: "points",
  },
};

function pureNash(g) {
  const out = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
    const rowBest = g.payoff[r][c][0] >= g.payoff[1 - r][c][0];
    const colBest = g.payoff[r][c][1] >= g.payoff[r][1 - c][1];
    if (rowBest && colBest) out.push([r, c]);
  }
  return out;
}

module.exports = function createWarmup(players) {
  let mode = "beauty"; // "beauty" | "matrix"
  let gameKey = "pd";
  let round = null; // {no, kind, status: "open"|"revealed", ...}
  let roundNo = 0;
  const choices = new Map(); // playerId -> number (beauty) or action index (matrix)
  const scores = new Map(); // playerId -> cumulative points for current game
  const history = []; // revealed round summaries
  let showNe = false; // 2/3 game: the instructor reveals the Nash equilibrium line when ready

  function start() {
    choices.clear();
    roundNo += 1;
    const ids = [...players.keys()];
    if (!ids.length) return { error: "No players have joined yet." };
    if (mode === "beauty") {
      round = { no: roundNo, kind: "beauty", status: "open", p: 2 / 3, roster: ids };
    } else {
      // Random pairs; an odd player out faces a bot.
      const shuffled = ids.slice().sort(() => Math.random() - 0.5);
      const pairs = [];
      for (let i = 0; i < shuffled.length; i += 2) pairs.push([shuffled[i], shuffled[i + 1] ?? null]);
      // Randomize who is Row (matters for asymmetric games).
      const roles = {};
      for (const pr of pairs) {
        if (Math.random() < 0.5 && pr[1]) pr.reverse();
        roles[pr[0]] = { role: 0, partner: pr[1] };
        if (pr[1]) roles[pr[1]] = { role: 1, partner: pr[0] };
      }
      round = { no: roundNo, kind: "matrix", game: gameKey, status: "open", pairs, roles, roster: ids };
    }
    return { ok: true };
  }

  function submit(id, value) {
    if (!round || round.status !== "open" || !round.roster.includes(id)) return { error: "No open round" };
    if (round.kind === "beauty") {
      const v = value === "" || value === null || value === undefined ? NaN : Number(value);
      if (!Number.isFinite(v) || v < 0 || v > 100) return { error: "Pick a number from 0 to 100" };
      choices.set(id, Math.round(v * 10) / 10);
    } else {
      const a = Number(value);
      if (a !== 0 && a !== 1) return { error: "bad action" };
      choices.set(id, a);
    }
    return { ok: true };
  }

  function botAction(g, role) {
    if (round.game === "pennies") return Math.random() < 0.5 ? 0 : 1;
    // Otherwise play a pure Nash equilibrium action for that role.
    const ne = pureNash(g)[0];
    return ne ? ne[role] : 0;
  }

  function reveal() {
    if (!round || round.status !== "open") return;
    round.status = "revealed";
    const name = (id) => players.get(id)?.name ?? "?";
    if (round.kind === "beauty") {
      const vals = [...choices.entries()].map(([id, v]) => ({ id, name: name(id), v }));
      const avg = vals.length ? vals.reduce((a, b) => a + b.v, 0) / vals.length : null;
      const target = avg === null ? null : avg * round.p;
      let best = Infinity;
      for (const x of vals) best = Math.min(best, Math.abs(x.v - target));
      const winners = vals.filter((x) => Math.abs(x.v - target) === best).map((x) => x.name);
      round.result = { values: vals.map((x) => x.v), avg, target, winners, n: vals.length };
      history.push({ no: round.no, kind: "beauty", avg, target, winners, n: vals.length });
    } else {
      const g = GAMES[round.game];
      const cells = [[0, 0], [0, 0]];
      const outcomes = {}; // playerId -> {mine, theirs, payoff, role}
      for (const [a, b] of round.pairs) {
        const ra = a && choices.has(a) ? choices.get(a) : null;
        const rb = b && choices.has(b) ? choices.get(b) : null;
        if (ra === null && rb === null) continue; // neither chose
        // If only one side chose, a bot stands in for the other.
        const ra2 = ra ?? botAction(g, 0), rb2 = rb ?? botAction(g, 1);
        const aName = !a ? "Bot" : ra === null ? "Bot (stand-in)" : name(a), bName = !b ? "Bot" : rb === null ? "Bot (stand-in)" : name(b);
        cells[ra2][rb2] += 1;
        const [pa, pb] = g.payoff[ra2][rb2];
        if (a && ra !== null) { outcomes[a] = { role: 0, mine: ra2, theirs: rb2, payoff: pa, partner: bName }; scores.set(a, (scores.get(a) || 0) + pa); }
        if (b && rb !== null) { outcomes[b] = { role: 1, mine: rb2, theirs: ra2, payoff: pb, partner: aName }; scores.set(b, (scores.get(b) || 0) + pb); }
      }
      const byRole = [[0, 0], [0, 0]];
      for (const o of Object.values(outcomes)) byRole[o.role][o.mine] += 1;
      round.result = { cells, byRole, outcomes };
      history.push({ no: round.no, kind: "matrix", game: round.game, cells, byRole });
    }
  }

  function setMode(m, g) {
    if (m) mode = m === "matrix" ? "matrix" : "beauty";
    if (g && GAMES[g] && g !== gameKey) { gameKey = g; scores.clear(); }
    // Clear the current round when the selection changes, so the projector never mixes game types.
    if (round && (round.status === "open" || round.kind !== mode || (mode === "matrix" && round.game !== gameKey))) round = null;
  }

  // A removed player leaves the open round; their partner faces the bot.
  function drop(id) {
    choices.delete(id);
    if (!round || round.status !== "open") return;
    round.roster = round.roster.filter((x) => x !== id);
    if (round.kind !== "matrix") return;
    for (const pr of round.pairs) {
      const i = pr.indexOf(id);
      if (i < 0) continue;
      pr[i] = null;
      const other = pr[1 - i];
      if (other) round.roles[other] = { role: 1 - i, partner: null };
    }
    round.pairs = round.pairs.filter((pr) => pr[0] || pr[1]);
    delete round.roles[id];
  }

  function toggleNe() { showNe = !showNe; }

  function reset() { showNe = false; round = null; roundNo = 0; choices.clear(); scores.clear(); history.length = 0; }

  function publicState() {
    const g = GAMES[gameKey];
    const leaderboard = [...scores.entries()].map(([id, s]) => ({ name: players.get(id)?.name ?? "?", score: s }))
      .sort((a, b) => b.score - a.score).slice(0, 5);
    return {
      mode, gameKey, games: Object.fromEntries(Object.entries(GAMES).map(([k, v]) => [k, { ...v, nash: pureNash(v) }])),
      round: round && {
        no: round.no, kind: round.kind, game: round.game, status: round.status, p: round.p, roster: round.roster,
        roles: round.roles,
        submitted: [...choices.keys()],
        result: round.result,
      },
      history: history.filter((h) => (mode === "beauty" ? h.kind === "beauty" : h.kind === "matrix" && h.game === gameKey)),
      leaderboard,
      showNe,
      gameName: g.name,
    };
  }

  function exportRows() {
    return history.map((h) => h.kind === "beauty"
      ? { round: h.no, game: "beauty", n: h.n, avg: h.avg?.toFixed(2), target: h.target?.toFixed(2), winners: h.winners.join("; "), cells: "", row_actions: "", col_actions: "" }
      : { round: h.no, game: h.game, n: "", avg: "", target: "", winners: "", cells: JSON.stringify(h.cells), row_actions: JSON.stringify(h.byRole[0]), col_actions: JSON.stringify(h.byRole[1]) });
  }

  return { start, submit, reveal, setMode, reset, drop, toggleNe, publicState, exportRows, choices };
};
