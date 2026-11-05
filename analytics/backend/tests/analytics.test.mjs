import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {ALLOWED_ORIGIN,ApiError,CHALLENGE_TTL_MS,adminData,collect,dayKey,isOwner,issueChallenge,json,normalizedIp,parseLogQuery,preflight,publicStats,requireCollector,smallJson,visitorIp} from '../lib/analytics-core.mjs';
const NOW = Date.parse('2026-11-05T02:00:00Z');
const eventId = n => '00000000-0000-4000-8000-' + String(n).padStart(12,'0');
function database() {
  const sqlite=new DatabaseSync(':memory:');
  for(const name of readdirSync(new URL('../drizzle/',import.meta.url)).filter(name=>name.endsWith('.sql')).sort()) sqlite.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
  function query(sql,values=[]) {
    return {sql,values,bind(...params){return query(sql,params)},async first(){return sqlite.prepare(sql).get(...values)||null},async all(){return {results:sqlite.prepare(sql).all(...values)}},async run(){sqlite.prepare(sql).all(...values);return {meta:{changes:Number(sqlite.prepare('SELECT changes() AS n').get().n)}}}};
  }
  return {prepare:query,sqlite,async batch(statements){sqlite.exec('BEGIN');try{const result=statements.map(statement=>({results:sqlite.prepare(statement.sql).all(...statement.values),meta:{changes:Number(sqlite.prepare('SELECT changes() AS n').get().n)}}));sqlite.exec('COMMIT');return result}catch(error){sqlite.exec('ROLLBACK');throw error}}};
}
function request(ip='203.0.113.42',origin=ALLOWED_ORIGIN) {return new Request('https://analytics.test/api/collect',{method:'POST',headers:{origin,'cf-connecting-ip':ip}})}
async function visit(db,n,ip='203.0.113.42',now=NOW){const req=request(ip);const challenge=await issueChallenge(req,db,now);return collect(req,db,{eventId:eventId(n),token:challenge.token,view:'interviews'},now)}

test('One visit counts once across retries, while a real refresh counts again',async()=>{
 const db=database(),req=request(),challenge=await issueChallenge(req,db,NOW);
 const body={eventId:eventId(1),token:challenge.token,view:'interviews'};
 assert.equal((await collect(req,db,body,NOW)).counted,true);
 assert.equal((await collect(req,db,body,NOW)).counted,false);
 await visit(db,2);await visit(db,3,'198.51.100.9');
 const stats=await publicStats(db,NOW);
 assert.equal(stats.total,3);assert.equal(stats.today,3);assert.equal(stats.todayIps,2);
 assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM visits').get().n,3);
 assert(!JSON.stringify(stats).includes('203.0.113.42'));
});
test('Concurrent retries preserve a single aggregate and log row',async()=>{
 const db=database(),req=request(),challenge=await issueChallenge(req,db,NOW);
 const body={eventId:eventId(1),token:challenge.token,view:'questions'};
 await Promise.all(Array.from({length:8},()=>collect(req,db,body,NOW)));
 assert.equal((await publicStats(db,NOW)).total,1);
 assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM visits').get().n,1);
});
test('Only the edge IP is recorded; browser supplied IP and X-Forwarded-For are ignored',async()=>{
 const db=database(),req=request(),challenge=await issueChallenge(req,db,NOW);
 await collect(req,db,{eventId:eventId(1),token:challenge.token,view:'resources',ip:'198.51.100.99'},NOW);
 assert.equal(db.sqlite.prepare('SELECT ip FROM visits').get().ip,'203.0.113.42');
 assert.equal(visitorIp(new Headers({'x-forwarded-for':'198.51.100.99'})),null);
 assert.equal(visitorIp(new Headers({'cf-connecting-ip':'2a06:98c0:3600::103'})),null);
 assert.throws(()=>requireCollector(new Request('https://analytics.test',{headers:{origin:ALLOWED_ORIGIN,'x-forwarded-for':'198.51.100.99'}})),error=>error.status===503);
});
test('Invalid origins, forged token reuse, a different IP and expired tokens are rejected',async()=>{
 const db=database(),req=request(),challenge=await issueChallenge(req,db,NOW);
 const body={eventId:eventId(1),token:challenge.token,view:'interviews'};
 await assert.rejects(()=>issueChallenge(request('203.0.113.42','https://evil.test'),db,NOW),error=>error.status===403);
 await assert.rejects(()=>collect(request('198.51.100.9'),db,body,NOW),error=>error.status===403);
 await assert.rejects(()=>collect(req,db,body,NOW+CHALLENGE_TTL_MS+1),error=>error.status===403);
 assert.equal((await publicStats(db,NOW)).total,0);
 await collect(req,db,body,NOW);
 await assert.rejects(()=>collect(req,db,{...body,eventId:eventId(2)},NOW),error=>error.status===403);
 assert.equal((await publicStats(db,NOW)).total,1);
});
test('IP records expire after 30 days while cumulative anonymous counts remain',async()=>{
 const db=database();await visit(db,1);
 const stats=await publicStats(db,NOW+31*86400000);
 assert.equal(stats.total,1);assert.equal(stats.today,0);assert.equal(stats.todayIps,0);
 assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM visits').get().n,0);
 assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM collect_challenges').get().n,0);
 assert.equal(db.sqlite.prepare('SELECT pageviews FROM daily_metrics').get().pageviews,1);
});
test('Daily counters use Beijing time at the UTC day boundary',async()=>{
 assert.equal(dayKey(Date.parse('2026-11-05T16:00:00Z')),'2026-11-06');
 const db=database();await visit(db,1,'203.0.113.42',Date.parse('2026-11-05T15:59:59Z'));
 await visit(db,2,'203.0.113.42',Date.parse('2026-11-05T16:00:01Z'));
 const stats=await publicStats(db,Date.parse('2026-11-05T16:00:02Z'));
 assert.equal(stats.total,2);assert.equal(stats.today,1);assert.equal(stats.todayIps,1);
});
test('Log pagination with identical timestamps has no duplicate or omitted records',async()=>{
 const db=database();for(let n=1;n<=55;n++)await visit(db,n);
 const first=await adminData(db,parseLogQuery('https://analytics.test/api/admin?days=7'),NOW);
 assert.equal(first.items.length,50);assert(first.nextCursor);
 const second=await adminData(db,parseLogQuery('https://analytics.test/api/admin?days=7&before='+encodeURIComponent(first.nextCursor)),NOW);
 assert.equal(second.items.length,5);assert.equal(new Set([...first.items,...second.items].map(item=>item.event_id)).size,55);
});
test('Challenge issuance is bounded, including consumed challenges',async()=>{
 const db=database();for(let n=1;n<=60;n++)await visit(db,n);
 await assert.rejects(()=>issueChallenge(request(),db,NOW),error=>error.status===429);
 assert.equal((await publicStats(db,NOW)).total,60);
});
test('Owner authentication needs verified identity and matching configured email',()=>{
 assert.equal(isOwner(null,'owner@example.test'),false);
 assert.equal(isOwner({email:'owner@example.test'},'owner@example.test'),false);
 assert.equal(isOwner({userId:'user-1',email:'someone@example.test'},'owner@example.test'),false);
 assert.equal(isOwner({userId:'user-1',email:'OWNER@example.test'},'owner@example.test'),true);
 assert.equal(isOwner({userId:'user-1',email:'owner@example.test'},''),false);
});
test('Requests and log query inputs are bounded and validated',async()=>{
 assert.equal(normalizedIp('2001:0db8:0:0:0:0:0:1'),'2001:db8::1');
 for(const ip of ['999.2.3.4','01.2.3.4','host.example','<script>','::zz'])assert.equal(normalizedIp(ip),null);
 assert.throws(()=>parseLogQuery('https://analytics.test?days=999'),ApiError);
 assert.throws(()=>parseLogQuery('https://analytics.test?ip=anything'),ApiError);
 assert.throws(()=>parseLogQuery('https://analytics.test?before=invalid'),ApiError);
 await assert.rejects(()=>smallJson(new Request('https://analytics.test',{method:'POST',headers:{'content-type':'application/json'},body:'x'.repeat(2049)})),error=>error.status===413);
 await assert.rejects(()=>smallJson(new Request('https://analytics.test',{method:'POST',headers:{'content-type':'text/plain'},body:'{}'})),error=>error.status===415);
});
test('Public CORS is restricted and responses are never cached with private data',()=>{
 const result=json({total:1},200,ALLOWED_ORIGIN);
 assert.equal(result.headers.get('access-control-allow-origin'),ALLOWED_ORIGIN);
 assert.equal(result.headers.get('access-control-allow-credentials'),null);
 assert.equal(result.headers.get('cache-control'),'no-store');
 assert.equal(json({},200,'https://evil.test').headers.get('access-control-allow-origin'),null);
 assert.equal(preflight(new Request('https://analytics.test',{headers:{origin:'https://evil.test'}})).status,403);
});
