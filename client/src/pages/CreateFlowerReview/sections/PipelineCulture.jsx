import React from 'react'
import LiquidCard from '../../../components/LiquidCard'
import PipelineTimeline from '../../../components/forms/flower/PipelineTimeline'

/**
 * Section Pipeline Culture pour CreateFlowerReview
 * Utilise le nouveau système PipelineTimeline selon CDC
 */
export default function PipelineCulture({ formData, handleChange }) {
    // Culture-specific data fields selon PIPELINE_DONNEE_CULTURES.md
    const cultureDataFields = [
        // ========== GÉNÉRAL ==========
        {
            name: 'startDate',
            label: 'Date de début',
            section: 'GÉNÉRAL',
            type: 'date',
            defaultValue: ''
        },
        {
            name: 'endDate',
            label: 'Date de fin',
            section: 'GÉNÉRAL',
            type: 'date',
            defaultValue: ''
        },
        {
            name: 'mode',
            label: 'Mode de culture',
            section: 'GÉNÉRAL',
            type: 'select',
            options: [
                'Indoor (intérieur)',
                'Outdoor (extérieur plein champ)',
                'Greenhouse / Serre chauffée',
                'Greenhouse froide / non chauffée',
                'Greenhouse avec assistance lumineuse',
                'No-till indoor',
                'No-till outdoor',
                'Culture en container / bac hors-sol',
                'Culture verticale (multi-niveaux)',
                'Culture mixte'
            ],
            defaultValue: 'Indoor (intérieur)'
        },
        {
            name: 'spaceType',
            label: "Type d'espace de culture",
            section: 'GÉNÉRAL',
            type: 'select',
            options: [
                'Armoire de culture',
                'Tente de culture',
                'Chambre dédiée',
                'Pièce industrielle / salle blanche',
                'Serre verre',
                'Serre polycarbonate',
                'Tunnel plastique',
                'Plein champ extérieur',
                'Balcon / terrasse',
                'Box DIY / caisson technique',
                'Autre'
            ],
            defaultValue: 'Tente de culture'
        },
        {
            name: 'spaceLength',
            label: 'Longueur',
            section: 'GÉNÉRAL',
            type: 'number',
            unit: 'cm',
            placeholder: '120',
            defaultValue: ''
        },
        {
            name: 'spaceWidth',
            label: 'Largeur',
            section: 'GÉNÉRAL',
            type: 'number',
            unit: 'cm',
            placeholder: '120',
            defaultValue: ''
        },
        {
            name: 'spaceHeight',
            label: 'Hauteur',
            section: 'GÉNÉRAL',
            type: 'number',
            unit: 'cm',
            placeholder: '200',
            defaultValue: ''
        },
        {
            name: 'spaceArea',
            label: 'Surface au sol',
            section: 'GÉNÉRAL',
            type: 'number',
            unit: 'm²',
            placeholder: '1.44',
            defaultValue: ''
        },
        {
            name: 'spaceVolume',
            label: 'Volume total',
            section: 'GÉNÉRAL',
            type: 'number',
            unit: 'm³',
            placeholder: '2.88',
            defaultValue: ''
        },

        // ========== ENVIRONNEMENT - Propagation ==========
        {
            name: 'propagation',
            label: 'Technique de propagation',
            section: 'ENVIRONNEMENT',
            type: 'select',
            options: [
                'Graine directement en substrat',
                'Graine en pastille Jiffy / tourbe',
                'Graine en laine de roche',
                'Graine en cube Root Riot / similaire',
                'Germination sur sopalin',
                'Germination sur coton',
                'Germination dans serviette humide',
                'Germination en eau (verre d\'eau)',
                'Germination en propagateur chauffant',
                'Clone / bouture prélevée en interne',
                'Clone acheté / externe',
                'Bouture en eau claire',
                'Bouture en eau + hormone d\'enracinement',
                'Bouture en substrat (tourbe/terre/coco)',
                'Bouture en laine de roche',
                'Bouture en cube de propagation (Root Riot, etc.)',
                'Micropropagation / in vitro',
                'Autre'
            ],
            defaultValue: 'Graine directement en substrat'
        },

        // ========== ENVIRONNEMENT - Substrat ==========
        {
            name: 'substrateType',
            label: 'Type de substrat',
            section: 'SUBSTRAT',
            type: 'select',
            options: [
                'Hydroponique recirculé',
                'Hydroponique drain-to-waste',
                'DWC (deep water culture)',
                'RDWC (recirculating DWC)',
                'NFT (nutrient film technique)',
                'Aéroponie haute pression',
                'Aéroponie basse pression',
                'Substrat inerte (coco, laine de roche, billes d\'argile, perlite, vermiculite)',
                'Terreau « Bio »',
                'Terreau organique vivant (living soil)',
                'Super-soil / no-till',
                'Mélange terre / coco',
                'Mélange terre / perlite',
                'Mélange coco / perlite',
                'Mélange coco / billes d\'argile',
                'Mélange personnalisé'
            ],
            defaultValue: 'Terreau « Bio »'
        },
        {
            name: 'substrateVolumePerPot',
            label: 'Volume par contenant',
            section: 'SUBSTRAT',
            type: 'number',
            unit: 'L',
            placeholder: '11',
            defaultValue: ''
        },
        {
            name: 'substrateTotalVolume',
            label: 'Volume total de substrat',
            section: 'SUBSTRAT',
            type: 'number',
            unit: 'L',
            placeholder: '44',
            defaultValue: ''
        },
        {
            name: 'substrateComposition',
            label: 'Composition substrat',
            section: 'SUBSTRAT',
            type: 'text',
            placeholder: 'Terre végétale 50%, Perlite 20%, Compost 30%',
            defaultValue: ''
        },
        {
            name: 'substrateBrand',
            label: 'Marque substrat',
            section: 'SUBSTRAT',
            type: 'select',
            options: [
                'Canna',
                'Plagron',
                'Biobizz',
                'Atami',
                'Advanced Nutrients',
                'House & Garden',
                'General Hydroponics / Terra Aquatica',
                'FoxFarm',
                'Mills',
                'Green House Feeding',
                'BAC',
                'Aptus',
                'Remo',
                'Autre'
            ],
            defaultValue: ''
        },

        // ========== IRRIGATION ==========
        {
            name: 'irrigationType',
            label: "Type de système d'irrigation",
            section: 'IRRIGATION',
            type: 'select',
            options: [
                'Arrosage manuel (arrosoir)',
                'Arrosage manuel + pompe électrique',
                'Goutte à goutte simple',
                'Goutte à goutte avec piquets',
                'Goutte à goutte réglable',
                'Goutte à goutte multi-sorties',
                'Ligne de goutte à goutte (drip line)',
                'Ebb & Flow / Flood & Drain',
                'Sub-irrigation / bottom feeding',
                'Systèmes top-feed automatisés',
                'Systèmes à mèche / wicking',
                'DWC avec bullage',
                'RDWC',
                'NFT',
                'Aéroponie basse pression',
                'Aéroponie haute pression',
                'Système hybride',
                'Brumisation / fogponic',
                'Autre'
            ],
            defaultValue: 'Arrosage manuel (arrosoir)'
        },
        {
            name: 'irrigationFrequency',
            label: "Fréquence d'arrosage",
            section: 'IRRIGATION',
            type: 'select',
            options: [
                '1 fois par jour',
                '2 fois par jour',
                '3 fois par jour',
                '4 fois par jour',
                '6 fois par jour',
                '8 fois par jour',
                '12 fois par jour',
                '1 fois tous les 2 jours',
                '2 fois par semaine',
                '3 fois par semaine',
                '4 fois par semaine',
                '5 fois par semaine',
                '6 fois par semaine',
                '7 fois par semaine',
                'Irrigation en continu',
                'Irrigation à la demande (capteurs)',
                'Autre'
            ],
            defaultValue: '1 fois tous les 2 jours'
        },
        {
            name: 'waterVolume',
            label: "Volume d'eau par arrosage",
            section: 'IRRIGATION',
            type: 'number',
            unit: 'L',
            placeholder: '2',
            defaultValue: ''
        },
        {
            name: 'waterVolumeMode',
            label: "Mode de volume d'eau",
            section: 'IRRIGATION',
            type: 'select',
            options: [
                'Volume fixe par pot',
                'Volume fixe par m²',
                'Volume variable'
            ],
            defaultValue: 'Volume fixe par pot'
        },

        // ========== ENGRAIS ==========
        {
            name: 'fertilizerType',
            label: "Type d'engrais",
            section: 'ENGRAIS',
            type: 'select',
            options: [
                'Minéral / chimique',
                'Organique',
                'Organique-minéral / mixte',
                'Biologique certifié',
                'Amendement solide à libération lente',
                'Solution nutritive hydroponique',
                'Booster / stimulateur racinaire',
                'Booster floraison',
                'Additifs (enzymes, sucres, PK, etc.)',
                'Autre'
            ],
            defaultValue: 'Organique'
        },
        {
            name: 'fertilizerBrand',
            label: 'Marque et gamme',
            section: 'ENGRAIS',
            type: 'select',
            options: [
                'Canna (Terra, Aqua, Coco, BioCanna)',
                'Plagron (Terra, Alga, Coco)',
                'Biobizz (Bio-Grow, Bio-Bloom)',
                'Advanced Nutrients (pH Perfect)',
                'General Hydroponics / Terra Aquatica',
                'House & Garden',
                'Green House Feeding',
                'FoxFarm',
                'Mills',
                'Aptus',
                'Remo Nutrients',
                'Autre'
            ],
            defaultValue: ''
        },
        {
            name: 'fertilizerDosage',
            label: 'Dosage',
            section: 'ENGRAIS',
            type: 'text',
            unit: 'g/L, ml/L, EC, ppm',
            placeholder: '2ml/L ou EC 1.8 ou 800ppm',
            defaultValue: ''
        },
        {
            name: 'fertilizerFrequency',
            label: "Fréquence d'application",
            section: 'ENGRAIS',
            type: 'select',
            options: [
                'À chaque arrosage',
                '1 arrosage sur 2',
                '1 fois par jour',
                '1 fois tous les 2 jours',
                '1 fois par semaine',
                '1 fois toutes les 2 semaines',
                'Continu (fertigation permanente)',
                'Ponctuel (début stretch, etc.)',
                'Autre'
            ],
            defaultValue: 'À chaque arrosage'
        },

        // ========== LUMIÈRE ==========
        {
            name: 'lightType',
            label: 'Type de lampe',
            section: 'LUMIÈRE',
            type: 'select',
            options: [
                'LED panneau',
                'LED barre linéaire',
                'LED quantum board',
                'LED COB',
                'HPS (sodium haute pression)',
                'MH (métal halide)',
                'CMH / LEC',
                'CFL / néon / T5',
                'Plasma',
                'Halogénure céramique',
                'Multibar industrial LED',
                'Lumière naturelle uniquement',
                'Lumière naturelle + complément LED',
                'Lumière naturelle + HPS',
                'Autre'
            ],
            defaultValue: 'LED panneau'
        },
        {
            name: 'lightSpectrum',
            label: 'Spectre',
            section: 'LUMIÈRE',
            type: 'select',
            options: [
                'Spectre complet',
                'Dominante bleue',
                'Dominante rouge',
                'Croissance (blue heavy)',
                'Floraison (red heavy)',
                'UV-A inclus',
                'UV-B inclus',
                'IR / Far-red inclus',
                'Spectre ajustable / multi-canaux',
                'Non spécifié'
            ],
            defaultValue: 'Spectre complet'
        },
        {
            name: 'lightDistance',
            label: 'Distance lampe/plante',
            section: 'LUMIÈRE',
            type: 'number',
            unit: 'cm',
            placeholder: '30',
            defaultValue: ''
        },
        {
            name: 'lightDistanceMode',
            label: 'Mode distance',
            section: 'LUMIÈRE',
            type: 'select',
            options: ['Fixe', 'Variable (suivi dans pipeline)'],
            defaultValue: 'Fixe'
        },
        {
            name: 'lightPowerTotal',
            label: 'Puissance totale',
            section: 'LUMIÈRE',
            type: 'number',
            unit: 'W',
            placeholder: '600',
            defaultValue: ''
        },
        {
            name: 'lightPowerPerM2',
            label: 'Puissance par m²',
            section: 'LUMIÈRE',
            type: 'number',
            unit: 'W/m²',
            placeholder: '400',
            defaultValue: ''
        },
        {
            name: 'lightDimmable',
            label: 'Dimmable',
            section: 'LUMIÈRE',
            type: 'select',
            options: ['Oui', 'Non'],
            defaultValue: 'Non'
        },
        {
            name: 'lightPhotoperiod',
            label: 'Photopériode',
            section: 'LUMIÈRE',
            type: 'select',
            options: [
                '24/0',
                '20/4',
                '18/6',
                '16/8',
                '12/12',
                '11/13',
                '10/14',
                'Personnalisée'
            ],
            defaultValue: '18/6'
        },
        {
            name: 'lightDLI',
            label: 'DLI',
            section: 'LUMIÈRE',
            type: 'number',
            unit: 'mol/m²/jour',
            placeholder: '40',
            defaultValue: ''
        },
        {
            name: 'lightPPFD',
            label: 'PPFD moyen',
            section: 'LUMIÈRE',
            type: 'number',
            unit: 'µmol/m²/s',
            placeholder: '500',
            defaultValue: ''
        },
        {
            name: 'lightKelvin',
            label: 'Kelvin (température de couleur)',
            section: 'LUMIÈRE',
            type: 'select',
            options: [
                '2700 K',
                '3000 K',
                '3500 K',
                '4000 K',
                '5000 K',
                '6500 K',
                'Spectre mixte / non applicable'
            ],
            defaultValue: 'Spectre mixte / non applicable'
        },

        // ========== CLIMAT ==========
        {
            name: 'temperatureAverage',
            label: 'Température moyenne',
            section: 'CLIMAT',
            type: 'number',
            unit: '°C',
            placeholder: '24',
            defaultValue: ''
        },
        {
            name: 'temperatureDay',
            label: 'Température jour',
            section: 'CLIMAT',
            type: 'number',
            unit: '°C',
            placeholder: '26',
            defaultValue: ''
        },
        {
            name: 'temperatureNight',
            label: 'Température nuit',
            section: 'CLIMAT',
            type: 'number',
            unit: '°C',
            placeholder: '20',
            defaultValue: ''
        },
        {
            name: 'temperatureMode',
            label: 'Mode température',
            section: 'CLIMAT',
            type: 'select',
            options: ['Contrôlée', 'Non contrôlée'],
            defaultValue: 'Contrôlée'
        },
        {
            name: 'humidityAverage',
            label: 'Humidité relative moyenne',
            section: 'CLIMAT',
            type: 'number',
            unit: '%',
            placeholder: '60',
            defaultValue: ''
        },
        {
            name: 'co2Level',
            label: 'Niveau CO₂',
            section: 'CLIMAT',
            type: 'select',
            options: [
                'Non enrichi (~400-500 ppm)',
                '600-800 ppm',
                '800-1000 ppm',
                '1000-1200 ppm',
                '>1200 ppm (avancé)'
            ],
            defaultValue: 'Non enrichi (~400-500 ppm)'
        },
        {
            name: 'co2Mode',
            label: 'Mode CO₂',
            section: 'CLIMAT',
            type: 'select',
            options: [
                'Pas de contrôle',
                'Injection bouteille',
                'Générateur',
                'HVACD'
            ],
            defaultValue: 'Pas de contrôle'
        },
        {
            name: 'ventilationType',
            label: 'Type de ventilation',
            section: 'CLIMAT',
            type: 'select',
            options: [
                'Extracteur d\'air',
                'Intracteur d\'air',
                'Ventilateur oscillant',
                'Ventilation au plafond',
                'Ventilation par gaines (HVACD)',
                'Déshumidificateur',
                'Humidificateur',
                'Filtre à charbon',
                'Autre'
            ],
            defaultValue: 'Extracteur d\'air'
        },
        {
            name: 'ventilationMode',
            label: 'Mode de ventilation',
            section: 'CLIMAT',
            type: 'select',
            options: [
                'Continu',
                'Cyclé (minuterie)',
                'Piloté par hygromètre/thermostat',
                'Piloté par pression différentielle'
            ],
            defaultValue: 'Continu'
        },

        // ========== PALISSAGE ==========
        {
            name: 'trainingMethod',
            label: 'Méthodologie LST/HST',
            section: 'PALISSAGE',
            type: 'select',
            options: [
                'Pas de palissage',
                'LST (Low Stress Training)',
                'HST (High Stress Training)',
                'Topping (étêtage)',
                'Fimming',
                'Main-Lining / Manifolding',
                'SCROG (Screen of Green)',
                'SOG (Sea of Green)',
                'Lollipopping',
                'Super-cropping',
                'Defoliation ciblée',
                'Super-cropping + support tuteur / filet',
                'Splitting / fente de tige',
                'Tuteurs individuels',
                'Filets multi-niveaux',
                'Palissage horizontal',
                'Palissage vertical',
                'Ligaturage / tie-down simple',
                'Ligaturage en étoile',
                'Taille apicale répétée',
                'Taille latérale',
                'Taille de racines',
                'Autre'
            ],
            defaultValue: 'Pas de palissage'
        },
        {
            name: 'trainingComment',
            label: 'Description manipulation',
            section: 'PALISSAGE',
            type: 'text',
            placeholder: 'Décrivez les techniques appliquées...',
            defaultValue: ''
        },

        // ========== MORPHOLOGIE ==========
        {
            name: 'plantHeightCm',
            label: 'Taille',
            section: 'MORPHOLOGIE',
            type: 'number',
            unit: 'cm',
            placeholder: '80',
            defaultValue: ''
        },
        {
            name: 'plantHeightCategory',
            label: 'Catégorie de taille',
            section: 'MORPHOLOGIE',
            type: 'select',
            options: [
                '<30 cm',
                '30-60 cm',
                '60-90 cm',
                '90-120 cm',
                '120-150 cm',
                '150-200 cm',
                '>200 cm'
            ],
            defaultValue: ''
        },
        {
            name: 'plantVolumeCategory',
            label: 'Volume de canopée',
            section: 'MORPHOLOGIE',
            type: 'select',
            options: [
                'Petit',
                'Moyen',
                'Grand',
                'Très volumineux'
            ],
            defaultValue: 'Moyen'
        },
        {
            name: 'plantVolumeM3',
            label: 'Volume chiffré',
            section: 'MORPHOLOGIE',
            type: 'number',
            unit: 'm³',
            placeholder: '0.5',
            defaultValue: ''
        },
        {
            name: 'plantWeightFresh',
            label: 'Poids plante fraîche (hors racines)',
            section: 'MORPHOLOGIE',
            type: 'number',
            unit: 'g',
            placeholder: '500',
            defaultValue: ''
        },
        {
            name: 'mainBranchesCount',
            label: 'Nombre branches principales',
            section: 'MORPHOLOGIE',
            type: 'number',
            placeholder: '8',
            defaultValue: ''
        },
        {
            name: 'mainBranchesCategory',
            label: 'Catégorie branches',
            section: 'MORPHOLOGIE',
            type: 'select',
            options: ['1-4', '5-8', '9-12', '>12'],
            defaultValue: ''
        },
        {
            name: 'leavesCount',
            label: 'Nombre de feuilles (estimé)',
            section: 'MORPHOLOGIE',
            type: 'select',
            options: ['<50', '50-100', '100-200', '>200'],
            defaultValue: ''
        },
        {
            name: 'budsCount',
            label: 'Nombre de buds / sites floraux',
            section: 'MORPHOLOGIE',
            type: 'select',
            options: ['<20', '20-50', '50-100', '>100'],
            defaultValue: ''
        },

        // ========== RÉCOLTE ==========
        {
            name: 'trichomeColor',
            label: 'Couleur des trichomes',
            section: 'RÉCOLTE',
            type: 'select',
            options: [
                'Majorité laiteux',
                'Majorité ambré',
                'Transparent / translucide',
                'Laiteux / opaque',
                'Ambré',
                'Mélange transparent-laiteux',
                'Mélange laiteux-ambré'
            ],
            defaultValue: 'Majorité laiteux'
        },
        {
            name: 'harvestDate',
            label: 'Date de récolte',
            section: 'RÉCOLTE',
            type: 'date',
            defaultValue: ''
        },
        {
            name: 'weightWet',
            label: 'Poids brut (plante entière fraîche)',
            section: 'RÉCOLTE',
            type: 'number',
            unit: 'g',
            placeholder: '250',
            defaultValue: ''
        },
        {
            name: 'weightAfterDefoliation',
            label: 'Poids net après première défoliation',
            section: 'RÉCOLTE',
            type: 'number',
            unit: 'g',
            placeholder: '180',
            defaultValue: ''
        },
        {
            name: 'weightDryFinal',
            label: 'Poids sec final',
            section: 'RÉCOLTE',
            type: 'number',
            unit: 'g',
            placeholder: '80',
            defaultValue: ''
        },
        {
            name: 'weightLossPercent',
            label: 'Taux de perte',
            section: 'RÉCOLTE',
            type: 'number',
            unit: '%',
            placeholder: '68',
            defaultValue: ''
        },
        {
            name: 'yieldPerM2',
            label: 'Rendement g/m²',
            section: 'RÉCOLTE',
            type: 'number',
            unit: 'g/m²',
            placeholder: '400',
            defaultValue: ''
        },
        {
            name: 'yieldPerPlant',
            label: 'Rendement g/plante',
            section: 'RÉCOLTE',
            type: 'number',
            unit: 'g/plante',
            placeholder: '80',
            defaultValue: ''
        },
        {
            name: 'yieldPerWatt',
            label: 'Rendement g/W',
            section: 'RÉCOLTE',
            type: 'number',
            unit: 'g/W',
            placeholder: '0.8',
            defaultValue: ''
        },
        {
            name: 'yieldQuality',
            label: 'Qualité du rendement',
            section: 'RÉCOLTE',
            type: 'select',
            options: ['Faible', 'Moyen', 'Bon', 'Très élevé'],
            defaultValue: 'Bon'
        }
    ]
    options: [
        'LED panneau',
        'LED barre linéaire',
        'LED quantum board',
        'LED COB',
        'HPS (sodium haute pression)',
        'MH (métal halide)',
        'CMH / LEC',
        'CFL / néon / T5',
        'Plasma',
        'Halogénure céramique',
        'Multibar industrial LED',
        'Lumière naturelle uniquement',
        'Lumière naturelle + complément LED',
        'Lumière naturelle + HPS',
        'Autre'
    ],
        defaultValue: 'LED panneau'
},
{
    name: 'lightSpectrum',
        label: 'Type de spectre',
            section: 'LUMIÈRE',
                type: 'select',
                    options: [
                        'Spectre complet',
                        'Dominante bleue',
                        'Dominante rouge',
                        'Croissance (blue heavy)',
                        'Floraison (red heavy)',
                        'UV-A inclus',
                        'UV-B inclus',
                        'IR / Far-red inclus',
                        'Spectre ajustable / multi-canaux',
                        'Non spécifié'
                    ],
                        defaultValue: 'Spectre complet'
},
{
    name: 'lightDistance',
        label: 'Distance lampe/plante',
            section: 'LUMIÈRE',
                type: 'number',
                    unit: 'cm',
                        placeholder: '30',
                            defaultValue: ''
},
{
    name: 'lightPower',
        label: 'Puissance totale',
            section: 'LUMIÈRE',
                type: 'number',
                    unit: 'W',
                        placeholder: '600',
                            defaultValue: ''
},
{
    name: 'lightPowerPerM2',
        label: 'Puissance par m²',
            section: 'LUMIÈRE',
                type: 'number',
                    unit: 'W/m²',
                        placeholder: '400',
                            defaultValue: ''
},
{
    name: 'lightDimmable',
        label: 'Dimmable',
            section: 'LUMIÈRE',
                type: 'select',
                    options: ['Oui', 'Non'],
                        defaultValue: 'Non'
},
{
    name: 'lightPhotoperiod',
        label: 'Photopériode',
            section: 'LUMIÈRE',
                type: 'select',
                    options: [
                        '24/0',
                        '20/4',
                        '18/6',
                        '16/8',
                        '12/12',
                        '11/13',
                        '10/14',
                        'Personnalisée'
                    ],
                        defaultValue: '18/6'
},
{
    name: 'lightDLI',
        label: 'DLI',
            section: 'LUMIÈRE',
                type: 'number',
                    unit: 'mol/m²/jour',
                        placeholder: '40',
                            defaultValue: ''
},
{
    name: 'lightPPFD',
        label: 'PPFD moyen',
            section: 'LUMIÈRE',
                type: 'number',
                    unit: 'µmol/m²/s',
                        placeholder: '500',
                            defaultValue: ''
},
{
    name: 'lightKelvin',
        label: 'Kelvin (température de couleur)',
            section: 'LUMIÈRE',
                type: 'select',
                    options: [
                        '2700 K',
                        '3000 K',
                        '3500 K',
                        '4000 K',
                        '5000 K',
                        '6500 K',
                        'Spectre mixte / non applicable'
                    ],
                        defaultValue: 'Spectre mixte / non applicable'
},

// ========== CLIMAT ==========
{
    name: 'temperature',
        label: 'Température moyenne',
            section: 'CLIMAT',
                type: 'number',
                    unit: '°C',
                        placeholder: '24',
                            defaultValue: ''
},
{
    name: 'temperatureDay',
        label: 'Température jour',
            section: 'CLIMAT',
                type: 'number',
                    unit: '°C',
                        placeholder: '26',
                            defaultValue: ''
},
{
    name: 'temperatureNight',
        label: 'Température nuit',
            section: 'CLIMAT',
                type: 'number',
                    unit: '°C',
                        placeholder: '20',
                            defaultValue: ''
},
{
    name: 'humidity',
        label: 'Humidité relative moyenne',
            section: 'CLIMAT',
                type: 'number',
                    unit: '%',
                        placeholder: '60',
                            defaultValue: ''
},
{
    name: 'co2',
        label: 'CO₂',
            section: 'CLIMAT',
                type: 'select',
                    options: [
                        'Non enrichi (~400-500 ppm)',
                        '600-800 ppm',
                        '800-1000 ppm',
                        '1000-1200 ppm',
                        '1200+ ppm (avancé)'
                    ],
                        defaultValue: 'Non enrichi (~400-500 ppm)'
},
{
    name: 'ventilation',
        label: 'Type de ventilation',
            section: 'CLIMAT',
                type: 'select',
                    options: [
                        'Extracteur d\'air',
                        'Intracteur d\'air',
                        'Ventilateur oscillant',
                        'Ventilation au plafond',
                        'Ventilation par gaines (HVACD)',
                        'Déshumidificateur',
                        'Humidificateur',
                        'Filtre à charbon',
                        'Combinaison',
                        'Autre'
                    ],
                        defaultValue: 'Extracteur d\'air'
},
{
    name: 'ventilationMode',
        label: 'Mode de ventilation',
            section: 'CLIMAT',
                type: 'select',
                    options: [
                        'Continu',
                        'Cyclé (minuterie)',
                        'Piloté par hygromètre/thermostat',
                        'Piloté par pression différentielle',
                        'Autre'
                    ],
                        defaultValue: 'Continu'
},

// ========== PALISSAGE ==========
{
    name: 'training',
        label: 'Méthodologie LST/HST',
            section: 'PALISSAGE',
                type: 'select',
                    options: [
                        'Pas de palissage',
                        'LST (Low Stress Training)',
                        'HST (High Stress Training)',
                        'Topping (étêtage)',
                        'Fimming',
                        'Main-Lining / Manifolding',
                        'SCROG (Screen of Green)',
                        'SOG (Sea of Green)',
                        'Lollipopping',
                        'Super-cropping',
                        'Defoliation ciblée',
                        'Super-cropping + support tuteur / filet',
                        'Splitting / fente de tige',
                        'Tuteurs individuels',
                        'Filets multi-niveaux',
                        'Palissage horizontal',
                        'Palissage vertical',
                        'Ligaturage / tie-down simple',
                        'Ligaturage en étoile',
                        'Taille apicale répétée',
                        'Taille latérale',
                        'Taille de racines',
                        'Autre'
                    ],
                        defaultValue: 'Pas de palissage'
},
{
    name: 'trainingComment',
        label: 'Description manipulation',
            section: 'PALISSAGE',
                type: 'text',
                    placeholder: 'Décrivez les techniques de palissage appliquées...',
                        defaultValue: ''
},

// ========== MORPHOLOGIE ==========
{
    name: 'plantHeight',
        label: 'Taille de la plante',
            section: 'MORPHOLOGIE',
                type: 'number',
                    unit: 'cm',
                        placeholder: '80',
                            defaultValue: ''
},
{
    name: 'plantHeightCategory',
        label: 'Catégorie de taille',
            section: 'MORPHOLOGIE',
                type: 'select',
                    options: [
                        '<30 cm',
                        '30-60 cm',
                        '60-90 cm',
                        '90-120 cm',
                        '120-150 cm',
                        '150-200 cm',
                        '>200 cm'
                    ],
                        defaultValue: ''
},
{
    name: 'plantVolume',
        label: 'Volume de canopée',
            section: 'MORPHOLOGIE',
                type: 'select',
                    options: [
                        'Petit',
                        'Moyen',
                        'Grand',
                        'Très volumineux'
                    ],
                        defaultValue: 'Moyen'
},
{
    name: 'plantVolumeM3',
        label: 'Volume chiffré',
            section: 'MORPHOLOGIE',
                type: 'number',
                    unit: 'm³',
                        placeholder: '0.5',
                            defaultValue: ''
},
{
    name: 'plantWeightFresh',
        label: 'Poids plante fraîche (hors racines)',
            section: 'MORPHOLOGIE',
                type: 'number',
                    unit: 'g',
                        placeholder: '500',
                            defaultValue: ''
},
{
    name: 'mainBranches',
        label: 'Nombre branches principales',
            section: 'MORPHOLOGIE',
                type: 'number',
                    placeholder: '8',
                        defaultValue: ''
},
{
    name: 'leavesCount',
        label: 'Nombre de feuilles (estimé)',
            section: 'MORPHOLOGIE',
                type: 'select',
                    options: [
                        '<50',
                        '50-100',
                        '100-200',
                        '>200'
                    ],
                        defaultValue: ''
},
{
    name: 'budsCount',
        label: 'Nombre de buds / sites floraux',
            section: 'MORPHOLOGIE',
                type: 'select',
                    options: [
                        '<20',
                        '20-50',
                        '50-100',
                        '>100'
                    ],
                        defaultValue: ''
},

// ========== RÉCOLTE ==========
{
    name: 'trichomeColor',
        label: 'Couleur des trichomes',
            section: 'RÉCOLTE',
                type: 'select',
                    options: [
                        'Majorité laiteux',
                        'Majorité ambré',
                        'Transparent / translucide',
                        'Laiteux / opaque',
                        'Ambré',
                        'Mélange transparent-laiteux',
                        'Mélange laiteux-ambré'
                    ],
                        defaultValue: 'Majorité laiteux'
},
{
    name: 'harvestDate',
        label: 'Date de récolte',
            section: 'RÉCOLTE',
                type: 'date',
                    defaultValue: ''
},
{
    name: 'wetWeight',
        label: 'Poids brut (plante entière fraîche)',
            section: 'RÉCOLTE',
                type: 'number',
                    unit: 'g',
                        placeholder: '250',
                            defaultValue: ''
},
{
    name: 'dryWeightAfterDefoliation',
        label: 'Poids net après première défoliation',
            section: 'RÉCOLTE',
                type: 'number',
                    unit: 'g',
                        placeholder: '180',
                            defaultValue: ''
},
{
    name: 'dryWeightFinal',
        label: 'Poids sec final',
            section: 'RÉCOLTE',
                type: 'number',
                    unit: 'g',
                        placeholder: '80',
                            defaultValue: ''
},
{
    name: 'weightLossPercent',
        label: 'Taux de perte',
            section: 'RÉCOLTE',
                type: 'number',
                    unit: '%',
                        placeholder: '68',
                            defaultValue: ''
},
{
    name: 'yieldPerM2',
        label: 'Rendement par m²',
            section: 'RÉCOLTE',
                type: 'number',
                    unit: 'g/m²',
                        placeholder: '400',
                            defaultValue: ''
},
{
    name: 'yieldPerPlant',
        label: 'Rendement par plante',
            section: 'RÉCOLTE',
                type: 'number',
                    unit: 'g/plante',
                        placeholder: '80',
                            defaultValue: ''
},
{
    name: 'yieldPerWatt',
        label: 'Rendement par Watt',
            section: 'RÉCOLTE',
                type: 'number',
                    unit: 'g/W',
                        placeholder: '0.8',
                            defaultValue: ''
},
{
    name: 'yieldQuality',
        label: 'Qualité du rendement',
            section: 'RÉCOLTE',
                type: 'select',
                    options: [
                        'Faible',
                        'Moyen',
                        'Bon',
                        'Très élevé'
                    ],
                        defaultValue: 'Bon'
}
    ]

const handlePipelineChange = (pipelineData) => {
    handleChange('culturePipeline', pipelineData)
}

return (
    <LiquidCard title="🌱 Pipeline de culture" bordered>
        <div className="space-y-4">
            {/* Instructions d'utilisation */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                    📋 Pipeline de culture : Timeline interactive CDC
                </h4>
                <ul className="text-xs text-purple-800 dark:text-purple-200 space-y-1 list-disc list-inside">
                    <li>Glissez les contenus depuis le panneau latéral vers les cases de la timeline</li>
                    <li>Drag & drop : Sélectionnez un contenu à gauche et déposez-le sur une case</li>
                    <li>Édition : Cliquez sur une case pour modifier ses données</li>
                    <li>Préréglages sauvegardés : Créez des configurations globales réutilisables</li>
                    <li>Assignation masse : Sélectionnez plusieurs cases (Ctrl/Shift) puis assignez un préréglage</li>
                </ul>
            </div>

            {/* Composant Timeline */}
            <PipelineTimeline
                pipelineType="culture"
                data={formData.culturePipeline || {}}
                onChange={handlePipelineChange}
                availableDataFields={cultureDataFields}
            />
        </div>
    </LiquidCard>
)
}
