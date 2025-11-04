/**
 * 🪝 useReviewCompletion.js
 * 
 * Hook React complet pour gérer le cycle de vie complet de complétion
 * et soumission de reviews.
 * 
 * Basé sur les anciennes méthodes et adaptée pour React + new stack
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import { ReviewCompletionEngine, createEmptyReview, PRODUCT_TYPES } from '../utils/ReviewCompletionEngine'

export const useReviewCompletion = (initialType = PRODUCT_TYPES.FLEUR) => {
    // État principal
    const [reviewData, setReviewData] = useState(() =>
        createEmptyReview(initialType)
    )

    const [errors, setErrors] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [completionPercentage, setCompletionPercentage] = useState(0)
    const [totals, setTotals] = useState({})
    const [uploadedFiles, setUploadedFiles] = useState([])
    const [submitStatus, setSubmitStatus] = useState(null) // success | error | null

    // Références
    const engineRef = useRef(new ReviewCompletionEngine())
    const fileInputRef = useRef(null)
    const abortControllerRef = useRef(null)

    // ─────────────────────────────────────────────────────────────────────
    // GESTION DE DONNÉES
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Mettre à jour un champ simple
     */
    const updateField = useCallback((fieldPath, value) => {
        setReviewData(prev => {
            const keys = fieldPath.split('.')
            const updated = { ...prev }
            let current = updated

            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i]
                if (!current[key]) current[key] = {}
                current = current[key]
            }

            current[keys[keys.length - 1]] = value
            return updated
        })

        // Réinitialiser l'erreur pour ce champ
        if (errors[fieldPath]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[fieldPath]
                return newErrors
            })
        }
    }, [errors])

    /**
     * Mettre à jour un rating (avec validation)
     */
    const updateRating = useCallback((ratingKey, value) => {
        const numValue = parseFloat(value)
        if (numValue >= 0 && numValue <= 10) {
            updateField(`ratings.${ratingKey}`, numValue)
        }
    }, [updateField])

    /**
     * Ajouter/retirer d'un tableau (terpènes, effets, etc.)
     */
    const toggleArrayItem = useCallback((arrayPath, item) => {
        setReviewData(prev => {
            const updated = { ...prev }
            const array = updated[arrayPath] || []
            const index = array.indexOf(item)

            if (index > -1) {
                array.splice(index, 1)
            } else {
                array.push(item)
            }

            return { ...updated, [arrayPath]: array }
        })
    }, [])

    /**
     * Réinitialiser le formulaire
     */
    const resetForm = useCallback((newType = initialType) => {
        setReviewData(createEmptyReview(newType))
        setErrors({})
        setUploadedFiles([])
        setSubmitStatus(null)
        setTotals({})
    }, [initialType])

    /**
     * Charger une review existante
     */
    const loadReview = useCallback((reviewData) => {
        setReviewData(reviewData)
        setErrors({})
        setSubmitStatus(null)
    }, [])

    // ─────────────────────────────────────────────────────────────────────
    // GESTION DES FICHIERS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Ajouter des images (avec drag & drop support)
     */
    const handleImageUpload = useCallback((files) => {
        const engine = engineRef.current
        const newFiles = Array.from(files).filter(file => {
            const validation = engine.validators.image(file)
            if (!validation) {
                setErrors(prev => ({
                    ...prev,
                    images: `${file.name} est invalide (format ou taille)`
                }))
                return false
            }
            return true
        })

        // Vérifier la limite de 10 images
        const totalImages = uploadedFiles.length + newFiles.length
        if (totalImages > 10) {
            setErrors(prev => ({
                ...prev,
                images: `Maximum 10 images (vous en avez ${totalImages})`
            }))
            return
        }

        setUploadedFiles(prev => [...prev, ...newFiles])

        // Mettre à jour la preview
        newFiles.forEach(file => {
            const reader = new FileReader()
            reader.onload = (e) => {
                setReviewData(prev => ({
                    ...prev,
                    images: [...(prev.images || []), {
                        file,
                        preview: e.target.result,
                        id: Math.random().toString(36)
                    }]
                }))
            }
            reader.readAsDataURL(file)
        })
    }, [uploadedFiles])

    /**
     * Retirer une image
     */
    const removeImage = useCallback((imageId) => {
        setReviewData(prev => ({
            ...prev,
            images: prev.images.filter(img => img.id !== imageId)
        }))

        setUploadedFiles(prev =>
            prev.filter(f => f.name !== imageId)
        )
    }, [])

    /**
     * Déclencher sélection fichier
     */
    const triggerFileInput = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    // ─────────────────────────────────────────────────────────────────────
    // VALIDATION & CALCULS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Valider une étape spécifique
     */
    const validateStep = useCallback((stepName) => {
        const engine = engineRef.current
        const result = engine.validateStep(reviewData, stepName)

        if (!result.isValid) {
            setErrors(prev => ({
                ...prev,
                [stepName]: result.error
            }))
            return false
        }

        return true
    }, [reviewData])

    /**
     * Valider le formulaire complet
     */
    const validateForm = useCallback(() => {
        const engine = engineRef.current
        const validation = engine.validateReview(reviewData)

        if (!validation.isValid) {
            setErrors(validation.errors)
            return false
        }

        setErrors({})
        return true
    }, [reviewData])

    /**
     * Calculer et mettre à jour les totaux
     */
    const recalculateTotals = useCallback(() => {
        const engine = engineRef.current
        const calculateFn = engine.calculateFunctions[reviewData.type]

        if (calculateFn) {
            const newTotals = calculateFn(reviewData.ratings || {})
            setTotals(newTotals)
        }

        // Calculer le % de complétion
        const percentage = engine.calculateCompletionPercentage(reviewData)
        setCompletionPercentage(percentage)
    }, [reviewData])

    /**
     * Récalculer à chaque changement de ratings
     */
    useEffect(() => {
        recalculateTotals()
    }, [reviewData.ratings, recalculateTotals])

    // ─────────────────────────────────────────────────────────────────────
    // SOUMISSION
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Sauvegarder comme brouillon
     */
    const saveDraft = useCallback(async () => {
        if (!validateForm()) {
            return false
        }

        setIsSubmitting(true)
        try {
            const engine = engineRef.current
            const draftData = { ...reviewData, isDraft: true }

            const result = await engine.submitReview(draftData, uploadedFiles)

            setSubmitStatus({ type: 'success', message: 'Brouillon sauvegardé' })
            return result
        } catch (err) {
            setSubmitStatus({ type: 'error', message: err.message })
            return false
        } finally {
            setIsSubmitting(false)
        }
    }, [reviewData, uploadedFiles, validateForm])

    /**
     * Soumettre la review
     */
    const submitReview = useCallback(async () => {
        if (!validateForm()) {
            return false
        }

        setIsSubmitting(true)
        abortControllerRef.current = new AbortController()

        try {
            const engine = engineRef.current
            const finalData = { ...reviewData, isDraft: false }

            const result = await engine.submitReview(finalData, uploadedFiles)

            setSubmitStatus({ type: 'success', message: 'Review publiée avec succès' })
            return result
        } catch (err) {
            setSubmitStatus({ type: 'error', message: err.message })
            return false
        } finally {
            setIsSubmitting(false)
            abortControllerRef.current = null
        }
    }, [reviewData, uploadedFiles, validateForm])

    /**
     * Annuler la soumission en cours
     */
    const cancelSubmit = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
            setIsSubmitting(false)
        }
    }, [])

    /**
     * Dupliquer une review
     */
    const duplicateReview = useCallback((sourceReview) => {
        const engine = engineRef.current
        const duplicated = engine.duplicateReview(sourceReview)
        loadReview(duplicated)
    }, [loadReview])

    // ─────────────────────────────────────────────────────────────────────
    // EXPORTS
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Exporter en JSON
     */
    const exportJSON = useCallback(async () => {
        const engine = engineRef.current
        return await engine.exportAsJSON(reviewData)
    }, [reviewData])

    /**
     * Exporter en CSV
     */
    const exportCSV = useCallback(async (reviews) => {
        const engine = engineRef.current
        return await engine.exportAsCSV(reviews || reviewData)
    }, [reviewData])

    // ─────────────────────────────────────────────────────────────────────
    // UTILITAIRES
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Obtenir les choix pour un champ
     */
    const getChoices = useCallback((fieldName) => {
        const engine = engineRef.current
        return engine.getChoicesForField(reviewData.type, fieldName)
    }, [reviewData.type])

    /**
     * Obtenir les erreurs pour une section
     */
    const getFieldError = useCallback((fieldPath) => {
        return errors[fieldPath] || null
    }, [errors])

    /**
     * Vérifier si un champ a une erreur
     */
    const hasError = useCallback((fieldPath) => {
        return !!errors[fieldPath]
    }, [errors])

    // ─────────────────────────────────────────────────────────────────────
    // RETOUR
    // ─────────────────────────────────────────────────────────────────────

    return {
        // État
        reviewData,
        errors,
        isSubmitting,
        completionPercentage,
        totals,
        uploadedFiles,
        submitStatus,

        // Gestion données
        updateField,
        updateRating,
        toggleArrayItem,
        resetForm,
        loadReview,

        // Images
        handleImageUpload,
        removeImage,
        triggerFileInput,
        fileInputRef,

        // Validation
        validateStep,
        validateForm,
        recalculateTotals,

        // Soumission
        saveDraft,
        submitReview,
        cancelSubmit,
        duplicateReview,

        // Export
        exportJSON,
        exportCSV,

        // Utilitaires
        getChoices,
        getFieldError,
        hasError,

        // Références
        engine: engineRef.current
    }
}

export default useReviewCompletion
