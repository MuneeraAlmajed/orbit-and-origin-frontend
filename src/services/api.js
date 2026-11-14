
const API_URL = 'http://127.0.0.1:8000/api/v1/mars'

async function fetchData(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`)

  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }

  return response.json()
}

export function getMarsMap() {
  return fetchData('/map')
}

export function getTerrainLayers() {
  return fetchData('/layers')
}

export function getTerrainLayer(layerId) {
  return fetchData(`/layers/${layerId}`)
}

export function getMarsTerrain(lat, lon) {
  return fetchData(`/terrain?lat=${lat}&lon=${lon}`)
}

export function getMarsImagery(lat, lon) {
  return fetchData(`/imagery?lat=${lat}&lon=${lon}`)
}

export function getTerrainGrid() {
  return fetchData('/terrain/grid')
}