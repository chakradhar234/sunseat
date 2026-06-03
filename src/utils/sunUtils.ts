import SunCalc from 'suncalc'

export function getSunAzimuth(lat: number, lon: number, date: Date): number {
  const sunPosition = SunCalc.getPosition(date, lat, lon)
  const azimuthDegrees = (sunPosition.azimuth * 180) / Math.PI
  return (azimuthDegrees + 360) % 360
}

export function getSunIntensity(date: Date, lat: number, lon: number): string {
  const sunPosition = SunCalc.getPosition(date, lat, lon)
  const altitudeDeg = (sunPosition.altitude * 180) / Math.PI
  if (altitudeDeg < 0) return 'No sun (night time)'
  if (altitudeDeg < 15) return 'Mild (sun is low)'
  if (altitudeDeg < 45) return 'Moderate'
  return 'Harsh (sun is high)'
}