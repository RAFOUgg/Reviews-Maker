import React, { useState } from 'react'
import TemplatePicker from '../../components/gallery/TemplatePicker'
import TemplatePreview from '../../components/gallery/TemplatePreview'

export default function TemplatesDemo({ reviewData = null }) {
    const [selected, setSelected] = useState(null)
    // sample review data if not provided
    const sample = reviewData || { holderName: 'Sample bud', mainImageUrl: '/images/review-1764349708220-429115255.jpg' }

    return (
        <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ width: 360 }}>
                <TemplatePicker onSelect={t => setSelected(t)} />
            </div>
            <div style={{ flex: 1 }}>
                <TemplatePreview template={selected} reviewData={sample} />
            </div>
        </div>
    )
}
