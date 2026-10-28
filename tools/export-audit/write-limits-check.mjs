// Lot L22 (dette sécurité) — contrôle côté API, sans navigateur :
//   1. plafond d'écriture sur les commentaires : une rafale finit en 429 (anonyme ET connecté) ;
//   2. plafond sur les likes (route authentifiée des reviews) ;
//   3. DELETE /api/pipeline-github/:id ne plante plus (il faisait un `include: { review }` sur un
//      modèle qui n'a pas cette relation → 500 à CHAQUE appel).
//
//   AUDIT_API=http://localhost:3199 node tools/export-audit/write-limits-check.mjs
//
// AUDIT_API est OBLIGATOIRE : sur le VPS, :3000 est l'API de PRODUCTION (règle 5 du plan) — cette
// sonde crée un compte et sature des compteurs, elle ne doit viser qu'une pile jetable
// (`run-all.mjs` la lui fournit, en NODE_ENV=development).
//
// Le compte créé pour la rafale « connectée » reste dans la base de la pile de test (jetable) ; la
// review d'appui est supprimée en fin de sonde.
import { createFixture, deleteFixture } from './fixtures.mjs';

const ROOT_API = process.env.AUDIT_API;
if (!ROOT_API) {
    console.error('AUDIT_API requis (pile de test jetable, jamais l’API de production)');
    process.exit(2);
}
const API = `${ROOT_API}/api`;
let ko = 0;
const fail = (msg) => { console.log(`KO — ${msg}`); ko++; };

async function rafale(n, envoyer) {
    const codes = [];
    for (let i = 0; i < n; i++) codes.push((await envoyer(i)).status);
    return codes;
}
const resume = (codes) => Object.entries(codes.reduce((m, c) => ({ ...m, [c]: (m[c] || 0) + 1 }), {}))
    .map(([c, k]) => `${c}×${k}`).join(' ');

let fixture = null;
try {
    fixture = await createFixture(ROOT_API, 'flower', 'minimal', { isPublic: 'true' });
    console.log(`review d'appui ${fixture}`);

    // ── 1a. Commentaires, anonyme : la route répond 401, mais le compteur (par IP) tourne AVANT —
    // sinon un script pourrait marteler la route sans limite.
    const anon = await rafale(25, () => fetch(`${API}/gallery/${fixture}/comment`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: 'audit' }),
    }));
    console.log(`commentaires anonymes ×25 : ${resume(anon)}`);
    if (!anon.includes(429)) fail('aucun 429 sur une rafale anonyme de commentaires');
    if (anon.some((c) => c >= 500)) fail('erreur serveur pendant la rafale anonyme');

    // ── 1b. Commentaires, connecté (vrai compte, vraie session) : 20 passent, le 21e est refusé.
    const email = `l22-audit-${Date.now()}@example.invalid`;
    const signup = await fetch(`${API}/auth/email/signup`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'audit-L22-password', username: `l22audit${Date.now() % 1e6}` }),
    });
    const cookie = (signup.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');
    if (!signup.ok || !cookie) {
        fail(`inscription du compte de test : HTTP ${signup.status} ${(await signup.text()).slice(0, 120)}`);
    } else {
        const auth = await rafale(22, (i) => fetch(`${API}/gallery/${fixture}/comment`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie },
            body: JSON.stringify({ content: `audit L22 #${i + 1}` }),
        }));
        console.log(`commentaires connectés ×22 : ${resume(auth)}`);
        const premiers = auth.slice(0, 20);
        if (!premiers.every((c) => c === 201)) fail(`les 20 premiers commentaires devaient passer (201) : ${premiers.join(',')}`);
        if (auth[20] !== 429 || auth[21] !== 429) fail(`le 21e commentaire devait être refusé (429), reçu ${auth[20]}`);
    }

    // ── 2. Likes (route authentifiée, utilisateur de dev) : la rafale finit en 429.
    const likes = await rafale(35, () => fetch(`${API}/reviews/${fixture}/like`, { method: 'POST' }));
    console.log(`likes ×35 : ${resume(likes)}`);
    if (!likes.includes(429)) fail('aucun 429 sur une rafale de likes');
    if (likes.some((c) => c >= 500)) fail('erreur serveur pendant la rafale de likes');

    // ── 3. DELETE /api/pipeline-github/:id
    const cree = await fetch(`${API}/pipeline-github`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: fixture, reviewType: 'flower', pipelineType: 'curing', intervalType: 'days', cells: { 0: { intensity: 1 } } }),
    });
    const pid = (await cree.json().catch(() => ({})))?.pipeline?.id;
    if (!cree.ok || !pid) {
        fail(`création du pipeline : HTTP ${cree.status}`);
    } else {
        const d1 = await fetch(`${API}/pipeline-github/${pid}`, { method: 'DELETE' });
        const d2 = await fetch(`${API}/pipeline-github/${pid}`, { method: 'DELETE' });
        const d3 = await fetch(`${API}/pipeline-github/inexistant-l22`, { method: 'DELETE' });
        console.log(`DELETE pipeline : ${d1.status} · re-DELETE ${d2.status} · id inconnu ${d3.status}`);
        if (d1.status !== 200) fail(`la suppression devait réussir (200), reçu ${d1.status}`);
        if (d2.status !== 404 || d3.status !== 404) fail(`un pipeline absent doit donner 404 (reçu ${d2.status}/${d3.status})`);
    }
} catch (e) {
    fail(e.message);
} finally {
    if (fixture) await deleteFixture(ROOT_API, fixture);
}

console.log(ko ? `\n${ko} défaut(s)` : '\nOK — plafonds d’écriture actifs, DELETE pipeline-github sain');
process.exit(ko ? 1 : 0);
