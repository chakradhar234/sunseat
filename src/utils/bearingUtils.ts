import type { SunResult, Location } from '../types'
import { getSunAzimuth, getSunIntensity } from './sunUtils'
import { getRouteBearing } from '../services/osrmService'

export async function calculateSeatSide(from: Location, to: Location, travelDate: Date): Promise<SunResult> {
  const travelBearing = await getRouteBearing(from, to)
  const sunAzimuth = getSunAzimuth(from.lat, from.lon, travelDate)
  const relative = (sunAzimuth - travelBearing + 360) % 360
  const sitSide = relative < 180 ? 'LEFT' : 'RIGHT'
  return { sitSide, sunAzimuth, travelBearing, fromLocation: from, toLocation: to }
}

export function getBearingLabel(bearing: number): string {
  const directions = ['North','North-East','East','South-East','South','South-West','West','North-West']
  const index = Math.round(bearing / 45) % 8
  return directions[index]
}

export { getSunIntensity }