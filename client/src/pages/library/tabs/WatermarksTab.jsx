/**
 * WatermarksTab.jsx - Onglet Filigranes de la Bibliothèque
 * 
 * Conforme au CDC:
 * - CRUD filigranes personnalisés
 * - Position, taille, opacité configurables
 * - Définir un filigrane par défaut
 * - Upload d'images ou texte personnalisé
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useToast } from '../../../components/shared/ToastContainer'
import { LiquidCard, LiquidButton } from '@/components/ui/LiquidUI'
import { AnimatePresence, motion } from 'framer-motion'
import { 
    Stamp, Plus, Trash2, Star, Edit, Eye, Upload, Type,
    Move, ZoomIn, Contrast, Check, X, Image as ImageIcon
} from 'lucide-react'

const POSITIONS = [
    { id: 'top-left', label: 'Haut gauche' },
    { id: 'top-center', label: 'Haut centre' },
    { id: 'top-right', label: 'Haut droit' },
    { id: 'center-left', label: 'Centre gauche' },
    { id: 'center', label: 'Centre' },
    { id: 'center-right', label: 'Centre droit' },
    { id: 'bottom-left', label: 'Bas gauche' },
    { id: 'bottom-center', label: 'Bas centre' },
    { id: 'bottom-right', label: 'Bas droit' },
]

export default function WatermarksTab() {
    const toast = useToast()
    const fileInputRef = useRef(null)
    
    const [watermarks, setWatermarks] = useState([])
    const [loading, setLoading] = useState(true)
    const [defaultWatermarkId, setDefaultWatermarkId] = useState(null)
    const [isCreating, setIsCreating] = useState(false)
    const [editingWatermark, setEditingWatermark] = useState(null)
    const [previewWatermark, setPreviewWatermark] = useState(null)

    // Formulaire de création/édition
    const [formData, setFormData] = useState({
        name: '',
        type: 'text', // 'text' ou 'image'
        content: '', // texte ou URL image
        position: 'bottom-right',
        size: 50, // pourcentage
        opacity: 50, // pourcentage
        rotation: 0, // degrés
        fontFamily: 'Inter',
        color: '#ffffff'
    })

    // Charger les filigranes
    const fetchWatermarks = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/library/watermarks', {
                credentials: 'include'
            })
            if (response.ok) {
                const data = await response.json()
                setWatermarks(data.watermarks || [])
                setDefaultWatermarkId(data.defaultId)
            }
        } catch (error) {
            toast.error('Erreur lors du chargement des filigranes')
        } finally {
            setLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchWatermarks()
    }, [fetchWatermarks])

    // Réinitialiser le formulaire
    const resetForm = () => {
        setFormData({
            name: '',
            type: 'text',
            content: '',
            position: 'bottom-right',
            size: 50,
            opacity: 50,
            rotation: 0,
            fontFamily: 'Inter',
            color: '#ffffff'
        })
        setIsCreating(false)
        setEditingWatermark(null)
    }

    // Ouvrir l'édition
    const openEdit = (watermark) => {
        setFormData({
            name: watermark.name,
            type: watermark.type,
            content: watermark.content,
            position: watermark.position,
            size: watermark.size,
            opacity: watermark.opacity,
            rotation: watermark.rotation || 0,
            fontFamily: watermark.fontFamily || 'Inter',
            color: watermark.color || '#ffffff'
        })
        setEditingWatermark(watermark)
    }

    // Upload image
    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Veuillez sélectionner une image')
            return
        }

        const formDataUpload = new FormData()
        formDataUpload.append('watermark', file)

        try {
            const response = await fetch('/api/library/watermarks/upload', {
                method: 'POST',
                credentials: 'include',
                body: formDataUpload
            })

            if (response.ok) {
                const { url } = await response.json()
                setFormData({ ...formData, content: url, type: 'image' })
            } else {
                toast.error('Erreur lors de l\'upload')
            }
        } catch (error) {
            toast.error('Erreur lors de l\'upload')
        }
    }

    // Sauvegarder
    const saveWatermark = async () => {
        if (!formData.name.trim()) {
            toast.error('Veuillez entrer un nom')
            return
        }
        if (!formData.content.trim()) {
            toast.error('Veuillez entrer un contenu (texte ou image)')
            return
        }

        try {
            const url = editingWatermark 
                ? `/api/library/watermarks/${editingWatermark.id}`
                : '/api/library/watermarks'

            const response = await fetch(url, {
                method: editingWatermark ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                const saved = await response.json()
                if (editingWatermark) {
                    setWatermarks(watermarks.map(w => w.id === saved.id ? saved : w))
                    toast.success('Filigrane mis à jour')
                } else {
                    setWatermarks([...watermarks, saved])
                    toast.success('Filigrane créé')
                }
                resetForm()
            } else {
                toast.error('Erreur lors de la sauvegarde')
            }
        } catch (error) {
            toast.error('Erreur de connexion')
        }
    }

    // Supprimer
    const deleteWatermark = async (id) => {
        if (!window.confirm('Supprimer ce filigrane ?')) return

        try {
            const response = await fetch(`/api/library/watermarks/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (response.ok) {
                setWatermarks(watermarks.filter(w => w.id !== id))
                toast.success('Filigrane supprimé')
            }
        } catch (error) {
            toast.error('Erreur lors de la suppression')
        }
    }

    // Définir par défaut
    const setAsDefault = async (id) => {
        try {
            const response = await fetch('/api/library/watermarks/default', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ watermarkId: id })
            })

            if (response.ok) {
                setDefaultWatermarkId(id)
                toast.success('Filigrane défini par défaut')
            }
        } catch (error) {
            toast.error('Erreur lors de la mise à jour')
        }
    }

    // Rendu d'un filigrane
    const renderWatermarkCard = (watermark, index) => {
        const isDefault = defaultWatermarkId === watermark.id
        const positionLabel = POSITIONS.find(p => p.id === watermark.position)?.label || watermark.position

        return (
            <motion.div
                key={watermark.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
            >
                <LiquidCard 
                    glow={isDefault ? 'purple' : 'none'} 
                    padding="none"
                    className={`overflow-hidden ${isDefault ? 'ring-2 ring-purple-500' : ''}`}
                >
                    {/* Preview */}
                    <div 
                        className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden"
                        style={{ backgroundImage: 'url(/images/watermark-preview-bg.jpg)', backgroundSize: 'cover' }}
                    >
                        {/* Rendu du filigrane */}
                        <div 
                            className={`absolute ${getPositionClasses(watermark.position)} p-4`}
                            style={{ opacity: watermark.opacity / 100 }}
                        >
                            {watermark.type === 'text' ? (
                                <span 
                                    style={{ 
                                        fontFamily: watermark.fontFamily,
                                        fontSize: `${watermark.size / 5}px`,
                                        color: watermark.color,
                                        transform: `rotate(${watermark.rotation || 0}deg)`,
                                        display: 'inline-block'
                                    }}
                                >
                                    {watermark.content}
                                </span>
                            ) : (
                                <img 
                                    src={watermark.content} 
                                    alt={watermark.name}
                                    style={{ 
                                        width: `${watermark.size}%`,
                                        transform: `rotate(${watermark.rotation || 0}deg)`
                                    }}
                                />
                            )}
                        </div>

                        {/* Badge défaut */}
                        {isDefault && (
                            <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-purple-500 text-white text-xs font-bold flex items-center gap-1">
                                <Star className="w-3 h-3" fill="currentColor" />
                                Défaut
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                            {watermark.type === 'text' ? <Type className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                            {watermark.name}
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs text-white/50 mb-4">
                            <div className="flex items-center gap-1">
                                <Move className="w-3 h-3" />
                                {positionLabel}
                            </div>
                            <div className="flex items-center gap-1">
                                <ZoomIn className="w-3 h-3" />
                                {watermark.size}%
                            </div>
                            <div className="flex items-center gap-1">
                                <Contrast className="w-3 h-3" />
                                {watermark.opacity}%
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => setAsDefault(watermark.id)}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                    isDefault 
                                        ? 'bg-purple-500/20 text-purple-400' 
                                        : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                {isDefault ? '✓ Défaut' : 'Définir'}
                            </button>
                            <button
                                onClick={() => openEdit(watermark)}
                                className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => deleteWatermark(watermark.id)}
                                className="p-2 rounded-lg bg-white/5 text-white/60 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </LiquidCard>
            </motion.div>
        )
    }

    // Classes CSS pour position
    const getPositionClasses = (position) => {
        const map = {
            'top-left': 'top-0 left-0',
            'top-center': 'top-0 left-1/2 -translate-x-1/2',
            'top-right': 'top-0 right-0',
            'center-left': 'top-1/2 left-0 -translate-y-1/2',
            'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'center-right': 'top-1/2 right-0 -translate-y-1/2',
            'bottom-left': 'bottom-0 left-0',
            'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2',
            'bottom-right': 'bottom-0 right-0',
        }
        return map[position] || map['bottom-right']
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Bouton créer */}
            {!isCreating && !editingWatermark && (
                <LiquidButton
                    onClick={() => setIsCreating(true)}
                    variant="primary"
                    leftIcon={<Plus className="w-4 h-4" />}
                >
                    Créer un filigrane
                </LiquidButton>
            )}

            {/* Formulaire création/édition */}
            <AnimatePresence>
                {(isCreating || editingWatermark) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <LiquidCard glow="purple" padding="lg">
                            <h3 className="text-lg font-bold text-white mb-6">
                                {editingWatermark ? 'Modifier le filigrane' : 'Nouveau filigrane'}
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Formulaire */}
                                <div className="space-y-4">
                                    {/* Nom */}
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Nom</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Mon filigrane"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                                        />
                                    </div>

                                    {/* Type */}
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Type</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setFormData({ ...formData, type: 'text', content: '' })}
                                                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                                                    formData.type === 'text' 
                                                        ? 'bg-purple-500 text-white' 
                                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                }`}
                                            >
                                                <Type className="w-4 h-4" />
                                                Texte
                                            </button>
                                            <button
                                                onClick={() => setFormData({ ...formData, type: 'image', content: '' })}
                                                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                                                    formData.type === 'image' 
                                                        ? 'bg-purple-500 text-white' 
                                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                }`}
                                            >
                                                <ImageIcon className="w-4 h-4" />
                                                Image
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contenu */}
                                    {formData.type === 'text' ? (
                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Texte</label>
                                            <input
                                                type="text"
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                placeholder="@moncompte"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Image</label>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-full py-4 px-4 rounded-xl border-2 border-dashed border-white/20 hover:border-purple-500/50 text-white/60 hover:text-white transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Upload className="w-5 h-5" />
                                                {formData.content ? 'Changer l\'image' : 'Télécharger une image'}
                                            </button>
                                            {formData.content && (
                                                <img src={formData.content} alt="Preview" className="mt-2 h-20 rounded-lg" />
                                            )}
                                        </div>
                                    )}

                                    {/* Position */}
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">Position</label>
                                        <select
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
                                        >
                                            {POSITIONS.map(p => (
                                                <option key={p.id} value={p.id} className="bg-[#1a1a2e]">{p.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Sliders */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Taille: {formData.size}%</label>
                                            <input
                                                type="range"
                                                min="10"
                                                max="100"
                                                value={formData.size}
                                                onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) })}
                                                className="w-full accent-purple-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Opacité: {formData.opacity}%</label>
                                            <input
                                                type="range"
                                                min="10"
                                                max="100"
                                                value={formData.opacity}
                                                onChange={(e) => setFormData({ ...formData, opacity: parseInt(e.target.value) })}
                                                className="w-full accent-purple-500"
                                            />
                                        </div>
                                    </div>

                                    {formData.type === 'text' && (
                                        <div>
                                            <label className="block text-sm text-white/60 mb-2">Couleur</label>
                                            <input
                                                type="color"
                                                value={formData.color}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                                className="w-full h-10 rounded-lg cursor-pointer"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Preview */}
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Aperçu</label>
                                    <div 
                                        className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl relative overflow-hidden border border-white/10"
                                        style={{ backgroundImage: 'url(/images/watermark-preview-bg.jpg)', backgroundSize: 'cover' }}
                                    >
                                        {formData.content && (
                                            <div 
                                                className={`absolute ${getPositionClasses(formData.position)} p-4`}
                                                style={{ opacity: formData.opacity / 100 }}
                                            >
                                                {formData.type === 'text' ? (
                                                    <span 
                                                        style={{ 
                                                            fontFamily: formData.fontFamily,
                                                            fontSize: `${formData.size / 5}px`,
                                                            color: formData.color,
                                                            transform: `rotate(${formData.rotation}deg)`,
                                                            display: 'inline-block'
                                                        }}
                                                    >
                                                        {formData.content}
                                                    </span>
                                                ) : (
                                                    <img 
                                                        src={formData.content} 
                                                        alt="Preview"
                                                        style={{ 
                                                            width: `${formData.size}%`,
                                                            transform: `rotate(${formData.rotation}deg)`
                                                        }}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/10">
                                <LiquidButton
                                    onClick={resetForm}
                                    variant="ghost"
                                    leftIcon={<X className="w-4 h-4" />}
                                >
                                    Annuler
                                </LiquidButton>
                                <LiquidButton
                                    onClick={saveWatermark}
                                    variant="primary"
                                    leftIcon={<Check className="w-4 h-4" />}
                                >
                                    {editingWatermark ? 'Mettre à jour' : 'Créer'}
                                </LiquidButton>
                            </div>
                        </LiquidCard>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Liste des filigranes */}
            {watermarks.length === 0 ? (
                <LiquidCard glow="none" padding="lg">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/10">
                            <Stamp className="w-8 h-8 text-white/30" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Aucun filigrane</h3>
                        <p className="text-white/50">
                            Créez votre premier filigrane pour l'utiliser dans vos exports
                        </p>
                    </div>
                </LiquidCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {watermarks.map((watermark, idx) => renderWatermarkCard(watermark, idx))}
                </div>
            )}
        </div>
    )
}
