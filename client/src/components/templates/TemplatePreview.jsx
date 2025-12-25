import React from 'react'

export default function TemplatePreview({ template, reviewData }) {
  if (!template) return <div>No template selected</div>

  // template.config may be a JSON string (server fallback) or object
  const config = typeof template.config === 'string' ? JSON.parse(template.config || '{}') : template.config

  // Basic render: first page, render zones absolutely positioned
  const page = (config.pages && config.pages[0]) || { zones: [] }

  return (
    <div className="template-preview" style={{ position: 'relative', width: 800, height: 1100, border: '1px solid #eee' }}>
      {page.zones.map(z => {
        const key = z.id || z.name
        let content = ''
        if (z.source && reviewData) {
          // naive source resolver: supports 'holderName' and 'images[0]'
          if (z.source === 'holderName') content = reviewData.holderName || ''
          if (z.source === 'images[0]') {
            const imgSrc = reviewData.thumbnailUrl || reviewData.mainImageUrl
            content = imgSrc ? <img loading="lazy" decoding="async" src={imgSrc} alt="main" style={{ maxWidth: '100%', height: 'auto' }} /> : null
          }
        }

        const style = {
          position: 'absolute', left: z.x || 0, top: z.y || 0, width: z.w || 200, height: z.h || 50,
          overflow: 'hidden', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(0,0,0,0.06)', padding: 6
        }
        return (
          <div key={key} style={style}>
            {typeof content === 'string' ? <div>{content}</div> : content}
          </div>
        )
      })}
    </div>
  )
}
