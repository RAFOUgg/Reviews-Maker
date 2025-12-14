import React from 'react'
import LiquidCard from '../../../components/LiquidCard'

export default function Genetiques({ formData, handleChange }) {
    return (
        <LiquidCard title="🧬 Génétiques" bordered>
            <div className="space-y-4">
                {/* Breeder */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Breeder de la graine
                    </label>
                    <input
                        type="text"
                        value={formData.breeder || ''}
                        onChange={(e) => handleChange('breeder', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Nom du breeder"
                    />
                </div>

                {/* Variété */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Variété
                    </label>
                    <input
                        type="text"
                        value={formData.variete || ''}
                        onChange={(e) => handleChange('variete', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Nom de la variété"
                        list="varietes-list"
                    />
                    <datalist id="varietes-list">
                        {/* TODO: Load from API */}
                    </datalist>
                </div>

                {/* Généalogie */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Généalogie (parents)
                    </label>
                    <textarea
                        value={formData.genealogie || ''}
                        onChange={(e) => handleChange('genealogie', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Parents, lignée, phénotype..."
                        rows={3}
                    />
                </div>

                {/* Code phénotype */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Code phénotype / sélection
                    </label>
                    <input
                        type="text"
                        value={formData.phenotype || ''}
                        onChange={(e) => handleChange('phenotype', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: Pheno #3"
                    />
                </div>
            </div>
        </LiquidCard>
    )
}
