import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { choiceCatalog } from '../utils/productStructures';

/**
 * RecipeSection - Gestionnaire de recette pour comestibles
 * Structure unifiée: ingredients (catalogue + cannabis) + protocol (étapes ordonnées)
 */
const RecipeSection = ({ value = {}, onChange }) => {
    const { ingredients = [], protocol = [] } = value;

    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    // État pour formulaire d'ajout d'ingrédient
    const [ingredientType, setIngredientType] = useState('standard'); // 'standard' | 'cannabis'
    const [selectedIngredient, setSelectedIngredient] = useState('');
    const [customIngredient, setCustomIngredient] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('g');

    // État pour sélection produit cannabis
    const [cannabisSource, setCannabisSource] = useState('new'); // 'new' | 'library'
    const [cannabisType, setCannabisType] = useState('');
    const [cannabisName, setCannabisName] = useState('');
    const [selectedReview, setSelectedReview] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // État pour formulaire d'ajout d'étape protocole - SYSTÈME AVANCÉ
    const [selectedActionIndex, setSelectedActionIndex] = useState(-1);
    const [customAction, setCustomAction] = useState('');
    const [actionTemp, setActionTemp] = useState('');
    const [actionDuration, setActionDuration] = useState('');
    const [selectedPrecisions, setSelectedPrecisions] = useState([]);
    const [selectedIngredients, setSelectedIngredients] = useState([]);

    // Action sélectionnée
    const selectedActionData = selectedActionIndex >= 0 ? choiceCatalog.actionsProtocole[selectedActionIndex] : null;

    // Charger les reviews pour la bibliothèque
    useEffect(() => {
        if (cannabisSource === 'library' && ingredientType === 'cannabis') {
            loadReviews();
        }
    }, [cannabisSource, ingredientType]);

    const loadReviews = async () => {
        setLoadingReviews(true);
        try {
            const response = await fetch('/api/reviews');
            if (response.ok) {
                const data = await response.json();
                const filtered = data.filter(r => ['Fleur', 'Hash', 'Concentré'].includes(r.type));
                setReviews(filtered);
            }
        } catch (error) {
            console.error('Erreur chargement reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const updateField = (field, val) => {
        onChange({ ...value, [field]: val });
    };

    // ========== GESTION INGRÉDIENTS ==========
    const addIngredient = () => {
        let newIngredient;

        if (ingredientType === 'standard') {
            const name = selectedIngredient === 'Autre (personnalisé)' ? customIngredient : selectedIngredient;
            if (!name || !quantity) return;

            newIngredient = {
                id: Date.now().toString(),
                type: 'standard',
                name,
                quantity,
                unit
            };
        } else {
            if (cannabisSource === 'new') {
                if (!cannabisType || !cannabisName || !quantity) return;

                newIngredient = {
                    id: Date.now().toString(),
                    type: 'cannabis',
                    source: 'new',
                    cannabisType,
                    name: cannabisName,
                    quantity,
                    unit
                };
            } else {
                if (!selectedReview || !quantity) return;

                newIngredient = {
                    id: Date.now().toString(),
                    type: 'cannabis',
                    source: 'library',
                    reviewId: selectedReview.id,
                    cannabisType: selectedReview.type,
                    name: selectedReview.holderName,
                    cultivars: selectedReview.cultivars,
                    breeder: selectedReview.breeder,
                    quantity,
                    unit
                };
            }
        }

        updateField('ingredients', [...ingredients, newIngredient]);

        // Reset form
        setSelectedIngredient('');
        setCustomIngredient('');
        setQuantity('');
        setCannabisType('');
        setCannabisName('');
        setSelectedReview(null);
        setSearchTerm('');
    };

    const removeIngredient = (id) => {
        updateField('ingredients', ingredients.filter(i => i.id !== id));
    };

    // ========== GESTION PROTOCOLE - SYSTÈME AVANCÉ ==========
    const addProtocolStep = () => {
        if (!selectedActionData && !customAction) return;

        const actionName = selectedActionData?.isCustom ? customAction : selectedActionData?.name;
        if (!actionName) return;

        const newStep = {
            id: Date.now().toString(),
            action: actionName,
            category: selectedActionData?.category || 'autre',
            temperature: actionTemp || null,
            duration: actionDuration || null,
            precisions: selectedPrecisions,
            ingredients: selectedIngredients
        };

        updateField('protocol', [...protocol, newStep]);

        // Reset form
        setSelectedActionIndex(-1);
        setCustomAction('');
        setActionTemp('');
        setActionDuration('');
        setSelectedPrecisions([]);
        setSelectedIngredients([]);
    };

    const removeProtocolStep = (id) => {
        updateField('protocol', protocol.filter(s => s.id !== id));
    };

    const moveProtocolStep = (index, direction) => {
        const newProtocol = [...protocol];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex < 0 || newIndex >= protocol.length) return;

        [newProtocol[index], newProtocol[newIndex]] = [newProtocol[newIndex], newProtocol[index]];
        updateField('protocol', newProtocol);
    };

    const toggleIngredientInStep = (ingredientId) => {
        if (selectedIngredients.includes(ingredientId)) {
            setSelectedIngredients(selectedIngredients.filter(id => id !== ingredientId));
        } else {
            setSelectedIngredients([...selectedIngredients, ingredientId]);
        }
    };

    const togglePrecisionInStep = (precision) => {
        if (selectedPrecisions.includes(precision)) {
            setSelectedPrecisions(selectedPrecisions.filter(p => p !== precision));
        } else {
            setSelectedPrecisions([...selectedPrecisions, precision]);
        }
    };

    // Filtrer reviews pour la recherche
    const filteredReviews = reviews.filter(r =>
        r.holderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.cultivars && r.cultivars.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (r.breeder && r.breeder.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* ========== INGRÉDIENTS ========== */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-4">🥘 Ingrédients</h4>

                {/* Type d'ingrédient */}
                <div className="mb-4">
                    <label className="block text-xs text-gray-400 mb-2">Type d'ingrédient</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setIngredientType('standard')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${ingredientType === 'standard'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Ingrédient Standard
                        </button>
                        <button
                            type="button"
                            onClick={() => setIngredientType('cannabis')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${ingredientType === 'cannabis'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            🌿 Produit Cannabinique
                        </button>
                    </div>
                </div>

                {/* Formulaire Ingrédient Standard */}
                {ingredientType === 'standard' && (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Ingrédient</label>
                            <select
                                value={selectedIngredient}
                                onChange={(e) => setSelectedIngredient(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                            >
                                <option value="">-- Sélectionner --</option>
                                {choiceCatalog.ingredientsCuisine.map((ing, i) => (
                                    <option key={i} value={ing}>{ing}</option>
                                ))}
                            </select>
                        </div>

                        {selectedIngredient === 'Autre (personnalisé)' && (
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Nom personnalisé</label>
                                <input
                                    type="text"
                                    value={customIngredient}
                                    onChange={(e) => setCustomIngredient(e.target.value)}
                                    placeholder="Ex: Épice spéciale..."
                                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Formulaire Produit Cannabinique */}
                {ingredientType === 'cannabis' && (
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-2">Source du produit</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCannabisSource('new')}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${cannabisSource === 'new'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    Nouveau produit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCannabisSource('library')}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${cannabisSource === 'library'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    📚 Bibliothèque
                                </button>
                            </div>
                        </div>

                        {cannabisSource === 'new' ? (
                            <>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Type</label>
                                    <select
                                        value={cannabisType}
                                        onChange={(e) => setCannabisType(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                                    >
                                        <option value="">-- Sélectionner --</option>
                                        <option value="Fleur">Fleur</option>
                                        <option value="Hash">Hash</option>
                                        <option value="Concentré">Concentré</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Nom du produit</label>
                                    <input
                                        type="text"
                                        value={cannabisName}
                                        onChange={(e) => setCannabisName(e.target.value)}
                                        placeholder="Ex: OG Kush, Bubble Hash..."
                                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">Rechercher dans la bibliothèque</label>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Nom, cultivar, breeder..."
                                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                                    />
                                </div>

                                {loadingReviews ? (
                                    <div className="text-center text-gray-400 text-sm py-4">Chargement...</div>
                                ) : (
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {filteredReviews.map((review) => (
                                            <button
                                                key={review.id}
                                                type="button"
                                                onClick={() => setSelectedReview(review)}
                                                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedReview?.id === review.id
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-700/30 text-gray-300 hover:bg-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-sm">{review.holderName}</div>
                                                        <div className="text-xs text-gray-400">
                                                            {review.type} {review.cultivars && `• ${review.cultivars}`}
                                                        </div>
                                                    </div>
                                                    {selectedReview?.id === review.id && <span className="text-lg">✓</span>}
                                                </div>
                                            </button>
                                        ))}
                                        {filteredReviews.length === 0 && (
                                            <div className="text-center text-gray-500 text-sm py-4">Aucun produit trouvé</div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Quantité et Unité (commun) */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Quantité</label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="Ex: 250"
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Unité</label>
                        <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                        >
                            <option value="g">g (grammes)</option>
                            <option value="mg">mg (milligrammes)</option>
                            <option value="kg">kg (kilogrammes)</option>
                            <option value="ml">ml (millilitres)</option>
                            <option value="cl">cl (centilitres)</option>
                            <option value="L">L (litres)</option>
                            <option value="oz">oz (onces)</option>
                            <option value="lb">lb (livres)</option>
                            <option value="tasse">tasse(s)</option>
                            <option value="c.à.s">c. à soupe</option>
                            <option value="c.à.c">c. à café</option>
                            <option value="pincée">pincée(s)</option>
                            <option value="unité">unité(s)</option>
                        </select>
                    </div>
                </div>

                {/* Bouton Ajouter */}
                <button
                    type="button"
                    onClick={addIngredient}
                    className="w-full mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    ➕ Ajouter l'ingrédient
                </button>

                {/* Liste des ingrédients */}
                {ingredients.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <div className="text-xs text-gray-400 font-medium mb-2">
                            Ingrédients ajoutés ({ingredients.length})
                        </div>
                        {ingredients.map((ing) => (
                            <div key={ing.id} className="flex items-center gap-2 bg-gray-700/30 rounded-lg p-2">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        {ing.type === 'cannabis' && <span className="text-green-400">🌿</span>}
                                        <span className="text-white text-sm font-medium">{ing.name}</span>
                                        {ing.type === 'cannabis' && ing.source === 'library' && (
                                            <span className="text-xs text-blue-400">📚</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {ing.quantity} {ing.unit}
                                        {ing.cultivars && ` • ${ing.cultivars}`}
                                        {ing.breeder && ` • ${ing.breeder}`}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeIngredient(ing.id)}
                                    className="px-2 py-1 text-red-400 hover:text-red-300 text-sm"
                                    title="Supprimer"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ========== PROTOCOLE - SYSTÈME AVANCÉ ========== */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-white mb-4">📖 Protocole de Préparation</h4>

                <div className="space-y-4">
                    {/* Sélection Action */}
                    <div>
                        <label className="block text-xs text-gray-400 mb-2">Action</label>
                        <div className="grid grid-cols-2 gap-2">
                            {choiceCatalog.actionsProtocole.map((action, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                        setSelectedActionIndex(index);
                                        if (action.defaultTemp) setActionTemp(action.defaultTemp);
                                        if (action.defaultDuration) setActionDuration(action.defaultDuration);
                                    }}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${selectedActionIndex === index
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    {action.name}
                                    {action.category === 'cannabis' && ' 🌿'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action personnalisée */}
                    {selectedActionData?.isCustom && (
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Action personnalisée</label>
                            <input
                                type="text"
                                value={customAction}
                                onChange={(e) => setCustomAction(e.target.value)}
                                placeholder="Décrire l'action..."
                                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                            />
                        </div>
                    )}

                    {/* Température (si nécessaire) */}
                    {selectedActionData?.needsTemp && (
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">
                                🌡️ Température: {actionTemp}°C
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min={selectedActionData.tempRange[0]}
                                    max={selectedActionData.tempRange[1]}
                                    step="5"
                                    value={actionTemp || selectedActionData.defaultTemp}
                                    onChange={(e) => setActionTemp(e.target.value)}
                                    className="flex-1 accent-green-500"
                                />
                                <input
                                    type="number"
                                    min={selectedActionData.tempRange[0]}
                                    max={selectedActionData.tempRange[1]}
                                    value={actionTemp || selectedActionData.defaultTemp}
                                    onChange={(e) => setActionTemp(e.target.value)}
                                    className="w-20 px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-white text-sm text-center focus:outline-none focus:border-green-500"
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{selectedActionData.tempRange[0]}°C</span>
                                <span>{selectedActionData.tempRange[1]}°C</span>
                            </div>
                        </div>
                    )}

                    {/* Durée (si nécessaire) */}
                    {selectedActionData?.needsDuration && (
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">
                                ⏱️ Durée: {actionDuration} min
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min={selectedActionData.durationRange[0]}
                                    max={selectedActionData.durationRange[1]}
                                    step={selectedActionData.durationRange[1] > 60 ? 5 : 1}
                                    value={actionDuration || selectedActionData.defaultDuration}
                                    onChange={(e) => setActionDuration(e.target.value)}
                                    className="flex-1 accent-blue-500"
                                />
                                <input
                                    type="number"
                                    min={selectedActionData.durationRange[0]}
                                    max={selectedActionData.durationRange[1]}
                                    value={actionDuration || selectedActionData.defaultDuration}
                                    onChange={(e) => setActionDuration(e.target.value)}
                                    className="w-20 px-2 py-1 bg-gray-700/50 border border-gray-600 rounded text-white text-sm text-center focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>{selectedActionData.durationRange[0]} min</span>
                                <span>{selectedActionData.durationRange[1]} min</span>
                            </div>
                        </div>
                    )}

                    {/* Précisions (si disponibles) */}
                    {selectedActionData?.needsPrecision && selectedActionData.precisions && (
                        <div>
                            <label className="block text-xs text-gray-400 mb-2">Précisions (optionnel)</label>
                            <div className="flex flex-wrap gap-2">
                                {selectedActionData.precisions.map((precision, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => togglePrecisionInStep(precision)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${selectedPrecisions.includes(precision)
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        {precision}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ingrédients concernés */}
                    {ingredients.length > 0 && (
                        <div>
                            <label className="block text-xs text-gray-400 mb-2">
                                Ingrédients concernés (optionnel)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {ingredients.map((ing) => (
                                    <button
                                        key={ing.id}
                                        type="button"
                                        onClick={() => toggleIngredientInStep(ing.id)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${selectedIngredients.includes(ing.id)
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        {ing.type === 'cannabis' && '🌿 '}
                                        {ing.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bouton Ajouter Étape */}
                    <button
                        type="button"
                        onClick={addProtocolStep}
                        disabled={!selectedActionData && !customAction}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        ➕ Ajouter l'étape
                    </button>
                </div>

                {/* Liste des étapes - AFFICHAGE STRUCTURÉ */}
                {protocol.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <div className="text-xs text-gray-400 font-medium mb-2">
                            Étapes du protocole ({protocol.length})
                        </div>
                        {protocol.map((step, index) => (
                            <div key={step.id} className="bg-gray-700/30 rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        {/* Titre de l'étape */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg font-bold text-green-400">{index + 1}.</span>
                                            <span className="text-white text-sm font-medium">{step.action}</span>
                                            {step.category && (
                                                <span className={`text-xs px-2 py-0.5 rounded ${step.category === 'cannabis' ? 'bg-green-600/30 text-green-300' :
                                                        step.category === 'temperature' ? 'bg-orange-600/30 text-orange-300' :
                                                            step.category === 'cuisson' ? 'bg-red-600/30 text-red-300' :
                                                                step.category === 'melange' ? 'bg-blue-600/30 text-blue-300' :
                                                                    step.category === 'refroidissement' ? 'bg-cyan-600/30 text-cyan-300' :
                                                                        'bg-gray-600/30 text-gray-300'
                                                    }`}>
                                                    {step.category}
                                                </span>
                                            )}
                                        </div>

                                        {/* Paramètres structurés */}
                                        <div className="ml-7 space-y-1">
                                            {step.temperature && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-orange-400">🌡️</span>
                                                    <span className="text-white font-medium">{step.temperature}°C</span>
                                                </div>
                                            )}
                                            {step.duration && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-blue-400">⏱️</span>
                                                    <span className="text-white font-medium">{step.duration} minutes</span>
                                                </div>
                                            )}
                                            {step.precisions && step.precisions.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-1">
                                                    <span className="text-purple-400 text-xs">ℹ️</span>
                                                    {step.precisions.map((prec, idx) => (
                                                        <span key={idx} className="text-xs px-2 py-0.5 bg-purple-600/20 text-purple-300 rounded">
                                                            {prec}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {step.ingredients && step.ingredients.length > 0 && (
                                                <div className="flex flex-wrap items-center gap-1 mt-1">
                                                    <span className="text-green-400 text-xs">🥘</span>
                                                    {step.ingredients.map(ingId => {
                                                        const ing = ingredients.find(i => i.id === ingId);
                                                        return ing ? (
                                                            <span key={ingId} className="text-xs px-2 py-0.5 bg-gray-800 rounded text-gray-300">
                                                                {ing.type === 'cannabis' && '🌿 '}{ing.name}
                                                            </span>
                                                        ) : null;
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 ml-2">
                                        <button
                                            type="button"
                                            onClick={() => moveProtocolStep(index, 'up')}
                                            disabled={index === 0}
                                            className="px-2 py-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                                            title="Monter"
                                        >
                                            ↑
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveProtocolStep(index, 'down')}
                                            disabled={index === protocol.length - 1}
                                            className="px-2 py-1 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-xs"
                                            title="Descendre"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeProtocolStep(step.id)}
                                            className="px-2 py-1 text-red-400 hover:text-red-300 text-xs"
                                            title="Supprimer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

RecipeSection.propTypes = {
    value: PropTypes.shape({
        ingredients: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string,
            type: PropTypes.oneOf(['standard', 'cannabis']),
            name: PropTypes.string,
            quantity: PropTypes.string,
            unit: PropTypes.string,
            // Cannabis specific
            source: PropTypes.oneOf(['new', 'library']),
            reviewId: PropTypes.string,
            cannabisType: PropTypes.string,
            cultivars: PropTypes.string,
            breeder: PropTypes.string
        })),
        protocol: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string,
            action: PropTypes.string,
            category: PropTypes.string,
            temperature: PropTypes.string,      // Température en °C
            duration: PropTypes.string,         // Durée en minutes
            precisions: PropTypes.arrayOf(PropTypes.string), // Précisions structurées
            ingredients: PropTypes.arrayOf(PropTypes.string) // IDs des ingrédients
        }))
    }),
    onChange: PropTypes.func.isRequired
};

export default RecipeSection;
