// Fleet Wars' SSE + polling transport, adapted for private bidder views.
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names = {english:'English ascending',dutch:'Dutch descending','first-price':'Sealed first-price','second-price':'Sealed second-price'};
const rules = {
 english:'Raise the high bid by at least the increment. Highest bid at the fixed deadline wins and pays that bid. The timer never extends.',
 dutch:'The price falls once per second, reaching the minimum in the final second. First accepted price wins and pays immediately. No acceptance by the deadline means no sale.',
 'first-price':'Submit one private, final bid before the deadline. Highest bid wins and pays their own bid.',
 'second-price':'Submit one private, final bid before the deadline. Highest bid wins and pays the greater of the second-highest bid and the minimum price.'
};
let token = localStorage.getItem('cap6318-auction-token') || '', state, offset = 0, lastUpdate = 0;
const key = new URLSearchParams(location.search).get('key') || '';
async function post(url, data) {
  const res = await fetch(url, {method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token}`},body:JSON.stringify(data)});
  const result = await res.json(); if (!res.ok) throw new Error(result.error || 'Request failed.'); return result;
}
function message(text, success=false) { $('message').textContent=text; $('message').style.color=success?'var(--good)':'var(--bad)'; }
async function action(fn) { try { await fn(); } catch(e) { message(e.message); } }
function connect(onState) {
  let es, pollTimer, fallback, stopped=false, polling=false;
  const accept = s => { lastUpdate=Date.now(); state=s; offset=s.serverTime-Date.now(); onState(s); };
  const poll = async () => { if(stopped)return; try { const r=await fetch('/state',{cache:'no-store',headers:{authorization:`Bearer ${token}`}}); if(r.ok)accept(await r.json()); } catch {} if(!stopped)pollTimer=setTimeout(poll,500); };
  const startPolling=()=>{ if(stopped||polling)return; polling=true; es?.close(); clearTimeout(fallback); poll(); };
  if(new URLSearchParams(location.search).has('poll'))startPolling();
  else {
    es=new EventSource('/events'+(token?'?token='+encodeURIComponent(token):''));
    es.onmessage=e=>{clearTimeout(fallback);accept(JSON.parse(e.data));};
    es.onerror=startPolling; fallback=setTimeout(startPolling,4000);
  }
  return ()=>{stopped=true;es?.close();clearTimeout(pollTimer);clearTimeout(fallback);};
}
function common(s) {
  const r=s.round;
  $('participants').textContent=`${s.players.length} bidder${s.players.length===1?'':'s'} joined`;
  $('item').textContent=r?r.title:'The next item is coming';
  $('format').textContent=r?names[r.type]:'Welcome to Classroom Auctions';
  $('rules').textContent=r?rules[r.type]:'Keep this page open. Your fake credits carry over from one item to the next. Only the winner pays.';
  $('roundStatus').textContent=r?(r.status==='running'?`Auction ${r.no} · bidding open`:`Auction ${r.no} · closed`):'Waiting for the instructor';
  let price='Ready when you are', detail='';
  if(r?.status==='ended') {
    price=r.result.winner?`${r.result.payment} credits`:'No sale';
    detail=r.result.winner?`${r.result.winner} wins · winning bid ${r.result.winningBid}`:'No bids were accepted. Nobody pays';
    detail+='. Discuss the result; the instructor starts the next item.';
  } else if(r?.type==='english') { price=r.leader?`${r.leader.amount} credits`:`Opens at ${r.reserve}`; detail=r.leader?`${r.leader.name} leads · next bid at least ${r.minimumBid}`:'Be the first to bid.'; }
  else if(r?.type==='dutch') { price=`${r.price} credits`; detail=`Current asking price · minimum ${r.reserve}`; }
  else if(r) { price='Bids are sealed'; detail=`${r.submitted} submitted · amounts stay private`; }
  $('price').textContent=price; $('detail').textContent=detail;
  if($('history')) $('history').innerHTML=s.history.slice().reverse().map(h=>`<li><strong>${esc(h.title)}</strong> · ${esc(names[h.type])}<br>${h.result.winner?`${esc(h.result.winner)} paid ${h.result.payment} (winning bid ${h.result.winningBid})`:'No sale'}</li>`).join('')||'<li>No completed auctions yet.</li>';
  tick();
}
function tick() {
  if(!state)return;
  const r=state.round, left=r?.status==='running'?Math.max(0,Math.ceil((r.endsAt-Date.now()-offset)/1000)):null;
  $('clock').textContent=left===null?'Between auctions':left?`${left}s remaining`:'Closing…';
  $('connection').textContent=Date.now()-lastUpdate>4000?'Connection interrupted · reconnecting…':'Live';
  if($('bidButton')) $('bidButton').disabled=!state.me||r?.status!=='running'||left===0||Date.now()-lastUpdate>4000||
    (r.type==='english'?(r.leader?.id===state.me?.id||r.minimumBid>state.me?.balance):r.type==='dutch'?r.price>state.me?.balance:state.me?.bid!==null);
}
setInterval(tick,250);
