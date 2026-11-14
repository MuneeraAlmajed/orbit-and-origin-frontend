
const API_BASE = (
    import.meta.env.VITE_API_BASE_URL ||
    'http://127.0.0.1:8001/api/v1'
  ).replace(/\/$/, '')
  
  async function request(path, options = {}) {
    let response
  
    try {
      response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })
    } catch {
      throw new Error(
        'Cannot connect to FastAPI. Check the backend server.'
      )
    }
  
    if (!response.ok) {
      const body = await response.json().catch(() => null)
      const detail = body?.detail
  
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? detail.map((item) => item.msg).join('; ')
            : `API request failed (${response.status})`
  
      throw new Error(message)
    }
  
    if (response.status === 204) return null
  
    return response.json()
  }
  
  export function createRoute(start, destination) {
    return request('/routes', {
      method: 'POST',
      body: JSON.stringify({ start, destination }),
    })
  }
  
  export function getRoute(routeId) {
    return request(`/routes/${encodeURIComponent(routeId)}`)
  }
  
  export function analyzeRoute(route) {
    return request('/routes/analyze', {
      method: 'POST',
      body: JSON.stringify({
        start: route.start,
        destination: route.destination,
        waypoints: route.waypoints,
      }),
    })
  }
  
  export function getRouteHazards(routeId) {
    return request(
      `/routes/${encodeURIComponent(routeId)}/hazards`
    )
  }
  
  export function getRouteTerrain(routeId) {
    return request(
      `/routes/${encodeURIComponent(routeId)}/terrain`
    )
  }
  
  export function deleteRoute(routeId) {
    return request(`/routes/${encodeURIComponent(routeId)}`, {
      method: 'DELETE',
    })
  }
  