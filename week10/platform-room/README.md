# Platform Room — CAP-6318 week 10

A local Node app for two live-classroom network-effects games, built on the week09 Auction Room architecture: phone entry, projector QR, instructor console, reconnect identity, Server-Sent Events, and polling fallback. Week09 is unchanged. The models follow `week10/L10.01_platform_economics.ipynb`.

- **Walk the Line** (one-sided, O1): students stand on an imaginary 0–100% adoption line and either "join" or "stay out" of a network good, betting on how many others will join.
- **Price Structure** (two-sided, O3): students are diners or restaurants on a two-sided platform; the instructor sets a fixed price level and how it is split between the two sides.

## Run

Requires Node **20.10 or later**. No install, database, cloud account, or other service required.

From the repository root:

```sh
node week10/platform-room/server.js
```

Alternatively, run `make platforms` from the repository root, or `npm start` from this directory. Default port: **3010**, so Auction Room can still use 3009. The terminal prints all three URLs, including a randomly generated instructor key. Keep the instructor URL private. For a stable instructor URL across restarts, set `ADMIN_KEY`:

```sh
ADMIN_KEY='your-private-key' PUBLIC_URL='http://YOUR-LAN-IP:3010' node week10/platform-room/server.js
```

- Students: `/` or `/play` on their phones.
- Projector: `/screen`; QR and join URL use `PUBLIC_URL`, or the origin used to open the screen.
- Instructor: `/admin?key=YOUR-KEY` (use the URL printed at startup).

Phones cannot reach your laptop through `localhost`. Put them on the same reachable Wi-Fi network and use your LAN IP, or optionally expose this same Node server through an existing HTTPS tunnel and set `PUBLIC_URL` to its public origin. This app is **not a Cloudflare Worker**. No tunnel is required for local/LAN use. Campus Wi-Fi client isolation can prevent LAN access; test a phone before class.

Append `?poll` to a student/projector view URL to force polling (the instructor console always polls `/api/admin/state`, since it needs the private per-player taste values). SSE automatically falls back if it errors or delivers no initial state within four seconds. Phones keep their opaque reconnect token in localStorage. Refreshing or closing and reopening the same browser preserves a student's identity, group, and score.

## The model

Network value for a one-sided market: $f(n) = a + b n$, with $a = 0.1$, $b = 1.0$ in Walk the Line. A player with taste $x$ joins a round if $x f(n^e) \ge p$, where $n^e$ is the announced *expected* adoption. With $x \sim U[0,1]$ this gives the lecture's fulfilled-expectations map $g(n^e;p) = \mathrm{clamp}(1 - p/f(n^e), 0, 1)$, whose fixed points at $p=0.2$ are $0$, $n_L \approx 0.1298$ (unstable), and $n_H \approx 0.7702$ (stable).

**Stratified tastes.** The room never samples $x$ uniformly at random each round. Instead, the instructor "deals" tastes: every player in a group receives $x_i = (k-0.5)/N$ for a random permutation $k=1..N$ of that group. This makes the room's realized adoption the exact finite-$N$ analogue of the lecture's continuous $g$. Dealing happens automatically the next time a round starts if group membership changed since the last deal (new joiners, a market split, or a mode switch); the instructor can also force a redeal any time between rounds. A player's taste is shown only to that player — never on the projector, in the public API, or via SSE.

**Payoffs use the REALIZED share, not the announced one.** A joiner earns $x f(n_{\text{realized}}) - p$ points that round; a non-joiner earns 0. This is what makes the decision a genuine bet: announcing a high $n^e$ does not pay off unless enough people actually join. Scores accumulate across rounds and the projector shows a top-10 leaderboard.

**Walk the Line** supports one or two markets (A/B), each with its own price, announced $n^e$, stratified tastes, and round history. On close, the realized share becomes next round's announced $n^e$ unless the instructor overrides it. The projector draws a cobweb/staircase diagram of the market's history on the $g(n^e;p)$ curve with the 45° line; a hidden theory overlay (dots at $0$, $n_L$, $n_H$) appears only after the instructor clicks **Reveal theory**. The instructor can set $n^e$ exactly to $n_L$ ("knife-edge"), nudge the realized join count by $\pm 1$ ("volunteer") before settling, and re-run a market from any chosen $n^e$ by editing it between rounds.

**Price Structure** assigns every player to Diners or Restaurants (balanced random, stratified tastes within each side). Calibrated network values: $f_D(n_R) = 0.05 + 0.3\,n_R$ (diners get little from restaurants) and $f_R(n_D) = 0.1 + 3.0\,n_D$ (restaurants get a lot from diners) — editable on the admin console and stored in the session. A fixed price level $L$ (default 0.4) splits into $p_D = sL$ and $p_R = (1-s)L$ via a structure slider $s \in [0,1]$, with presets *free for diners* ($s=0$), *even* ($s=0.5$), and *free for restaurants* ($s=1$). Each side's phone shows the **other** side's announced share. Payoff uses the other side's realized share. The projector shows a seesaw (price level unchanged, split visualized by $s$), two adoption bars, platform revenue ($p_D \cdot \#\text{diners} + p_R \cdot \#\text{restaurants}$ in points), and a 2-D phase plot of $(n_D, n_R)$ with the actual trajectory; Reveal theory overlays the deterministic rational-play trajectory from the same starting point using the stratified-$x$ simulation. With stratified tastes, a start of $(0.1, 0.1)$ and $L=0.4$, iterating rational best responses for 12 rounds converges (for every side size the engine was calibrated against) to $n_D=1,\ n_R \ge 0.8$ under free-for-diners, $(0,0)$ under even, and $n_D=0,\ n_R=1$ under free-for-restaurants.

## Round rules

- A round has a 5–120 second timer (default 25s). The choice (Join / Stay out) can change until the deadline; the **last** choice counts. No choice at all counts as **Stay out**.
- The projector shows a live countdown and the number of **responses** (not choices) during an open round, so the room cannot read the aggregate before it closes.
- Mode (Walk the Line ↔ Price Structure) and market split (one market ↔ two markets) can only change **between** rounds; both reassign every player's group (balanced random) and queue a redeal.
- A round snapshots its prices/expectations/parameters at the moment it starts. Editing them afterward only affects the *next* round.

## Instructor console

Mode switch; market split; deal tastes now; per-market price/$n^e$ with a knife-edge button; price level, structure slider, and presets; round timer, start, and close-early; volunteer $\pm 1$ (walk mode, mid-round); Reveal theory toggle; reset history (keeps players and identities, clears scores/rounds); new class session (typed `NEW SESSION` confirmation, full wipe); private session backup download; a players table with name, group, this round's response, and score — this private table is the only place a player's taste $x$ is shown.

## Persistence and recovery

Like Auction Room, this app saves the full session locally after every accepted mutation. Default: `week10/platform-room/data/session.json`, ignored by Git. Set `DATA_FILE=/absolute/path/session.json` to choose another location.

Snapshots are written synchronously to a temporary file, flushed, and atomically renamed. Save failures roll back the in-memory action and return an error instead of acknowledging an unsaved choice. An unreadable/malformed session file stops startup; it is never silently replaced. A running round retains its original deadline after restart: if it has expired, it settles on the first server update; otherwise it resumes with the same snapshot and remaining time. The instructor key changes on restart unless `ADMIN_KEY` is set; student tokens remain valid with the same session file and browser origin.

Download the private session backup from the instructor console before starting a new session. To restore: stop the server, copy the backup to `DATA_FILE` (or the default path), then restart. To start a new class, close any running round, expand **Start a new class session**, type `NEW SESSION`, and reset.

Run only **one server process per session file**. Local snapshots are suitable for one classroom and ordinary process restarts, not multi-host operation, file corruption, disk loss, or guaranteed recovery through every possible power failure.

## Verification

```sh
npm test --prefix week10/platform-room
```

Uses Node's built-in test runner. Covers the lecture's fixed points and critical mass, critical-mass comparative statics, stratified dealing (exact quantile multiset, rebalancing on a late join), round lifecycle (deadline, last-choice-wins, no-choice-means-stay), payoffs from realized (not announced) share, two-market independence, the volunteer adjustment, the knife-edge button, the two-sided calibration requirement across five side sizes, taste privacy, admin authorization, persistence round-trips, reconnects, and HTTP-level origin/auth/SSE checks.

## Classroom trust model

This is a classroom activity with points that only matter for in-class discussion, not a production marketplace. A student token is a bearer credential stored on their phone; keep the instructor URL and backup private, and use HTTPS when exposing the app beyond a trusted LAN. The app has no roster login or one-student-one-account enforcement: a new browser can create another account. Ask students to join once, use recognizable names, and keep their browser open. Balances, display names, and groups are visible to the class; tastes are not. Choices cannot be withdrawn once the round closes early, and the instructor's **Close and settle now** settles rather than cancels a round.
