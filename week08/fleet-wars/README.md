# Fleet Wars

A live classroom game on the Braess network from L08.02. Each student routes a fleet of cars from A to B with sliders on their phone. Between rounds you change the market structure (independent fleets, then companies, then one company), and the projector shows the class drifting between the selfish outcome (80), the equilibrium for that market, and the social planner's optimum (64.69).

No dependencies, just Node 18 or newer. The QR library is bundled, so nothing loads from a CDN.

## Run it

```bash
ADMIN_KEY=pick-something node server.js        # PORT defaults to 3000
```

| Page | URL | Who |
|---|---|---|
| Player | `/` | students' phones (QR code on the projector) |
| Projector | `/screen` | the room |
| Console | `/admin?key=pick-something` | you |

Students need to reach your server from their phones.

**Recommended: Tailscale Funnel.** It gives a stable public https URL for your laptop, so you can put the QR code in your slides ahead of time.

```bash
ADMIN_KEY=pick-something PUBLIC_URL=https://<device>.<tailnet>.ts.net node server.js
tailscale funnel 3000        # prints the public URL; first use asks you to approve Funnel for the tailnet
```

Plain Tailscale (without Funnel) won't work, because students' phones aren't on your tailnet.

**Alternative: Cloudflare quick tunnel.** Run `cloudflared tunnel --url http://localhost:3000`. It needs no account, but you get a new random `*.trycloudflare.com` URL each time. Quick tunnels also don't support Server-Sent Events, so the pages automatically switch to polling twice a second. That's fine for a class of 12. A named Cloudflare tunnel on your own domain avoids both issues but needs more setup.

**Same Wi-Fi** (`http://<laptop LAN IP>:3000`) works only if campus Wi-Fi allows devices to talk to each other, which it often doesn't.

## The projector

Open `/screen` on your laptop (`http://localhost:3000/screen` is fine). It shows a full-screen join page with a large QR code and the names of students as they join. When you start the first round it switches to the live dashboard, which keeps a small QR code in the corner. Press **Q** to bring the big join screen back for latecomers.

The QR code encodes `PUBLIC_URL` if you set it, and otherwise whatever address you opened `/screen` from. If you open it via `localhost` without setting `PUBLIC_URL`, the QR code will point at localhost.

Add `?poll` to any page URL to force polling instead of Server-Sent Events.

## The game

- Total demand is normalized to 1 and split equally across the students in the round. Edges A-C and D-B cost `40 × (share of all cars on that edge)`, edges A-D and C-B cost 45, and the wormhole C-D costs 0. These are the notebook's numbers.
- Each student's commute is the share-weighted average over their three routes. **Everyone in a company scores on the company's average commute**, so a big company starts to internalize the congestion it causes.
- Commutes update live every half second. A round's score is the company's average commute over the **second half** of the round, so early experimenting is free. Lower wins.
- The "equilibrium for this market" benchmark is the Nash equilibrium among the round's actual companies (sized as assigned), each minimizing its own fleet's total time. The server computes it by best-response iteration when a round starts.

| Market structure (12 students, wormhole open) | Equilibrium avg commute |
|---|---|
| 12 independent fleets | 80.0 |
| 6 companies of 2 | 77.6 |
| 4 companies of 3 | 73.8 |
| 3 companies of 4 | 71.0 |
| 2 companies of 6 | 67.5 |
| 1 company | 64.69 (the planner) |

## Suggested run of show (about 15 to 20 minutes)

The console has preset buttons for each step. Load a preset, then press **Start round**. 60 to 90 seconds per round works well.

1. **Solo, no wormhole.** They should find the 50/50 split at 65 quickly. Ask: why didn't anyone need to coordinate?
2. **Solo, wormhole open.** Start the round with it closed and click the wormhole button about 20 seconds in. Watch the class average climb toward 80. This is Braess, and they did it to themselves.
3. **4 companies.** Teammates sit together and can talk. The benchmark drops to 73.8.
4. **2 companies.** 67.5.
5. **One company.** The whole class is the planner. Can they find 64.69? It takes sending about 12% of cars through the wormhole, which almost nobody guesses. If they settle at 65 by ignoring the wormhole, that's a great reveal.

Discussion prompts:

- Why does merging fleets help here when we usually think concentration hurts consumers? What is the externality, and who internalizes it?
- Waze routes each driver selfishly. What would a routing app that maximized total welfare have to do, and would drivers follow it?
- Price of Anarchy from their own data: realized round 2 average divided by 64.69.

Optional knob: set **Information shown to players** to *Limited* to hide everyone's flows on the map. Convergence usually gets slower and noisier.

## Data

The console's export links download:

- `rounds.csv`: one row per company per round, with realized average, equilibrium benchmark, planner value, members, score and rank.
- `ticks.csv`: every player's split and commute every half second. Good for plotting learning dynamics in Julia, for example:

```julia
using CSV, DataFrames, Statistics
t = CSV.read("fleetwars-ticks.csv", DataFrame)
combine(groupby(t, [:round, :t]), :commute => mean => :avg)
```

## Notes

- State lives in memory. Restarting the server clears everything, so export before you stop it.
- Students who reload keep their identity (stored in the browser). Remove stray or duplicate players from the console.
- Players who join mid-round sit out until the next round starts.
- "Reset rounds" clears scores but keeps players. "Reset everything" also removes players.
