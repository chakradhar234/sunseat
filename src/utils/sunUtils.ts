import SunCalc from 'suncalc'

export interface MoonInfo {
  azimuth: number
  altitude: number
  illumination: number
  phaseName: string
}

function phaseNameFromPhase(phase: number): string {
  const p = ((phase % 1) + 1) % 1
  if (p < 0.03 || p > 0.97) return 'New moon'
  if (p < 0.22) return 'Waxing crescent'
  if (p < 0.28) return 'First quarter'
  if (p < 0.47) return 'Waxing gibbous'
  if (p < 0.53) return 'Full moon'
  if (p < 0.72) return 'Waning gibbous'
  if (p < 0.78) return 'Last quarter'
  return 'Waning crescent'
}

export function getMoonInfo(date: Date, lat: number, lon: number): MoonInfo {
  const moonPosition = SunCalc.getMoonPosition(date, lat, lon)
  const azimuthDegrees = (moonPosition.azimuth * 180) / Math.PI
  const azimuth = (azimuthDegrees + 180 + 360) % 360
  const altitude = (moonPosition.altitude * 180) / Math.PI
  const { fraction, phase } = SunCalc.getMoonIllumination(date)
  return {
    azimuth,
    altitude,
    illumination: Math.round(fraction * 100),
    phaseName: phaseNameFromPhase(phase),
  }
}

export function getSunAzimuth(lat: number, lon: number, date: Date): number {
  const sunPosition = SunCalc.getPosition(date, lat, lon)
  const azimuthDegrees = (sunPosition.azimuth * 180) / Math.PI
  return (azimuthDegrees + 180 + 360) % 360
}

export function getSunIntensity(date: Date, lat: number, lon: number): string {
  const sunPosition = SunCalc.getPosition(date, lat, lon)
  const altitudeDeg = (sunPosition.altitude * 180) / Math.PI
  if (altitudeDeg < 0) return 'No sun (night time)'
  if (altitudeDeg < 15) return 'Mild (sun is low)'
  if (altitudeDeg < 45) return 'Moderate'
  return 'Harsh (sun is high)'
}