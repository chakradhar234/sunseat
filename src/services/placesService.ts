import type { Place, RoutePoint } from '../types'
import { computePlaceSide, findNearestPointOnRoute } from '../utils/routeUtils'

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
] as const

const SAMPLE_COUNT = 20
const AROUND_RADIUS_M = 3000
const MAX_PLACES = 15
const REQUEST_TIMEOUT_MS = 15000

export interface PlacesAlongRouteResult {
  places: Place[]
  failed: boolean
}

interface OverpassElement {
  type: string
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

interface ScoredCandidate {
  element: OverpassElement
  score: number
}

const placesCache = new Map<string, PlacesAlongRouteResult>()

function routeCacheKey(routePoints: RoutePoint[]): string {
  const [startLat, startLon] = routePoints[0]
  const [endLat, endLon] = routePoints[routePoints.length - 1]
  return `${startLat.toFixed(4)},${startLon.toFixed(4)}-${endLat.toFixed(4)},${endLon.toFixed(4)}`
}

function simplifyRoute(routePoints: RoutePoint[], targetCount: number): RoutePoint[] {
  if (routePoints.length <= targetCount) {
    return routePoints
  }
  const result: RoutePoint[] = []
  const step = (routePoints.length - 1) / (targetCount - 1)
  for (let i = 0; i < targetCount; i++) {
    result.push(routePoints[Math.round(i * step)])
  }
  return result
}

function buildOverpassQuery(samplePoints: RoutePoint[]): string {
  const filters: string[] = []
  for (const [lat, lon] of samplePoints) {
    const around = `(around:${AROUND_RADIUS_M},${lat},${lon})`
    for (const kind of ['node', 'way'] as const) {
      filters.push(`${kind}${around}[name][tourism=attraction];`)
      filters.push(`${kind}${around}[name][tourism=viewpoint];`)
      filters.push(`${kind}${around}[name][historic];`)
      filters.push(`${kind}${around}[name][amenity=place_of_worship][wikidata];`)
      filters.push(`${kind}${around}[name][amenity=place_of_worship][wikipedia];`)
      filters.push(`${kind}${around}[name][amenity=place_of_worship][heritage];`)
    }
  }
  return `[out:json][timeout:25];(\n${filters.join('\n')}\n);out center tags;`
}

function elementCoordinates(element: OverpassElement): { lat: number; lon: number } | null {
  if (element.lat !== undefined && element.lon !== undefined) {
    return { lat: element.lat, lon: element.lon }
  }
  if (element.center) {
    return { lat: element.center.lat, lon: element.center.lon }
  }
  return null
}

function elementCategory(tags: Record<string, string>): string {
  if (tags.tourism) {
    return tags.tourism
  }
  if (tags.historic) {
    return tags.historic
  }
  if (tags.amenity) {
    return tags.amenity
  }
  return 'place'
}

function scoreElement(tags: Record<string, string>): number {
  let score = 0
  if (tags.wikidata) {
    score += 3
  }
  if (tags.wikipedia) {
    score += 2
  }
  if (tags.tourism === 'attraction') {
    score += 2
  }
  if (tags.tourism === 'viewpoint') {
    score += 2
  }
  if (tags.historic) {
    score += 1
  }
  return score
}

function shouldRetryStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504
}

async function fetchOverpassElements(query: string): Promise<OverpassElement[] | null> {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (shouldRetryStatus(response.status)) {
        continue
      }
      if (!response.ok) {
        continue
      }

      const data = (await response.json()) as { elements?: OverpassElement[] }
      const elements = data.elements ?? []
      console.log(`Overpass ${endpoint} returned ${elements.length} elements`)
      return elements
    } catch {
      clearTimeout(timeoutId)
      continue
    }
  }
  return null
}

function elementsToPlaces(routePoints: RoutePoint[], elements: OverpassElement[]): Place[] {
  const seen = new Set<string>()
  const candidates: ScoredCandidate[] = []

  for (const element of elements) {
    const name = element.tags?.name?.trim()
    if (!name) {
      continue
    }
    const coords = elementCoordinates(element)
    if (!coords) {
      continue
    }

    const dedupeKey = `${element.type}/${element.id}`
    if (seen.has(dedupeKey)) {
      continue
    }
    seen.add(dedupeKey)

    const tags = element.tags ?? {}
    candidates.push({ element, score: scoreElement(tags) })
  }

  candidates.sort((a, b) => b.score - a.score)
  const top = candidates.slice(0, MAX_PLACES)

  const places: Place[] = top.map(({ element }) => {
    const name = element.tags!.name!.trim()
    const coords = elementCoordinates(element)!
    const tags = element.tags ?? {}
    const nearest = findNearestPointOnRoute(routePoints, coords.lat, coords.lon)
    const side = computePlaceSide(routePoints, nearest.index, coords.lat, coords.lon)
    return {
      name,
      lat: coords.lat,
      lon: coords.lon,
      category: elementCategory(tags),
      distanceFromStartKm: nearest.distanceFromStartKm,
      distanceOffRouteKm: nearest.distanceOffRouteKm,
      side,
    }
  })

  places.sort((a, b) => a.distanceFromStartKm - b.distanceFromStartKm)
  return places
}

export async function getPlacesAlongRoute(
  routePoints: RoutePoint[],
  bypassCache = false
): Promise<PlacesAlongRouteResult> {
  if (routePoints.length === 0) {
    return { places: [], failed: false }
  }

  const cacheKey = routeCacheKey(routePoints)
  if (!bypassCache && placesCache.has(cacheKey)) {
    return placesCache.get(cacheKey)!
  }

  const samplePoints = simplifyRoute(routePoints, SAMPLE_COUNT)
  const query = buildOverpassQuery(samplePoints)
  const elements = await fetchOverpassElements(query)

  if (elements === null) {
    return { places: [], failed: true }
  }

  const places = elementsToPlaces(routePoints, elements)
  const result: PlacesAlongRouteResult = { places, failed: false }
  placesCache.set(cacheKey, result)
  return result
}
