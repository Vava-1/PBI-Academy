const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

function getToken() {
  return localStorage.getItem('pbi_token')
}

async function request(path: string, options: RequestInit = {}) {
  const url = `${API_BASE}${path}`
  console.log('API Request:', { method: options.method || 'GET', url, path })
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  try {
    const res = await fetch(url, { ...options, headers })
    console.log('API Response status:', res.status, res.statusText)
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }))
      console.error('API Error:', err)
      throw new Error(err.error || `HTTP ${res.status}`)
    }
    
    const data = await res.json()
    console.log('API Response data:', data)
    return data
  } catch (error) {
    console.error('API Request failed:', error)
    throw error
  }
}

export const api = {
  get: (path: string) => request(path, { method: 'GET' }),
  post: (path: string, body: unknown) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path: string, body: unknown) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
}
