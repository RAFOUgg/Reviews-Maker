import PropTypes from 'prop-types';
import FieldRenderer from '../FieldRendererClean';
import { DRAGGABLE_FIELDS } from '../ContentPanel';

export default function CustomTemplate({ config, reviewData, dimensions }) {
    const { moduleOrder = [], contentModules = {}, typography = {}, colors = {} } = config;

    return (
        <div style={{ width: dimensions.width, height: dimensions.height, background: colors.background, fontFamily: typography.fontFamily, position: 'relative' }} className="p-6">
            <div className="grid grid-cols-12 gap-4">
                {moduleOrder.map((m) => {
                    if (!contentModules[m]) return null;
                    // Basic mapping
                    switch (m) {
                        case 'title':
                            return <h1 key={m} className="col-span-12" style={{ color: colors.title, fontSize: typography.titleSize }}>{reviewData.title}</h1>
                        case 'rating':
                            return <div key={m} className="col-span-12" style={{ color: colors.accent }}>{reviewData.rating}/5</div>
                        case 'image':
                            return (<div key={m} className="col-span-4"><img src={reviewData.imageUrl} alt="image" className="w-full rounded-lg" /></div>);
                        default:
                            return <div key={m} className="col-span-12 text-sm text-white/80">{String(reviewData[m] || '')}</div>
                    }
                })}
            </div>

            {/* Branding placeholder */}
            {config.branding?.enabled && config.branding?.logoUrl && (
                <div className="absolute" style={{ right: 16, bottom: 16, opacity: config.branding.opacity }}>
                    <img src={config.branding.logoUrl} alt="logo" className="w-12 h-12 object-contain orchard-branding" />
                </div>
            )}
            {/* Render any saved custom layout overlays */}
            {renderCustomLayout(reviewData?.orchardCustomLayout, reviewData)}
        </div>
    );
}

// If an orchard custom layout is present, try to render placed elements
function renderCustomLayout(layout, reviewData) {
    if (!layout) return null

    // layout can be a stringified JSON when coming from the server
    let parsed = layout
    try {
        if (typeof layout === 'string') parsed = JSON.parse(layout)
    } catch (e) {
        parsed = layout
    }

    if (!Array.isArray(parsed)) return null

    const getFieldValue = (field) => {
        if (!reviewData) return null
        if (!field) return null

        if (field.id && field.id.includes('.')) {
            const parts = field.id.split('.')
            let value = reviewData
            for (const p of parts) {
                value = value?.[p]
            }
            return value
        }

        return reviewData[field.id]
    }

    return parsed.map((pl) => {
        // If this is a zone, render a container and the assigned fields
        if (pl.type === 'zone' || pl.zone === true) {
            return (
                <div key={pl.id} className="absolute" style={{ left: `${pl.position.x}%`, top: `${pl.position.y}%`, width: `${pl.width}%`, height: `${pl.height}%`, transform: `rotate(${pl.rotation}deg)` }}>
                    <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg bg-gray-900/20">
                        <div className="text-sm text-gray-300 mb-2">{pl.label || 'Zone'}</div>
                        {(pl.assignedFields || []).map(fid => {
                            const def = findFieldDef(fid);
                            const value = getFieldValue(def);
                            return (
                                <div key={`${pl.id}-${fid}`} className="mb-1 w-full">
                                    <FieldRenderer field={def} value={value} compact />
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        }
        const pos = pl.position || { x: 0, y: 0 }
        const width = pl.width || 20
        const height = pl.height || 10
        const rotation = pl.rotation || 0
        const field = pl

        return (
            <div
                key={pl.id}
                className="absolute"
                style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                    transform: `rotate(${rotation}deg)`,
                    pointerEvents: 'none'
                }}
            >
                <FieldRenderer field={field} value={getFieldValue(field)} compact />
            </div>
        )
    })
}

function findFieldDef(id) {
    for (const k in DRAGGABLE_FIELDS) {
        const arr = DRAGGABLE_FIELDS[k];
        if (!Array.isArray(arr)) continue;
        const found = arr.find(f => f.id === id);
        if (found) return found;
    }
    return { id, label: id, icon: '🔲', type: 'text' };
}

// getFieldValue() defined inside renderCustomLayout() uses reviewData for values

CustomTemplate.propTypes = {
    config: PropTypes.object.isRequired,
    reviewData: PropTypes.object.isRequired,
    dimensions: PropTypes.object.isRequired
};
