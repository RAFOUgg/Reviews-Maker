import React from 'react';
import { Handle, Position } from 'reactflow';
import { Leaf, AlertCircle } from 'lucide-react';

/**
 * PhenoNode - Nœud personnalisé pour l'arbre généalogique
 */
export default function PhenoNode({ data, selected, isConnecting }) {
    return (
        <div className={`
            relative px-4 py-3 rounded-xl border-2 transition-all duration-200
            ${selected
                ? 'border-emerald-400 shadow-lg shadow-emerald-500/50 scale-110'
                : 'border-emerald-500/30 shadow-md'
            }
            ${isConnecting
                ? 'opacity-50'
                : 'opacity-100'
            }
            bg-gradient-to-br from-emerald-950/80 to-slate-900/80 backdrop-blur-sm
            hover:border-emerald-400/80 hover:shadow-lg hover:shadow-emerald-500/30
            min-w-[200px] cursor-grab active:cursor-grabbing
        `}>
            {/* Input Handles */}
            <Handle
                type="target"
                position={Position.Top}
                style={{
                    background: selected ? '#10b981' : '#059669',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    border: '2px solid #0f172a'
                }}
            />

            {/* Content */}
            <div className="space-y-2">
                {/* Header */}
                <div className="flex items-start gap-2">
                    <Leaf className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">
                            {data.cultivarName || 'Cultivar'}
                        </h3>
                    </div>
                </div>

                {/* Pheno Code */}
                <div className="px-2 py-1 bg-emerald-900/40 rounded border border-emerald-500/20">
                    <p className="text-xs font-mono text-emerald-300">
                        {data.phenoCode?.substring(0, 12)}
                        {data.phenoCode?.length > 12 ? '...' : ''}
                    </p>
                </div>

                {/* Genetics Info */}
                {data.genetics?.type && (
                    <div className="flex items-center gap-1 text-xs text-slate-300">
                        <span className="text-emerald-400">📊</span>
                        <span className="capitalize">{data.genetics.type}</span>
                    </div>
                )}

                {/* Metadata */}
                {data.metadata?.notes && (
                    <p className="text-xs text-slate-400 italic line-clamp-2">
                        "{data.metadata.notes}"
                    </p>
                )}

                {/* Created Date */}
                {data.metadata?.createdAt && (
                    <p className="text-xs text-slate-500">
                        {new Date(data.metadata.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                )}
            </div>

            {/* Output Handles */}
            <Handle
                type="source"
                position={Position.Bottom}
                style={{
                    background: selected ? '#10b981' : '#059669',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    border: '2px solid #0f172a'
                }}
            />

            {/* Selection Indicator */}
            {selected && (
                <div className="absolute -inset-1 border-2 border-emerald-400 rounded-xl pointer-events-none animate-pulse" />
            )}
        </div>
    );
}
