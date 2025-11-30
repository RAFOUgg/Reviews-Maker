export const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export async function listTemplates(publicOnly = false) {
  const url = `${API_BASE}/templates${publicOnly ? '?publicOnly=true' : ''}`
  const res = await fetch(url, { credentials: 'include' })
  return res.json()
}

export async function getTemplate(id) {
  const res = await fetch(`${API_BASE}/templates/${id}`, { credentials: 'include' })
  return res.json()
}

export async function createTemplate(payload) {
  const res = await fetch(`${API_BASE}/templates`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  return res.json()
}

export async function copyTemplate(id) {
  const res = await fetch(`${API_BASE}/templates/${id}/copy`, { method: 'POST', credentials: 'include' })
  return res.json()
}
