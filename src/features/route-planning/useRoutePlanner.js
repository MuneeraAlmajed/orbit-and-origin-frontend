
import { useEffect, useRef, useState } from 'react'
import {
  createRoute,
  getRoute,
  analyzeRoute,
  getRouteHazards,
  getRouteTerrain,
  deleteRoute,
} from './routePlanningApi'

function validPoint(point) {
  if (
    String(point.lat).trim() === '' ||
    String(point.lon).trim() === ''
  ) {
    throw new Error('Enter both latitude and longitude.')
  }

  const lat = Number(point.lat)
  const lon = Number(point.lon)

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 || lat > 90 ||
    lon < -180 || lon > 180
  ) {
    throw new Error('Enter valid latitude and longitude values.')
  }

  return { lat, lon }
}

export function useRoutePlanner() {
  const [start, setStart] = useState({
    lat: '18.35',
    lon: '77.60',
  })
  const [destination, setDestination] = useState({
    lat: '18.50',
    lon: '77.85',
  })

  const [pickMode, setPickMode] = useState(null)
  const [route, setRoute] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [hazardReport, setHazardReport] = useState(null)
  const [terrainReport, setTerrainReport] = useState(null)

  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reportWarnings, setReportWarnings] = useState([])

  const busyRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  function updatePoint(which, field, value) {
    const setter = which === 'start'
      ? setStart
      : setDestination

    setter((previous) => ({
      ...previous,
      [field]: value,
    }))
    setError('')
  }

  function fillFromSelected(which, point) {
    if (!point) return

    const lat = Number(point.lat)
    const lon = Number(point.lon)

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return
    }

    const setter = which === 'start'
      ? setStart
      : setDestination

    setter({
      lat: String(lat),
      lon: String(lon),
    })

    setPickMode(null)
    setNotice(`${which} selected from the Mars map.`)
  }

  function applyMapSelection(point) {
    if (pickMode === 'start' || pickMode === 'destination') {
      fillFromSelected(pickMode, point)
    }
  }

  function clearReports() {
    setAnalysis(null)
    setHazardReport(null)
    setTerrainReport(null)
    setReportWarnings([])
  }

  async function loadReports(activeRoute) {
    const results = await Promise.allSettled([
      analyzeRoute(activeRoute),
      getRouteHazards(activeRoute.id),
      getRouteTerrain(activeRoute.id),
    ])

    if (!mountedRef.current) return

    const [safety, hazards, terrain] = results
    const warnings = []

    if (safety.status === 'fulfilled') {
      setAnalysis(safety.value)
    } else {
      warnings.push(
        `Safety analysis unavailable: ${safety.reason?.message}`
      )
    }

    if (hazards.status === 'fulfilled') {
      setHazardReport(hazards.value)
    } else {
      warnings.push(
        `Hazard report unavailable: ${hazards.reason?.message}`
      )
    }

    if (terrain.status === 'fulfilled') {
      setTerrainReport(terrain.value)
    } else {
      warnings.push(
        `Terrain report unavailable: ${terrain.reason?.message}`
      )
    }

    setReportWarnings(warnings)
  }

  async function planRoute() {
    if (busyRef.current) return

    let from
    let to

    try {
      from = validPoint(start)
      to = validPoint(destination)

      if (from.lat === to.lat && from.lon === to.lon) {
        throw new Error('Start and destination must be different.')
      }
    } catch (err) {
      setError(err.message)
      return
    }

    busyRef.current = true
    setWorking(true)
    setError('')
    setNotice('')
    setPickMode(null)
    setRoute(null)
    clearReports()

    try {
      const created = await createRoute(from, to)

      if (created?.id == null) {
        throw new Error('Backend did not return a route ID.')
      }

      if (!mountedRef.current) return
      setRoute(created)

      let activeRoute = created

      try {
        activeRoute = await getRoute(created.id)
        if (mountedRef.current) setRoute(activeRoute)
      } catch {
        if (mountedRef.current) {
          setNotice('Route created using the initial response.')
        }
      }

      await loadReports(activeRoute)
    } catch (err) {
      if (mountedRef.current) setError(err.message)
    } finally {
      busyRef.current = false
      if (mountedRef.current) setWorking(false)
    }
  }

  async function loadSavedRoute(routeId) {
    if (busyRef.current) return

    const id = Number(routeId)

    if (!Number.isInteger(id) || id <= 0) {
      setError('Enter a valid route ID.')
      return
    }

    busyRef.current = true
    setWorking(true)
    setError('')
    setNotice('')
    clearReports()

    try {
      const saved = await getRoute(id)
      if (!mountedRef.current) return

      setRoute(saved)

      if (saved.start) {
        setStart({
          lat: String(saved.start.lat),
          lon: String(saved.start.lon),
        })
      }

      if (saved.destination) {
        setDestination({
          lat: String(saved.destination.lat),
          lon: String(saved.destination.lon),
        })
      }

      setNotice(`Loaded route #${id}.`)
      await loadReports(saved)
    } catch (err) {
      if (mountedRef.current) setError(err.message)
    } finally {
      busyRef.current = false
      if (mountedRef.current) setWorking(false)
    }
  }

  async function removeRoute() {
    if (busyRef.current || route?.id == null) return

    busyRef.current = true
    setWorking(true)
    setError('')

    try {
      await deleteRoute(route.id)

      if (!mountedRef.current) return

      setRoute(null)
      clearReports()
      setNotice('Route deleted successfully.')
    } catch (err) {
      if (mountedRef.current) setError(err.message)
    } finally {
      busyRef.current = false
      if (mountedRef.current) setWorking(false)
    }
  }

  return {
    start,
    destination,
    updatePoint,
    fillFromSelected,
    pickMode,
    setPickMode,
    applyMapSelection,
    route,
    analysis,
    hazardReport,
    terrainReport,
    working,
    error,
    notice,
    reportWarnings,
    planRoute,
    loadSavedRoute,
    removeRoute,
  }
}
