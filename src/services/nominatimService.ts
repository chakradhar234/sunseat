import type { Location } from '../types'

export async function getCoordinates(cityName: string): Promise<Location> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
  const response = await fetch(url, {
    headers: { 'User-Agent': 'SunSeatPlanner/1.0' }
  })
  const data = await response.json()
  if (!data || data.length === 0) {
    throw new Error(`City not found: ${cityName}`)
  }
  return {
    name: cityName,
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  }
}