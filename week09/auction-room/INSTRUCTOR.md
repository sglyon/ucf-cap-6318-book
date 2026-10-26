# Week 9 auction run of show

1. Bring one real item per queued entry. Several cookies of the same kind can be separate auctions.
2. Run `node week09/auction-room/server.js` from the repository root. Open the printed instructor URL and `/screen` on the projector. For phones, use a reachable LAN IP or an optional tunnel as described in README; set `PUBLIC_URL` accordingly.
3. If the app opens an old session, download its private backup, then start a new session from the console. Set the initial budget **before anyone joins**. A useful default is 100 fake credits for the full activity.
4. Queue items in presentation order. Choose the auction type, duration, minimum price, English increment, or Dutch starting price for each. Remove and re-add an item to change its settings/order. Four similar cookies, one in each format, make a useful comparison. These are illustrative choices, not built-in inventory.
5. Test joining and bidding from a phone before class. Students scan the QR once and stay on the same browser and URL throughout. Their remaining budgets carry across all items. Do not project the instructor URL/key.
6. Explain: only the winner pays; fake credits are scarce across all auctions. English has a fixed deadline; Dutch descends once per second; sealed bids are one-shot and final. Equal sealed bids use join order. First valid Dutch acceptance received by the server wins.
7. Click **Start next item** when ready. Watch the current price/submission count. **Close and settle now** ends early with the normal payment rule. There is no automatic advance.
8. Give the item to the displayed winner. Discuss why they bid or waited, how much they paid, and how the remaining budget changes their next decision. In second-price, compare winning bid to payment. A lone bid pays the minimum. No bids means no sale.
9. Repeat for the other formats. The textbook's private-value, single-item truthfulness argument does not automatically carry over to a repeated classroom game with shared budgets, actual consumption preferences, and different goods. Discuss that distinction explicitly.
10. Download the private backup before resetting for another class. It contains student reconnect credentials and sealed submissions; keep it private.

If a phone stops updating, reload; try `?poll`. The same browser reconnects to its existing balance. If the server stops, restart it with the same data file; saved deadlines continue and expired auctions settle automatically. A disk-save error means an action was not accepted—fix storage before continuing. Phones on a different browser/hostname cannot recover an account by display name.
