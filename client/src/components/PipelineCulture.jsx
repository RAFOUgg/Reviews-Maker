import React from 'react'
import { useTranslation } from 'react-i18next'
import PipelineTimeline from './PipelineTimeline'

/**
 * Section 3: Pipeline Culture
 * Utilise PipelineTimeline avec système de préréglages selon CDC
 */
export default function PipelineCulture({ data, onChange }) {
    const { t } = useTranslation()

    // Culture-specific data fields selon REAL_VISION_CDC_DEV.md
    const cultureDataFields = [
        // GÉNÉRAL
        {
            name: 'mode',
            label: 'Mode de culture',
            section: 'GÉNÉRAL',
            type: 'select',
            options: ['Indoor', 'Outdoor', 'Greenhouse', 'No-till', 'Autre'],
            defaultValue: 'Indoor'
        },
        {
            name: 'spaceType',
            label: 'Type d\'espace',
            section: 'GÉNÉRAL',
            type: 'select',
            options: ['Armoire', 'Tente', 'Serre', 'Extérieur', 'Autre'],
            defaultValue: 'Tente'
        },
        {
            name: 'spaceDimensions',
            label: 'Dimensions (LxlxH cm)',
            section: 'GÉNÉRAL',
            type: 'text',
            placeholder: '120x120x200',
            defaultValue: ''
        },

        // ENVIRONNEMENT
        {
            name: 'propagation',
            label: 'Technique de propagation',
            section: 'ENVIRONNEMENT',
            type: 'select',
            options: ['Graine', 'Clone', 'Bouture', 'Sopalin', 'Autre'],
            defaultValue: 'Graine'
        },
        {
            name: 'substrateType',
            label: 'Type de substrat',
            section: 'ENVIRONNEMENT',
            type: 'select',
            options: ['Hydro', 'Bio', 'Organique'],
            defaultValue: 'Bio'
        },
        {
            name: 'substrateVolume',
            label: 'Volume substrat (L)',
            section: 'ENVIRONNEMENT',
            type: 'number',
            placeholder: '11',
            defaultValue: ''
        },
        {
            name: 'substrateComposition',
            label: 'Composition substrat',
            section: 'ENVIRONNEMENT',
            type: 'text',
            placeholder: 'Terre 70%, Coco 20%, Perlite 10%',
            defaultValue: ''
        },
        {
            name: 'irrigationType',
            label: 'Système d\'irrigation',
            section: 'ENVIRONNEMENT',
            type: 'select',
            options: ['Goutte à goutte', 'Inondation', 'Manuel', 'Autre'],
            defaultValue: 'Manuel'
        },
        {
            name: 'irrigationFrequency',
            label: 'Fréquence d\'arrosage',
            section: 'ENVIRONNEMENT',
            type: 'text',
            placeholder: 'Tous les 2 jours',
            defaultValue: ''
        },
        {
            name: 'waterVolume',
            label: 'Volume d\'eau par arrosage (L)',
            section: 'ENVIRONNEMENT',
            type: 'number',
            placeholder: '2',
            defaultValue: ''
        },

        // ENGRAIS
        {
            name: 'fertilizerType',
            label: 'Type d\'engrais',
            section: 'ENGRAIS',
            type: 'select',
            options: ['Bio', 'Chimique', 'Mixte'],
            defaultValue: 'Bio'
        },
        {
            name: 'fertilizerBrand',
            label: 'Marque et gamme',
            section: 'ENGRAIS',
            type: 'text',
            placeholder: 'BioBizz - Light Mix',
            defaultValue: ''
        },
        {
            name: 'fertilizerDosage',
            label: 'Dosage (g/L ou ml/L)',
            section: 'ENGRAIS',
            type: 'text',
            placeholder: '2ml/L',
            defaultValue: ''
        },

        // LUMIÈRE
        {
            name: 'lightType',
            label: 'Type de lampe',
            section: 'LUMIÈRE',
            type: 'select',
            options: ['LED', 'HPS', 'CFL', 'Naturel', 'Mixte', 'Autre'],
            defaultValue: 'LED'
        },
        {
            name: 'lightSpectrum',
            label: 'Type de spectre',
            section: 'LUMIÈRE',
            type: 'select',
            options: ['Complet', 'Bleu', 'Rouge', 'Mixte'],
            defaultValue: 'Complet'
        },
        {
            name: 'lightDistance',
            label: 'Distance lampe/plante (cm)',
            section: 'LUMIÈRE',
            type: 'number',
            placeholder: '30',
            defaultValue: ''
        },
        {
            name: 'lightPower',
            label: 'Puissance totale (W)',
            section: 'LUMIÈRE',
            type: 'number',
            placeholder: '600',
            defaultValue: ''
        },
        {
            name: 'lightDuration',
            label: 'Durée d\'éclairage (h/jour)',
            section: 'LUMIÈRE',
            type: 'number',
            placeholder: '18',
            defaultValue: ''
        },
        {
            name: 'lightDLI',
            label: 'DLI (mol/m²/jour)',
            section: 'LUMIÈRE',
            type: 'number',
            placeholder: '40',
            defaultValue: ''
        },
        {
            name: 'lightPPFD',
            label: 'PPFD moyen (µmol/m²/s)',
            section: 'LUMIÈRE',
            type: 'number',
            placeholder: '500',
            defaultValue: ''
        },

        // ENVIRONNEMENT CLIMATIQUE
        {
            name: 'temperature',
            label: 'Température moyenne (°C)',
            section: 'CLIMAT',
            type: 'number',
            placeholder: '24',
            defaultValue: ''
        },
        {
            name: 'humidity',
            label: 'Humidité relative (%)',
            section: 'CLIMAT',
            type: 'number',
            placeholder: '60',
            defaultValue: ''
        },
        {
            name: 'co2',
            label: 'CO₂ (ppm)',
            section: 'CLIMAT',
            type: 'number',
            placeholder: '400',
            defaultValue: ''
        },
        {
            name: 'ventilation',
            label: 'Ventilation',
            section: 'CLIMAT',
            type: 'text',
            placeholder: 'Continue, extracteur 100m³/h',
            defaultValue: ''
        },

        // PALISSAGE
        {
            name: 'training',
            label: 'Méthodologie LST/HST',
            section: 'PALISSAGE',
            type: 'select',
            options: ['SCROG', 'SOG', 'Main-Lining', 'LST', 'HST', 'Aucun', 'Autre'],
            defaultValue: 'Aucun'
        },
        {
            name: 'trainingComment',
            label: 'Description manipulation',
            section: 'PALISSAGE',
            type: 'text',
            placeholder: 'Décrivez la manipulation...',
            defaultValue: ''
        },

        // MORPHOLOGIE
        {
            name: 'plantHeight',
            label: 'Taille (cm)',
            section: 'MORPHOLOGIE',
            type: 'number',
            placeholder: '80',
            defaultValue: ''
        },
        {
            name: 'plantVolume',
            label: 'Volume',
            section: 'MORPHOLOGIE',
            type: 'text',
            placeholder: 'Estimation visuelle',
            defaultValue: ''
        },
        {
            name: 'plantWeight',
            label: 'Poids estimé',
            section: 'MORPHOLOGIE',
            type: 'text',
            placeholder: 'Avant récolte',
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

        // RÉCOLTE
        {
            name: 'trichomeColor',
            label: 'Couleur des trichomes',
            section: 'RÉCOLTE',
            type: 'select',
            options: ['Laiteux', 'Ambré', 'Translucide', 'Mixte'],
            defaultValue: 'Laiteux'
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
            label: 'Poids brut (g)',
            section: 'RÉCOLTE',
            type: 'number',
            placeholder: '250',
            defaultValue: ''
        },
        {
            name: 'dryWeight',
            label: 'Poids net après défoliation (g)',
            section: 'RÉCOLTE',
            type: 'number',
            placeholder: '80',
            defaultValue: ''
        },
        {
            name: 'yield',
            label: 'Rendement (g/m² ou g/plante)',
            section: 'RÉCOLTE',
            type: 'text',
            placeholder: '400g/m²',
            defaultValue: ''
        }
    ]

    const handlePipelineChange = (pipelineData) => {
        onChange({
            ...data,
            culturePipeline: pipelineData
        })
    }

    return (
        <div className="space-y-4">
            {/* Instructions d'utilisation */}
            <div className="bg-gradient-to-r dark:/20 dark:/20 border dark: rounded-xl p-4">
                <h4 className="text-sm font-semibold dark: mb-2 flex items-center gap-2">
                    📋 Pipeline de culture : Timeline interactive
                </h4>
                <ul className="text-xs dark: space-y-1 list-disc list-inside">
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
                data={data.culturePipeline || {}}
                onChange={handlePipelineChange}
                availableDataFields={cultureDataFields}
            />
        </div>
    )
}


