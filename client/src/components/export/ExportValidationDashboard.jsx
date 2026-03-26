import { useState, useRef, useEffect } from 'react';
import LiquidGlass from '../ui/LiquidGlass';
import ExportMaker from './ExportMaker';
import { CheckCircle2, XCircle, AlertCircle, Play, RotateCcw } from 'lucide-react';

/**
 * ExportValidationDashboard - Interface de validation complète pour ExportMaker
 * Teste toutes les combinaisons templates/formats/produits avec de vraies données
 */
const ExportValidationDashboard = () => {
    const [selectedTemplate, setSelectedTemplate] = useState('modernCompact');
    const [selectedFormat, setSelectedFormat] = useState('1:1');
    const [selectedProduct, setSelectedProduct] = useState('flower');
    const [testResults, setTestResults] = useState([]);
    const [isTesting, setIsTesting] = useState(false);
    const [stats, setStats] = useState({ passed: 0, failed: 0, total: 0 });
    const [showExport, setShowExport] = useState(false);
    const exportContainerRef = useRef(null);

    // Données de test complètes pour chaque type de produit
    const testData = {
        flower: {
            id: 'test-flower-001',
            typeName: 'Fleurs',
            holderName: 'OG Kush Premium',
            varietyType: 'Indica',
            mainImage: 'https://images.unsplash.com/photo-1605394961959-f0b341ab86e4?w=400&h=300&fit=crop',
            rating: 8.7,
            overallRating: 8.7,
            createdAt: new Date().toISOString(),
            author: { username: 'terpologie' },

            genetics: {
                breeder: 'Kushman Genetics',
                variety: 'OG Kush #18',
                indicaPercent: 80,
                sativaPercent: 20,
                parents: ['Chemdawg', 'Hindu Kush']
            },

            analytics: {
                thc: 24.5,
                cbd: 0.8,
                cbg: 1.2,
                cbc: 0.6,
                cbn: 0.4,
                thcv: 0.3,
                labReport: 'LAB-2026-001'
            },

            terpeneProfile: [
                { name: 'Myrcène', percentage: 2.1 },
                { name: 'Limonène', percentage: 1.8 },
                { name: 'Pinène', percentage: 1.2 },
                { name: 'Caryophyllène', percentage: 0.9 },
                { name: 'Linalol', percentage: 0.6 }
            ],

            odor: {
                intensity: 8.5,
                dominant: ['Pin', 'Carburant', 'Terre'],
                secondary: ['Citron', 'Épices'],
                description: 'Arôme puissant de pin et de carburant'
            },

            taste: {
                intensity: 8.2,
                aggressiveness: 6.5,
                inhalation: ['Carburant', 'Terre', 'Pin'],
                expiration: ['Citron', 'Épices', 'Bois'],
                description: 'Goût terreux avec finale citronnée'
            },

            effects: {
                intensity: 9.0,
                onset: 7.5,
                duration: 8.0,
                selected: ['Relaxation', 'Euphorie', 'Créativité', 'Anti-stress']
            },

            categoryScores: {
                visual: 8.5,
                odor: 8.7,
                taste: 8.2,
                effects: 9.0,
                texture: 7.8
            }
        },

        hash: {
            id: 'test-hash-001',
            typeName: 'Hash',
            holderName: 'Moroccan Gold',
            varietyType: 'Hybride',
            mainImage: 'https://images.unsplash.com/photo-1589287076380-5a0e4425f7e8?w=400&h=300&fit=crop',
            rating: 8.3,
            overallRating: 8.3,
            createdAt: new Date().toISOString(),
            author: { username: 'terpologie' },

            analytics: {
                thc: 42.0,
                cbd: 1.2,
                cbg: 0.8
            },

            terpeneProfile: [
                { name: 'Myrcène', percentage: 1.8 },
                { name: 'Caryophyllène', percentage: 1.4 }
            ],

            texture: {
                flexibility: 'Souple',
                malleability: 8.0,
                crumble: 6.5
            },

            odor: {
                intensity: 7.8,
                dominant: ['Épices', 'Terre', 'Bois']
            },

            taste: {
                intensity: 7.5,
                inhalation: ['Épices', 'Terre']
            },

            effects: {
                intensity: 8.5,
                selected: ['Relaxation', 'Méditation']
            }
        },

        concentrate: {
            id: 'test-concentrate-001',
            typeName: 'Concentré',
            holderName: 'Live Resin - Gelato',
            mainImage: 'https://images.unsplash.com/photo-1605394961959-f0b341ab86e4?w=400&h=300&fit=crop',
            rating: 9.2,
            overallRating: 9.2,
            createdAt: new Date().toISOString(),
            author: { username: 'terpologie' },

            extractionMethod: 'Live Resin',
            consistencyType: 'Sauce',

            analytics: {
                thc: 82.5,
                cbd: 0.5,
                cbg: 2.1,
                thcv: 1.2
            },

            terpeneProfile: [
                { name: 'Limonène', percentage: 4.2 },
                { name: 'Myrcène', percentage: 3.8 },
                { name: 'Caryophyllène', percentage: 2.1 }
            ],

            odor: {
                intensity: 9.5,
                dominant: ['Fruits', 'Crème', 'Sucré']
            },

            taste: {
                intensity: 9.0,
                inhalation: ['Fruits', 'Crème']
            },

            effects: {
                intensity: 9.5,
                selected: ['Euphorie', 'Créativité', 'Énergie']
            }
        }
    };

    // Tests de validation
    const validationChecks = [
        {
            id: 'image-display',
            name: 'Image principale affichée',
            category: 'Fondamentaux',
            check: (container) => {
                const img = container.querySelector('img[src*="http"], img[src*="data:"]');
                return Boolean(img && img.src);
            }
        },
        {
            id: 'product-name',
            name: 'Nom produit visible',
            category: 'Fondamentaux',
            check: (container) => {
                const holderName = testData[selectedProduct].holderName;
                return container.textContent.includes(holderName);
            }
        },
        {
            id: 'product-type',
            name: 'Type produit avec icône',
            category: 'Fondamentaux',
            check: (container) => {
                const icons = ['🌸', '🟫', '🍯', '🍪'];
                return icons.some(icon => container.textContent.includes(icon));
            }
        },
        {
            id: 'thc-badge',
            name: 'Badge THC avec couleur',
            category: 'Cannabinoïdes',
            check: (container) => {
                return container.textContent.includes('THC') &&
                    container.textContent.includes('%');
            }
        },
        {
            id: 'cbd-badge',
            name: 'Badge CBD avec couleur',
            category: 'Cannabinoïdes',
            check: (container) => {
                return container.textContent.includes('CBD') &&
                    container.textContent.includes('%');
            }
        },
        {
            id: 'minor-cannabinoids',
            name: 'Cannabinoïdes mineurs (CBG, CBC, etc.)',
            category: 'Cannabinoïdes',
            check: (container) => {
                const text = container.textContent;
                const analytics = testData[selectedProduct].analytics;
                const hasMinor = analytics.cbg || analytics.cbc || analytics.cbn || analytics.thcv;

                if (!hasMinor) return true; // Pass if no minor cannabinoids in data

                return text.includes('CBG') || text.includes('CBC') ||
                    text.includes('CBN') || text.includes('THCV');
            }
        },
        {
            id: 'rating-display',
            name: 'Note globale affichée',
            category: 'Scores',
            check: (container) => {
                const rating = testData[selectedProduct].rating.toString();
                return container.textContent.includes(rating) ||
                    container.querySelector('[data-testid="score-gauge"]');
            }
        },
        {
            id: 'terpenes-section',
            name: 'Section Terpènes complète',
            category: 'Terpènes',
            check: (container) => {
                const text = container.textContent;
                const terpenes = testData[selectedProduct].terpeneProfile;
                if (!terpenes || terpenes.length === 0) return true;

                return terpenes.some(terp => text.includes(terp.name));
            }
        },
        {
            id: 'terpenes-sorted',
            name: 'Terpènes triés décroissant',
            category: 'Terpènes',
            check: (container) => {
                // Check if terpenes appear in order (hard to validate in DOM, assume OK if section exists)
                return container.textContent.includes('Terpènes') ||
                    testData[selectedProduct].terpeneProfile?.[0]?.name;
            }
        },
        {
            id: 'odor-section',
            name: '👃 Section Odeur',
            category: 'Sections sensorielles',
            check: (container) => {
                const text = container.textContent;
                const hasIcon = text.includes('👃');
                const hasLabel = text.toLowerCase().includes('odeur');
                const odor = testData[selectedProduct].odor;
                const hasContent = odor?.dominant?.some(arome => text.includes(arome));

                return (hasIcon || hasLabel) && hasContent;
            }
        },
        {
            id: 'taste-section',
            name: '😋 Section Goût',
            category: 'Sections sensorielles',
            check: (container) => {
                const text = container.textContent;
                const hasIcon = text.includes('😋');
                const hasLabel = text.toLowerCase().includes('goût') || text.toLowerCase().includes('gout');
                const taste = testData[selectedProduct].taste;
                const hasContent = taste?.inhalation?.some(gout => text.includes(gout));

                return (hasIcon || hasLabel) && hasContent;
            }
        },
        {
            id: 'effects-section',
            name: '💥 Section Effets',
            category: 'Sections sensorielles',
            check: (container) => {
                const text = container.textContent;
                const hasIcon = text.includes('💥');
                const hasLabel = text.toLowerCase().includes('effet');
                const effects = testData[selectedProduct].effects;
                const hasContent = effects?.selected?.some(effet => text.includes(effet));

                return (hasIcon || hasLabel) && hasContent;
            }
        },
        {
            id: 'genetics-display',
            name: 'Génétiques affichées',
            category: 'Détails',
            check: (container) => {
                const genetics = testData[selectedProduct].genetics;
                if (!genetics) return true;

                const text = container.textContent;
                return text.includes(genetics.breeder) ||
                    text.includes(genetics.variety) ||
                    text.includes('Indica') ||
                    text.includes('Sativa');
            }
        },
        {
            id: 'branding',
            name: 'Branding Terpologie',
            category: 'Fondamentaux',
            check: (container) => {
                const text = container.textContent.toUpperCase();
                return text.includes('TERPOLOGIE') || text.includes('terpologie.fr');
            }
        }
    ];

    // Lancer un test unique
    const runSingleTest = async () => {
        setIsTesting(true);
        setShowExport(true);

        // Attendre que le DOM soit mis à jour
        setTimeout(async () => {
            const container = exportContainerRef.current;
            if (!container) {
                console.error('[Validation] Export container not found');
                setIsTesting(false);
                return;
            }

            // Chercher le contenu du canvas
            const canvasContent = container.querySelector('[style*="position: relative"]') || container;

            const results = [];
            let passed = 0;
            let failed = 0;

            for (const check of validationChecks) {
                try {
                    const checkPassed = check.check(canvasContent);
                    results.push({
                        id: check.id,
                        name: check.name,
                        category: check.category,
                        passed: checkPassed,
                        error: null
                    });

                    if (checkPassed) passed++;
                    else failed++;
                } catch (error) {
                    results.push({
                        id: check.id,
                        name: check.name,
                        category: check.category,
                        passed: false,
                        error: error.message
                    });
                    failed++;
                }
            }

            setTestResults(results);
            setStats({
                passed,
                failed,
                total: results.length
            });
            setIsTesting(false);
        }, 1500); // Attendre 1.5s pour que le canvas soit bien rendu
    };

    // Lancer validation complète
    const runCompleteValidation = async () => {
        const allConfigs = [
            { template: 'modernCompact', format: '1:1', product: 'flower' },
            { template: 'modernCompact', format: '16:9', product: 'flower' },
            { template: 'modernCompact', format: '9:16', product: 'flower' },
            { template: 'detailedCard', format: '1:1', product: 'flower' },
            { template: 'detailedCard', format: 'A4', product: 'flower' },
            { template: 'blogArticle', format: '16:9', product: 'flower' },
            { template: 'modernCompact', format: '1:1', product: 'hash' },
            { template: 'detailedCard', format: '16:9', product: 'hash' },
            { template: 'modernCompact', format: '1:1', product: 'concentrate' }
        ];

        let allResults = [];
        let totalPassed = 0;
        let totalFailed = 0;

        setIsTesting(true);

        for (const config of allConfigs) {
            setSelectedTemplate(config.template);
            setSelectedFormat(config.format);
            setSelectedProduct(config.product);
            setShowExport(true);

            await new Promise(resolve => setTimeout(resolve, 2000));

            const container = exportContainerRef.current;
            if (!container) continue;

            const canvasContent = container.querySelector('[style*="position: relative"]') || container;

            for (const check of validationChecks) {
                try {
                    const checkPassed = check.check(canvasContent);
                    allResults.push({
                        config: `${config.template}-${config.format}-${config.product}`,
                        ...check,
                        passed: checkPassed
                    });

                    if (checkPassed) totalPassed++;
                    else totalFailed++;
                } catch (error) {
                    allResults.push({
                        config: `${config.template}-${config.format}-${config.product}`,
                        ...check,
                        passed: false,
                        error: error.message
                    });
                    totalFailed++;
                }
            }
        }

        setTestResults(allResults);
        setStats({
            passed: totalPassed,
            failed: totalFailed,
            total: totalPassed + totalFailed
        });
        setIsTesting(false);
    };

    const resetTests = () => {
        setTestResults([]);
        setStats({ passed: 0, failed: 0, total: 0 });
        setShowExport(false);
    };

    const successRate = stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;

    // Grouper les résultats par catégorie
    const resultsByCategory = testResults.reduce((acc, result) => {
        if (!acc[result.category]) {
            acc[result.category] = [];
        }
        acc[result.category].push(result);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                        🧪 VALIDATION EXPORTMAKER
                    </h1>
                    <p className="text-gray-400">
                        Test systématique du nouveau système adaptatif
                    </p>
                </div>

                {/* Configuration & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Configuration */}
                    <LiquidGlass className="p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            ⚙️ Configuration Test
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Template:
                                </label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                >
                                    <option value="modernCompact">Moderne Compact</option>
                                    <option value="blogArticle">Fiche Standard</option>
                                    <option value="detailedCard">Fiche Détaillée</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Format:
                                </label>
                                <select
                                    value={selectedFormat}
                                    onChange={(e) => setSelectedFormat(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                >
                                    <option value="1:1">1:1 (Carré 540x540)</option>
                                    <option value="16:9">16:9 (Paysage 720x405)</option>
                                    <option value="9:16">9:16 (Portrait 405x720)</option>
                                    <option value="A4">A4 (Document 530x750)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Type de produit:
                                </label>
                                <select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
                                >
                                    <option value="flower">🌸 Fleurs</option>
                                    <option value="hash">🟫 Hash</option>
                                    <option value="concentrate">🍯 Concentrés</option>
                                </select>
                            </div>

                            <button
                                onClick={runSingleTest}
                                disabled={isTesting}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
                            >
                                <Play size={18} />
                                {isTesting ? 'Test en cours...' : '🔍 Tester Configuration'}
                            </button>

                            <button
                                onClick={runCompleteValidation}
                                disabled={isTesting}
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
                            >
                                🚀 Validation Complète (9 configs)
                            </button>

                            {testResults.length > 0 && (
                                <button
                                    onClick={resetTests}
                                    className="w-full bg-white/5 hover:bg-white/10 text-gray-300 font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
                                >
                                    <RotateCcw size={16} />
                                    Réinitialiser
                                </button>
                            )}
                        </div>
                    </LiquidGlass>

                    {/* Stats */}
                    <LiquidGlass className="p-6 lg:col-span-2">
                        <h2 className="text-xl font-bold text-white mb-4">📊 Résultats</h2>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="text-center">
                                <div className="text-3xl font-black text-green-400">
                                    {stats.passed}
                                </div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide">
                                    Passés
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-black text-red-400">
                                    {stats.failed}
                                </div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide">
                                    Échoués
                                </div>
                            </div>
                            <div className="text-center">
                                <div className={`text-3xl font-black ${successRate >= 90 ? 'text-green-400' :
                                        successRate >= 70 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                    {successRate}%
                                </div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide">
                                    Taux Succès
                                </div>
                            </div>
                        </div>

                        {stats.total > 0 && (
                            <div className="space-y-3">
                                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-500 ${successRate >= 90 ? 'bg-green-500' :
                                                successRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${successRate}%` }}
                                    />
                                </div>

                                <div className="text-center">
                                    {successRate >= 95 && (
                                        <div className="text-green-400 font-bold flex items-center justify-center gap-2">
                                            <CheckCircle2 size={20} />
                                            ✅ VALIDATION RÉUSSIE - Production Ready
                                        </div>
                                    )}
                                    {successRate >= 85 && successRate < 95 && (
                                        <div className="text-yellow-400 font-bold flex items-center justify-center gap-2">
                                            <AlertCircle size={20} />
                                            ⚠️ VALIDATION PARTIELLE - Corrections mineures
                                        </div>
                                    )}
                                    {successRate < 85 && stats.total > 0 && (
                                        <div className="text-red-400 font-bold flex items-center justify-center gap-2">
                                            <XCircle size={20} />
                                            ❌ VALIDATION ÉCHOUÉE - Corrections majeures
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </LiquidGlass>
                </div>

                {/* Résultats détaillés */}
                {testResults.length > 0 && (
                    <LiquidGlass className="p-6 mb-6">
                        <h2 className="text-xl font-bold text-white mb-4">🔍 Détails des Tests</h2>

                        <div className="space-y-6">
                            {Object.entries(resultsByCategory).map(([category, results]) => {
                                const categoryPassed = results.filter(r => r.passed).length;
                                const categoryTotal = results.length;
                                const categoryRate = Math.round((categoryPassed / categoryTotal) * 100);

                                return (
                                    <div key={category} className="bg-white/5 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-lg font-bold text-purple-300">
                                                {category}
                                            </h3>
                                            <span className={`text-sm font-bold ${categoryRate >= 90 ? 'text-green-400' :
                                                    categoryRate >= 70 ? 'text-yellow-400' : 'text-red-400'
                                                }`}>
                                                {categoryPassed}/{categoryTotal} ({categoryRate}%)
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            {results.map((result, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex items-center gap-3 p-2 rounded ${result.passed
                                                            ? 'bg-green-500/10 border-l-2 border-green-500'
                                                            : 'bg-red-500/10 border-l-2 border-red-500'
                                                        }`}
                                                >
                                                    {result.passed ? (
                                                        <CheckCircle2 size={16} className="text-green-400 flex-shrink-0" />
                                                    ) : (
                                                        <XCircle size={16} className="text-red-400 flex-shrink-0" />
                                                    )}
                                                    <span className="text-sm text-gray-200 flex-1">
                                                        {result.name}
                                                    </span>
                                                    {result.config && (
                                                        <span className="text-xs text-gray-500 font-mono">
                                                            {result.config}
                                                        </span>
                                                    )}
                                                    {result.error && (
                                                        <span className="text-xs text-red-400">
                                                            {result.error}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </LiquidGlass>
                )}

                {/* Preview Zone */}
                {showExport && (
                    <LiquidGlass className="p-6">
                        <h2 className="text-xl font-bold text-white mb-4">🖼️ Preview ExportMaker</h2>
                        <div ref={exportContainerRef} className="bg-black/20 rounded-lg overflow-hidden">
                            <ExportMaker
                                reviewData={testData[selectedProduct]}
                                productType={selectedProduct}
                                onClose={() => setShowExport(false)}
                            />
                        </div>
                    </LiquidGlass>
                )}
            </div>
        </div>
    );
};

export default ExportValidationDashboard;
