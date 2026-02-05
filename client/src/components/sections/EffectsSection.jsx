export { default } from './EffectsSectionImpl';

                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">⏱️ Durée des effets</label>
                    <div className="flex gap-2 items-center">
                        <input type="number" min="0" max="23" value={dureeEffetsHeures} onChange={(e) => setDureeEffetsHeures(e.target.value)} placeholder="HH" className="w-16 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-center" />
                        <span className="text-white/40 py-2">:</span>
                        <input type="number" min="0" max="59" value={dureeEffetsMinutes} onChange={(e) => setDureeEffetsMinutes(e.target.value)} placeholder="MM" className="w-16 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 outline-none text-center" />
                    </div>
                </div>
            </div>

            {/* Début & Durée catégorie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">🚀 Début des effets</label>
                    <select value={debutEffets} onChange={(e) => setDebutEffets(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 outline-none">
                        <option value="" className="bg-gray-900">Sélectionner...</option>
                        {EXPERIENCE_VALUES.debutEffets.map(d => (
                            <option key={d.value} value={d.value} className="bg-gray-900">{d.label}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">⏰ Catégorie durée</label>
                    <select value={dureeEffetsCategorie} onChange={(e) => setDureeEffetsCategorie(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-cyan-500/50 outline-none">
                        {EXPERIENCE_VALUES.dureeEffets.map(d => (
                            <option key={d.value} value={d.value} className="bg-gray-900">{d.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Effets secondaires */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-white/80">Effets secondaires (max 10)</label>
                <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_VALUES.effetsSecondaires.map(e => (
                        <LiquidChip
                            key={e.value}
                            active={effetsSecondaires.includes(e.value)}
                            color="amber"
                            onClick={() => toggleMultiSelect('effetsSecondaires', e.value)}
                            size="sm"
                        >
                            {e.label}
                        </LiquidChip>
                    ))}
                </div>
            </div>

            {/* Usages préférés */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-white/80">Usages préférés (max 10)</label>
                <div className="flex flex-wrap gap-2">
                    {EXPERIENCE_VALUES.usagesPreferes.map(u => (
                        <LiquidChip
                            key={u.value}
                            active={usagesPreferes.includes(u.value)}
                            color="purple"
                            onClick={() => toggleMultiSelect('usagesPreferes', u.value)}
                            size="sm"
                        >
                            {u.label}
                        </LiquidChip>
                    ))}
                </div>
            </div>
        </div>
    )}
</div>

        </LiquidCard >
    );
}





