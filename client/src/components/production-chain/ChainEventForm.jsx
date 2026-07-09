/**
 * ChainEventForm Component
 *
 * Formulaire de journalisation manuelle d'un événement (ex: "le frigo est resté ouvert 4min31s,
 * chaîne du froid rompue") sur le nœud/liaison sélectionné du canevas Chaîne de production.
 * Complète le journal automatique (créations/modifications déjà tracées par
 * server-new/utils/chainAuditLog.js) pour tout ce qui n'est pas une mutation de données — un
 * incident, une observation, une action documentée à la main.
 *
 * L'équipement (optionnel) référence une entrée de la bibliothèque "Matériel" existante
 * (SavedData, catégorie 'materiel' — cf. client/src/pages/library/tabs/DataTab.jsx), pas un
 * nouveau registre : une lampe/un frigo déjà enregistré là-bas peut être rattaché à l'événement.
 */

import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import useProductionChainStore from '../../store/useProductionChainStore';

const SEVERITY_OPTIONS = [
    { value: 'info', label: 'Information' },
    { value: 'warning', label: 'Avertissement' },
    { value: 'critical', label: 'Critique' }
];

export default function ChainEventForm({ chainId, entityType, entityId, onClose }) {
    const store = useProductionChainStore();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState('info');
    const [startedAt, setStartedAt] = useState('');
    const [endedAt, setEndedAt] = useState('');
    const [equipmentId, setEquipmentId] = useState('');
    const [equipmentOptions, setEquipmentOptions] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Bibliothèque "Matériel" existante (SavedData, pas un nouveau registre) — chargée une fois à
    // l'ouverture du formulaire, pas au montage du panneau (rarement ouvert).
    useEffect(() => {
        let cancelled = false;
        fetch('/api/library/data?category=materiel', { credentials: 'include' })
            .then(r => r.ok ? r.json() : [])
            .then(items => { if (!cancelled) setEquipmentOptions(Array.isArray(items) ? items : []); })
            .catch(() => {});
        return () => { cancelled = true };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || submitting) return;
        setSubmitting(true);
        setError(null);

        const equipment = equipmentOptions.find(eq => eq.id === equipmentId);

        const result = await store.logManualEvent(chainId, {
            entityType,
            entityId,
            title,
            description: description || null,
            severity,
            startedAt: startedAt ? new Date(startedAt).toISOString() : null,
            endedAt: endedAt ? new Date(endedAt).toISOString() : null,
            equipmentId: equipmentId || null,
            equipmentLabel: equipment?.name || null
        });

        setSubmitting(false);
        if (result?.error) {
            setError(result.error);
            return;
        }
        onClose();
    };

    return (
        <form className="chain-event-form" onSubmit={handleSubmit}>
            <div className="chain-event-form-header">
                <span>Journaliser un événement</span>
                <button type="button" onClick={onClose} title="Annuler">
                    <X size={13} />
                </button>
            </div>

            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Chaîne du froid rompue"
                autoFocus
                required
            />

            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails (optionnel) — ex: frigo laissé ouvert 4min31s"
                rows={2}
            />

            <div className="chain-event-form-row">
                <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
                    {SEVERITY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <select value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)}>
                    <option value="">Équipement (optionnel)</option>
                    {equipmentOptions.map(eq => (
                        <option key={eq.id} value={eq.id}>{eq.name}</option>
                    ))}
                </select>
            </div>

            <div className="chain-event-form-row">
                <label>
                    Début
                    <input type="datetime-local" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} />
                </label>
                <label>
                    Fin
                    <input type="datetime-local" value={endedAt} onChange={(e) => setEndedAt(e.target.value)} />
                </label>
            </div>

            {error && (
                <div className="chain-event-form-error">
                    <AlertTriangle size={12} /> {error}
                </div>
            )}

            <button type="submit" className="chain-event-form-submit" disabled={submitting || !title.trim()}>
                {submitting ? 'Enregistrement...' : 'Journaliser'}
            </button>
        </form>
    );
}
