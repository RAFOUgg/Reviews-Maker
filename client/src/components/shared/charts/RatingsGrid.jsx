import React from 'react';

const safeParse = (v) => {
    try {
        if (typeof v === 'string') return JSON.parse(v);
        return v;
    } catch (e) {
        return v;
    }
};

export default function RatingsGrid({ data }) {
    const parsed = safeParse(data) || data;
    if (!parsed) return null;

    // expect object with keys -> numeric
    const entries = typeof parsed === 'object' && !Array.isArray(parsed) ? Object.entries(parsed) : [];
    if (!entries.length) return null;

    return (
        <div>
            <div className="text-sm text-gray-500">Notes par catégorie</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
                {entries.map(([k, v]) => (
                    <div key={k} className="p-2 rounded border bg-white/50">
                        <div className="text-sm text-gray-600">{k}</div>
                        <div className="font-semibold text-gray-800">{parseFloat(v).toFixed ? parseFloat(v).toFixed(1) : String(v)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}


