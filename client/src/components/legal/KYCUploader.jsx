/**
 * Composant eKYC - Upload de documents d'identité
 * Pour comptes Producer et Influencer uniquement
 * Liquid Glass UI Design System
 */

import React, { useState, useEffect } from 'react';
import { LiquidCard, LiquidButton, LiquidSelect } from '@/components/ui/LiquidUI';
import { Upload, FileText, Check, X, Eye, Trash2, AlertCircle, Shield, Loader2 } from 'lucide-react';

export default function KYCUploader({ userId, accountType }) {
    const [documents, setDocuments] = useState([]);
    const [kycStatus, setKycStatus] = useState('none');
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedType, setSelectedType] = useState('id_card');
    const [dragActive, setDragActive] = useState(false);

    const documentTypes = [
        { value: 'id_card', label: '🪪 Carte d\'identité' },
        { value: 'passport', label: '🛂 Passeport' },
        { value: 'driving_license', label: '🚗 Permis de conduire' },
        { value: 'business_license', label: '🏢 Licence commerciale', producerOnly: true }
    ];

    const statusLabels = {
        none: { label: 'Non vérifié', color: 'bg-white/10', textColor: 'text-white/60', icon: '❓' },
        pending: { label: 'En attente', color: 'bg-amber-500/20', textColor: 'text-amber-400', icon: '⏳' },
        verified: { label: 'Vérifié', color: 'bg-green-500/20', textColor: 'text-green-400', icon: '✅' },
        rejected: { label: 'Rejeté', color: 'bg-red-500/20', textColor: 'text-red-400', icon: '❌' }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/kyc/documents', { credentials: 'include' });
            if (!response.ok) throw new Error('Failed to fetch documents');
            const data = await response.json();
            setDocuments(data.documents || []);
            setKycStatus(data.status || 'none');
            setError(null);
        } catch (err) {
            console.error('Erreur chargement documents:', err);
            setError('Erreur lors du chargement des documents');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = async (files) => {
        if (!files || files.length === 0) return;
        const file = files[0];

        if (file.size > 10 * 1024 * 1024) {
            setError('Fichier trop volumineux (max 10MB)');
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError('Type de fichier non autorisé. Formats acceptés: JPEG, PNG, PDF');
            return;
        }

        await uploadDocument(file);
    };

    const uploadDocument = async (file) => {
        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('document', file);
            formData.append('documentType', selectedType);

            const response = await fetch('/api/kyc/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Upload failed');
            }

            await fetchDocuments();
            setError(null);
        } catch (err) {
            console.error('Erreur upload:', err);
            setError(err.message || 'Erreur lors de l\'upload du document');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (documentId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

        try {
            const response = await fetch(`/api/kyc/document/${documentId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Delete failed');
            await fetchDocuments();
        } catch (err) {
            console.error('Erreur suppression:', err);
            setError('Erreur lors de la suppression du document');
        }
    };

    const handleView = (documentId) => {
        window.open(`/api/kyc/document/${documentId}/view`, '_blank');
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (accountType !== 'producer' && accountType !== 'influencer') {
        return (
            <LiquidCard className="p-6" style={{
                background: 'rgba(245, 158, 11, 0.1)',
                borderColor: 'rgba(245, 158, 11, 0.3)'
            }}>
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-400" />
                    <div>
                        <h3 className="font-bold text-white">eKYC non disponible</h3>
                        <p className="text-sm text-white/60">Cette fonctionnalité est réservée aux comptes Producteur et Influenceur.</p>
                    </div>
                </div>
            </LiquidCard>
        );
    }

    const statusInfo = statusLabels[kycStatus] || statusLabels.none;

    return (
        <div className="space-y-6">
            {/* Status Badge */}
            <LiquidCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Shield className="w-6 h-6 text-violet-400" />
                        Vérification d'identité (eKYC)
                    </h3>
                    <span className={`${statusInfo.color} ${statusInfo.textColor} px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-current/30`}>
                        <span>{statusInfo.icon}</span>
                        {statusInfo.label}
                    </span>
                </div>

                <p className="text-white/60 text-sm mb-4">
                    {accountType === 'producer'
                        ? 'En tant que Producteur, vous devez fournir des documents officiels pour valider votre identité et vos informations commerciales.'
                        : 'En tant qu\'Influenceur, vous devez fournir une pièce d\'identité valide pour vérifier votre compte.'}
                </p>

                {kycStatus === 'rejected' && (
                    <LiquidCard className="p-4" style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderColor: 'rgba(239, 68, 68, 0.3)'
                    }}>
                        <p className="text-red-400 font-medium">❌ Document(s) rejeté(s)</p>
                        <p className="text-red-300/70 text-sm mt-1">Veuillez uploader de nouveaux documents conformes.</p>
                    </LiquidCard>
                )}
            </LiquidCard>

            {/* Upload Zone */}
            <LiquidCard className="p-6">
                <h4 className="text-lg font-bold text-white mb-4">Ajouter un document</h4>

                {/* Type selector */}
                <div className="mb-4">
                    <LiquidSelect
                        label="Type de document"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        options={documentTypes
                            .filter(type => !type.producerOnly || accountType === 'producer')
                            .map(type => ({ value: type.value, label: type.label }))
                        }
                    />
                </div>

                {/* Drag & Drop Zone */}
                <div
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${dragActive
                            ? 'border-violet-500 bg-violet-500/10'
                            : 'border-white/20 hover:border-white/40 bg-white/5'
                        }`}
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

                    {uploading ? (
                        <Loader2 className="w-12 h-12 mx-auto mb-4 text-violet-400 animate-spin" />
                    ) : (
                        <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-violet-400' : 'text-white/40'}`} />
                    )}

                    <p className="text-white font-medium mb-2">
                        {uploading ? 'Upload en cours...' : 'Glissez-déposez votre fichier ici'}
                    </p>

                    <p className="text-white/40 text-sm mb-4">ou</p>

                    <label
                        htmlFor="file-upload"
                        className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all cursor-pointer ${uploading
                                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                                : 'bg-gradient-to-r from-violet-500/30 to-purple-500/30 border border-violet-500/50 text-white hover:from-violet-500/40 hover:to-purple-500/40'
                            }`}
                    >
                        <FileText className="w-5 h-5" />
                        Choisir un fichier
                    </label>

                    <p className="text-white/40 text-xs mt-4">
                        Formats acceptés: JPEG, PNG, PDF (max 10MB)
                    </p>
                </div>

                {error && (
                    <LiquidCard className="mt-4 p-4" style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        borderColor: 'rgba(239, 68, 68, 0.3)'
                    }}>
                        <p className="text-red-400 font-medium flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </p>
                    </LiquidCard>
                )}
            </LiquidCard>

            {/* Documents List */}
            {loading ? (
                <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 mx-auto text-violet-400 animate-spin" />
                    <p className="text-white/60 mt-2">Chargement des documents...</p>
                </div>
            ) : documents.length > 0 ? (
                <LiquidCard className="p-6">
                    <h4 className="text-lg font-bold text-white mb-4">Documents uploadés ({documents.length})</h4>
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition-all"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-violet-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-white truncate">{doc.originalName}</p>
                                        <div className="flex items-center gap-3 text-sm text-white/60">
                                            <span>{documentTypes.find(t => t.value === doc.type)?.label || doc.type}</span>
                                            <span>•</span>
                                            <span>{formatFileSize(doc.size)}</span>
                                            <span>•</span>
                                            <span>{formatDate(doc.uploadedAt)}</span>
                                        </div>
                                    </div>
                                    <div>
                                        {doc.status === 'pending' && (
                                            <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/30">
                                                ⏳ En attente
                                            </span>
                                        )}
                                        {doc.status === 'approved' && (
                                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
                                                ✅ Approuvé
                                            </span>
                                        )}
                                        {doc.status === 'rejected' && (
                                            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">
                                                ❌ Rejeté
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleView(doc.id)}
                                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                                        title="Voir le document"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </LiquidCard>
            ) : (
                <LiquidCard className="p-8 text-center">
                    <FileText className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white font-medium">Aucun document uploadé</p>
                    <p className="text-white/50 text-sm">Commencez par ajouter votre premier document ci-dessus</p>
                </LiquidCard>
            )}
        </div>
    );
}


