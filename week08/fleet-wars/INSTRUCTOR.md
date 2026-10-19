# Fleet Wars: run of show

## Before class
- `git pull`
- `PUBLIC_URL=https://<device>.<tailnet>.ts.net ADMIN_KEY=<key> node server.js`
- `/Applications/Tailscale.app/Contents/MacOS/Tailscale funnel --bg 3000`
- Projector (extended display): `localhost:3000/screen`
- Laptop: `localhost:3000/admin?key=<key>`
- Scan the QR code with your phone on cellular to test, then remove yourself in the console

## L08.01 warm-ups (same app, students join once for the whole day)
- Console → "L08.01 warm-ups" card. Click a game, then **Start warm-up round**, then **Reveal** when the count says everyone is in (the console lists who it's still waiting on)
- Students can change their answer until you reveal. The projector shows only how many are in until then
- Each matrix round re-pairs students randomly and randomizes Row/Column. An odd student plays a bot
- **Opener: 2/3 of the average.** Start of lecture. Run 3 rounds back to back and watch the target shrink; point back to it at the IDDS section. The NE line is hidden until you click **Show NE line**
- **Prisoner's dilemma.** Right before the PD slide. One or two rounds, then reveal the cell counts
- **Marketing game.** Before IDDS on the marketing game. Two or three rounds; Firm 2 players should drift to Upscale
- **Matching pennies.** At the matching pennies section. Five or more quick rounds; watch the H share per role head toward 50%
- Click **Switch everyone to Fleet Wars** (or start a Fleet Wars round) when you move to L08.02

## 1. Join (2 min)
- Projector shows the big QR code. Wait until every name is on screen
- Say: route your fleet A→B with the sliders, lowest company average wins, only the second half of each round counts
- Press Q to drop the QR screen, then point at the map key: blue roads congest, gray roads are fixed at 45

## 2. Round 1: solo, wormhole closed (60s)
- Console: preset 1, then Start round
- Projector: the average settles at 65
- Pause and discuss

## 3. Round 2: solo, wormhole opened mid-round (90s)
- Console: preset 2 (wormhole still closed), then Start round
- About 20s in, click the wormhole button to open it
- Projector: the average climbs toward 80
- Pause and discuss Braess's paradox and the Price of Anarchy (history table vs. the planner line)

## 4. Round 3: 4 companies (60s)
- Console: preset 3, then Start round
- Teams are assigned at Start; phones show color and teammates. Let them huddle in place (the first half doesn't count)
- Projector: watch the average against the equilibrium line (73.8 with 12 players; read the projector for other class sizes)

## 5. Round 4: 2 companies (60s)
- Console: preset 4, then Start round (equilibrium 67.5 with an even class)

## 6. Round 5: one company (60s)
- Console: preset 5, then Start round
- Projector: they will likely settle at 65
- Reveal: the optimum is 64.69 with 1/8 of cars on the wormhole (this corrects L08.02's figure of 65)

## 7. Wrap-up (3 min)
- Projector: the history table lists all rounds
- Discuss market structure vs. congestion
- Console: download the CSVs if you want them for homework

## Press Q on the projector
- Toggles the big join QR code for latecomers. Joining mid-round puts them in at the next round

## Mistakes
- Wrong preset started: click End round now before the halfway mark. The round is discarded and its number reused
- Presets set the round length (60s, or 90s for round 2); edit the field to change it

## Troubleshooting
- A phone isn't updating: reload it
- A duplicate or ghost player: remove them in the console
