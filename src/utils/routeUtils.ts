import type { RoutePoint } from '../types'

const EARTH_RADIUS_KM = 6371

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a))
}

function bearingDegrees(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLon = toRad(lon2 - lon1)
  const lat1Rad = toRad(lat1)
  const lat2Rad = toRad(lat2)
  const y = Math.sin(dLon) * Math.cos(lat2Rad)
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon)
  return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360
}

function closestPointOnSegment(
  placeLat: number,
  placeLon: number,
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number
): { lat: number; lon: number; t: number; distanceKm: number } {
  const dx = bLon - aLon
  const dy = bLat - aLat
  if (dx === 0 && dy === 0) {
    return {
      lat: aLat,
      lon: aLon,
      t: 0,
      distanceKm: haversineKm(placeLat, placeLon, aLat, aLon),
    }
  }
  let t = ((placeLon - aLon) * dx + (placeLat - aLat) * dy) / (dx * dx + dy * dy)
  t = Math.max(0, Math.min(1, t))
  const lat = aLat + t * dy
  const lon = aLon + t * dx
  return { lat, lon, t, distanceKm: haversineKm(placeLat, placeLon, lat, lon) }
}

export interface NearestOnRouteResult {
  index: number
  distanceOffRouteKm: number
  distanceFromStartKm: number
}

export function findNearestPointOnRoute(
  routePoints: RoutePoint[],
  placeLat: number,
  placeLon: number
): NearestOnRouteResult {
  if (routePoints.length === 0) {
    return { index: 0, distanceOffRouteKm: 0, distanceFromStartKm: 0 }
  }
  if (routePoints.length === 1) {
    return {
      index: 0,
      distanceOffRouteKm: haversineKm(placeLat, placeLon, routePoints[0][0], routePoints[0][1]),
      distanceFromStartKm: 0,
    }
  }

  let best: NearestOnRouteResult = {
    index: 0,
    distanceOffRouteKm: Number.POSITIVE_INFINITY,
    distanceFromStartKm: 0,
  }

  let cumulative = 0
  for (let i = 0; i < routePoints.length - 1; i++) {
    const [aLat, aLon] = routePoints[i]
    const [bLat, bLon] = routePoints[i + 1]
    const segLen = haversineKm(aLat, aLon, bLat, bLon)
    const closest = closestPointOnSegment(placeLat, placeLon, aLat, aLon, bLat, bLon)
    if (closest.distanceKm < best.distanceOffRouteKm) {
      best = {
        index: i,
        distanceOffRouteKm: closest.distanceKm,
        distanceFromStartKm: cumulative + segLen * closest.t,
      }
    }
    cumulative += segLen
  }

  return best
}

export function computePlaceSide(
  routePoints: RoutePoint[],
  segmentIndex: number,
  placeLat: number,
  placeLon: number
): 'LEFT' | 'RIGHT' {
  const idx = Math.min(Math.max(segmentIndex, 0), routePoints.length - 2)
  const [aLat, aLon] = routePoints[idx]
  const [bLat, bLon] = routePoints[idx + 1]
  const routeBearing = bearingDegrees(aLat, aLon, bLat, bLon)
  const onRoute = closestPointOnSegment(placeLat, placeLon, aLat, aLon, bLat, bLon)
  const placeBearing = bearingDegrees(onRoute.lat, onRoute.lon, placeLat, placeLon)
  const relative = (placeBearing - routeBearing + 360) % 360
  return relative < 180 ? 'RIGHT' : 'LEFT'
}
