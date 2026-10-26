# Classroom Auctions — CAP-6318 week 9

A local Node app for bidding fake credits on real classroom items, such as the Crumbl cookies SGL brings. Built on the week08 Fleet Wars architecture: phone entry, projector QR, instructor console, reconnect identity, Server-Sent Events, and polling fallback. Week08 is unchanged. The four mechanisms follow `week09/L09.03_auctions.ipynb`.

## Run

Requires Node **20.10 or later**. No install, database, cloud account, or other service required.

From the repository root:

```sh
node week09/auction-room/server.js
```

Alternatively, run `make auctions` from the repository root, or `npm start` from this directory. Default port: **3009**, so Fleet Wars can still use 3000. The terminal prints all three URLs, including a randomly generated instructor key. Keep the instructor URL private. For a stable instructor URL across restarts, set `ADMIN_KEY`:

```sh
ADMIN_KEY='your-private-key' PUBLIC_URL='http://YOUR-LAN-IP:3009' node week09/auction-room/server.js
```

- Students: `/` or `/play` on their phones.
- Projector: `/screen`; QR and join URL use `PUBLIC_URL`, or the origin used to open the screen.
- Instructor: `/admin?key=YOUR-KEY` (use the URL printed at startup).

Phones cannot reach your laptop through `localhost`. Put them on the same reachable Wi-Fi network and use your LAN IP, or optionally expose this same Node server through an existing HTTPS tunnel and set `PUBLIC_URL` to its public origin. This app is **not a Cloudflare Worker**. No tunnel is required for local/LAN use. Campus Wi-Fi client isolation can prevent LAN access; test a phone before class. When using a tunnel, restart with the correct `PUBLIC_URL` so the QR points to it. Do not include `/admin` or the instructor key in `PUBLIC_URL`.

Append `?poll` to a view URL to force polling (`/admin?key=...&poll`). SSE automatically falls back if it errors or delivers no initial state within four seconds. Phones keep their opaque reconnect token in localStorage. Refreshing or closing and reopening the same browser preserves their account and balance.

## Auction rules

All prices, bids, budgets, and increments are whole credits. Minimum price is at least 1; round length is 5–600 seconds; budgets/prices are at most 1,000,000. Each queue entry sells **one item to one winner**. Queue multiple entries for multiple cookies.

| Format | Bidding and timer | Winner pays |
| --- | --- | --- |
| English ascending | Bid at least the minimum, then at least the high bid plus the increment. Current leader cannot raise their own bid. Highest accepted bid at the fixed deadline wins. No time extensions. | Their high bid |
| Dutch descending | Starts at the configured starting price, drops once per second, reaches the minimum during the last second, and closes immediately on the first affordable acceptance. | The accepted asking price |
| Sealed first-price | One final private bid per bidder; submissions close at the fixed deadline. | Their own bid |
| Sealed second-price | One final private bid per bidder; submissions close at the fixed deadline. | Greater of the second-highest bid and the minimum price |

Dutch price at elapsed whole second `t` is `startPrice - floor((startPrice - minimum) * min(t, duration - 1) / (duration - 1))`. Rounding can produce repeated prices or jumps. Phones receive the authoritative price, not a locally computed quote. A stale acceptance is rejected with a retry message, so a student never accidentally buys at a different price.

- Server receipt/processing time determines eligibility. At or after the deadline a bid is rejected, even if a phone's countdown looks different. Closing runs before handling the next request as well as on the 250 ms server timer.
- English conflicts accept the first valid request; subsequent bids must beat it by the increment. Dutch accepts only the first valid request received. Network latency matters.
- Equal sealed bids go to the bidder who joined first (the notebook's lower-index rule). Display names are not identities; duplicate names can occur.
- Bids must fit the bidder's current balance, even in second-price auctions. Only the winner pays; payments happen exactly once. Bids do not cost losing bidders anything.
- A lone sealed second-price bidder pays the minimum. With no bids, the item remains unsold and nobody pays. A Dutch timeout also means no sale. Queue an unsold item again to retry it.
- Sealed bid amounts are hidden from public state, SSE, polling, and the instructor display. Each student can see their own amount. Results reveal only winner, winning bid, and payment. The instructor's **private session backup** contains all submissions for recovery; it must not be shared with students.
- Late joiners may bid in the active round and receive the configured starting budget. Existing accounts never get a fresh budget by reconnecting.
- There is always a discussion break after a round. Only the instructor's **Start next item** begins another auction.

## Persistence and recovery

Unlike Fleet Wars, this app saves the full session locally after every accepted mutation, including joins, queued items, bids, and settlement. Default: `week09/auction-room/data/session.json`, ignored by Git. Set `DATA_FILE=/absolute/path/session.json` to choose another location. No database service is needed.

Snapshots are written synchronously to a temporary file, flushed, and atomically renamed. The bid, debit, result, and history entry are part of the same snapshot. Save failures roll back the in-memory action and return an error instead of acknowledging an unsaved bid. An unreadable/malformed session file stops startup; it is never silently replaced. Completed payments are not charged again on restart.

A running auction retains its original deadline after restart: if it has expired, it settles on the first server update; otherwise it resumes with its saved bids and remaining time. The instructor key changes on restart unless `ADMIN_KEY` is set; student tokens remain valid with the same session file and browser origin. Changing the public hostname changes browser localStorage access; reuse the same join origin during class.

Download the private session backup from the instructor console before starting a new session. To restore: stop the server, copy the backup to `DATA_FILE` (or the default path), then restart. To start a new class, close any running auction, expand **Start a new class session**, type `NEW SESSION`, and reset. This clears identities, balances, queue, and results and restores the default budget of 100. Set the new budget before students join.

Run only **one server process per session file**. Local snapshots are suitable for one classroom and ordinary process restarts, not multi-host operation, file corruption, disk loss, or guaranteed recovery through every possible power failure. Keep backups outside the working directory if results matter.

## Verification

```sh
npm test --prefix week09/auction-room
```

Uses Node's built-in test runner. Covers all four formats, deadlines, simultaneous requests, ties, affordability, sealed privacy, single-bid and no-bid auctions, stale round/price requests, exactly-once settlement, cross-round balances, reconnects, storage failure rollback, HTTP authorization, and recovery.

## Classroom trust model

This is a classroom activity with fake currency, not a production marketplace. A student token is a bearer credential stored on their phone; keep the instructor URL and backup private, and use HTTPS when exposing the app beyond a trusted LAN. The app has no roster login or one-student-one-account enforcement: a new browser can create another account and budget. Ask students to join once, use recognizable names, and keep their browser open. If a token/browser is lost, instructor recovery is by restoring the session/browser, not name-based account takeover. Balances and display names are visible to the class. Bids cannot be withdrawn or revised; avoid double-clicking sealed submissions. Instructor early close settles rather than cancels an item. Adjusting individual balances and undoing settlements are deliberately unsupported.
