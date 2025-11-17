import PropTypes from 'prop-types';

export default function CustomTemplate({ config, reviewData, dimensions }) {
    const { moduleOrder = [], contentModules = {}, typography = {}, colors = {} } = config;

    return (
        <div style={{ width: dimensions.width, height: dimensions.height, background: colors.background, fontFamily: typography.fontFamily }} className="p-6">
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
        </div>
    );
}

CustomTemplate.propTypes = {
    config: PropTypes.object.isRequired,
    reviewData: PropTypes.object.isRequired,
    dimensions: PropTypes.object.isRequired
};
