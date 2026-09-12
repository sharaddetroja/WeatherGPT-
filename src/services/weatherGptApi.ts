export interface WeatherGPTLocation {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  state?: string;
}

export interface AskApiResponse {
  success: boolean;
  answer: string;
  language: string;
  conversationId: string;
  location?: WeatherGPTLocation;
  weather?: {
    temperature: number;
    apparentTemperature: number;
    condition: string;
    rain_probability: number;
    rain_amount_mm: number;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
  };
  timeline?: {
    hours: Array<{
      hourLabel: string;
      temperature: number;
      conditionEmoji: string;
      rainProbability: number;
      riskLevel: 'safe' | 'caution' | 'risky';
    }>;
  };
  riskScores?: {
    overall: number;
    severity: 'low' | 'moderate' | 'high' | 'extreme';
    alerts: string[];
  };
  advisories?: {
    bestTimeToGoOut?: {
      reason: string;
      safetyScore: number;
    };
    mood?: {
      emoji: string;
      summary: string;
      clothing: string[];
      umbrellaNeeded: boolean;
    };
  };
  error?: any;
  intent?: string; // Keeping for backward compatibility

  // New Data Fields from Backend
  airQuality?: {
    score?: number;
    aqi?: number; // Depending on backend naming
    pm25?: number;
    pm10?: number;
    healthAdvice?: string;
  };
  forecastConfidence?: 'HIGH' | 'MODERATE' | 'LOW';
  conversationContext?: {
    identifiedPlace?: string;
    identifiedTime?: string;
  };
  bestTimeToGoOut?: {
    time?: string;
    reason?: string;
    safetyScore?: number;
  };
  explainWhy?: any;
}

// Use relative paths to allow Vite (local) and Vercel (production) proxies to bypass CORS
const API_BASE_URL = '/api';
const API_ENDPOINT = `${API_BASE_URL}/ask`;
export const WEATHER_ENDPOINT = `${API_BASE_URL}/weather`;
export const WEATHER_CURRENT_ENDPOINT = `${API_BASE_URL}/weather/current`;
export const WEATHER_HOURLY_ENDPOINT = `${API_BASE_URL}/weather/hourly`;
export const WEATHER_DAILY_ENDPOINT = `${API_BASE_URL}/weather/daily`;
export const WEATHER_ALERTS_ENDPOINT = `${API_BASE_URL}/weather/alerts`;
export const HEALTH_ENDPOINT = `${API_BASE_URL}/health`;

export interface AskWeatherGPTParams {
  question: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  conversationId?: string;
  persona?: 'farmer' | 'student' | 'traveler' | 'elderly' | 'outdoor_worker' | 'general';
}

/**
 * Sends a weather query to the live WeatherGPT backend API
 */
export async function askWeatherGPT(params: AskWeatherGPTParams | string): Promise<AskApiResponse> {
  let requestParams: AskWeatherGPTParams;

  if (typeof params === 'string') {
    requestParams = { question: params };
  } else {
    requestParams = params;
  }

  if (!requestParams.question || !requestParams.question.trim()) {
    throw new Error('Please enter a weather query.');
  }

  try {
    const convId = requestParams.conversationId || localStorage.getItem('weathergpt_conversation_id') || undefined;

    const payload: any = {
      question: requestParams.question.trim(),
    };
    
    if (requestParams.location) {
      payload.location = requestParams.location;
    }
    
    if (convId) {
      payload.conversationId = convId;
    }

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || "Failed to fetch weather data.");
    }

    const data: AskApiResponse = await response.json();
    
    if (data.conversationId) {
      localStorage.setItem('weathergpt_conversation_id', data.conversationId);
    }
    
    return data;
  } catch (err: any) {
    return {
      success: false,
      answer: '',
      language: 'en',
      conversationId: '',
      error: err.message || 'Network connection error. Please check your internet connection.',
    };
  }
}

/**
 * Helper to get user location
 */
export async function getUserLocation(): Promise<{latitude: number; longitude: number} | undefined> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(undefined);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => {
        resolve(undefined);
      },
      { timeout: 5000 }
    );
  });
}

// ============================================================================
// NEW API ENDPOINTS
// ============================================================================

export interface ReverseGeocodeResponse {
  city: string;
  state: string;
  country: string;
  address: string;
}

/**
 * 2. Mobile GPS Reverse Geocoding
 */
export async function reverseGeocodeLocation(lat: number, lon: number): Promise<ReverseGeocodeResponse> {
  const response = await fetch(`${API_BASE_URL}/location/reverse-geocode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: lat, longitude: lon }),
  });
  if (!response.ok) throw new Error('Reverse geocoding failed');
  return response.json();
}

/**
 * 3. Disaster Intelligence - Alerts
 */
export async function getDisasterAlerts(location: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/disaster/alerts?location=${encodeURIComponent(location)}`);
  if (!response.ok) throw new Error('Failed to fetch disaster alerts');
  return response.json();
}

/**
 * 3. Disaster Intelligence - Safety Guide
 */
export async function getEmergencyGuide(disasterType: string, language: string = 'en'): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/disaster/emergency-guide?disasterType=${encodeURIComponent(disasterType)}&language=${encodeURIComponent(language)}`
  );
  if (!response.ok) throw new Error('Failed to fetch emergency guide');
  return response.json();
}

/**
 * 4. Interactive Weather Map Overlay
 */
export async function getMapWeatherOverlay(layer: string, lat: number, lon: number): Promise<{tileUrlTemplate: string, legend?: any}> {
  const response = await fetch(
    `${API_BASE_URL}/maps/weather?layer=${encodeURIComponent(layer)}&lat=${lat}&lon=${lon}`
  );
  if (!response.ok) throw new Error('Failed to fetch map overlay data');
  return response.json();
}

/**
 * 5. Multi-City Comparison
 */
export async function compareCitiesWeather(locations: string[]): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/weather/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locations }),
  });
  if (!response.ok) throw new Error('Failed to compare cities weather');
  return response.json();
}

/**
 * 6. Weather Lens (AI Sky Camera)
 */
export interface WeatherLensResponse {
  cloudType: string;
  cloudCoverPercent: number;
  rainRiskPercent: number;
  confidenceScore: number;
  answer: string;
}

export async function analyzeWeatherLens(
  imageBase64: string,
  question: string,
  location: string,
  language: string = 'en'
): Promise<WeatherLensResponse> {
  
  let locationObj: any = undefined;
  if (location && location !== 'Unknown') {
    const [lat, lon] = location.split(',');
    if (lat && lon) {
      locationObj = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    }
  }

  const response = await fetch(`${API_BASE_URL}/weather/lens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: imageBase64,
      question,
      location: locationObj,
      language
    }),
  });
  if (!response.ok) throw new Error('Failed to analyze weather lens image');
  return response.json();
}
