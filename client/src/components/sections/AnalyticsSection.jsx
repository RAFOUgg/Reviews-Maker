import React, { useState, useEffect } from 'react';
import { Beaker, Upload, File, X, CheckCircle, AlertCircle, Eye, FlaskConical } from 'lucide-react';
import { LiquidCard, LiquidInput, LiquidDivider, LiquidButton } from '@/components/ui/LiquidUI';

/**
 * Section Données Analytiques pour Hash/Concentrés/Fleurs
 * Conforme CDC - Upload certificat cannabinoïdes + profil terpénique
 * Liquid Glass UI Design System
 * Props: productType, formData, handleChange
 */
export default function AnalyticsSection({ productType, formData = {}, handleChange }) {
    const data = formData.analytics || {};
    const [thc, setThc] = useState(data?.thc || '');
    const [cbd, setCbd] = useState(data?.cbd || '');
    const [cbg, setCbg] = useState(data?.cbg || '');
    const [cbc, setCbc] = useState(data?.cbc || '');
    const [uploadedFile, setUploadedFile] = useState(data?.certificateFile || null);
    const [terpeneFile, setTerpeneFile] = useState(data?.terpeneFile || null);
    const [uploadError, setUploadError] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [previewType, setPreviewType] = useState(null); // 'cannabinoid' or 'terpene'

    // Synchroniser avec parent
    useEffect(() => {
        if (!handleChange) return;
        handleChange('analytics', {
            thc: thc ? parseFloat(thc) : null,
            cbd: cbd ? parseFloat(cbd) : null,
            cbg: cbg ? parseFloat(cbg) : null,
            cbc: cbc ? parseFloat(cbc) : null,
            certificateFile: uploadedFile,
            terpeneFile: terpeneFile
        });
    }, [thc, cbd, cbg, cbc, uploadedFile, terpeneFile, handleChange]);

    const handleFileUpload = (e, type = 'cannabinoid') => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Vérifier type de fichier
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setUploadError('Format non supporté. Utilisez PDF, JPEG ou PNG.');
            return;
        }

        // Vérifier taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('Fichier trop volumineux. Maximum 5 MB.');
            return;
        }

        setUploadError('');

        if (type === 'terpene') {
            setTerpeneFile(file);
        } else {
            setUploadedFile(file);
        }
    };

    const removeFile = (type = 'cannabinoid') => {
        if (type === 'terpene') {
            setTerpeneFile(null);
        } else {
            setUploadedFile(null);
        }
        setUploadError('');
    };

    const handleNumberInput = (value, setter) => {
        // Autoriser vide, nombres et décimales
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setter(value);
        }
    };

    const getFileIcon = (file) => {
        if (!file) return null;

        if (file.type === 'application/pdf') {
            return '📄';
        }
        return '🖼️';
    };

    const openPreview = (type) => {
        setPreviewType(type);
        setShowPreview(true);
    };

    const closePreview = () => {
        setShowPreview(false);
        setPreviewType(null);
    };

    return (
        <LiquidCard glow="blue" padding="lg" className="space-y-8">

            {/* En-tête */}
            <div className="flex items-center gap-3 pb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Beaker className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">🔬 Données Analytiques</h3>
                    <p className="text-sm text-white/50">Analyses cannabinoïdes et certificat</p>
                </div>
            </div>

            <LiquidDivider />

            {/* Note importante */}
            <div className="p-4 border border-blue-500/20 rounded-xl bg-blue-500/10">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-white/80">
                        <p className="font-semibold mb-1">Section optionnelle</p>
                        <p className="text-white/60">Les données analytiques ne sont pas obligatoires. Vous pouvez laisser vide si vous n'avez pas de certificat d'analyse.</p>
                    </div>
                </div>
            </div>

            {/* Taux cannabinoïdes */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white/80">Taux de cannabinoïdes (%)</h4>
                    {!uploadedFile && (
                        <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Certificat requis
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* THC */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/60">
                            THC <span className="text-purple-400">(Δ9-THC)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={thc}
                                onChange={(e) => handleNumberInput(e.target.value, setThc)}
                                placeholder="0.0"
                                disabled={!uploadedFile}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">%</span>
                        </div>
                    </div>

                    {/* CBD */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/60">
                            CBD <span className="text-green-400">(Cannabidiol)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={cbd}
                                onChange={(e) => handleNumberInput(e.target.value, setCbd)}
                                placeholder="0.0"
                                disabled={!uploadedFile}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">%</span>
                        </div>
                    </div>

                    {/* CBG */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/60">
                            CBG <span className="text-orange-400">(Cannabigerol)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={cbg}
                                onChange={(e) => handleNumberInput(e.target.value, setCbg)}
                                placeholder="0.0"
                                disabled={!uploadedFile}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">%</span>
                        </div>
                    </div>

                    {/* CBC */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/60">
                            CBC <span className="text-cyan-400">(Cannabichromene)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={cbc}
                                onChange={(e) => handleNumberInput(e.target.value, setCbc)}
                                placeholder="0.0"
                                disabled={!uploadedFile}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">%</span>
                        </div>
                    </div>
                </div>
            </div>

            <LiquidDivider />

            {/* Upload certificat cannabinoïdes */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-white/80">Certificat d'analyse cannabinoïdes</h4>

                {!uploadedFile ? (
                    <div className="relative">
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, 'cannabinoid')}
                            className="hidden"
                            id="certificate-upload"
                        />
                        <label
                            htmlFor="certificate-upload"
                            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-blue-500/50 transition-all group"
                        >
                            <Upload className="w-12 h-12 text-white/40 group-hover:text-blue-400 transition-colors mb-3" />
                            <p className="text-sm font-medium text-white/80 mb-1">
                                Cliquez pour uploader un certificat
                            </p>
                            <p className="text-xs text-white/40">
                                PDF, JPEG ou PNG (max 5 MB)
                            </p>
                        </label>
                    </div>
                ) : (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">{getFileIcon(uploadedFile)}</div>
                                <div>
                                    <p className="text-sm font-semibold text-white flex items-center gap-2">
                                        {uploadedFile.name}
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                    </p>
                                    <p className="text-xs text-white/40">
                                        {(uploadedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openPreview('cannabinoid')}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Prévisualiser"
                                >
                                    <Eye className="w-5 h-5 text-white/60" />
                                </button>
                                <button
                                    onClick={() => removeFile('cannabinoid')}
                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                    title="Supprimer"
                                >
                                    <X className="w-5 h-5 text-red-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Upload profil terpénique - CDC REQUIS */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white/80 flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-purple-400" />
                        Profil terpénique complet
                    </h4>
                    <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                        CDC - Certificat uniquement
                    </span>
                </div>

                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-xs text-white/60">
                        <strong className="text-purple-400">Conforme CDC :</strong> Le profil terpénique complet doit être fourni via un certificat d'analyse (PDF ou image). Saisie manuelle non autorisée.
                    </p>
                </div>

                {!terpeneFile ? (
                    <div className="relative">
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e, 'terpene')}
                            className="hidden"
                            id="terpene-upload"
                        />
                        <label
                            htmlFor="terpene-upload"
                            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/20 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 hover:border-purple-500/50 transition-all group"
                        >
                            <FlaskConical className="w-12 h-12 text-white/40 group-hover:text-purple-400 transition-colors mb-3" />
                            <p className="text-sm font-medium text-white/80 mb-1">
                                Uploader certificat profil terpénique
                            </p>
                            <p className="text-xs text-white/40">
                                PDF, JPEG ou PNG (max 5 MB)
                            </p>
                        </label>
                    </div>
                ) : (
                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">{getFileIcon(terpeneFile)}</div>
                                <div>
                                    <p className="text-sm font-semibold text-white flex items-center gap-2">
                                        {terpeneFile.name}
                                        <CheckCircle className="w-4 h-4 text-purple-400" />
                                    </p>
                                    <p className="text-xs text-white/40">
                                        {(terpeneFile.size / 1024).toFixed(1)} KB - Profil terpénique
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openPreview('terpene')}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    title="Prévisualiser"
                                >
                                    <Eye className="w-5 h-5 text-white/60" />
                                </button>
                                <button
                                    onClick={() => removeFile('terpene')}
                                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                    title="Supprimer"
                                >
                                    <X className="w-5 h-5 text-red-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {uploadError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-sm text-red-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {uploadError}
                        </p>
                    </div>
                )}
            </div>

            {/* Résumé */}
            {(thc || cbd || cbg || cbc || uploadedFile || terpeneFile) && (
                <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/20 space-y-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Beaker className="w-4 h-4 text-blue-400" />
                        Résumé analytique
                    </h4>
                    <div className="text-sm text-white/60 space-y-1">
                        {thc && <p><span className="font-semibold text-purple-400">THC :</span> {thc}%</p>}
                        {cbd && <p><span className="font-semibold text-green-400">CBD :</span> {cbd}%</p>}
                        {cbg && <p><span className="font-semibold text-orange-400">CBG :</span> {cbg}%</p>}
                        {cbc && <p><span className="font-semibold text-cyan-400">CBC :</span> {cbc}%</p>}
                        {uploadedFile && (
                            <p className="pt-2 border-t border-white/10">
                                <span className="font-semibold text-white/80">Certificat cannabinoïdes :</span> {uploadedFile.name}
                            </p>
                        )}
                        {terpeneFile && (
                            <p className={uploadedFile ? '' : 'pt-2 border-t border-white/10'}>
                                <span className="font-semibold text-purple-400">Profil terpénique :</span> {terpeneFile.name}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Preview */}
            {showPreview && (previewType === 'cannabinoid' ? uploadedFile : terpeneFile) && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={closePreview}
                >
                    <div
                        className="bg-gray-900/95 border border-white/10 rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-auto relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header modal */}
                        <div className="sticky top-0 bg-gray-900/95 border-b border-white/10 p-4 flex items-center justify-between z-10">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                {previewType === 'cannabinoid' ? (
                                    <><Beaker className="w-5 h-5 text-blue-400" /> Certificat cannabinoïdes</>
                                ) : (
                                    <><FlaskConical className="w-5 h-5 text-purple-400" /> Profil terpénique</>
                                )}
                            </h3>
                            <button
                                onClick={closePreview}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6 text-white/60" />
                            </button>
                        </div>

                        {/* Contenu preview */}
                        <div className="p-6">
                            {(() => {
                                const file = previewType === 'cannabinoid' ? uploadedFile : terpeneFile;
                                if (file.type === 'application/pdf') {
                                    return (
                                        <div className="space-y-4">
                                            <div className="p-8 bg-white/5 rounded-xl text-center">
                                                <File className="w-16 h-16 mx-auto text-white/40 mb-4" />
                                                <p className="text-sm text-white/60">
                                                    Prévisualisation PDF non disponible
                                                </p>
                                                <p className="text-xs text-white/40 mt-2">
                                                    Fichier : {file.name}
                                                </p>
                                            </div>
                                            <div className="text-xs text-white/40 text-center">
                                                Le certificat sera visible lors de l'export final
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="Preview certificat"
                                            className="w-full h-auto rounded-xl border border-white/10"
                                        />
                                    );
                                }
                            })()}
                        </div>
                    </div>
                </div>
            )}

        </LiquidCard>
    );
}


