import type { Location, RoutePoint } from '../types'

export async function getRouteGeometry(from: Location, to: Location): Promise<RoutePoint[]> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`
  const response = await fetch(url)
  const data = await response.json()
  if (!data.routes || data.routes.length === 0) {
    throw new Error('Route not found between these cities')
  }
  const coordinates: [number, number][] = data.routes[0].geometry.coordinates
  return coordinates.map(([lon, lat]) => [lat, lon])
}

export async function getRouteBearing(from: Location, to: Location): Promise<number> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=false`
  const response = await fetch(url)
  const data = await response.json()
  if (!data.routes || data.routes.length === 0) {
    throw new Error('Route not found between these cities')
  }
  return calculateBearing(from.lat, from.lon, to.lat, to.lon)
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLon = toRad(lon2 - lon1)
  const lat1Rad = toRad(lat1)
  const lat2Rad = toRad(lat2)
  const y = Math.sin(dLon) * Math.cos(lat2Rad)
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon)
  const bearing = (Math.atan2(y, x) * 180) / Math.PI
  return (bearing + 360) % 360
}