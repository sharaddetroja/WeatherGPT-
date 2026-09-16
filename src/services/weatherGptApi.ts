export interface WeatherGPTLocation {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
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
  intent?: string;

  airQuality?: {
    score?: number;
    aqi?: number;
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

// Base URL configuration supporting .env and default production Render URL
const RAW_BASE_URL = (import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://weathergpt-backend-46or.onrender.com').replace(/\/+$/, '');
export const BASE_API_URL = RAW_BASE_URL.endsWith('/api') ? RAW_BASE_URL : `${RAW_BASE_URL}/api`;

const API_ENDPOINT = `${BASE_API_URL}/ask`;
export const WEATHER_ENDPOINT = `${BASE_API_URL}/weather`;
export const WEATHER_CURRENT_ENDPOINT = `${BASE_API_URL}/weather/current`;
export const WEATHER_HISTORY_ENDPOINT = `${BASE_API_URL}/weather/history`;
export const WEATHER_ALERTS_ENDPOINT = `${BASE_API_URL}/alerts`;
export const ROUTE_WEATHER_ENDPOINT = `${BASE_API_URL}/route-weather`;
export const HEALTH_ENDPOINT = `${RAW_BASE_URL.replace(/\/api$/, '')}/health`;
export const VOICE_SPEAK_ENDPOINT = `${BASE_API_URL}/voice/speak`;
export const VOICE_TRANSCRIBE_ENDPOINT = `${BASE_API_URL}/voice/transcribe`;
export const VOICE_ASK_ENDPOINT = `${BASE_API_URL}/voice/ask`;

export const KNOWN_CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  rajkot: { lat: 22.3039, lon: 70.8022 },
  morbi: { lat: 22.8173, lon: 70.8368 },
  ahmedabad: { lat: 23.0225, lon: 72.5714 },
  surat: { lat: 21.1702, lon: 72.8311 },
  vadodara: { lat: 22.3072, lon: 73.1812 },
  bhavnagar: { lat: 21.7645, lon: 72.1519 },
  jamnagar: { lat: 22.4707, lon: 70.0577 },
  junagadh: { lat: 21.5222, lon: 70.4579 },
  gandhinagar: { lat: 23.2156, lon: 72.6369 },
  mumbai: { lat: 19.0760, lon: 72.8777 },
  pune: { lat: 18.5204, lon: 73.8567 },
  nagpur: { lat: 21.1458, lon: 79.0882 },
  nashik: { lat: 19.9975, lon: 73.7898 },
  delhi: { lat: 28.6139, lon: 77.2090 },
  'new delhi': { lat: 28.6139, lon: 77.2090 },
  noida: { lat: 28.5355, lon: 77.3910 },
  gurugram: { lat: 28.4595, lon: 77.0266 },
  bengaluru: { lat: 12.9716, lon: 77.5946 },
  bangalore: { lat: 12.9716, lon: 77.5946 },
  hyderabad: { lat: 17.3850, lon: 78.4867 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  kolkata: { lat: 22.5726, lon: 88.3639 },
  jaipur: { lat: 26.9124, lon: 75.7873 },
  lucknow: { lat: 26.8467, lon: 80.9462 },
  kanpur: { lat: 26.4499, lon: 80.3319 },
  indore: { lat: 22.7196, lon: 75.8577 },
  bhopal: { lat: 23.2599, lon: 77.4126 },
  patna: { lat: 25.5941, lon: 85.1376 },
  chandigarh: { lat: 30.7333, lon: 76.7794 },
  varanasi: { lat: 25.3176, lon: 82.9739 },
  agra: { lat: 27.1767, lon: 78.0081 },
  amritsar: { lat: 31.6340, lon: 74.8723 },
  coimbatore: { lat: 11.0168, lon: 76.9558 },
  kochi: { lat: 9.9312, lon: 76.2673 },
  thiruvananthapuram: { lat: 8.5241, lon: 76.9366 },
  visakhapatnam: { lat: 17.6868, lon: 83.2185 },
  goa: { lat: 15.2993, lon: 74.1240 },
  shimla: { lat: 31.1048, lon: 77.1734 },
  dehradun: { lat: 30.3165, lon: 78.0322 },
  srinagar: { lat: 34.0837, lon: 74.7973 },
  guwahati: { lat: 26.1445, lon: 91.7362 },
  bhubaneswar: { lat: 20.2961, lon: 85.8245 },
  ranchi: { lat: 23.3441, lon: 85.3096 },
  raipur: { lat: 21.2514, lon: 81.6296 },
};

export function resolveCoordinatesForCity(cityOrLocation: string): { latitude: number; longitude: number } {
  if (!cityOrLocation || !cityOrLocation.trim()) {
    return { latitude: 22.3039, longitude: 70.8022 };
  }

  const parts = cityOrLocation.split(',');
  if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
    return { latitude: Number(parts[0].trim()), longitude: Number(parts[1].trim()) };
  }

  const cleanName = parts[0].trim().toLowerCase();
  if (KNOWN_CITY_COORDINATES[cleanName]) {
    return { latitude: KNOWN_CITY_COORDINATES[cleanName].lat, longitude: KNOWN_CITY_COORDINATES[cleanName].lon };
  }

  const foundKey = Object.keys(KNOWN_CITY_COORDINATES).find(k => cleanName.includes(k) || k.includes(cleanName));
  if (foundKey) {
    return { latitude: KNOWN_CITY_COORDINATES[foundKey].lat, longitude: KNOWN_CITY_COORDINATES[foundKey].lon };
  }

  return { latitude: 22.3039, longitude: 70.8022 };
}

export interface AskWeatherGPTParams {
  question: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  conversationId?: string;
  persona?: 'farmer' | 'student' | 'traveler' | 'elderly' | 'outdoor_worker' | 'general';
  language?: string;
}

/**
 * Health Check API Call (Hits root /health which returns status 200)
 */
export async function getHealthStatus(): Promise<{ status: string; timestamp: string; success?: boolean; message?: string }> {
  try {
    const response = await fetch(HEALTH_ENDPOINT);
    if (!response.ok) {
      throw new Error(`Health check failed with status ${response.status}`);
    }
    return await response.json();
  } catch (err: any) {
    return { status: 'DOWN', timestamp: new Date().toISOString(), success: false, message: err.message };
  }
}

/**
 * Live Weather Fetch using POST /api/weather
 */
export async function fetchBackendWeather(
  cityOrLocation: string,
  coords?: { latitude: number; longitude: number }
): Promise<any> {
  try {
    const cleanCity = (cityOrLocation || 'Rajkot').split(',')[0].trim() || 'Rajkot';
    const location = coords || resolveCoordinatesForCity(cityOrLocation);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(WEATHER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        city: cleanCity,
        location,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    return await response.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Network request failed' };
  }
}

/**
 * Live Current Weather Endpoint adapter (calls live backend POST /api/weather)
 */
export async function fetchCurrentWeatherApi(cityOrLocation: string): Promise<any> {
  const result = await fetchBackendWeather(cityOrLocation);
  if (result && result.success && result.data) {
    const cur = result.data.current || {};
    return {
      success: true,
      location: result.data.location || { name: cityOrLocation },
      current: {
        temp_c: cur.temperature ?? 28,
        temperature_c: cur.temperature ?? 28,
        feelslike_c: cur.apparentTemperature ?? cur.temperature ?? 28,
        condition: {
          text: cur.condition || 'Partly Cloudy',
          icon: cur.weatherCode !== undefined ? (cur.weatherCode > 50 ? 'cloud-rain' : cur.weatherCode > 0 ? 'cloud-sun' : 'sun') : 'cloud-sun'
        },
        wind_kph: cur.windSpeed ?? 14,
        humidity: cur.humidity ?? 65,
        uv: cur.uvIndex ?? 6,
        precip_mm: cur.precipitation ?? 0,
        visibility_km: cur.visibility ? Math.round(cur.visibility / 1000) : 10,
        is_stale: false,
        fetched_at: result.data.retrievedAt || new Date().toISOString()
      },
      hourly: result.data.hourly,
      daily: result.data.daily,
    };
  }
  return result || { success: false, error: 'Failed to fetch current weather' };
}

/**
 * Live Weather History / Forecast Endpoint adapter
 */
export async function fetchWeatherHistoryApi(cityOrLocation: string): Promise<any> {
  const result = await fetchBackendWeather(cityOrLocation);
  if (result && result.success && result.data && Array.isArray(result.data.daily)) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      success: true,
      location: result.data.location || { name: cityOrLocation },
      history: result.data.daily.map((d: any) => {
        const dateObj = new Date(d.date);
        return {
          date: d.date,
          day: days[dateObj.getDay()] || 'Day',
          min_temp_c: d.temperatureMin,
          max_temp_c: d.temperatureMax,
          avg_temp_c: Math.round(((d.temperatureMax + d.temperatureMin) / 2) * 10) / 10,
          condition: d.condition,
          precipitation_mm: d.precipitationSum ?? 0,
          humidity: 60,
          wind_kph: 14,
          pressure_mb: 1012,
          uv: d.uvIndexMax ?? 6,
          is_stale: false,
        };
      })
    };
  }
  return { success: false, history: [] };
}

/**
 * Live Weather Alerts Endpoint adapter (POST /api/alerts)
 */
export async function fetchWeatherAlertsApi(cityOrLocation: string): Promise<any> {
  try {
    const cleanCity = (cityOrLocation || 'Rajkot').split(',')[0].trim() || 'Rajkot';
    const location = resolveCoordinatesForCity(cleanCity);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${BASE_API_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        city: cleanCity,
        location,
        threshold: 50
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const alerts: any[] = [];
      if (data?.currentStatus?.thresholdCrossed) {
        alerts.push({
          headline: `Severe Weather Warning for ${cleanCity}`,
          event: "Rain Alert",
          severity: "High",
          description: `Precipitation risk reached ${data.currentStatus.maxRainProbability}%.`,
          area: cleanCity
        });
      }
      return { success: true, alerts, message: data?.makeWebhookResult?.message || '' };
    }
    return { success: true, alerts: [] };
  } catch {
    return { success: true, alerts: [] };
  }
}

/**
 * Live Route Weather Discovery Endpoint
 */
export async function fetchRouteWeatherApi(source: string, destination: string): Promise<any> {
  const url = `${ROUTE_WEATHER_ENDPOINT}?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody?.message || errBody?.error || `Failed to calculate route weather from ${source} to ${destination}`);
  }
  return await response.json();
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

    if (requestParams.language && requestParams.language !== 'auto') {
      payload.language = requestParams.language;
    }
    
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

export interface ReverseGeocodeResponse {
  city: string;
  state: string;
  country: string;
  address: string;
}

export async function reverseGeocodeLocation(lat: number, lon: number): Promise<ReverseGeocodeResponse> {
  const response = await fetch(`${BASE_API_URL}/location/reverse-geocode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude: lat, longitude: lon }),
  });
  if (!response.ok) throw new Error('Reverse geocoding failed');
  return response.json();
}

export async function getDisasterAlerts(location: string): Promise<any> {
  const response = await fetch(`${BASE_API_URL}/disaster/alerts?location=${encodeURIComponent(location)}`);
  if (!response.ok) throw new Error('Failed to fetch disaster alerts');
  return response.json();
}

export async function getEmergencyGuide(disasterType: string, language: string = 'en'): Promise<any> {
  const response = await fetch(
    `${BASE_API_URL}/disaster/emergency-guide?disasterType=${encodeURIComponent(disasterType)}&language=${encodeURIComponent(language)}`
  );
  if (!response.ok) throw new Error('Failed to fetch emergency guide');
  return response.json();
}

export async function getMapWeatherOverlay(layer: string, lat: number, lon: number): Promise<{tileUrlTemplate: string, legend?: any}> {
  const response = await fetch(
    `${BASE_API_URL}/maps/weather?layer=${encodeURIComponent(layer)}&lat=${lat}&lon=${lon}`
  );
  if (!response.ok) throw new Error('Failed to fetch map overlay data');
  return response.json();
}

export async function compareCitiesWeather(locations: string[]): Promise<any> {
  const response = await fetch(`${BASE_API_URL}/weather/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locations }),
  });
  if (!response.ok) throw new Error('Failed to compare cities weather');
  return response.json();
}

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

  const response = await fetch(`${BASE_API_URL}/weather/lens`, {
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

export async function fetchVoiceSpeakAudio(text: string, language: string = 'en-IN'): Promise<Blob | null> {
  try {
    const response = await fetch(`${BASE_API_URL}/voice/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await response.json();
      if (json.audioBase64) {
        const byteCharacters = atob(json.audioBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: json.mimeType || 'audio/mp3' });
      }
      return null;
    }

    const blob = await response.blob();
    return blob && blob.size > 0 ? blob : null;
  } catch (err) {
    console.warn('Backend TTS /voice/speak direct fetch failed:', err);
    return null;
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<{ transcription: string; language: string } | null> {
  try {
    const response = await fetch(`${BASE_API_URL}/voice/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': audioBlob.type || 'audio/webm'
      },
      body: audioBlob
    });

    if (!response.ok) return null;
    const data = await response.json();
    const transcription = data.transcription || data.transcript || data.text || '';
    const language = data.language || 'en';
    return transcription ? { transcription, language } : null;
  } catch (err) {
    console.warn('Backend /api/voice/transcribe direct fetch failed:', err);
    return null;
  }
}

export async function askLLM(question: string, language: string = 'auto'): Promise<{ answer: string } | null> {
  try {
    const payload: any = { question };
    if (language && language !== 'auto') {
      payload.language = language;
    }
    const response = await fetch(`${BASE_API_URL}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return { answer: data.answer || '' };
  } catch (err) {
    console.warn('Backend /api/ask fetch failed:', err);
    return null;
  }
}

export async function fetchVoiceSpeakAudioV2(text: string, language: string = 'en'): Promise<Blob | null> {
  try {
    const response = await fetch(`${BASE_API_URL}/voice/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });

    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await response.json();
      if (json.audioBase64) {
        const byteCharacters = atob(json.audioBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: json.mimeType || 'audio/mp3' });
      }
      return null;
    }

    const blob = await response.blob();
    return blob && blob.size > 0 ? blob : null;
  } catch (err) {
    console.warn('Backend TTS /voice/speak V2 fetch failed:', err);
    return null;
  }
}
