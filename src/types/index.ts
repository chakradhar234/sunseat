export interface Location {
  name: string
  lat: number
  lon: number
}

export interface RouteFormData {
  fromCity: string
  toCity: string
  date: string
  time: string
}

export interface SunResult {
  sitSide: 'LEFT' | 'RIGHT'
  sunAzimuth: number
  travelBearing: number
  fromLocation: Location
  toLocation: Location
}