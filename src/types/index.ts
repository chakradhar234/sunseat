export type RoutePoint = [number, number]

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

export interface Place {
  name: string
  lat: number
  lon: number
  category: string
  distanceFromStartKm: number
  distanceOffRouteKm: number
  side: 'LEFT' | 'RIGHT'
}