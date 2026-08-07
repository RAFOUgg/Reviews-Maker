/**
 * Liste les clés RACINE que l'API renvoie pour une review, avec leur type et un extrait.
 *
 * Sert à répondre sans deviner à « d'où vient ce champ brut dans la fiche ? » : toute clé racine
 * non couverte par le registre et non protégée finit dans « Données supplémentaires ».
 *
 * Usage : node tools/export-audit/keys-check.mjs [--type=hash] [--density=dense]
 */
import { createFixture, deleteFixture } from './fixtures.mjs';

const args = Object.fromEntries(
    process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
        const [k, ...v] = a.slice(2).split('=');
        return [k, v.join('=') || true];
    })
);
const API = args.api || 'http://localhost:3000';
const type = args.type || 'hash';

const id = await createFixture(API, type, args.density || 'dense');
try {
    const raw = await fetch(`${API}/api/reviews/${id}`).then((x) => x.json());
    const review = raw.review || raw;
    console.log(`CLÉS RACINE (${type}) :`);
    for (const [k, v] of Object.entries(review)) {
        const t = Array.isArray(v) ? 'array' : typeof v;
        const s = (v && t === 'object') ? '{…}' : String(v).slice(0, 40);
        console.log('  ', k.padEnd(30), t.padEnd(8), s);
    }
} finally {
    await deleteFixture(API, id);
}
