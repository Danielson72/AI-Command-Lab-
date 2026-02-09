const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function fetchAPI(path: string, init?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, init)
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`)
  return res.json()
}
