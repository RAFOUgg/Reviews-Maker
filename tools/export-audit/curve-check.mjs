/**
 * L'éditeur de courbe remplit-il RÉELLEMENT les cellules du pipeline ?
 *
 * La demande — « les statistiques des pipelines sont mal faites […] ajouter une option dans le menu
 * contextuel du clic droit pour créer une courbe de valeur à la main » — ne se vérifie pas en
 * regardant la modale s'ouvrir : elle se vérifie en relisant les DONNÉES après application. On
 * compte donc, sur une trame de 30 jours dont AUCUNE cellule ne porte de température, combien de
 * cellules en portent une après avoir tracé la courbe — puis on recharge la page pour confirmer que
 * la saisie a bien traversé la sauvegarde, et pas seulement l'état React.
 */
import { chromium } from 'playwright';

const BASE = 'http://localhost:5173', API = 'http://localhost:3000';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const fd = new FormData();
fd.append('nomCommercial', 'Audit courbe');
fd.append('title', 'Audit courbe');
fd.append('cultivar', 'Audit');
// Trame de 30 jours, VIDE de toute mesure : c'est exactement l'état que la courbe doit corriger.
fd.append('cultureTimelineConfig', JSON.stringify({ type: 'jour', mode: 'libre', totalDays: 30 }));
fd.append('cultureTimelineData', JSON.stringify([]));
fd.append('images', new Blob([Uint8Array.from(atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
), (c) => c.charCodeAt(0))], { type: 'image/png' }), 'audit.png');

const res = await fetch(`${API}/api/flower-reviews`, { method: 'POST', body: fd });
if (!res.ok) throw new Error(`création : HTTP ${res.status} — ${(await res.text()).slice(0, 200)}`);
const cree = await res.json();
const id = cree?.data?.id || cree?.review?.id || cree?.id;
if (!id) throw new Error(`aucun id dans ${JSON.stringify(cree).slice(0, 200)}`);
console.log(`review ${id}`);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1800, height: 1100 } });
p.on('pageerror', (e) => console.log('JS ERR:', String(e.message).slice(0, 160)));
let ko = 0;
let champLu = null;
try {
    await p.goto(`${BASE}/edit/flower/${id}`, { waitUntil: 'networkidle' }); await sleep(5000);

    // Atteindre la section Culture : le formulaire est sectionné par des onglets à émoji (🌱 = Culture)
    // et la trame n'est montée qu'une fois sa section ouverte.
    await p.locator('button', { hasText: '🌱' }).first().click().catch(() => {});
    await sleep(3000);
    if (!(await p.locator('[data-cell-timestamp]').count())) {
        // La trame peut être repliée derrière un dépliant à l'intérieur de la section.
        for (const l of [/Pipeline/i, /Timeline/i, /trame/i]) {
            const b2 = p.locator('button', { hasText: l }).first();
            if (await b2.count()) { await b2.click().catch(() => {}); await sleep(2500); }
            if (await p.locator('[data-cell-timestamp]').count()) break;
        }
    }

    const cellule = p.locator('[data-cell-timestamp]').first();
    const nbCellules = await p.locator('[data-cell-timestamp]').count();
    console.log(`cellules visibles dans le formulaire : ${nbCellules}`);
    if (nbCellules === 0) {
        console.log('boutons visibles :', (await p.locator('button').allTextContents()).slice(0, 40).join(' | '));
        throw new Error('aucune cellule de pipeline trouvée — la sonde ne mesure rien');
    }

    await cellule.click({ button: 'right' }); await sleep(1200);

    const entree = p.locator('button', { hasText: 'Tracer une courbe de valeurs' }).first();
    if (!(await entree.count())) { console.log('KO — pas d’entrée « Tracer une courbe » dans le menu contextuel'); ko++; }
    else {
        await entree.click(); await sleep(1200);

        // Choisir la température : mesure présente dans toutes les trames de culture.
        const select = p.locator('select').last();
        const options = await select.locator('option').allTextContents();
        console.log(`mesures proposées : ${options.length - 1}`);
        const temp = options.find((o) => /Température/i.test(o));
        if (!temp) { console.log(`KO — aucune mesure « Température » proposée (${options.slice(0, 6).join(' | ')})`); ko++; }
        else {
            await select.selectOption({ label: temp }); await sleep(800);
            // La clé réellement écrite est celle du champ choisi (`temperatureDay`, pas « température ») :
            // on la lit plutôt que de la supposer, sinon la sonde cherche une clé qui n'existe pas.
            champLu = await select.inputValue();
            console.log(`mesure choisie : ${champLu}`);

            // Dessiner : un glissé diagonal sur le tracé, comme le ferait l'utilisateur.
            const svg = p.locator('svg[viewBox]').last();
            const boite = await svg.boundingBox();
            await p.mouse.move(boite.x + 50, boite.y + boite.height - 40);
            await p.mouse.down();
            for (let i = 1; i <= 20; i++) {
                await p.mouse.move(boite.x + 50 + (i / 20) * (boite.width - 70), boite.y + boite.height - 40 - (i / 20) * (boite.height - 70));
                await sleep(20);
            }
            await p.mouse.up(); await sleep(600);

            const btn = p.locator('button', { hasText: /^Appliquer à/ }).first();
            console.log(`bouton : « ${await btn.textContent()} »`);
            await btn.click(); await sleep(3000);
            const dom = await p.evaluate(() => {
                const cs = [...document.querySelectorAll('[data-cell-timestamp]')];
                return { n: cs.length, avecTexte: cs.filter((c) => /\d/.test(c.innerText || '')).length,
                         extrait: (cs[3]?.innerText || '').replace(/\s+/g, ' ').slice(0, 80) };
            });
            console.log(`DOM après application : ${dom.avecTexte}/${dom.n} cellules avec un chiffre — ex. « ${dom.extrait} »`);
            await p.screenshot({ path: 'tools/export-audit/reports/curve-after.png' });
        }
    }

    // Sauvegarder, puis RELIRE l'API : seule la donnée persistée prouve quoi que ce soit.
    // Le formulaire sauvegarde tout seul ; le bouton reste désactivé (« Déjà sauvegardé ») quand
    // l'autosave a déjà passé. On ne clique donc que s'il est réellement actionnable.
    const enregistrer = p.locator('button', { hasText: /Enregistrer|Sauvegarder|Mettre à jour/ }).first();
    if (await enregistrer.count() && await enregistrer.isEnabled()) { await enregistrer.click(); }
    await sleep(8000);

    const reponse = await fetch(`${API}/api/reviews/${id}`);
    if (!reponse.ok) throw new Error(`relecture : HTTP ${reponse.status}`);
    const relu = await reponse.json();
    const noyau = relu?.data || relu?.review || relu;
    console.log('clés « culture » côté API :', Object.keys(noyau || {}).filter((k) => /culture/i.test(k)).join(', ') || '(aucune)');
    console.log('bouton sauvegarde :', await p.locator('button', { hasText: /Enregistrer|Sauvegarder/ }).first().getAttribute('title'));
    const brut = relu?.data?.cultureTimelineData ?? relu?.cultureTimelineData ?? relu?.review?.cultureTimelineData;
    const donnees = typeof brut === 'string' ? JSON.parse(brut || '[]') : (brut || []);
    const entrees = Array.isArray(donnees) ? donnees : Object.entries(donnees).map(([timestamp, v]) => ({ timestamp, ...v }));
    const avecTemp = entrees.filter((e) => Number.isFinite(Number(e[champLu])));
    const valeurs = avecTemp.map((e) => Number(e[champLu]));
    console.log(`cellules portant une température après courbe : ${avecTemp.length}/${entrees.length || 0} (trame de ${nbCellules})`);
    console.log(`valeurs : ${valeurs.slice(0, 8).join(', ')}${valeurs.length > 8 ? ` … ${valeurs.slice(-2).join(', ')}` : ''}`);

    if (avecTemp.length < nbCellules) { console.log('KO — la courbe n’a pas rempli les cellules'); ko++; }
    // Une courbe croissante doit produire des valeurs croissantes : sans ça on a écrit une constante,
    // donc les statistiques resteraient la ligne plate qui a motivé la demande.
    if (valeurs.length > 4 && !(valeurs[valeurs.length - 1] > valeurs[0])) { console.log('KO — courbe plate, le tracé n’a pas été suivi'); ko++; }
} finally {
    await b.close();
    await fetch(`${API}/api/reviews/${id}`, { method: 'DELETE' }).catch(() => {});
}
console.log(ko === 0 ? '\nOK — la courbe remplit et persiste les cellules' : `\n${ko} défaut(s)`);
process.exit(ko === 0 ? 0 : 1);
