const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Auction, fresh } = require('./auction');
const { createApp } = require('./server');
function setup(type='english', overrides={}) {
  let now=1000;
  const g=new Auction(fresh(),()=>{},()=>now);
  const a=g.join('Alice').token,b=g.join('Bob').token;
  g.admin('queue',{title:'Cookie',type,duration:10,reserve:1,increment:2,startPrice:100,...overrides});g.admin('start');
  const bid=(token,amount,roundId=g.s.round.id)=>g.bid(token,{amount,roundId});
  return {g,a,b,bid,time:n=>now=n};
}
test('English: simultaneous equal bids, affordability, stale rounds, deadline, exactly one debit',()=>{
 const {g,a,b,bid,time}=setup();bid(a,10);assert.throws(()=>bid(b,10));assert.throws(()=>bid(b,101));bid(b,12);
 assert.throws(()=>bid(a,14,'old-round'));time(11000);assert.throws(()=>bid(a,14));
 assert.equal(g.player(b).balance,88);assert.equal(g.player(a).balance,100);g.admin('close');g.expire();assert.equal(g.s.history.length,1);assert.equal(g.player(b).balance,88);
});
for(const type of ['first-price','second-price'])test(`${type}: hidden one-shot bids, join-order ties, correct payment`,()=>{
 const {g,a,b,bid}=setup(type);bid(b,40);bid(a,40);assert.throws(()=>bid(a,50));
 const pub=JSON.stringify(g.view());assert.ok(!pub.includes('playerId'));assert.ok(!pub.includes('"amount"'));assert.ok(!pub.includes(a));assert.equal(g.view(a).me.bid,40);assert.equal(g.view(b).me.bid,40);
 g.admin('close');assert.equal(g.s.round.result.winner,'Alice');assert.equal(g.player(a).balance,60);assert.equal(g.player(b).balance,100);
});
test('Second price charges highest competing bid, then reserve for single bid',()=>{
 const {g,a,b,bid}=setup('second-price',{reserve:5});bid(a,90);bid(b,30);g.admin('close');assert.equal(g.player(a).balance,70);
 g.admin('queue',{title:'Next',type:'second-price',duration:5,reserve:5,increment:1,startPrice:100});g.admin('start');bid(a,60);g.admin('close');assert.equal(g.player(a).balance,65);assert.equal(g.s.history.length,2);
});
test('Dutch: discrete descent to reserve, stale-price rejection, first acceptance only',()=>{
 const {g,a,b,bid,time}=setup('dutch',{reserve:10});assert.equal(g.view().round.price,100);time(2000);assert.equal(g.view().round.price,90);assert.throws(()=>bid(a,100));bid(a,90);assert.throws(()=>bid(b,90));assert.equal(g.player(a).balance,10);assert.equal(g.s.history.length,1);
 const x=setup('dutch',{reserve:10});x.time(10000);assert.equal(x.g.view().round.price,10);x.time(11000);assert.equal(x.g.view().round.result.winner,null);
});
test('No bids: all formats end without a charge; next item remains instructor-controlled',()=>{
 for(const type of ['english','dutch','first-price','second-price']){const {g,a,time}=setup(type);time(11000);g.expire();assert.equal(g.s.round.result.winner,null);assert.equal(g.player(a).balance,100);assert.equal(g.s.round.status,'ended');}
});
test('Reconnect keeps identity and depleted balance; new session invalidates old tokens',()=>{
 const {g,a,bid}=setup();bid(a,25);g.admin('close');assert.equal(g.join('Different',a).token,a);assert.equal(g.player(a).balance,75);assert.equal(g.s.players.length,2);assert.throws(()=>g.admin('budget',{initialBudget:200}));assert.throws(()=>g.admin('reset'));g.admin('reset',{confirm:'NEW SESSION'});assert.equal(g.player(a),undefined);
});
test('Storage failure rolls back bid and settlement atomically',()=>{
 const {g,a,bid}=setup('dutch');g.save=()=>{throw new Error('disk full');};assert.throws(()=>bid(a,100));assert.equal(g.player(a).balance,100);assert.equal(g.s.round.status,'running');assert.equal(g.s.round.bids.length,0);assert.equal(g.s.history.length,0);
});
test('HTTP: auth, private views, concurrent acceptance, persistence and restart settlement',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'auction-test-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
 const dataFile=path.join(dir,'session.json');
 const app=createApp({dataFile,adminKey:'test'});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));t.after(()=>app.server.close());
 const base=`http://127.0.0.1:${app.server.address().port}`;
 const post=async(p,b,token)=>{const r=await fetch(base+p,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token||''}`},body:JSON.stringify(b)});return {status:r.status,body:await r.json()};};
 assert.equal((await post('/api/admin/start',{})).status,403);
 const a=(await post('/api/join',{name:'A'})).body.token,b=(await post('/api/join',{name:'B'})).body.token;
 await post('/api/admin/queue?key=test',{title:'Cookie',type:'dutch',duration:10,reserve:100,increment:1,startPrice:100});await post('/api/admin/start?key=test',{});
 const roundId=app.game.s.round.id;
 const results=await Promise.all([post('/api/bid',{roundId,amount:100},a),post('/api/bid',{roundId,amount:100},b)]);assert.deepEqual(results.map(r=>r.status).sort(),[200,400]);
 const saved=JSON.parse(fs.readFileSync(dataFile));assert.equal(saved.history.length,1);assert.equal(saved.players.reduce((s,p)=>s+p.balance,0),100);
 const publicView=await (await fetch(base+'/state')).json();assert.equal(publicView.me,null);assert.ok(!JSON.stringify(publicView).includes(a));
 assert.equal((await fetch(base+'/api/backup?key=wrong')).status,403);
 const restored=createApp({dataFile,adminKey:'test'});restored.server.emit('close');assert.equal(restored.game.view(a).me.balance,app.game.player(a).balance);restored.game.admin('close');assert.equal(restored.game.s.history.length,1);
 // Private sealed state must remain private over both transports, including the instructor's public view.
 await post('/api/admin/queue?key=test',{title:'Sealed cookie',type:'first-price',duration:60,reserve:1,increment:1,startPrice:100});
 await post('/api/admin/start?key=test',{});
 const funded=app.game.player(a).balance>=45?a:b;
 await post('/api/bid',{roundId:app.game.s.round.id,amount:45},funded);
 const sealed=await (await fetch(base+'/state')).json();
 assert.equal(sealed.round.submitted,1);assert.equal(sealed.me,null);assert.ok(!JSON.stringify(sealed).includes('"amount"'));assert.equal(sealed.round.bids,undefined);
 const privateState=await (await fetch(base+'/state',{headers:{authorization:`Bearer ${funded}`}})).json();assert.equal(privateState.me.bid,45);
 const stream=await fetch(base+'/events');const reader=stream.body.getReader();const event=new TextDecoder().decode((await reader.read()).value);
 assert.ok(!event.includes('"amount"'));assert.ok(!event.includes(funded));assert.ok(event.includes('"submitted":1'));await reader.cancel();
 const expired=setup('first-price');expired.bid(expired.a,20);const restart=new Auction(structuredClone(expired.g.s),()=>{},()=>20000);restart.expire();restart.expire();assert.equal(restart.player(expired.a).balance,80);
});
