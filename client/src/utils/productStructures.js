// Structures de formulaires pour chaque type de produit
export const productStructures = {
    Fleur: {
        sections: [
            {
                title: "Informations générales",
                fields: [
                    { key: "cultivars", label: "Cultivar", type: "text", required: true },
                    { key: "breeder", label: "Breeder de la graine", type: "text" },
                    { key: "farm", label: "Farm", type: "text" },
                    {
                        key: "typeCulture",
                        label: "Type de culture",
                        type: "select",
                        choices: ["Indoor", "Outdoor", "Greenhouse", "Living Soil", "Autre"]
                    },
                    {
                        key: "spectre",
                        label: "Spectre lumineux",
                        type: "select",
                        choices: ["Complet", "Far-red", "Mint green", "Blanc froid", "Blanc chaud", "UV-A", "UV-B", "HPS", "Autre"]
                    }
                ]
            },
            {
                title: "Visuel et Technique",
                fields: [
                    { key: "densite", label: "Densité", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "trichome", label: "Trichome", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "pistil", label: "Pistil", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "manucure", label: "Manucure", type: "number", max: 10, min: 0, step: 0.5 }
                ],
                total: true,
                totalKeys: ["densite", "trichome", "pistil", "manucure"]
            },
            {
                title: "Odeur",
                fields: [
                    { key: "intensiteOdeur", label: "Intensité", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "notesDominantesOdeur", label: "Notes dominantes", type: "wheel-aromas" },
                    { key: "notesSecondairesOdeur", label: "Notes secondaires", type: "wheel-aromas" }
                ],
                total: true,
                totalKeys: ["intensiteOdeur"]
            },
            {
                title: "Texture",
                fields: [
                    { key: "durete", label: "Dureté", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "densiteTexture", label: "Densité", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "elasticite", label: "Élasticité", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "collant", label: "Collant", type: "number", max: 10, min: 0, step: 0.5 }
                ],
                total: true,
                totalKeys: ["durete", "densiteTexture", "elasticite", "collant"]
            },
            {
                title: "Goûts & Expérience fumée",
                fields: [
                    { key: "dryPuff", label: "Notes (dry puff/tirage à sec/froid)", type: "wheel-tastes" },
                    { key: "inhalation", label: "Notes (inhalation)", type: "wheel-tastes" },
                    { key: "expiration", label: "Notes (expiration)", type: "wheel-tastes" },
                    { key: "intensiteFumee", label: "Intensité", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "agressivite", label: "Agressivité/piquant", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "cendre", label: "Cendre", type: "number", max: 10, min: 0, step: 0.5 }
                ],
                total: true,
                totalKeys: ["intensiteFumee", "agressivite", "cendre"]
            },
            {
                title: "Effet",
                fields: [
                    { key: "montee", label: "Montée", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "intensiteEffet", label: "Intensité", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "typeEffet", label: "Type d'effet", type: "effects" },
                    {
                        key: "duree",
                        label: "Durée",
                        type: "select",
                        choices: ["<15min", "<30min", "<1h", "<2h", "2h+"]
                    }
                ],
                total: true,
                totalKeys: ["montee", "intensiteEffet"]
            }
        ]
    },
    Hash: {
        sections: [
            {
                title: "Informations générales",
                fields: [
                    { key: "cultivars", label: "Cultivars utilisés", type: "text", required: true },
                    { key: "hashmaker", label: "Hash Maker", type: "text" },
                    {
                        key: "typeSeparation",
                        label: "Type de séparation",
                        type: "select",
                        choices: [
                            "Tamisage WPFF (Whole Plant Fresh Frozen)",
                            "Tamisage à l'eau glacée (Bubble Hash)",
                            "Tamisage à la glace carbonique (Ice Hash)",
                            "Tamisage à sec (Dry)",
                            "Friction manuelle (Charas)",
                            "Autre"
                        ]
                    }
                ]
            },
            {
                title: "Visuel & Technique",
                fields: [
                    { key: "couleurTransparence", label: "Couleur/transparence", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "pureteVisuelle", label: "Pureté visuelle", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "densite", label: "Densité", type: "number", max: 10, min: 0, step: 0.5 }
                ],
                total: true,
                totalKeys: ["couleurTransparence", "pureteVisuelle", "densite"]
            },
            {
                title: "Odeur",
                fields: [
                    { key: "intensiteAromatique", label: "Intensité aromatique", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "notesDominantesOdeur", label: "Notes dominantes", type: "wheel-aromas" },
                    { key: "notesSecondairesOdeur", label: "Notes secondaires", type: "wheel-aromas" },
                    { key: "fideliteCultivars", label: "Fidélité aux cultivars", type: "number", max: 10, min: 0, step: 0.5 }
                ],
                total: true,
                totalKeys: ["intensiteAromatique", "fideliteCultivars"]
            },
            {
                title: "Texture",
                fields: [
                    { key: "durete", label: "Dureté", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "densiteTexture", label: "Densité", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "friabiliteViscosite", label: "Friabilité/Viscosité", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "meltingResidus", label: "Melting/Résidus", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "aspectCollantGras", label: "Aspect collant/gras", type: "number", max: 10, min: 0, step: 0.5 }
                ],
                total: true,
                totalKeys: ["durete", "densiteTexture", "friabiliteViscosite", "meltingResidus", "aspectCollantGras"]
            },
            {
                title: "Goûts & expérience fumée",
                fields: [
                    { key: "dryPuff", label: "Notes (dry puff)", type: "wheel-tastes" },
                    { key: "inhalation", label: "Notes (inhalation)", type: "wheel-tastes" },
                    { key: "expiration", label: "Notes (expiration)", type: "wheel-tastes" },
                    { key: "intensiteFumee", label: "Intensité", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "agressivite", label: "Agressivité/piquant", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "cendre", label: "Cendre", type: "number", max: 10, min: 0, step: 0.5 }
                ],
                total: true,
                totalKeys: ["intensiteFumee", "agressivite", "cendre"]
            },
            {
                title: "Effet",
                fields: [
                    { key: "montee", label: "Montée (rapidité)", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "intensiteEffet", label: "Intensité", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "typeEffet", label: "Type d'effet", type: "effects" },
                    {
                        key: "duree",
                        label: "Durée",
                        type: "select",
                        choices: ["<15min", "<30min", "<1h", "<2h", "2h+"]
                    }
                ],
                total: true,
                totalKeys: ["montee", "intensiteEffet"]
            }
        ]
    },
    Concentré: {
        sections: [
            {
                title: "Informations générales",
                fields: [
                    { key: "cultivars", label: "Cultivars utilisés", type: "text", required: true },
                    {
                        key: "typeExtraction",
                        label: "Type d'extraction",
                        type: "select",
                        choices: ["Rosin", "Live Resin", "Wax", "Crumble", "Sauce", "Distillate", "Diamonds", "RSO", "Shatter", "Budder", "Sand", "Autre"]
                    },
                    { key: "purgevide", label: "Purge à vide", type: "boolean" }
                ]
            },
            {
                title: "Visuel & Technique",
                fields: [
                    { key: "couleur", label: "Couleur / Transparence", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "viscosite", label: "Viscosité", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "pureteVisuelle", label: "Pureté visuelle", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "melting", label: "Melting", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "residus", label: "Résidus", type: "number", max: 10, min: 0, step: 0.5 }
                ],
                total: true,
                totalKeys: ["couleur", "viscosite", "pureteVisuelle", "melting", "residus"]
            },
            {
                title: "Odeur",
                fields: [
                    { key: "intensiteAromatique", label: "Intensité aromatique", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "notesDominantesOdeur", label: "Notes dominantes", type: "wheel-aromas" },
                    { key: "notesSecondairesOdeur", label: "Notes secondaires", type: "wheel-aromas" },
                    { key: "fideliteCultivars", label: "Fidélité aux cultivars", type: "number", max: 10, min: 0, step: 0.5 }
                ],
                total: true,
                totalKeys: ["intensiteAromatique", "fideliteCultivars"]
            },
            {
                title: "Texture",
                fields: [
                    { key: "durete", label: "Dureté", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "densiteTexture", label: "Densité", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "viscositeTexture", label: "Viscosité", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "collant", label: "Collant", type: "number", max: 10, min: 0, step: 0.5 }
                ],
                total: true,
                totalKeys: ["durete", "densiteTexture", "viscositeTexture", "collant"]
            },
            {
                title: "Expérience Inhalation",
                fields: [
                    { key: "dryPuff", label: "Notes (dry puff)", type: "wheel-tastes" },
                    { key: "inhalation", label: "Notes (inhalation)", type: "wheel-tastes" },
                    { key: "expiration", label: "Notes (expiration)", type: "wheel-tastes" },
                    { key: "textureBouche", label: "Texture en bouche", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "douceur", label: "Douceur / Agressivité", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "intensite", label: "Intensité", type: "number", max: 10, min: 0, step: 0.5 }
                ],
                total: true,
                totalKeys: ["textureBouche", "douceur", "intensite"]
            },
            {
                title: "Effet",
                fields: [
                    { key: "montee", label: "Montée", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "intensiteEffets", label: "Intensité des effets", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "typeEffet", label: "Type d'effet", type: "effects" },
                    {
                        key: "duree",
                        label: "Durée",
                        type: "select",
                        choices: ["<15min", "<30min", "<1h", "<2h", "2h+"]
                    }
                ],
                total: true,
                totalKeys: ["montee", "intensiteEffets"]
            }
        ]
    },
    Comestible: {
        sections: [
            {
                title: "Informations générales",
                fields: [
                    { key: "productName", label: "Nom du produit", type: "text", required: true },
                    { key: "marque", label: "Marque / Producteur / Cuisinier", type: "text" },
                    {
                        key: "typeComestible",
                        label: "Type de produit",
                        type: "select",
                        choices: ["Pâtisserie", "Confiserie", "Boisson", "Capsule", "Huile", "Chocolat", "Bonbon", "Gélule", "Autre"]
                    },
                    { key: "ingredients", label: "Ingrédients principaux (hors cannabis)", type: "textarea" }
                ]
            },
            {
                title: "Informations sur l'infusion",
                fields: [
                    { key: "cultivars", label: "Cultivars (variété)", type: "text" },
                    {
                        key: "typeExtrait",
                        label: "Type d'extrait pour l'infusion",
                        type: "select",
                        choices: ["Distillat", "Rosin", "RSO/FECO", "Beurre de Marrakech", "Huile infusée", "Isolat", "Autre"]
                    },
                    { key: "thcMg", label: "THC (mg)", type: "number", max: 1000, min: 0 },
                    { key: "cbdMg", label: "CBD (mg)", type: "number", max: 1000, min: 0 },
                    { key: "terpenes", label: "Profil terpénique (si connu)", type: "textarea" }
                ]
            },
            {
                title: "Expérience gustative & sensorielle",
                fields: [
                    { key: "apparence", label: "Apparence", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "intensiteOdeur", label: "Intensité odeur", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "gout", label: "Goût", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "notesDominantes", label: "Notes dominantes", type: "wheel-tastes" },
                    { key: "texture", label: "Texture", type: "number", max: 10, min: 0, step: 0.5 },
                    { key: "qualiteAlimentaire", label: "Qualité globale du produit alimentaire", type: "number", max: 10, min: 0, step: 0.5 }
                ],
                total: true,
                totalKeys: ["apparence", "intensiteOdeur", "gout", "texture", "qualiteAlimentaire"]
            },
            {
                title: "Effets & expérience psychotrope",
                fields: [
                    { key: "dosagePris", label: "Dosage pris", type: "text" },
                    {
                        key: "tempsMontee",
                        label: "Temps de montée",
                        type: "select",
                        choices: ["<30min", "30-60min", "60-90min", "90min+"]
                    },
                    { key: "intensiteMax", label: "Intensité maximale", type: "number", max: 10, min: 0, step: 0.5 },
                    {
                        key: "plateau",
                        label: "Plateau (durée de l'effet principal)",
                        type: "select",
                        choices: ["<1h", "1-2h", "2-4h", "4h+"]
                    },
                    { key: "typeEffet", label: "Type d'effet", type: "effects" }
                ],
                total: true,
                totalKeys: ["intensiteMax"]
            }
        ]
    }
}

// Fonction helper pour calculer les totaux
export const calculateSectionTotal = (section, formData) => {
    if (!section.total || !section.totalKeys) return null

    const values = section.totalKeys
        .map(key => parseFloat(formData[key]) || 0)
        .filter(val => !isNaN(val))

    if (values.length === 0) return null

    const sum = values.reduce((acc, val) => acc + val, 0)
    const avg = sum / values.length

    return {
        total: sum.toFixed(1),
        average: avg.toFixed(1),
        count: values.length
    }
}
