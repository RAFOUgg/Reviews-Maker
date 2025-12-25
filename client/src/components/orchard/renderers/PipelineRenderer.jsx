import React from 'react';

const safeParse = (v) => {
    try {
        if (typeof v === 'string') return JSON.parse(v);
        return v;
    } catch (e) {
        return v;
    }
};

const asArray = (v) => {
    const p = safeParse(v);
    if (!p) return [];
    if (Array.isArray(p)) return p;
    return [p];
};

export default function PipelineRenderer({ data, style = {} }) {
    const steps = asArray(data);
    if (!steps.length) return null;

    return (
        <div className="space-y-2">
            <div className="text-sm text-gray-500">Plan / Pipeline</div>
            <ol className="list-decimal pl-5">
                {steps.map((s, i) => {
                    const step = typeof s === 'object' ? s : { label: s };
                    return (
                        <li key={i} className="mb-2">
                            <div className="font-medium text-gray-800">{step.label || step.name || `Étape ${i + 1}`}</div>
                            {step.details && <div className="text-sm text-gray-600">{typeof step.details === 'object' ? JSON.stringify(step.details) : step.details}</div>}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
