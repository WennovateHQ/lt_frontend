export interface Location {
  address: string
  city: string
  province: string
  postalCode?: string
  latitude?: number
  longitude?: number
  country: string
}

export interface LocationPreference {
  maxRadius: number // in kilometers
  preferredCities?: string[]
  workArrangement: 'remote' | 'hybrid' | 'onsite'
  hybridPercentage?: number // percentage of time on-site for hybrid
  travelWillingness?: number // max km willing to travel
}

export interface LocationMatchResult {
  distance: number // in kilometers
  matchScore: number // 0-100
  isWithinRadius: boolean
  travelTime?: number // estimated minutes
  transportationMode: 'driving' | 'transit' | 'walking'
  workArrangementCompatible: boolean
  recommendations: string[]
}

import { canadianCities, type CanadianCity } from '@/data/canadian-locations'

// Create a lookup map from the comprehensive Canadian cities data
const CANADIAN_CITIES_MAP = canadianCities.reduce((acc, city) => {
  const key = city.name.toLowerCase()
  acc[key] = {
    lat: 0, // Will need to be populated with actual coordinates
    lng: 0, // Will need to be populated with actual coordinates  
    population: city.population || 0,
    province: city.province,
    provinceCode: city.provinceCode
  }
  return acc
}, {} as Record<string, { lat: number; lng: number; population: number; province: string; provinceCode: string }>)

// BC Interior cities with approximate coordinates (keeping existing coordinates for now)
const BC_CITIES = {
  'kelowna': { lat: 49.8880, lng: -119.4960, population: 222748 },
  'kamloops': { lat: 50.6745, lng: -120.3273, population: 90280 },
  'penticton': { lat: 49.4991, lng: -119.5937, population: 33761 },
  'vernon': { lat: 50.2671, lng: -119.2720, population: 40116 },
  'cranbrook': { lat: 49.5956, lng: -115.7693, population: 20047 },
  'nelson': { lat: 49.4928, lng: -117.2948, population: 10572 },
  'prince george': { lat: 54.2297, lng: -122.7544, population: 74003 },
  'williams lake': { lat: 52.1417, lng: -122.1417, population: 10753 },
  'dawson creek': { lat: 55.7596, lng: -120.2377, population: 12178 },
  'fort st. john': { lat: 56.2498, lng: -120.8530, population: 21000 },
  'salmon arm': { lat: 50.7033, lng: -119.2733, population: 17706 },
  'trail': { lat: 49.0955, lng: -117.7135, population: 7709 },
  'castlegar': { lat: 49.3237, lng: -117.6619, population: 8039 },
  'revelstoke': { lat: 50.9981, lng: -118.2028, population: 8275 },
  'golden': { lat: 51.2969, lng: -116.9686, population: 3708 },
  'invermere': { lat: 50.5053, lng: -116.0306, population: 4214 },
  'fernie': { lat: 49.5047, lng: -115.0631, population: 5249 },
  'kimberley': { lat: 49.6706, lng: -115.9772, population: 6652 },
  'creston': { lat: 49.0956, lng: -116.5142, population: 5583 }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Get coordinates for a city name
 */
function getCityCoordinates(cityName: string): { lat: number; lng: number } | null {
  const normalizedCity = cityName.toLowerCase().trim()
  return BC_CITIES[normalizedCity as keyof typeof BC_CITIES] || null
}

/**
 * Estimate travel time based on distance and transportation mode
 */
function estimateTravelTime(distance: number, mode: 'driving' | 'transit' | 'walking'): number {
  // Average speeds in km/h
  const speeds = {
    driving: 60,    // Highway/city driving average
    transit: 35,    // Public transit with stops
    walking: 5      // Walking speed
  }
  
  const baseTime = (distance / speeds[mode]) * 60 // Convert to minutes
  
  // Add buffer time for different modes
  const buffers = {
    driving: 1.2,   // Traffic, parking
    transit: 1.5,   // Waiting, connections
    walking: 1.1    // Rest stops
  }
  
  return Math.round(baseTime * buffers[mode])
}

/**
 * Calculate location match score
 */
export function calculateLocationMatch(
  talentLocation: Location,
  projectLocation: Location,
  projectPreferences: LocationPreference,
  talentPreferences?: LocationPreference
): LocationMatchResult {
  const recommendations: string[] = []
  
  // Get coordinates
  const talentCoords = talentLocation.latitude && talentLocation.longitude
    ? { lat: talentLocation.latitude, lng: talentLocation.longitude }
    : getCityCoordinates(talentLocation.city)
  
  const projectCoords = projectLocation.latitude && projectLocation.longitude
    ? { lat: projectLocation.latitude, lng: projectLocation.longitude }
    : getCityCoordinates(projectLocation.city)
  
  if (!talentCoords || !projectCoords) {
    return {
      distance: 0,
      matchScore: 0,
      isWithinRadius: false,
      transportationMode: 'driving',
      workArrangementCompatible: false,
      recommendations: ['Unable to calculate distance - location coordinates not available']
    }
  }
  
  // Calculate distance
  const distance = calculateDistance(
    talentCoords.lat,
    talentCoords.lng,
    projectCoords.lat,
    projectCoords.lng
  )
  
  // Check if within radius
  const isWithinRadius = distance <= projectPreferences.maxRadius
  
  // Determine best transportation mode
  let transportationMode: 'driving' | 'transit' | 'walking' = 'driving'
  if (distance <= 2) {
    transportationMode = 'walking'
  } else if (distance <= 50 && ['kelowna', 'kamloops', 'prince george'].includes(projectLocation.city.toLowerCase())) {
    transportationMode = 'transit'
  }
  
  // Calculate travel time
  const travelTime = estimateTravelTime(distance, transportationMode)
  
  // Check work arrangement compatibility
  const workArrangementCompatible = checkWorkArrangementCompatibility(
    projectPreferences.workArrangement,
    talentPreferences?.workArrangement,
    distance
  )
  
  // Calculate match score
  let matchScore = 0
  
  // Distance scoring (0-40 points)
  if (distance === 0) {
    matchScore += 40 // Same location
    recommendations.push("✓ Same city location - no commute required")
  } else if (distance <= 5) {
    matchScore += 35
    recommendations.push("✓ Very close proximity - short commute")
  } else if (distance <= 15) {
    matchScore += 30
    recommendations.push("✓ Close proximity - reasonable commute")
  } else if (distance <= 30) {
    matchScore += 25
    recommendations.push("Moderate distance - manageable commute")
  } else if (distance <= 50) {
    matchScore += 20
    recommendations.push("Longer commute but within reasonable range")
  } else if (distance <= 100) {
    matchScore += 15
    recommendations.push("Significant commute - consider hybrid arrangement")
  } else if (distance <= 200) {
    matchScore += 10
    recommendations.push("Long distance - remote work strongly recommended")
  } else {
    matchScore += 5
    recommendations.push("Very long distance - remote work essential")
  }
  
  // Radius compliance (0-25 points)
  if (isWithinRadius) {
    matchScore += 25
    recommendations.push("✓ Within specified radius")
  } else {
    const overagePercentage = ((distance - projectPreferences.maxRadius) / projectPreferences.maxRadius) * 100
    if (overagePercentage <= 20) {
      matchScore += 20
      recommendations.push("Slightly outside radius but close")
    } else if (overagePercentage <= 50) {
      matchScore += 15
      recommendations.push("Outside radius - may require flexibility")
    } else {
      matchScore += 5
      recommendations.push("Significantly outside specified radius")
    }
  }
  
  // Work arrangement compatibility (0-25 points)
  if (workArrangementCompatible) {
    matchScore += 25
    recommendations.push("✓ Work arrangement preferences align")
  } else {
    matchScore += 10
    recommendations.push("Work arrangement may need adjustment")
  }
  
  // Travel time bonus/penalty (0-10 points)
  if (travelTime <= 30) {
    matchScore += 10
    recommendations.push(`✓ Short travel time: ${travelTime} minutes`)
  } else if (travelTime <= 60) {
    matchScore += 7
    recommendations.push(`Reasonable travel time: ${travelTime} minutes`)
  } else if (travelTime <= 90) {
    matchScore += 5
    recommendations.push(`Longer travel time: ${travelTime} minutes`)
  } else {
    matchScore += 2
    recommendations.push(`Extended travel time: ${travelTime} minutes`)
  }
  
  // Regional bonus for BC Interior focus
  if (isBCInteriorCity(talentLocation.city) && isBCInteriorCity(projectLocation.city)) {
    matchScore += 5
    recommendations.push("✓ Both locations in BC Interior region")
  }
  
  // Same city bonus
  if (talentLocation.city.toLowerCase() === projectLocation.city.toLowerCase()) {
    matchScore += 5
    recommendations.push("✓ Same city - local market knowledge")
  }
  
  // Ensure score is between 0 and 100
  matchScore = Math.max(0, Math.min(100, matchScore))
  
  return {
    distance: Math.round(distance * 10) / 10, // Round to 1 decimal
    matchScore: Math.round(matchScore),
    isWithinRadius,
    travelTime,
    transportationMode,
    workArrangementCompatible,
    recommendations
  }
}

/**
 * Check work arrangement compatibility
 */
function checkWorkArrangementCompatibility(
  projectArrangement: 'remote' | 'hybrid' | 'onsite',
  talentPreference?: 'remote' | 'hybrid' | 'onsite',
  distance?: number
): boolean {
  // If talent has no preference, assume flexible
  if (!talentPreference) return true
  
  // Exact match
  if (projectArrangement === talentPreference) return true
  
  // Remote work is always compatible if talent prefers it
  if (talentPreference === 'remote') return true
  
  // If project is remote but talent prefers onsite/hybrid
  if (projectArrangement === 'remote') {
    return talentPreference === 'hybrid' // Hybrid workers usually accept remote
  }
  
  // If project is hybrid
  if (projectArrangement === 'hybrid') {
    return talentPreference === 'onsite' || talentPreference === 'hybrid' // Onsite workers usually accept hybrid
  }
  
  // If project is onsite but talent prefers hybrid/remote
  if (projectArrangement === 'onsite') {
    // Only compatible if distance is reasonable
    return distance ? distance <= 50 : false
  }
  
  return false
}

/**
 * Check if city is in BC Interior region
 */
function isBCInteriorCity(cityName: string): boolean {
  const normalizedCity = cityName.toLowerCase().trim()
  return Object.keys(BC_CITIES).includes(normalizedCity)
}

/**
 * Get nearby cities within a radius
 */
export function getNearbyCities(
  centerLocation: Location,
  radiusKm: number
): Array<{ city: string; distance: number; population: number }> {
  const centerCoords = centerLocation.latitude && centerLocation.longitude
    ? { lat: centerLocation.latitude, lng: centerLocation.longitude }
    : getCityCoordinates(centerLocation.city)
  
  if (!centerCoords) return []
  
  const nearbyCities: Array<{ city: string; distance: number; population: number }> = []
  
  for (const [cityName, cityData] of Object.entries(BC_CITIES)) {
    const distance = calculateDistance(
      centerCoords.lat,
      centerCoords.lng,
      cityData.lat,
      cityData.lng
    )
    
    if (distance <= radiusKm && distance > 0) { // Exclude same city (distance = 0)
      nearbyCities.push({
        city: cityName.charAt(0).toUpperCase() + cityName.slice(1),
        distance: Math.round(distance * 10) / 10,
        population: cityData.population
      })
    }
  }
  
  // Sort by distance
  return nearbyCities.sort((a, b) => a.distance - b.distance)
}

/**
 * Calculate regional market score
 */
export function calculateRegionalMarketScore(
  talentLocation: Location,
  projectLocation: Location
): {
  marketScore: number
  marketSize: 'small' | 'medium' | 'large'
  competitionLevel: 'low' | 'medium' | 'high'
  recommendations: string[]
} {
  const recommendations: string[]= []
  let marketScore = 50 // Base score
  
  const talentCity = BC_CITIES[talentLocation.city.toLowerCase() as keyof typeof BC_CITIES]
  const projectCity = BC_CITIES[projectLocation.city.toLowerCase() as keyof typeof BC_CITIES]
  
  if (!talentCity || !projectCity) {
    return {
      marketScore: 0,
      marketSize: 'small',
      competitionLevel: 'low',
      recommendations: ['Location data not available for market analysis']
    }
  }
  
  // Market size based on population
  let marketSize: 'small' | 'medium' | 'large'
  if (projectCity.population > 100000) {
    marketSize = 'large'
    marketScore += 20
    recommendations.push("Large market with diverse opportunities")
  } else if (projectCity.population > 30000) {
    marketSize = 'medium'
    marketScore += 15
    recommendations.push("Medium-sized market with good potential")
  } else {
    marketSize = 'small'
    marketScore += 10
    recommendations.push("Smaller market - may have niche opportunities")
  }
  
  // Competition level (inverse of market size for local talent)
  let competitionLevel: 'low' | 'medium' | 'high'
  if (marketSize === 'large') {
    competitionLevel = 'high'
    recommendations.push("Higher competition but more opportunities")
  } else if (marketSize === 'medium') {
    competitionLevel = 'medium'
    recommendations.push("Moderate competition level")
  } else {
    competitionLevel = 'low'
    marketScore += 10 // Bonus for less competition
    recommendations.push("Lower competition - good for local specialists")
  }
  
  // Regional hub bonus
  const regionalHubs = ['kelowna', 'kamloops', 'prince george']
  if (regionalHubs.includes(projectLocation.city.toLowerCase())) {
    marketScore += 15
    recommendations.push("Regional hub location - good business ecosystem")
  }
  
  return {
    marketScore: Math.min(100, marketScore),
    marketSize,
    competitionLevel,
    recommendations
  }
}
