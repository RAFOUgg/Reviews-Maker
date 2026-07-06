# Marché mondial du cannabis — état des lieux

> ⚠️ **Tier de preuve : hors échelle T1-T5** (cf. brief méthodologique `terpologie-knowledge-base-brief.md` §0 et registre **[13_REGISTRE_SOURCES.md](13_REGISTRE_SOURCES.md)**, entrée `marche_estimations`). Les ordres de grandeur (marché, prix, parts de marché) sont issus de connaissances générales du secteur (rapports type BDSA, Prohibition Partners, New Frontier Data, Grand View Research jusqu'à l'entraînement du modèle). Ils n'ont **pas** été revérifiés par recherche web en temps réel — à traiter comme des ordres de grandeur indicatifs pour cadrer une roadmap produit, **jamais comme des chiffres d'audit financier ni comme un fait T1/T2**. Si ces données doivent un jour entrer dans une base de traçabilité de production (par opposition à un simple cadrage produit), elles devront être remontées au niveau T2 en s'appuyant sur les sources normatives listées au brief §2 (EUDA/ex-EMCDDA, ANSM, WHO ECDD, EFSA) plutôt que sur cette estimation qualitative.
>
> ⚠️ **Volatilité à surveiller** (brief §5) : le statut légal des nouveaux cannabinoïdes de synthèse/semi-synthèse (HHC, THCP, etc.) et les seuils réglementaires par juridiction changent en continu — toute donnée réglementaire de ce document doit être **isolée par juridiction + date**, jamais présentée comme un fait stable dans le temps.

## 1. Segmentation du marché

| Segment | Description | Poids relatif approximatif |
|---|---|---|
| Fleurs séchées | Produit historique, toujours dominant en volume | Le plus gros segment dans la majorité des marchés matures |
| Concentrés/extraits | Vapes/cartouches, wax/shatter/badder, rosin, distillat | Croissance rapide, marge élevée, forte proportion des ventes en dispensaire US (souvent >25-30% des ventes en valeur dans les marchés matures) |
| Comestibles/boissons | Gommies, chocolats, boissons infusées (THC drinks) | Segment en très forte croissance, tiré par la demande "sans fumée" et les boissons sociales |
| Topiques | Crèmes, baumes, patchs transdermiques | Petit segment, niche bien-être/douleur localisée |
| Fleur pré-roulée (pre-rolls) | Sous-segment fleur en croissance forte (commodité) | Croissance continue dans les marchés matures |
| CBD bien-être (hors THC) | Huiles, cosmétiques, compléments — cadre légal généralement distinct du THC | Marché mondial large mais très fragmenté, régulation hétérogène |
| Cannabis médical encadré | Prescriptions, produits pharmaceutiques (Sativex/nabiximols, Epidiolex/CBD pur) | Petit en volume, mais structurant pour la validation scientifique et l'export |

## 2. Panorama réglementaire par région

### Amérique du Nord
- **Canada** : légalisation fédérale récréative (Cannabis Act, 2018) — marché encadré de bout en bout (licences Santé Canada, traçabilité seed-to-sale), coexistence avec un marché illicite résiduel du fait de la fiscalité/prix.
- **États-Unis** : patchwork état par état (usage récréatif légal dans une majorité d'États sur la côte ouest/est, illégal fédéralement — classification Schedule I historique, discussions de reclassification). Conséquences structurelles :
  - Pas d'accès bancaire normal (problème du "cash business"), enjeu du SAFE Banking Act.
  - Fiscalité pénalisante (IRC section 280E : interdiction de déduire les charges d'exploitation normales pour une activité "trafiquant une substance Schedule I").
  - Impossibilité de commerce interétatique → duplication des chaînes de production par État, absence d'économies d'échelle nationales.
  - Multi-State Operators (MSOs) : consolidation par acquisition de licences dans plusieurs États plutôt que par expansion logistique classique.
- **Mexique** : dépénalisation actée par jurisprudence de la Cour suprême, cadre législatif d'application encore instable.

### Europe
- **Allemagne** : légalisation partielle de la possession/usage adulte + "cannabis social clubs" (culture associative non lucrative), pas de vente commerciale récréative généralisée à ce stade — modèle hybride.
- **Pays-Bas** : tolérance historique de vente en coffee-shop ("gedoogbeleid") sans légalisation de la production en amont — expérimentation de filières de production légale encadrée en cours.
- **Suisse** : projets pilotes de vente légale encadrée (recherche), cadre CBD (<1% THC) déjà toléré depuis longtemps.
- **Malte, Luxembourg** : légalisation de l'usage adulte et de l'auto-culture, sans marché commercial ouvert complet.
- **Espagne** : "clubs cannabiques" associatifs à but non lucratif, zone grise juridique tolérée localement (notamment Catalogne).
- **France** : cadre le plus restrictif du groupe — CBD légal si <0.3% THC (chanvre industriel), cannabis thérapeutique en expérimentation restreinte, usage récréatif illégal (contravention depuis 2020 pour l'usage simple).
- **Portugal, République tchèque** : dépénalisation de la possession pour usage personnel (approche santé publique plutôt que répressive).

### Amérique latine
- **Uruguay** : premier pays au monde à légaliser la production/vente encadrée par l'État (2013).
- **Colombie** : cadre fort pour l'export de cannabis médical/cosmétique (climat équatorial → coûts de production en extérieur très compétitifs), pas de marché récréatif domestique.

### Océanie / Asie
- **Australie** : cadre médical structuré (prescription), pas de marché récréatif national.
- **Thaïlande** : dépénalisation puis re-durcissement réglementaire (illustre la volatilité politique du secteur — pertinent pour la modélisation d'un champ "statut légal" qui doit pouvoir changer dans le temps).
- **Israël** : pionnier historique de la recherche médicale sur le cannabis (travaux fondateurs de Raphael Mechoulam sur le THC et le système endocannabinoïde), cadre médical mature.

### Implication produit
Un champ "juridiction/statut légal" dans l'app devrait être **temporel et régional**, pas un simple booléen global — le cadre change par pays, parfois par État/région, et évolue dans le temps.

## 3. Tendances structurantes du secteur

- **Consolidation** : rachat de petits producteurs par des groupes plus larges (surtout en Amérique du Nord), tout en laissant une place au segment "craft"/terroir (petits producteurs valorisant la génétique, le mode de culture, le curing soigné) — positionnement premium face à la production de masse indoor à bas coût.
- **Pression sur les prix** : la maturation des marchés légaux entraîne une baisse continue du prix au gramme (effetröle de la légalisation + surproduction régulière) — le marché illicite reste compétitif là où la fiscalité légale est élevée.
- **Marque et branding** : montée des marques D2C (direct-to-consumer) et des partenariats avec des célébrités, différenciation par le storytelling génétique/terroir plutôt que par le prix seul.
- **Cannabis "outdoor"/"living soil"/régénératif** : segment premium qui valorise justement le type de données que cette app capture (mode de culture, substrat, techniques d'engrais organiques) — pertinent pour la crédibilité scientifique des champs Pipeline Culture.
- **THC drinks (boissons infusées)** : catégorie en très forte croissance récente dans les marchés matures nord-américains, concurrençant directement l'alcool sur l'occasion sociale.
- **Marché noir persistant** : dans presque tous les marchés légaux matures, une part significative de la consommation reste hors circuit légal (fiscalité, accessibilité, habitude) — donnée à garder en tête si l'app veut un jour modéliser un "prix observé" ou une "provenance".

## 4. Débouchés médicaux reconnus (base scientifique la plus solide)

| Indication | Produit/molécule type | Niveau de preuve |
|---|---|---|
| Spasticité dans la sclérose en plaques | Nabiximols (Sativex, ratio THC:CBD ~1:1) | Approuvé dans plusieurs pays européens |
| Épilepsies réfractaires sévères (Dravet, Lennox-Gastaut) | CBD pharmaceutique purifié (Epidiolex) | Approuvé FDA/EMA — le cas d'usage du CBD le mieux validé cliniquement |
| Nausées/vomissements chimio-induits | Dronabinol/nabilone (THC ou analogue de synthèse) | Approuvé de longue date |
| Douleur chronique neuropathique | Cannabis médical (fleur ou extrait), preuve modérée | Usage large mais preuves d'efficacité hétérogènes selon les études |
| Stimulation de l'appétit (cachexie VIH/cancer) | Dronabinol | Approuvé (usage historique) |

Ce tableau est la base scientifique la plus solide dont peut se réclamer un futur module "usage thérapeutique" de l'app — à bien distinguer des allégations non prouvées (anxiolytique, anti-inflammatoire général, anti-cancer) qui circulent dans la culture populaire mais n'ont pas ce niveau de preuve clinique.
