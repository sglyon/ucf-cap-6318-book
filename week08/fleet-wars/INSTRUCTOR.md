# Fleet Wars: run of show

## Before class
- `git pull`
- `PUBLIC_URL=https://<device>.<tailnet>.ts.net ADMIN_KEY=<key> node server.js`
- `/Applications/Tailscale.app/Contents/MacOS/Tailscale funnel --bg 3000`
- Projector (extended display): `localhost:3000/screen`
- Laptop: `localhost:3000/admin?key=<key>`
- Scan the QR code with your phone on cellular to test, then remove yourself in the console

## 1. Join (2 min)
- Projector shows the big QR code. Wait until every name is on screen
- Say: route your fleet A→B with the sliders, lowest company average wins, only the second half of each round counts
- Point at the map key: blue roads congest, gray roads are fixed at 45

## 2. Round 1: solo, wormhole closed (60s)
- Console: preset 1, then Start round
- Projector: the average settles at 65
- Pause and discuss

## 3. Round 2: solo, wormhole opened mid-round (90s)
- Console: preset 1, then Start round
- About 20s in, click the wormhole button to open it
- Projector: the average climbs toward 80
- Pause and discuss Braess's paradox and the Price of Anarchy (history table vs. the planner line)

## 4. Round 3: 4 companies (60s)
- Console: preset 3, then Start round
- Have teammates move to sit together (names and colors are on their phones)
- Projector: watch the average against the 73.8 equilibrium line

## 5. Round 4: 2 companies (60s)
- Console: preset 4, then Start round. Regroup seats

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

## Troubleshooting
- A phone isn't updating: reload it
- A duplicate or ghost player: remove them in the console
