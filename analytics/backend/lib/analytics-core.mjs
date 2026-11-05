export const ALLOWED_ORIGIN = 'https://pyramiding.github.io';
export const RETENTION_DAYS = 30;
export const RETENTION_MS = RETENTION_DAYS * 86400000;
export const CHALLENGE_TTL_MS = 300000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VIEWS = new Set(['interviews', 'questions', 'resources']);

export class ApiError extends Error {
  constructor(status, code) { super(code); this.status = status; this.code = code; }
}
export function dayKey(time = Date.now()) { return new Date(time + 8 * 3600000).toISOString().slice(0, 10); }
export function isOwner(user, ownerEmail) {
  return !!(user?.userId && user?.email && ownerEmail && user.email.trim().toLowerCase() === ownerEmail.trim().toLowerCase());
}
export function normalizedIp(value) {
  if (typeof value !== 'string' || value.length > 64) return null;
  const ip = value.trim();
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => Number(part) <= 255 && String(Number(part)) === part) ? ip : null;
  }
  if (!ip.includes(':') || /[^a-fA-F0-9:.]/.test(ip)) return null;
  try { return new URL('http://[' + ip + ']/').hostname.slice(1, -1).toLowerCase(); } catch { return null; }
}
export function visitorIp(headers) {
  const ip = normalizedIp(headers.get('cf-connecting-ipv6')) || normalizedIp(headers.get('cf-connecting-ip'));
  // Cross-zone Worker subrequests may carry this shared proxy address, not a visitor.
  return ip === '2a06:98c0:3600::103' ? null : ip;
}
export function requireCollector(request) {
  if (request.headers.get('origin') !== ALLOWED_ORIGIN) throw new ApiError(403, 'origin_not_allowed');
  const ip = visitorIp(request.headers);
  if (!ip) throw new ApiError(503, 'visitor_ip_unavailable');
  return ip;
}
export function json(data, status = 200, origin = '') {
  const headers = {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Vary': 'Origin'};
  if (origin === ALLOWED_ORIGIN) headers['Access-Control-Allow-Origin'] = origin;
  return new Response(JSON.stringify(data), {status, headers});
}
export function preflight(request) {
  if (request.headers.get('origin') !== ALLOWED_ORIGIN) return json({error:'origin_not_allowed'},403);
  return new Response(null, {status:204,headers:{'Access-Control-Allow-Origin':ALLOWED_ORIGIN,'Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600','Vary':'Origin'}});
}
export function failure(error, request) {
  const known = error instanceof ApiError;
  return json({error: known ? error.code : 'statistics_unavailable'}, known ? error.status : 503, request.headers.get('origin'));
}
export async function smallJson(request) {
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > 2048) throw new ApiError(413, 'request_too_large');
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new ApiError(415, 'json_required');
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, 'invalid_json');
  const chunks = []; let length = 0;
  while (true) {
    const {done, value} = await reader.read(); if (done) break;
    length += value.byteLength;
    if (length > 2048) { await reader.cancel(); throw new ApiError(413, 'request_too_large'); }
    chunks.push(value);
  }
  const data = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(data)); } catch { throw new ApiError(400, 'invalid_json'); }
}
export async function cleanup(db, now = Date.now()) {
  await db.batch([
    db.prepare('DELETE FROM visits WHERE visited_at < ?').bind(now - RETENTION_MS),
    db.prepare('DELETE FROM collect_challenges WHERE expires_at < ?').bind(now),
  ]);
}
export async function issueChallenge(request, db, now = Date.now()) {
  const ip = requireCollector(request);
  await cleanup(db, now);
  const token = crypto.randomUUID();
  const inserted = await db.prepare('INSERT INTO collect_challenges(token, ip, origin, created_at, expires_at) SELECT ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM collect_challenges WHERE ip = ? AND created_at > ?) < 60 RETURNING token').bind(token, ip, ALLOWED_ORIGIN, now, now + CHALLENGE_TTL_MS, ip, now - 60000).first();
  if (!inserted) throw new ApiError(429, 'rate_limited');
  return {token, expiresAt: now + CHALLENGE_TTL_MS};
}
export async function publicStats(db, now = Date.now()) {
  await cleanup(db, now);
  const day = dayKey(now);
  const [total,today,unique] = await db.batch([
    db.prepare("SELECT total, started_at FROM analytics_counter WHERE id = 'warehouse'"),
    db.prepare('SELECT pageviews FROM daily_metrics WHERE day = ?').bind(day),
    db.prepare('SELECT COUNT(DISTINCT ip) AS n FROM visits WHERE day = ? AND counted = 1').bind(day),
  ]);
  return {total: Number(total.results?.[0]?.total || 0), today: Number(today.results?.[0]?.pageviews || 0), todayIps: Number(unique.results?.[0]?.n || 0), startedAt:total.results?.[0]?.started_at || null, timezone:'Asia/Shanghai'};
}
export async function collect(request, db, body, now = Date.now()) {
  const ip = requireCollector(request);
  if (!body || typeof body !== 'object' || !UUID.test(body.eventId || '') || !UUID.test(body.token || '') || !VIEWS.has(body.view)) throw new ApiError(400, 'invalid_visit');
  const {eventId,token,view} = body;
  const day = dayKey(now);
  const result = await db.batch([
    db.prepare('UPDATE collect_challenges SET used_event = ? WHERE token = ? AND ip = ? AND origin = ? AND expires_at >= ? AND (used_event IS NULL OR used_event = ?) RETURNING token').bind(eventId, token, ip, ALLOWED_ORIGIN, now, eventId),
    db.prepare('INSERT INTO visits(event_id, ip, day, visited_at, view, counted) SELECT ?, ?, ?, ?, ?, 0 FROM collect_challenges WHERE token = ? AND used_event = ? AND ip = ? AND origin = ? AND expires_at >= ? ON CONFLICT(event_id) DO NOTHING').bind(eventId, ip, day, now, view, token, eventId, ip, ALLOWED_ORIGIN, now),
    db.prepare("INSERT INTO analytics_counter(id, total, started_at) SELECT 'warehouse', 1, ? FROM visits WHERE event_id = ? AND ip = ? AND counted = 0 ON CONFLICT(id) DO UPDATE SET total = analytics_counter.total + 1").bind(now, eventId, ip),
    db.prepare('INSERT INTO daily_metrics(day, pageviews) SELECT ?, 1 FROM visits WHERE event_id = ? AND ip = ? AND counted = 0 ON CONFLICT(day) DO UPDATE SET pageviews = daily_metrics.pageviews + 1').bind(day, eventId, ip),
    db.prepare('UPDATE visits SET counted = 1 WHERE event_id = ? AND ip = ? AND counted = 0').bind(eventId, ip),
  ]);
  if (!result[0].results?.length) throw new ApiError(403, 'invalid_or_expired_challenge');
  return {accepted:true, counted:Number(result[1].meta?.changes || 0) === 1, stats:await publicStats(db,now)};
}
export function parseLogQuery(url) {
  const value = new URL(url); const days = Number(value.searchParams.get('days') || 7);
  if (![1,7,30].includes(days)) throw new ApiError(400, 'invalid_days');
  let ip = '';
  if (value.searchParams.get('ip')) { ip = normalizedIp(value.searchParams.get('ip')); if (!ip) throw new ApiError(400, 'invalid_ip'); }
  const before = value.searchParams.get('before') || '';
  let cursor = null;
  if (before) {
    try { cursor = JSON.parse(atob(before)); } catch { throw new ApiError(400,'invalid_cursor'); }
    if (!Number.isSafeInteger(cursor?.time) || !UUID.test(cursor?.id || '')) throw new ApiError(400,'invalid_cursor');
  }
  return {days,ip,cursor};
}
export async function adminData(db, query, now = Date.now()) {
  await cleanup(db,now);
  let sql = 'SELECT event_id, ip, visited_at, view FROM visits WHERE counted = 1 AND visited_at >= ?';
  const values = [now - query.days * 86400000];
  if (query.ip) { sql += ' AND ip = ?'; values.push(query.ip); }
  if (query.cursor) { sql += ' AND (visited_at < ? OR (visited_at = ? AND event_id < ?))'; values.push(query.cursor.time,query.cursor.time,query.cursor.id); }
  sql += ' ORDER BY visited_at DESC, event_id DESC LIMIT 51';
  const rows = (await db.prepare(sql).bind(...values).all()).results || [];
  const items = rows.slice(0,50); const last = items.at(-1);
  const series = (await db.prepare('SELECT day, pageviews FROM daily_metrics WHERE day >= ? ORDER BY day ASC').bind(dayKey(now - 29*86400000)).all()).results || [];
  return {stats:await publicStats(db,now),items,nextCursor:rows.length > 50 ? btoa(JSON.stringify({time:last.visited_at,id:last.event_id})) : null,series,retentionDays:RETENTION_DAYS};
}
