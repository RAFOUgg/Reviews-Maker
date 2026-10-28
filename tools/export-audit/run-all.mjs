/**
 * Barrière unique des sondes d'audit (plan MVP, lot L21) : lance TOUTES les sondes
 * `tools/export-audit/*-check.mjs` en série, une par une, et rend un verdict global.
 *
 *   node tools/export-audit/run-all.mjs                 # démarre sa propre pile de test
 *   node tools/export-audit/run-all.mjs --reuse         # utilise des serveurs déjà lancés
 *   node tools/export-audit/run-all.mjs --only=pdf,format --timeout=900
 *
 * Code de sortie : 0 si toutes les sondes sont vertes, 1 sinon (c'est la barrière de L20).
 *
 * POURQUOI UNE PILE DE TEST PROPRE, PAR DÉFAUT. Les sondes créent leurs fixtures par l'API réelle,
 * et leur API par défaut était `http://localhost:3000` en dur. Or sur le VPS, :3000 est l'API de
 * PRODUCTION : lancer une sonde là-bas, c'était viser la vraie base. Par défaut ce script démarre
 * donc :
 *   • une API `server-new` en `NODE_ENV=development` (utilisateur de test injecté, cf. règle 6 du
 *     plan) sur un port dédié, avec une base SQLite jetable (`db/audit-run-all.sqlite`, ignorée par
 *     git) recréée à chaque passage par `prisma migrate deploy` — donc migrations comprises ;
 *   • un Vite dont le proxy `/api` vise cette API (`VITE_API_PROXY_TARGET`, cf. `vite.config.js`).
 * Chaque sonde reçoit `AUDIT_BASE`/`AUDIT_API` et crée (puis supprime) SA fixture, comme avant.
 *
 * `--reuse` : ne démarre rien, utilise `AUDIT_BASE`/`AUDIT_API` (défaut 5173/3000) — le poste de
 * dev où `npm run dev` tourne déjà. À NE PAS utiliser sur le VPS sans `AUDIT_API` explicite.
 *
 * Options : --only=<noms> · --skip=<noms> (sans le suffixe `-check.mjs`) · --timeout=<s> par sonde
 *           (défaut 600) · --api-port / --web-port (défaut 3199 / 5199) · --keep-db
 *
 * Linux sans bibliothèques système de Chromium (VPS sans droits root) : extraire les paquets
 * manquants dans un dossier utilisateur (`apt-get download` + `dpkg -x`) et lancer ce script avec
 * `LD_LIBRARY_PATH` pointant dessus — il est transmis tel quel aux sondes.
 *
 * Les sondes listées dans `DIAGNOSTICS` ci-dessous sont des outils de MESURE (elles impriment des
 * chiffres, ne calculent aucun verdict) : elles tournent, un plantage compte comme KO, mais leur
 * « OK » signifie seulement « n'a pas planté ».
 */
import { spawn, spawnSync } from 'child_process';
import { readdirSync, mkdirSync, writeFileSync, rmSync, createWriteStream } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const SERVER_DIR = resolve(ROOT, 'server-new');
const CLIENT_DIR = resolve(ROOT, 'client');
const OUT = resolve(__dirname, 'reports', 'run-all');

const args = Object.fromEntries(
    process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
        const [k, ...v] = a.slice(2).split('=');
        return [k, v.join('=') || true];
    })
);
const list = (v) => (v ? String(v).split(',').map((s) => s.trim().replace(/-check(\.mjs)?$/, '')).filter(Boolean) : null);
const only = list(args.only);
const skip = list(args.skip) || [];
const TIMEOUT_S = Number(args.timeout) || 600;
const API_PORT = Number(args['api-port']) || 3199;
const WEB_PORT = Number(args['web-port']) || 5199;
const REUSE = Boolean(args.reuse);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// OUTILS DE MESURE, pas des sondes à verdict : ils impriment des chiffres pour qu'un humain les lise
// et ne calculent aucun KO. Ils tournent quand même (un plantage = KO), mais le résumé les marque
// « diag. » : un « OK » de leur part veut dire « n'a pas planté », pas « le produit est correct ».
const DIAGNOSTICS = {
    keys: 'liste les clés racine renvoyées par l’API',
    canvas: 'mesure la hauteur des canevas sur /r/:id',
    edit: 'compte les cellules de grille visibles en édition',
    'typography-domain': 'balaie les tailles de police (calibration)',
    'unmarked-content': 'mesure le contenu hors [data-module]',
};
const sondes = readdirSync(__dirname)
    .filter((f) => f.endsWith('-check.mjs'))
    .map((f) => f.replace(/-check\.mjs$/, ''))
    .filter((n) => (!only || only.includes(n)) && !skip.includes(n))
    .sort();

if (only) {
    const inconnues = only.filter((n) => !sondes.includes(n));
    if (inconnues.length) { console.error(`sonde(s) inconnue(s) : ${inconnues.join(', ')}`); process.exit(2); }
}

mkdirSync(OUT, { recursive: true });

async function attendre(url, label, ms = 90000) {
    const debut = Date.now();
    while (Date.now() - debut < ms) {
        try {
            const r = await fetch(url);
            if (r.ok) return true;
        } catch { /* pas encore prêt */ }
        await sleep(1000);
    }
    throw new Error(`${label} ne répond pas sur ${url} après ${ms / 1000}s`);
}

async function portLibre(port) {
    try {
        await fetch(`http://localhost:${port}/`, { signal: AbortSignal.timeout(1500) });
        return false;
    } catch {
        return true;
    }
}

const enfants = [];
function lancer(label, cmd, argv, opts) {
    const log = createWriteStream(resolve(OUT, `_${label}.log`));
    const child = spawn(cmd, argv, { ...opts, stdio: ['ignore', 'pipe', 'pipe'] });
    child.stdout.pipe(log);
    child.stderr.pipe(log);
    child.on('exit', (code) => { if (!child.arrete) console.log(`  ⚠ ${label} s'est arrêté (code ${code}) — voir reports/run-all/_${label}.log`); });
    enfants.push(child);
    return child;
}
function arreterTout() {
    for (const c of enfants) { c.arrete = true; try { c.kill('SIGTERM'); } catch { /* déjà mort */ } }
}
process.on('SIGINT', () => { arreterTout(); process.exit(130); });

let BASE, API;
if (REUSE) {
    BASE = process.env.AUDIT_BASE || 'http://localhost:5173';
    API = process.env.AUDIT_API || 'http://localhost:3000';
    console.log(`mode --reuse : web ${BASE} · api ${API}`);
    await attendre(`${API}/api/health`, 'API', 10000);
} else {
    for (const port of [API_PORT, WEB_PORT]) {
        if (!(await portLibre(port))) { console.error(`port ${port} déjà occupé — choisir --api-port/--web-port`); process.exit(2); }
    }
    BASE = `http://localhost:${WEB_PORT}`;
    API = `http://localhost:${API_PORT}`;
    const dbFile = resolve(ROOT, 'db', 'audit-run-all.sqlite');
    if (!args['keep-db']) for (const f of [dbFile, `${dbFile}-journal`, `${dbFile}-wal`, `${dbFile}-shm`]) rmSync(f, { force: true });
    // `file:` + chemin absolu : Prisma résout un chemin relatif depuis `prisma/`, pas depuis ici.
    const DATABASE_URL = `file:${dbFile.replace(/\\/g, '/')}`;
    const serverEnv = {
        ...process.env,
        NODE_ENV: 'development',
        PORT: String(API_PORT),
        DATABASE_URL,
        FRONTEND_URL: BASE,
        SESSION_SECRET: process.env.AUDIT_SESSION_SECRET || `audit-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        // Passport refuse de démarrer sans identifiant Discord ; valeurs factices, jamais utilisées.
        DISCORD_CLIENT_ID: 'audit-local',
        DISCORD_CLIENT_SECRET: 'audit-local',
    };
    console.log('migrations (base jetable)…');
    const prismaCli = resolve(SERVER_DIR, 'node_modules', 'prisma', 'build', 'index.js');
    const mig = spawnSync(process.execPath, [prismaCli, 'migrate', 'deploy'], { cwd: SERVER_DIR, env: serverEnv, encoding: 'utf8' });
    writeFileSync(resolve(OUT, '_migrate.log'), `${mig.stdout || ''}\n${mig.stderr || ''}`);
    if (mig.status !== 0) { console.error('✖ prisma migrate deploy a échoué — voir reports/run-all/_migrate.log'); process.exit(1); }

    console.log(`API de test :${API_PORT} · Vite :${WEB_PORT}`);
    lancer('api', process.execPath, ['server.js'], { cwd: SERVER_DIR, env: serverEnv });
    const viteBin = resolve(CLIENT_DIR, 'node_modules', 'vite', 'bin', 'vite.js');
    lancer('web', process.execPath, [viteBin, '--port', String(WEB_PORT), '--strictPort'], {
        cwd: CLIENT_DIR, env: { ...process.env, VITE_API_PROXY_TARGET: API },
    });
    try {
        await attendre(`${API}/api/health`, 'API');
        await attendre(`${BASE}/`, 'Vite');
        await attendre(`${BASE}/api/health`, 'proxy Vite → API');
    } catch (e) {
        console.error(`✖ ${e.message}`);
        arreterTout();
        process.exit(1);
    }
}

function executer(nom) {
    return new Promise((resolvePromise) => {
        const debut = Date.now();
        const logPath = resolve(OUT, `${nom}.log`);
        const log = createWriteStream(logPath);
        const child = spawn(process.execPath, [resolve(__dirname, `${nom}-check.mjs`)], {
            cwd: ROOT, env: { ...process.env, AUDIT_BASE: BASE, AUDIT_API: API }, stdio: ['ignore', 'pipe', 'pipe'],
        });
        let tail = '';
        const garder = (d) => { tail = (tail + d.toString()).slice(-1500); };
        child.stdout.on('data', garder); child.stderr.on('data', garder);
        child.stdout.pipe(log); child.stderr.pipe(log);
        let expire = false;
        const minuteur = setTimeout(() => { expire = true; child.kill('SIGKILL'); }, TIMEOUT_S * 1000);
        child.on('exit', (code) => {
            clearTimeout(minuteur);
            resolvePromise({
                nom, ok: code === 0 && !expire, code, expire, diagnostic: Boolean(DIAGNOSTICS[nom]),
                duree: Math.round((Date.now() - debut) / 1000),
                fin: tail.trim().split('\n').slice(-4).join(' | ').slice(0, 400),
            });
        });
    });
}

console.log(`\n${sondes.length} sonde(s), en série, ${TIMEOUT_S}s max chacune\n`);
const resultats = [];
for (const nom of sondes) {
    process.stdout.write(`  ${nom.padEnd(26)} … `);
    const r = await executer(nom);
    resultats.push(r);
    console.log(`${r.ok ? 'OK' : 'KO'}  ${String(r.duree).padStart(4)}s${r.expire ? '  (délai dépassé)' : ''}${r.diagnostic ? '  (diag. — aucun verdict, seul un plantage compte)' : ''}`);
}

arreterTout();

const ko = resultats.filter((r) => !r.ok);
writeFileSync(resolve(OUT, 'summary.json'), JSON.stringify({
    date: new Date().toISOString(), base: BASE, api: API, reuse: REUSE,
    total: resultats.length, ok: resultats.length - ko.length, ko: ko.length, resultats,
}, null, 2));

const nbDiag = resultats.filter((r) => r.diagnostic).length;
console.log(`\n${resultats.length - ko.length}/${resultats.length} vertes (dont ${nbDiag} outil(s) de mesure sans verdict)`);
for (const r of ko) console.log(`  ✖ ${r.nom} (code ${r.code}${r.expire ? ', délai dépassé' : ''}) — ${r.fin}`);
console.log(`journaux : tools/export-audit/reports/run-all/`);
process.exit(ko.length ? 1 : 0);
