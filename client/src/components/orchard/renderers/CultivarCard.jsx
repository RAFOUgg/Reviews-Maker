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

export default function CultivarCard({ data }) {
    const items = asArray(data);
    if (!items.length) return null;

    return (
        <div>
            <div className="text-sm text-gray-500">Cultivars</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
                {items.map((it, idx) => {
                    const obj = typeof it === 'object' ? it : { name: it };
                    return (
                        <div key={idx} className="p-3 rounded border bg-white/50">
                            <div className="font-semibold text-gray-800">{obj.name || obj.cultivar || obj.label}</div>
                            {obj.description && <div className="text-sm text-gray-600">{obj.description}</div>}
                            {obj.percentage && <div className="text-sm text-gray-500">{obj.percentage}%</div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
