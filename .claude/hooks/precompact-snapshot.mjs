// PreCompact : copie le transcript avant compactage, garde les 5 derniers.
// Stocké hors du repo (~/.claude/compact-snapshots) — l'auto-push ne doit jamais publier une conversation.
import { readFileSync, copyFileSync, mkdirSync, readdirSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const src = input.transcript_path;
if (!src || !existsSync(src)) process.exit(0);

const dir = join(homedir(), '.claude', 'compact-snapshots');
mkdirSync(dir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
copyFileSync(src, join(dir, `${stamp}-${input.trigger || 'unknown'}.jsonl`));

const files = readdirSync(dir).filter(f => f.endsWith('.jsonl')).sort();
for (const f of files.slice(0, Math.max(0, files.length - 5))) unlinkSync(join(dir, f));
