
const API_URL = 'http://127.0.0.1:8001/api/v1/mars'

async function fetchData(endpoint) {
  const response = await fetch(`${API_URL}${endpoint}`)

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`API Error ${response.status}: ${message}`)
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


export function get3DTerrain() {
  return fetchData('/terrain/3d')
}