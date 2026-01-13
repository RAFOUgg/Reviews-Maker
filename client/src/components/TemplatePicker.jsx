import React, { useEffect, useState } from 'react'
import { listTemplates, copyTemplate } from '../../lib/templateApi'

export default function TemplatePicker({ onSelect }) {
  const [templates, setTemplates] = useState([])
  useEffect(() => {
    listTemplates(false).then(setTemplates).catch(() => setTemplates([]))
  }, [])

  return (
    <div className="template-picker">
      <h3>Templates</h3>
      <div className="templates-list">
        {templates.map(t => (
          <div key={t.id} className="template-card">
            <div className="template-meta">
              <strong>{t.name}</strong>
              <p>{t.description}</p>
            </div>
            <div className="template-actions">
              <button onClick={() => onSelect(t)}>Use</button>
              <button onClick={async () => { await copyTemplate(t.id); alert('Copied to your templates') }}>Copy</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

