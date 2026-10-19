# Fleet Wars: instructor script

## Before class
- `git pull`, then `PUBLIC_URL=https://<device>.<tailnet>.ts.net ADMIN_KEY=<key> node server.js`
- Start the funnel: `/Applications/Tailscale.app/Contents/MacOS/Tailscale funnel --bg 3000`
- Projector (extended display): `localhost:3000/screen`. Laptop: `localhost:3000/admin?key=<key>`
- Test by scanning the QR code on your phone with Wi-Fi off, then remove yourself in the console

## Setup (2 min)
- Students scan the QR code and enter a name
- Rules: you route a fleet of cars from A to B. Lower average commute wins
- Point at the map: blue roads cost 40 × the share of **all** cars on them, gray roads always cost 45
- Only the second half of each round counts, so experimenting early is free

## Round 1: solo, no wormhole (60s)
- Expect: the class settles near 50/50 at 65 min
- Ask: nobody coordinated, so why did traffic balance itself?
- Point: this is a Nash equilibrium, because no one can cut their own time by switching

## Round 2: solo, wormhole opened mid-round (90s)
- Load preset 1 again (wormhole closed) and start. About 20 seconds in, click the wormhole button in the console to open it
- Expect: a rush into the wormhole, and the average climbs toward 80
- Ask: everyone got a new free road. Why is everyone worse off?
- Point: Braess's paradox. Taking A→C→D→B is each driver's dominant strategy, yet everyone ends up worse off
- Ask: what is the Price of Anarchy? Use this round's realized average from the history table divided by the planner's 64.69, roughly 80 / 64.69 ≈ 1.24

## Round 3: 4 companies, wormhole open (60s)
- Teams sit together and can talk. Everyone scores on their company's average
- Expect: the average falls toward the 73.8 equilibrium line
- Ask: same roads and same drivers. What changed?
- Point: a bigger fleet feels the congestion it imposes on its own cars, so part of the externality is internalized

## Round 4: 2 companies (60s)
- Expect: about 67.5

## Round 5: one company, the whole class (60s)
- The class is now the social planner
- Expect: they settle at 65 by abandoning the wormhole
- Reveal: the optimum is 64.69, with 1/8 of cars on the wormhole
  - Average cost is 65 − 5z + 20z², minimized at z = 1/8
  - The L08.02 notebook gets this wrong (it says 65)
- Ask: did merging hurt or help commuters? When is market concentration good for everyone?

## Wrap-up (3 min)
- The projector's history table shows that more concentration brought the equilibrium closer to the planner's optimum
- Discussion: Waze routes each driver selfishly. Would you use an app that routed you for total welfare at your own expense?
- Optional: export `ticks.csv` from the console for homework, e.g. plotting convergence or computing each round's Price of Anarchy

## If something goes wrong
- A phone isn't updating: reload it
- A ghost or duplicate player: remove them in the console
- Fewer than 8 students: the solo equilibrium is below 80 (each fleet is a big share). The equilibrium line already accounts for this
