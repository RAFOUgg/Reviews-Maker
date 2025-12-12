import React, { useState, useEffect } from 'react';
import { Beaker, Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Section Données Analytiques pour Hash/Concentrés/Fleurs
 * Props: productType, data, onChange
 */
export default function AnalyticsSection({ productType, data = {}, onChange }) {
    const [thc, setThc] = useState(data?.thc || '');
    const [cbd, setCbd] = useState(data?.cbd || '');
    const [cbg, setCbg] = useState(data?.cbg || '');
    const [cbc, setCbc] = useState(data?.cbc || '');
    const [uploadedFile, setUploadedFile] = useState(data?.certificateFile || null);
    const [uploadError, setUploadError] = useState('');

    // Synchroniser avec parent
    useEffect(() => {
        onChange({
            thc: thc ? parseFloat(thc) : null,
            cbd: cbd ? parseFloat(cbd) : null,
            cbg: cbg ? parseFloat(cbg) : null,
            cbc: cbc ? parseFloat(cbc) : null,
            certificateFile: uploadedFile
        });
    }, [thc, cbd, cbg, cbc, uploadedFile]);

    const handleFileUpload = (e) => {
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
        setUploadedFile(file);
    };

    const removeFile = () => {
        setUploadedFile(null);
        setUploadError('');
    };

    const handleNumberInput = (value, setter) => {
        // Autoriser vide, nombres et décimales
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setter(value);
        }
    };

    const getFileIcon = () => {
        if (!uploadedFile) return null;

        if (uploadedFile.type === 'application/pdf') {
            return '📄';
        }
        return '🖼️';
    };

    return (
        <div className="space-y-8 p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">

            {/* En-tête */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                    <Beaker className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">🔬 Données Analytiques</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Analyses cannabinoïdes et certificat</p>
                </div>
            </div>

            {/* Note importante */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-semibold mb-1">Section optionnelle</p>
                        <p>Les données analytiques ne sont pas obligatoires. Vous pouvez laisser vide si vous n'avez pas de certificat d'analyse.</p>
                    </div>
                </div>
            </div>

            {/* Taux cannabinoïdes */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Taux de cannabinoïdes (%)</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* THC */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            THC <span className="text-purple-500">(Δ9-THC)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={thc}
                                onChange={(e) => handleNumberInput(e.target.value, setThc)}
                                placeholder="0.0"
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                         rounded-lg text-gray-900 dark:text-white placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">%</span>
                        </div>
                    </div>

                    {/* CBD */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            CBD <span className="text-green-500">(Cannabidiol)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={cbd}
                                onChange={(e) => handleNumberInput(e.target.value, setCbd)}
                                placeholder="0.0"
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                         rounded-lg text-gray-900 dark:text-white placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">%</span>
                        </div>
                    </div>

                    {/* CBG */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            CBG <span className="text-orange-500">(Cannabigerol)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={cbg}
                                onChange={(e) => handleNumberInput(e.target.value, setCbg)}
                                placeholder="0.0"
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                         rounded-lg text-gray-900 dark:text-white placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">%</span>
                        </div>
                    </div>

                    {/* CBC */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            CBC <span className="text-blue-500">(Cannabichromene)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={cbc}
                                onChange={(e) => handleNumberInput(e.target.value, setCbc)}
                                placeholder="0.0"
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                         rounded-lg text-gray-900 dark:text-white placeholder-gray-400 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload certificat */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Certificat d'analyse</h4>

                {!uploadedFile ? (
                    <div className="relative">
                        <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="certificate-upload"
                        />
                        <label
                            htmlFor="certificate-upload"
                            className="flex flex-col items-center justify-center p-8 border-2 border-dashed 
                       border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer
                       bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 
                       transition-all group"
                        >
                            <Upload className="w-12 h-12 text-gray-400 group-hover:text-purple-500 transition-colors mb-3" />
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Cliquez pour uploader un certificat
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                PDF, JPEG ou PNG (max 5 MB)
                            </p>
                        </label>
                    </div>
                ) : (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">{getFileIcon()}</div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                        {uploadedFile.name}
                                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {(uploadedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={removeFile}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                title="Supprimer"
                            >
                                <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </button>
                        </div>
                    </div>
                )}

                {uploadError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {uploadError}
                        </p>
                    </div>
                )}
            </div>

            {/* Résumé */}
            {(thc || cbd || cbg || cbc || uploadedFile) && (
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl space-y-2">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Beaker className="w-4 h-4 text-purple-500" />
                        Résumé analytique
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        {thc && <p><span className="font-semibold text-purple-600 dark:text-purple-400">THC :</span> {thc}%</p>}
                        {cbd && <p><span className="font-semibold text-green-600 dark:text-green-400">CBD :</span> {cbd}%</p>}
                        {cbg && <p><span className="font-semibold text-orange-600 dark:text-orange-400">CBG :</span> {cbg}%</p>}
                        {cbc && <p><span className="font-semibold text-blue-600 dark:text-blue-400">CBC :</span> {cbc}%</p>}
                        {uploadedFile && (
                            <p className="pt-2 border-t border-gray-300 dark:border-gray-600">
                                <span className="font-semibold">Certificat :</span> {uploadedFile.name}
                            </p>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
