/**
 * Composant eKYC - Upload de documents d'identité
 * Pour comptes Producer et Influencer uniquement
 */

import React, { useState, useEffect } from 'react'
import { Upload, FileText, Check, X, Eye, Trash2, AlertCircle, Shield } from 'lucide-react'

export default function KYCUploader({ userId, accountType }) {
    const [documents, setDocuments] = useState([])
    const [kycStatus, setKycStatus] = useState('none')
    const [uploading, setUploading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedType, setSelectedType] = useState('id_card')
    const [dragActive, setDragActive] = useState(false)

    const documentTypes = [
        { value: 'id_card', label: 'Carte d\'identité', icon: '🪪' },
        { value: 'passport', label: 'Passeport', icon: '🛂' },
        { value: 'driving_license', label: 'Permis de conduire', icon: '🚗' },
        { value: 'business_license', label: 'Licence commerciale', icon: '🏢', producerOnly: true }
    ]

    const statusLabels = {
        none: { label: 'Non vérifié', color: 'bg-gray-500', icon: '❓' },
        pending: { label: 'En attente', color: 'bg-yellow-500', icon: '⏳' },
        verified: { label: 'Vérifié', color: 'bg-green-500', icon: '✅' },
        rejected: { label: 'Rejeté', color: 'bg-red-500', icon: '❌' }
    }

    useEffect(() => {
        fetchDocuments()
    }, [])

    const fetchDocuments = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/kyc/documents', {
                credentials: 'include'
            })

            if (!response.ok) throw new Error('Failed to fetch documents')

            const data = await response.json()
            setDocuments(data.documents || [])
            setKycStatus(data.status || 'none')
            setError(null)
        } catch (err) {
            console.error('Erreur chargement documents:', err)
            setError('Erreur lors du chargement des documents')
        } finally {
            setLoading(false)
        }
    }

    const handleFileSelect = async (files) => {
        if (!files || files.length === 0) return

        const file = files[0]

        // Validation taille (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setError('Fichier trop volumineux (max 10MB)')
            return
        }

        // Validation type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
        if (!allowedTypes.includes(file.type)) {
            setError('Type de fichier non autorisé. Formats acceptés: JPEG, PNG, PDF')
            return
        }

        await uploadDocument(file)
    }

    const uploadDocument = async (file) => {
        setUploading(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('document', file)
            formData.append('documentType', selectedType)

            const response = await fetch('/api/kyc/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Upload failed')
            }

            const result = await response.json()

            // Rafraîchir la liste
            await fetchDocuments()

            setError(null)
        } catch (err) {
            console.error('Erreur upload:', err)
            setError(err.message || 'Erreur lors de l\'upload du document')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (documentId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return

        try {
            const response = await fetch(`/api/kyc/document/${documentId}`, {
                method: 'DELETE',
                credentials: 'include'
            })

            if (!response.ok) throw new Error('Delete failed')

            await fetchDocuments()
        } catch (err) {
            console.error('Erreur suppression:', err)
            setError('Erreur lors de la suppression du document')
        }
    }

    const handleView = (documentId) => {
        window.open(`/api/kyc/document/${documentId}/view`, '_blank')
    }

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files)
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (accountType !== 'producer' && accountType !== 'influencer') {
        return (
            <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
                <div className="flex items-center gap-3 text-yellow-800">
                    <AlertCircle className="w-6 h-6" />
                    <div>
                        <h3 className="font-bold">eKYC non disponible</h3>
                        <p className="text-sm">Cette fonctionnalité est réservée aux comptes Producteur et Influenceur.</p>
                    </div>
                </div>
            </div>
        )
    }

    const statusInfo = statusLabels[kycStatus] || statusLabels.none

    return (
        <div className="space-y-6">
            {/* Status Badge */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-6 h-6" />
                        Vérification d'identité (eKYC)
                    </h3>
                    <span className={`${statusInfo.color} text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2`}>
                        <span>{statusInfo.icon}</span>
                        {statusInfo.label}
                    </span>
                </div>

                <p className="text-gray-700 text-sm mb-4">
                    {accountType === 'producer'
                        ? 'En tant que Producteur, vous devez fournir des documents officiels pour valider votre identité et vos informations commerciales.'
                        : 'En tant qu\'Influenceur, vous devez fournir une pièce d\'identité valide pour vérifier votre compte.'}
                </p>

                {kycStatus === 'rejected' && (
                    <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
                        <p className="text-red-800 font-medium">❌ Document(s) rejeté(s)</p>
                        <p className="text-red-600 text-sm mt-1">Veuillez uploader de nouveaux documents conformes.</p>
                    </div>
                )}
            </div>

            {/* Upload Zone */}
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Ajouter un document</h4>

                {/* Type selector */}
                <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Type de document</label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus: focus:ring-2 focus: transition-all text-gray-900"
                    >
                        {documentTypes
                            .filter(type => !type.producerOnly || accountType === 'producer')
                            .map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.icon} {type.label}
                                </option>
                            ))
                        }
                    </select>
                </div>

                {/* Drag & Drop Zone */}
                <div
                    className={`relative border-3 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive ? ' ' : 'border-gray-300 hover: hover:bg-gray-50' }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        disabled={uploading}
                    />

                    <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? '' : 'text-gray-400'}`} />

                    <p className="text-gray-900 font-medium mb-2">
                        {uploading ? 'Upload en cours...' : 'Glissez-déposez votre fichier ici'}
                    </p>

                    <p className="text-gray-600 text-sm mb-4">ou</p>

                    <label
                        htmlFor="file-upload"
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${uploading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r text-white hover:shadow-lg cursor-pointer' }`}
                    >
                        <FileText className="w-5 h-5" />
                        Choisir un fichier
                    </label>

                    <p className="text-gray-500 text-xs mt-4">
                        Formats acceptés: JPEG, PNG, PDF (max 10MB)
                    </p>
                </div>

                {error && (
                    <div className="mt-4 bg-red-50 rounded-xl p-4 border-2 border-red-200">
                        <p className="text-red-800 font-medium flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </p>
                    </div>
                )}
            </div>

            {/* Documents List */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="text-gray-600">Chargement des documents...</div>
                </div>
            ) : documents.length > 0 ? (
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Documents uploadés ({documents.length})</h4>
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-2 border-gray-200 hover: transition-all"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{doc.originalName}</p>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <span>{documentTypes.find(t => t.value === doc.type)?.label || doc.type}</span>
                                            <span>•</span>
                                            <span>{formatFileSize(doc.size)}</span>
                                            <span>•</span>
                                            <span>{formatDate(doc.uploadedAt)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        {doc.status === 'pending' && (
                                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                                                ⏳ En attente
                                            </span>
                                        )}
                                        {doc.status === 'approved' && (
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold">
                                                ✅ Approuvé
                                            </span>
                                        )}
                                        {doc.status === 'rejected' && (
                                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold">
                                                ❌ Rejeté
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleView(doc.id)}
                                        className="p-2 rounded-lg hover: transition-all"
                                        title="Voir le document"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Aucun document uploadé</p>
                    <p className="text-gray-500 text-sm">Commencez par ajouter votre premier document ci-dessus</p>
                </div>
            )}
        </div>
    )
}

