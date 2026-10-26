const crypto = require('node:crypto');
const TYPES = ['english', 'dutch', 'first-price', 'second-price'];
function integer(v, name, min = 0, max = 1000000) {
  if (!Number.isSafeInteger(v) || v < min || v > max) throw new Error(`${name} must be a whole number from ${min} to ${max}.`);
  return v;
}
const fresh = () => ({ version: 1, initialBudget: 100, players: [], queue: [], round: null, history: [] });
class Auction {
  constructor(state = fresh(), save = () => {}, clock = Date.now) { this.s = state; this.save = save; this.clock = clock; }
  transaction(fn) {
    const before = structuredClone(this.s);
    try { const result = fn(); this.save(this.s); return result; }
    catch (e) { this.s = before; throw e; }
  }
  player(token) { return this.s.players.find(p => p.token === token); }
  join(name, token) {
    const existing = this.player(token);
    if (existing) return { token: existing.token };
    name = String(name || '').trim().slice(0, 30);
    if (!name) throw new Error('Enter a display name.');
    return this.transaction(() => {
      const p = { id: crypto.randomUUID(), token: crypto.randomBytes(24).toString('hex'), name, balance: this.s.initialBudget, order: this.s.players.length };
      this.s.players.push(p); return { token: p.token };
    });
  }
  price(r = this.s.round, now = this.clock()) {
    const steps = r.duration - 1;
    return Math.max(r.reserve, r.startPrice - Math.floor((r.startPrice - r.reserve) * Math.min(steps, Math.max(0, Math.floor((now - r.startedAt) / 1000))) / steps));
  }
  expire() {
    if (this.s.round?.status === 'running' && this.clock() >= this.s.round.endsAt) this.transaction(() => this.settle('timer'));
  }
  settle(reason) {
    const r = this.s.round;
    if (!r || r.status !== 'running') return;
    const ranked = [...r.bids].sort((a,b) => b.amount - a.amount || a.order - b.order);
    const winner = ranked[0];
    const payment = winner ? (r.type === 'second-price' ? Math.max(r.reserve, ranked[1]?.amount ?? r.reserve) : winner.amount) : 0;
    if (winner) this.s.players.find(p => p.id === winner.playerId).balance -= payment;
    Object.assign(r, { status: 'ended', closedAt: this.clock(), reason, result: { winner: winner ? this.s.players.find(p => p.id === winner.playerId).name : null, winnerId: winner?.playerId ?? null, payment, winningBid: winner?.amount ?? null } });
    this.s.history.push(structuredClone(r));
  }
  admin(action, b = {}) {
    this.expire();
    return this.transaction(() => {
      const s = this.s;
      if (action === 'budget') {
        if (s.players.length) throw new Error('Set the initial budget before anyone joins. Start a new session to change it.');
        s.initialBudget = integer(b.initialBudget, 'Budget', 1);
      } else if (action === 'queue') {
        if (!TYPES.includes(b.type)) throw new Error('Choose a supported auction format.');
        const title = String(b.title || '').trim().slice(0, 120);
        if (!title) throw new Error('Give the item a name.');
        const item = { id: crypto.randomUUID(), title, type: b.type, duration: integer(b.duration, 'Duration', 5, 600), reserve: integer(b.reserve, 'Minimum price', 1), increment: integer(b.increment, 'Bid increment', 1), startPrice: integer(b.startPrice, 'Dutch starting price', 1) };
        if (item.type === 'dutch' && item.startPrice < item.reserve) throw new Error('Dutch starting price must be at least the minimum price.');
        s.queue.push(item);
      } else if (action === 'remove') {
        s.queue = s.queue.filter(i => i.id !== b.id);
      } else if (action === 'start') {
        if (s.round?.status === 'running') throw new Error('Close the current auction first.');
        if (!s.queue.length) throw new Error('Queue an item first.');
        if (!s.players.length) throw new Error('Wait for at least one bidder to join.');
        const now = this.clock();
        s.round = { ...s.queue.shift(), no: s.history.length + 1, status: 'running', startedAt: now, endsAt: null, bids: [] };
        s.round.endsAt = now + s.round.duration * 1000;
      } else if (action === 'close') this.settle('instructor');
      else if (action === 'reset') {
        if (s.round?.status === 'running') throw new Error('Close the current auction before starting a new session.');
        if (b.confirm !== 'NEW SESSION') throw new Error('Type NEW SESSION to reset balances, identities, items, and results.');
        this.s = fresh();
      } else throw new Error('Unknown instructor action.');
      return { ok: true };
    });
  }
  bid(token, b) {
    this.expire();
    return this.transaction(() => {
      const p = this.player(token), r = this.s.round;
      if (!p) throw new Error('Join again on this device.');
      if (!r || r.id !== b.roundId || r.status !== 'running' || this.clock() >= r.endsAt) throw new Error('This auction has closed or changed.');
      let amount;
      if (r.type === 'dutch') {
        amount = this.price();
        // Accept only the price actually displayed, never a higher stale price.
        if (b.amount !== amount) throw new Error('The price changed. Check the new price and accept again.');
      } else amount = integer(b.amount, 'Bid', r.reserve);
      if (amount > p.balance) throw new Error('That bid exceeds your remaining balance.');
      if (r.type === 'english') {
        const lead = r.bids[0];
        if (lead?.playerId === p.id) throw new Error('You already lead this auction.');
        if (amount < (lead ? lead.amount + r.increment : r.reserve)) throw new Error('Another bid arrived. Bid at least the new minimum.');
        r.bids = [{ playerId: p.id, amount, order: p.order }];
      } else {
        if (r.bids.some(x => x.playerId === p.id)) throw new Error('Your sealed bid is already locked in.');
        r.bids.push({ playerId: p.id, amount, order: p.order });
      }
      if (r.type === 'dutch') this.settle('accepted');
      return { ok: true };
    });
  }
  view(token) {
    this.expire();
    const s = this.s, p = this.player(token), r = s.round;
    let round = null;
    if (r) {
      const { bids, ...rest } = r;
      round = { ...rest, submitted: bids.length };
      if (r.type === 'english') {
        const lead = bids[0];
        round.leader = lead ? { name: s.players.find(p => p.id === lead.playerId).name, id: lead.playerId, amount: lead.amount } : null;
        round.minimumBid = lead ? lead.amount + r.increment : r.reserve;
      }
      if (r.type === 'dutch') round.price = this.price(r);
    }
    const me = p ? { id: p.id, name: p.name, balance: p.balance, bid: r?.bids.find(b => b.playerId === p.id)?.amount ?? null } : null;
    return { serverTime: this.clock(), initialBudget: s.initialBudget, players: s.players.map(({ id, name, balance }) => ({ id, name, balance })), queue: s.queue, round, me,
      history: s.history.map(({ bids, ...r }) => r) };
  }
}
module.exports = { Auction, fresh };
