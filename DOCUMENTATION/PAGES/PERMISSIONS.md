# Système de Permissions — État réel (vérifié 2026-06-19)

> ⚠️ Document réécrit. L'ancienne version (matrice "Amateur 0€/Producteur 29.99€/Influenceur 15.99€" très détaillée par section) était globalement proche de l'intention produit réelle — mais elle ne mentionnait pas le fait critique suivant : **le paiement n'est pas implémenté**, donc cette matrice de permissions est appliquée en code, mais n'importe qui peut obtenir n'importe quel tier sans payer.

## Tiers réels (champ `User.roles` / `accountType`)

`consumer` (gratuit), `influencer` (15,99 €/mois visé), `producer` (29,99 €/mois visé), + `admin`, `beta_tester` (accès illimité, usage interne/QA), `merchant`. Détermination : `getUserAccountType()` (`server-new/services/account.js:71-98`), priorité admin > producer > influencer > consumer.

## 🔴 Paiement non implémenté — le tier n'est pas garanti par un paiement réel

`server-new/routes/payment.js` est un **stub complet** : pas d'appel Stripe réel, checkout retourne une session mock, webhook mocké (voir [PROFILS/INDEX.md](./PROFILS/INDEX.md)). En pratique, le tier d'un compte change via :
1. Le panneau admin (`PATCH /api/admin/users/:id/account-type`) — sans vérification de paiement
2. Une modification directe en base de données

Les limites/quotas ci-dessous sont donc bien **appliquées par le code**, mais l'accès à un tier supérieur n'est actuellement protégé par aucun paiement réel.

## Limites réelles par tier (`server-new/middleware/permissions.js`, `EXPORT_LIMITS`)

| Limite | Consumer | Influencer | Producer | Beta tester |
|---|---|---|---|---|
| Exports/jour | 3 | 50 | illimité | illimité |
| Templates sauvegardés | 3 | 20 | illimité | illimité |
| Filigranes personnalisés | **0** | 10 | illimité | illimité |
| Reviews | 20 | illimité | illimité | illimité |
| Reviews publiques | 5 | illimité | illimité | illimité |
| Données récurrentes (bibliothèque) | 10 | 100 | illimité | illimité |
| Cultivars / Projets PhenoHunt | — | — | illimité | illimité |

## Formats d'export par tier (`EXPORT_FORMATS`)

| Format | Consumer | Influencer | Producer | Merchant | Beta tester |
|---|---|---|---|---|---|
| PNG / JPEG / PDF | ✓ | ✓ | ✓ | ✓ | ✓ |
| SVG / GIF | ✗ | ✓ | ✓ | ✗ (SVG ✓, GIF ✗) | ✓ |
| CSV / JSON / HTML | ✗ | ✗ | ✓ | ✓ | ✓ |

Qualité (DPI) : Consumer 150 DPI, Influencer/Producer 300 DPI.

## Accès fonctionnalités (`canAccessFeature()`, permissions.js)

- `template_custom` / `template_drag_drop` → Producer uniquement
- `pipeline_culture` / `pipeline_extraction` → Producer uniquement
- `genetics_canvas` / `genetics_library` → Producer uniquement
- `library_templates` / `library_watermarks` → tous, avec quotas ci-dessus
- `export_high_quality` (300 dpi) → Influencer/Producer

## Application réelle

- **Backend** : `requireExportFormat()` (403 si format interdit) et `requireActiveSubscription` sur les routes export ; vérifications ponctuelles sur routes pipelines/genetics — **pas de middleware global systématique** sur toutes les routes, donc à vérifier au cas par cas avant de supposer qu'une route est protégée par tier.
- **Frontend** : guards réels via les hooks `useAccountType.js` (moderne, `permissions.sections`/`pipelines`/`export`/`library`/`genetics`/`stats`, méthode `canAccess(feature)`) et `useAccountPermissions.js` (plus ancien, noms français Amateur/Producteur/Influenceur, toujours fonctionnel mais moins modulaire — les deux hooks coexistent actuellement).

## Bibliothèque — accès par onglet (confirmé dans le code, voir [BIBLIOTHEQUE/INDEX.md](./BIBLIOTHEQUE/INDEX.md))

- Reviews, Templates, Filigranes, Stats : tous tiers (quotas différents)
- Données récurrentes, Cultivars & Génétiques : **Producer uniquement**

## Fichiers référence

- `server-new/middleware/permissions.js` — limites, formats, `canAccessFeature()`
- `server-new/middleware/auth.js` — `requireAuth`/`optionalAuth` (+ bypass dev, voir [PROFILS/INDEX.md](./PROFILS/INDEX.md))
- `client/src/hooks/useAccountType.js`, `client/src/hooks/useAccountPermissions.js`
- `server-new/prisma/schema.prisma` — modèle `User` (`roles`, `accountType`), `Subscription`
