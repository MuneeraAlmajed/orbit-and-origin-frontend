
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api/v1'

async function request(path, signal) {
  const response = await fetch(`${API_BASE}${path}`, {
    signal,
  })

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`)
  }

  return response.json()
}

function queryString(filters = {}) {
  const params = new URLSearchParams()

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value))
    }
  })

  const query = params.toString()
  return query ? `?${query}` : ''
}

export function getHazards(filters = {}, signal) {
  return request(`/hazards${queryString(filters)}`, signal)
}

export function getHazardById(id, signal) {
  return request(`/hazards/${encodeURIComponent(id)}`, signal)
}

export function getNearbyHazards(lat, lon, radius, signal) {
  return request(
    `/hazards/nearby${queryString({ lat, lon, radius })}`,
    signal,
  )
}

export function getSciencePois(filters = {}, signal) {
  return request(`/science-pois${queryString(filters)}`, signal)
}

export function getSciencePoiById(id, signal) {
  return request(`/science-pois/${encodeURIComponent(id)}`, signal)
}

export function getNearbySciencePois(lat, lon, radius, signal) {
  return request(
    `/science-pois/nearby${queryString({ lat, lon, radius })}`,
    signal,
  )
}

export function getTerrainRisks(signal) {
  return request('/hazards/terrain-risk', signal)
}
