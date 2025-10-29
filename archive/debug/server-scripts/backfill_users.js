#!/usr/bin/env node
/*
 Backfill script for Reviews-Maker

 Creates a `users` table and populates it by scanning `reviews` and `review_likes`.
 Usage:
  node server/scripts/backfill_users.js --db "./db/reviews.sqlite" [--dry-run]

 Notes:
 - Always backup your DB before running without --dry-run.
 - Script is idempotent: it will create the table if missing and upsert rows.
*/
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

function usage() {
  console.log('Usage: node server/scripts/backfill_users.js --db "./db/reviews.sqlite" [--dry-run]');
  process.exit(1);
}

const args = process.argv.slice(2);
let dbFile = null;
let dryRun = false;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--db') dbFile = args[i+1], i++;
  else if (a === '--dry-run') dryRun = true;
  else if (a === '-h' || a === '--help') usage();
}

if (!dbFile) usage();
dbFile = path.resolve(dbFile);
if (!fs.existsSync(dbFile)) {
  console.error('DB file not found:', dbFile);
  process.exit(2);
}

console.log('[BACKFILL] DB:', dbFile, 'dryRun=', dryRun);

sqlite3.verbose();
const db = new sqlite3.Database(dbFile);

function runAsync(sql, params=[]) {
  return new Promise((resolve, reject) => db.run(sql, params, function(err) {
    if (err) return reject(err); resolve(this);
  }));
}

function allAsync(sql, params=[]) {
  return new Promise((resolve, reject) => db.all(sql, params, (err, rows) => {
    if (err) return reject(err); resolve(rows);
  }));
}

async function main() {
  try {
    // Create users table if missing
    const createSql = `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ownerId TEXT UNIQUE,
      email TEXT,
      displayName TEXT,
      firstSeen TEXT,
      lastSeen TEXT,
      reviewCount INTEGER DEFAULT 0,
      publicCount INTEGER DEFAULT 0,
      privateCount INTEGER DEFAULT 0,
      byType JSON DEFAULT '{}',
      likesReceived INTEGER DEFAULT 0,
      dislikesReceived INTEGER DEFAULT 0,
      votesGivenLikes INTEGER DEFAULT 0,
      votesGivenDislikes INTEGER DEFAULT 0,
      createdAt TEXT DEFAULT (datetime('now')),
      updatedAt TEXT DEFAULT (datetime('now'))
    );`;

    if (!dryRun) await runAsync(createSql);
    else console.log('[DRY] Would create users table if missing');

    // Read reviews (limit - but process all to be thorough)
    const reviews = await allAsync('SELECT id, data, ownerId, isPrivate, createdAt, updatedAt, productType FROM reviews');
    console.log('[BACKFILL] Reviews found:', reviews.length);

  // Build aggregation map: ownerId -> stats
  const users = new Map();

    const isEmail = (s) => typeof s === 'string' && /@/.test(s);
    const normalize = (s) => (s || '').toString().trim();
    const normalizeKey = (s) => (s || '').toString().trim().toLowerCase();
    const normalizeForCompare = (s) => {
      if (!s) return '';
      // remove diacritics, lower, keep alphanum
      try {
        const noDia = s.normalize ? s.normalize('NFKD').replace(/\p{M}/gu, '') : s;
        return noDia.replace(/[^0-9a-zA-Z]+/g, '').toLowerCase();
      } catch (e) {
        return s.replace(/[^0-9a-zA-Z]+/g, '').toLowerCase();
      }
    };
  // Placeholder owner names to ignore (anonymous reviews)
  const ANON_PLACEHOLDERS = new Set(['utilisateur non connecté','utilisateur_non_connecte','anonymous','invité','invite','guest','not logged in','anonymous user']);

    for (const r of reviews) {
      let payload = {};
      try { payload = JSON.parse(r.data || '{}'); } catch(e) {}
      // Determine canonical owner identifier: prefer ownerId column, else try email-like values
      // Prefer explicit email fields when present
      let ownerRaw = null;
      if (payload.email) ownerRaw = payload.email;
      else if (payload.holderEmail) ownerRaw = payload.holderEmail;
      else if (r.ownerId) ownerRaw = r.ownerId;
      else if (payload.ownerId) ownerRaw = payload.ownerId;
      else if (payload.holder) ownerRaw = payload.holder || payload.holderName;
      // normalize
      ownerRaw = ownerRaw ? String(ownerRaw).trim() : null;

      // skip anonymous placeholders
      if (!ownerRaw) continue;
      const ownerKeyCandidate = normalizeKey(ownerRaw);
      if (ANON_PLACEHOLDERS.has(ownerKeyCandidate)) continue;

      const owner = ownerKeyCandidate;

      const u = users.get(owner) || { ownerId: owner, originalIds: new Set(), emails: new Set(), displayNames: new Set(), email: null, displayName: null, firstSeen: null, lastSeen: null, reviewCount:0, publicCount:0, privateCount:0, byType: {}, ids: [] };
      u.reviewCount++;
      u.ids.push(r.id);
      if (r.isPrivate) u.privateCount++; else u.publicCount++;
      // displayName heuristics
      // collect display names and emails we see
  const candidateDisplay = payload.owner && payload.owner.displayName ? payload.owner.displayName : (payload.holderName || payload.author || payload.displayName || null);
  if (candidateDisplay) u.displayNames.add(normalize(candidateDisplay));
      if (payload.email) { u.emails.add(normalize(payload.email)); u.email = normalize(payload.email); }
      if (payload.holderEmail) { u.emails.add(normalize(payload.holderEmail)); u.email = normalize(payload.holderEmail); }
      // also if ownerRaw looks like an email, record it
      if (isEmail(ownerRaw)) { u.emails.add(ownerRaw); if (!u.email) u.email = ownerRaw; }
  if (!u.displayName && candidateDisplay) u.displayName = normalize(candidateDisplay);
      // type
      const t = r.productType || payload.productType || payload.type || 'Autre';
  u.byType[t] = (u.byType[t] || 0) + 1;
      // first/last seen
      const created = r.createdAt || payload.createdAt || null;
      const updated = r.updatedAt || payload.updatedAt || null;
      const seenAt = created || updated || null;
      if (seenAt) {
        if (!u.firstSeen || (new Date(seenAt) < new Date(u.firstSeen))) u.firstSeen = seenAt;
        if (!u.lastSeen || (new Date(seenAt) > new Date(u.lastSeen))) u.lastSeen = seenAt;
      }
      users.set(owner, u);
    }

    console.log('[BACKFILL] Aggregated users count:', users.size);

    // Merge heuristics: if a non-email owner corresponds to an email owner (payload email or matching displayName), merge into the email owner
    const emailOwners = new Map();
      for (const [k, v] of users.entries()) {
      // identify owners that have an email known
      if (v.email && isEmail(v.email)) emailOwners.set(normalizeKey(v.email), k);
      // also any recorded emails
      for (const e of v.emails) if (isEmail(e)) emailOwners.set(normalizeKey(e), k);
    }

    // helper to merge source into target (both keys)
    const mergeUsers = (targetKey, sourceKey) => {
      if (targetKey === sourceKey) return;
      const target = users.get(targetKey);
      const src = users.get(sourceKey);
      if (!target || !src) return;
      // combine counts
      target.reviewCount += src.reviewCount || 0;
      target.publicCount += src.publicCount || 0;
      target.privateCount += src.privateCount || 0;
      target.likesReceived = (target.likesReceived || 0) + (src.likesReceived || 0);
      target.dislikesReceived = (target.dislikesReceived || 0) + (src.dislikesReceived || 0);
      // merge byType
      for (const [t, c] of Object.entries(src.byType || {})) target.byType[t] = (target.byType[t] || 0) + c;
      // merge ids
      for (const id of (src.ids || [])) { if (!target.ids.includes(id)) target.ids.push(id); }
      // merge sets
      for (const e of src.emails || []) target.emails.add(e);
      for (const d of src.displayNames || []) target.displayNames.add(d);
      // first/last seen
      if (src.firstSeen && (!target.firstSeen || new Date(src.firstSeen) < new Date(target.firstSeen))) target.firstSeen = src.firstSeen;
      if (src.lastSeen && (!target.lastSeen || new Date(src.lastSeen) > new Date(target.lastSeen))) target.lastSeen = src.lastSeen;
      // prefer explicit email/displayName on target if missing
      if (!target.email && src.email) target.email = src.email;
      if (!target.displayName && src.displayName) target.displayName = src.displayName;
      // remove source
      users.delete(sourceKey);
    };

    // Try merging: for each non-email owner, if we find a matching email owner by recorded emails or matching displayName, merge.
    const nonEmailKeys = Array.from(users.keys()).filter(k => !isEmail(k));
    for (const nk of nonEmailKeys) {
      const u = users.get(nk);
      if (!u) continue;
      // If this user has recorded emails, merge into the first matching email owner
      let merged = false;
      for (const e of (u.emails || [])) {
        const ek = normalizeKey(e);
        const targetKey = emailOwners.get(ek);
        if (targetKey && targetKey !== nk) { mergeUsers(targetKey, nk); merged = true; break; }
      }
      if (merged) continue;
      // Otherwise, try to find an email-owner with the same displayName
      if (u.displayName) {
        const nameNormComp = normalizeForCompare(u.displayName);
        if (nameNormComp) {
          for (const [ek, sourceKey] of emailOwners.entries()) {
            const candidate = users.get(sourceKey);
            if (!candidate) continue;
            const candNames = Array.from(candidate.displayNames || []).map(x => normalizeForCompare(x || ''));
            if (candNames.includes(nameNormComp)) { mergeUsers(sourceKey, nk); break; }
          }
        }
      }
    }

    // Compute likes/dislikes received per user (only for their public reviews)
    const allUserEntries = Array.from(users.values());
    for (const u of allUserEntries) {
      if (!u.ids || u.ids.length === 0) continue;
      const ids = u.ids.filter(Boolean);
      if (ids.length === 0) continue;
      const placeholders = ids.map(()=>'?').join(',');
      const sql = `SELECT SUM(CASE WHEN vote=1 THEN 1 ELSE 0 END) as likes, SUM(CASE WHEN vote=-1 THEN 1 ELSE 0 END) as dislikes FROM review_likes rl JOIN reviews r ON r.id=rl.reviewId WHERE rl.reviewId IN (${placeholders}) AND r.isPrivate=0`;
      const row = await new Promise((res, rej) => db.get(sql, ids, (err, rr) => err ? rej(err) : res(rr)));
      u.likesReceived = (row && row.likes) ? Number(row.likes) : 0;
      u.dislikesReceived = (row && row.dislikes) ? Number(row.dislikes) : 0;
    }

    // Compute votes GIVEN for each owner
    // Map ownerId lowercased -> votes given counts
    const votesGivenRows = await allAsync('SELECT LOWER(ownerId) as owner, SUM(CASE WHEN vote=1 THEN 1 ELSE 0 END) as likes, SUM(CASE WHEN vote=-1 THEN 1 ELSE 0 END) as dislikes FROM review_likes GROUP BY LOWER(ownerId)');
    const votesGivenMap = new Map();
    for (const v of votesGivenRows) votesGivenMap.set(String(v.owner || '').toLowerCase(), { likes: v.likes || 0, dislikes: v.dislikes || 0 });

    // Upsert into users table
    let inserted = 0, updated = 0;
    for (const [owner, u] of users.entries()) {
      const byTypeJson = JSON.stringify(u.byType || {});
      const votes = votesGivenMap.get(owner) || { likes:0, dislikes:0 };
      if (dryRun) {
        console.log('[DRY] Would upsert user:', owner, { reviewCount: u.reviewCount, publicCount: u.publicCount, privateCount: u.privateCount, likesReceived: u.likesReceived, dislikesReceived: u.dislikesReceived, votesGivenLikes: votes.likes, votesGivenDislikes: votes.dislikes });
        continue;
      }
      // Use simple INSERT OR REPLACE to upsert while preserving id when present
      const now = new Date().toISOString();
      // Try update first
      const existing = await allAsync('SELECT id FROM users WHERE LOWER(ownerId)=?', [owner]);
      if (existing && existing.length > 0) {
        const uid = existing[0].id;
        await runAsync('UPDATE users SET email=?, displayName=?, firstSeen=?, lastSeen=?, reviewCount=?, publicCount=?, privateCount=?, byType=?, likesReceived=?, dislikesReceived=?, votesGivenLikes=?, votesGivenDislikes=?, updatedAt=? WHERE id=?', [u.email, u.displayName, u.firstSeen, u.lastSeen, u.reviewCount, u.publicCount, u.privateCount, byTypeJson, u.likesReceived||0, u.dislikesReceived||0, votes.likes||0, votes.dislikes||0, now, uid]);
        updated++;
      } else {
        await runAsync('INSERT INTO users (ownerId, email, displayName, firstSeen, lastSeen, reviewCount, publicCount, privateCount, byType, likesReceived, dislikesReceived, votesGivenLikes, votesGivenDislikes, createdAt, updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [owner, u.email, u.displayName, u.firstSeen, u.lastSeen, u.reviewCount, u.publicCount, u.privateCount, byTypeJson, u.likesReceived||0, u.dislikesReceived||0, votes.likes||0, votes.dislikes||0, now, now]);
        inserted++;
      }
    }

    console.log('[BACKFILL] Done. inserted=', inserted, 'updated=', updated);

    if (dryRun) console.log('[DRY] No changes were written. Run without --dry-run to apply.');

    db.close();
  } catch (err) {
    console.error('[BACKFILL] Error', err && err.message ? err.message : err);
    db.close();
    process.exit(3);
  }
}

main();
