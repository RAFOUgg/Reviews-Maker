/**
 * useGraphMultiSelection
 *
 * Sélection de PLUSIEURS éléments (Ctrl/⌘ + clic, ou rectangle Maj + glisser) sur les deux canevas
 * de graphe — Chaîne de production et PhenoHunt. Partagé, comme tout ce qui est mécanique et
 * identique entre les deux domaines (cf. GraphCanvasShell.jsx).
 *
 * Pourquoi un hook et pas simplement la sélection native de React Flow : React Flow SAIT déjà
 * sélectionner plusieurs nœuds, mais les deux canevas reconstruisent intégralement le tableau
 * `nodes` depuis leur store à chaque mutation (ajout de bulle, déplacement, import…) sans jamais
 * reporter le drapeau `selected` — la sélection était donc effacée par la première mutation venue,
 * et surtout aucun code applicatif ne pouvait la lire (les menus contextuels ne connaissaient que
 * `store.selectedNodeId`, un seul id). Ce hook fait le miroir : il retient les ids sélectionnés,
 * les réapplique sur les nœuds reconstruits (`applySelection`) et les expose aux menus.
 *
 * La sélection reste celle de React Flow (source de vérité), pas une seconde sélection maison :
 * le glisser groupé, le rectangle de sélection et la touche de modification restent natifs.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

const MULTI_CLASS = 'graph-multi-selected'

function sameIds(a, b) {
    return a.length === b.length && a.every((id, i) => b[i] === id)
}

function withMultiClass(className, multi) {
    const base = (className || '').split(' ').filter(c => c && c !== MULTI_CLASS)
    if (multi) base.push(MULTI_CLASS)
    return base.length > 0 ? base.join(' ') : undefined
}

export default function useGraphMultiSelection(setNodes) {
    const [selectedIds, setSelectedIds] = useState([])
    // Lu au moment où le canevas reconstruit ses nœuds : une ref, pas l'état, pour que
    // `applySelection` n'oblige pas l'effet de synchronisation store→canevas à se réexécuter
    // (donc à tout reconstruire) à chaque clic.
    const selectedIdsRef = useRef([])

    const handleSelectionChange = useCallback(({ nodes }) => {
        const ids = (nodes || []).map(n => n.id)
        if (sameIds(selectedIdsRef.current, ids)) return
        selectedIdsRef.current = ids
        setSelectedIds(ids)
    }, [])

    // Reporte la sélection sur les nœuds DÉJÀ montés (clic simple, ctrl+clic, rectangle) sans
    // repasser par la reconstruction complète.
    useEffect(() => {
        setNodes(prev => {
            let changed = false
            const next = prev.map(node => {
                const selected = selectedIds.includes(node.id)
                const className = withMultiClass(node.className, selectedIds.length > 1 && selected)
                if (node.selected === selected && node.className === className) return node
                changed = true
                return { ...node, selected, className }
            })
            return changed ? next : prev
        })
    }, [selectedIds, setNodes])

    /** À appliquer sur le tableau de nœuds reconstruit depuis le store, avant `setNodes`. */
    const applySelection = useCallback((rfNodes) => {
        const ids = selectedIdsRef.current
        if (ids.length === 0) return rfNodes
        const multi = ids.length > 1
        return rfNodes.map(node => ids.includes(node.id)
            ? { ...node, selected: true, className: withMultiClass(node.className, multi) }
            : node)
    }, [])

    /**
     * Ids réellement visés par une action de menu contextuel déclenchée sur `id` : la sélection
     * entière si l'élément cliqué en fait partie, sinon lui seul — un clic droit sur un élément
     * HORS sélection ne doit pas agir sur une sélection qu'on ne visait pas.
     */
    const resolveActionTargets = useCallback((id) => (
        selectedIdsRef.current.length > 1 && selectedIdsRef.current.includes(id)
            ? [...selectedIdsRef.current]
            : [id]
    ), [])

    return { selectedIds, onSelectionChange: handleSelectionChange, applySelection, resolveActionTargets }
}
