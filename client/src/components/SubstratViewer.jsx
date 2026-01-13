import React from 'react';

const safeParse = (v) => {
    try {
        if (typeof v === 'string') return JSON.parse(v);
        return v;
    } catch (e) {
        return v;
    }
};

export default function SubstratViewer({ data }) {
    const parsed = safeParse(data) || data;
    if (!parsed) return null;

    if (Array.isArray(parsed)) {
        return (
            <div>
                <div className="text-sm text-gray-500">Substrat</div>
                <ul className="list-disc pl-5 mt-2">
                    {parsed.map((p, i) => <li key={i} className="text-sm text-gray-700">{typeof p === 'object' ? (p.name || JSON.stringify(p)) : p}</li>)}
                </ul>
            </div>
        );
    }

    // object -> show key/values
    if (typeof parsed === 'object') {
        return (
            <div>
                <div className="text-sm text-gray-500">Substrat</div>
                <div className="mt-2 space-y-1">
                    {Object.entries(parsed).map(([k, v]) => <div key={k} className="text-sm text-gray-700"><strong>{k}:</strong> {typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>)}
                </div>
            </div>
        );
    }

    return <div className="text-sm text-gray-700">{String(parsed)}</div>;
}
