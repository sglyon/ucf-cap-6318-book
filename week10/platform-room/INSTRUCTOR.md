# Week 10 Platform Room run of show

Two scripts, about 15 minutes each, tied to `L10.01_platform_economics.ipynb`. Run `node week10/platform-room/server.js` (or `make platforms`) from the repository root. Open the printed instructor URL and `/screen` on the projector. For phones, use a reachable LAN IP or an optional tunnel as described in README; set `PUBLIC_URL` accordingly. **Before class**: tape or chalk a 0%–100% line on the floor — students will physically stand on it as a proxy for "how far along the adoption curve the room believes it is."

If the app opens an old session, download its private backup, then start a new session from the console.

## Part 1 — Walk the Line (~15 min) · ties to "Fulfilled-Expectations Equilibrium", "Reveal: The Middle Equilibrium Is a Threshold", and "Comparative Statics: Lower the Price"

1. Have students join on their phones. Confirm the mode is **Walk the Line** and a **single market** (the split toggle is off by default).
2. Explain the rule: "You'll see your private taste $x$, the price $p$, and an announced expected adoption $n^e$. If you join, you earn $x f(n)$ minus $p$, where $n$ is the share of your market that *actually* joins this round. If you stay out, you earn 0. The phone compares your value at the announced $n^e$ with the price, but the announcement is only a forecast: you are betting on what everyone else does."
3. **Split into two markets.** Toggle **Split into two markets (A/B)** on the console — this reassigns the room into Market A and Market B (balanced random) and queues a redeal. Set Market A's $n^e = 0.05$ (a pessimistic room) and Market B's $n^e = 0.9$ (an optimistic room); leave $p = 0.2$ for both — these are already the session defaults. Click **Start round** (25s).
4. Discuss while it runs: "A is being told almost nobody will join; B is being told almost everybody will." Close early if the room has clearly responded. Point at the projector's two realized numbers and the cobweb curve: market A should collapse toward 0%, market B should climb toward the high equilibrium.
5. Run 2–3 more rounds letting each market's realized share roll forward as next round's $n^e$ (the default). Market A should die out; Market B should approach the stable high equilibrium $n_H$. Click **Reveal theory** on the console — the projector now marks $0$, $n_L$, and $n_H$ on the curve, and $n_L$'s moved position after any price changes is visible to the room.
6. **Knife-edge round.** Pick one market, click **Set $n^e = n_L$**, and start a round. Ask the room to predict what happens. If everyone plays their phone's comparison, the market lands back at $n_L$ (with 15 players, 2 of 15 join) and stays there round after round. Then click **Volunteer +1** before closing: one extra joiner tips the market up, and it climbs toward $n_H$ over the next rounds. **Volunteer −1** tips it down to collapse. One body decides the outcome.
7. **Comparative statics.** Lower $p$ for a market (e.g. from 0.2 to 0.1) between rounds and restart; with theory revealed, watch $n_L$ visibly shrink on the projector — a lower price needs less critical mass to tip.
8. Wrap: "Expectations were self-fulfilling here. The platform's job in part 1 is to manage beliefs, not just set a price."

## Part 2 — Price Structure (~15 min) · ties to "The Chicken-and-Egg Problem" and "Price Structure Is Not Price Level"

1. Switch the console's **Game mode** to **Price Structure** (only works between rounds) — this reassigns everyone to Diner or Restaurant and queues a redeal. Mention the calibration: diners get little direct value from more restaurants ($a_D=0.05,\ b_D=0.3$); restaurants get a lot from more diners ($a_R=0.1,\ b_R=3.0$) — a textbook "money side / subsidy side" asymmetry.
2. **Even split.** Click preset **Even** ($s=0.5$, so $p_D=p_R=0.2$ at $L=0.4$). Run 2–3 rounds. Point at the seesaw (level $L$ unchanged, balanced) and the two bars. Restaurants may join briefly while they still expect some diners, but neither side sustains: the market settles at $(0, 0)$ with zero revenue. This is the chicken-and-egg problem.
3. **Free for restaurants.** Click preset **Free for restaurants** ($s=1$, $p_R=0$, $p_D=L$). Run 2–3 rounds. Restaurants join at 100% because it's free, but diners stay at 0% because a full restaurant side is worth little to them ($f_D(1)=0.35$) and they pay all of $L=0.4$. Revenue is still 0: the platform subsidized the wrong side.
4. **Free for diners.** Click preset **Free for diners** ($s=0$). Run 2–3 rounds. Diners join at 100% immediately, and restaurants follow to about 87% by the next round because $f_R$ responds strongly to $n_D$. Revenue jumps (about 5 points per round with 15 restaurants). Restaurants are the money side and diners are the subsidy side: Diners Club's free card and 7% merchant fee.
5. Click **Reveal theory**. The phase plot overlays the rational-play trajectory for the current preset from the same starting point, so the room can compare its actual path to the theory.
6. Wrap: "The price level never changed. Only *who* paid changed, and that decided whether the market existed at all. Subsidize the side whose presence creates value for the other."

## Recovery

If a phone stops updating, reload; try `?poll`. The same browser reconnects to its existing identity, group, and score. If the server stops, restart it with the same `DATA_FILE`; a saved running round's deadline continues and settles automatically if it already expired. A disk-save error means an action was not accepted — fix storage before continuing. Download the private backup before resetting for another class; it contains student reconnect credentials.
