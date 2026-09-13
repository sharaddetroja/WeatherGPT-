import { fetchWeatherHistoryApi } from './weatherGptApi';

export interface RawBackendHistoryDay {
  date: string;
  temperature?: {
    min_c?: number;
    max_c?: number;
    avg_c?: number;
  };
  humidity?: {
    min_percent?: number;
    max_percent?: number;
    avg_percent?: number;
  };
  wind?: {
    max_kph?: number;
    avg_kph?: number;
  };
  precipitation?: {
    accumulation_mm?: number;
    probability_percent?: number;
  };
  pressure?: {
    avg_mb?: number;
  };
  cloud_cover_percent?: number;
  condition?: {
    text?: string;
    icon?: string;
    code?: number;
  };
}

export interface RawBackendHistoryResponse {
  success?: boolean;
  source?: string;
  location?: {
    name?: string;
    latitude?: number;
    longitude?: number;
  };
  period?: {
    days?: number;
    from?: string;
    to?: string;
    timezone?: string;
  };
  history?: RawBackendHistoryDay[];
  error?: string;
}

export interface TemperatureTrendPoint {
  label: string;
  shortLabel: string;
  date: string;
  avgTempC: number;
  minTempC: number;
  maxTempC: number;
}

export interface RainfallTrendPoint {
  label: string;
  shortLabel: string;
  date: string;
  rainMm: number;
}

export interface ClimateSummary {
  averageTemperatureC: number | null;
  minTemperatureC: number | null;
  maxTemperatureC: number | null;
  totalRainfallMm: number | null;
  rainyDaysCount: number;
  totalRecordedDays: number;
}

export interface ClimateInsightData {
  title: string;
  description: string;
}

export interface NormalizedClimateData {
  success: boolean;
  location: {
    name: string;
    latitude: number | null;
    longitude: number | null;
  };
  period: {
    days: number;
    from: string;
    to: string;
    source: string;
  };
  temperatureTrend: TemperatureTrendPoint[];
  rainfallTrend: RainfallTrendPoint[];
  summary: ClimateSummary;
  insight: ClimateInsightData;
  error?: string;
}

/**
 * Pure data transformation function converting raw backend weather history API response
 * into normalized, data-driven climate models.
 */
export function transformClimateData(rawResponse: RawBackendHistoryResponse): NormalizedClimateData {
  if (!rawResponse || !rawResponse.success || !Array.isArray(rawResponse.history) || rawResponse.history.length === 0) {
    const errorMsg = rawResponse?.error || 'No historical weather data available for this location.';
    return {
      success: false,
      location: {
        name: rawResponse?.location?.name || 'Unknown Location',
        latitude: rawResponse?.location?.latitude ?? null,
        longitude: rawResponse?.location?.longitude ?? null,
      },
      period: {
        days: rawResponse?.period?.days ?? 0,
        from: rawResponse?.period?.from || '',
        to: rawResponse?.period?.to || '',
        source: rawResponse?.source || 'Express Backend API',
      },
      temperatureTrend: [],
      rainfallTrend: [],
      summary: {
        averageTemperatureC: null,
        minTemperatureC: null,
        maxTemperatureC: null,
        totalRainfallMm: null,
        rainyDaysCount: 0,
        totalRecordedDays: 0,
      },
      insight: {
        title: 'Climate Insight',
        description: errorMsg,
      },
      error: errorMsg,
    };
  }

  const historyList = rawResponse.history;
  const locationName = rawResponse.location?.name || 'Selected Location';
  const latitude = rawResponse.location?.latitude ?? null;
  const longitude = rawResponse.location?.longitude ?? null;

  const tempPoints: TemperatureTrendPoint[] = [];
  const rainPoints: RainfallTrendPoint[] = [];

  let tempSum = 0;
  let totalRain = 0;
  let rainyDaysCount = 0;
  let minTempOverall: number | null = null;
  let maxTempOverall: number | null = null;

  for (const item of historyList) {
    const rawDate = item.date || new Date().toISOString().split('T')[0];
    
    // Date formatting safely
    let label = rawDate;
    let shortLabel = rawDate;
    try {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        shortLabel = d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
      }
    } catch {
      // Fallback to raw string
    }

    // Temperature extraction
    const avgT = item.temperature?.avg_c ?? item.temperature?.max_c ?? 0;
    const minT = item.temperature?.min_c ?? avgT;
    const maxT = item.temperature?.max_c ?? avgT;

    tempPoints.push({
      label,
      shortLabel,
      date: rawDate,
      avgTempC: Math.round(avgT * 10) / 10,
      minTempC: Math.round(minT * 10) / 10,
      maxTempC: Math.round(maxT * 10) / 10,
    });

    tempSum += avgT;

    if (minTempOverall === null || minT < minTempOverall) minTempOverall = minT;
    if (maxTempOverall === null || maxT > maxTempOverall) maxTempOverall = maxT;

    // Precipitation extraction (using ?? 0 to preserve valid 0 mm values!)
    const rainMm = Math.round((item.precipitation?.accumulation_mm ?? 0) * 10) / 10;

    rainPoints.push({
      label,
      shortLabel,
      date: rawDate,
      rainMm,
    });

    totalRain += rainMm;
    if (rainMm > 0) {
      rainyDaysCount++;
    }
  }

  const totalRecordedDays = historyList.length;
  const averageTemperatureC = Math.round((tempSum / totalRecordedDays) * 10) / 10;
  const totalRainfallMm = Math.round(totalRain * 10) / 10;
  const minTemperatureC = minTempOverall !== null ? Math.round(minTempOverall * 10) / 10 : null;
  const maxTemperatureC = maxTempOverall !== null ? Math.round(maxTempOverall * 10) / 10 : null;

  // Truthful data-driven insight sentence
  let insightDesc = '';
  if (totalRecordedDays > 0) {
    insightDesc = `Average temperature for ${locationName} during the recorded ${totalRecordedDays}-day period (${rawResponse.period?.from || 'start'} to ${rawResponse.period?.to || 'end'}) was ${averageTemperatureC}°C with a recorded range of ${minTemperatureC}°C to ${maxTemperatureC}°C. Precipitation occurred on ${rainyDaysCount} of ${totalRecordedDays} recorded days, accumulating a total of ${totalRainfallMm} mm.`;
  } else {
    insightDesc = `Not enough historical weather data available for ${locationName} to generate a climate summary.`;
  }

  return {
    success: true,
    location: {
      name: locationName,
      latitude,
      longitude,
    },
    period: {
      days: totalRecordedDays,
      from: rawResponse.period?.from || (historyList[0]?.date ?? ''),
      to: rawResponse.period?.to || (historyList[historyList.length - 1]?.date ?? ''),
      source: rawResponse.source || 'Open-Meteo Archive / Backend API',
    },
    temperatureTrend: tempPoints,
    rainfallTrend: rainPoints,
    summary: {
      averageTemperatureC,
      minTemperatureC,
      maxTemperatureC,
      totalRainfallMm,
      rainyDaysCount,
      totalRecordedDays,
    },
    insight: {
      title: `Climate & Historical Insight • ${locationName}`,
      description: insightDesc,
    },
  };
}

/**
 * Service call executing raw backend history fetch and transforming response
 */
export async function getClimateDataForLocation(locationName: string = 'Morbi'): Promise<NormalizedClimateData> {
  try {
    const rawRes = await fetchWeatherHistoryApi(locationName);
    return transformClimateData(rawRes);
  } catch (err: any) {
    return {
      success: false,
      location: { name: locationName, latitude: null, longitude: null },
      period: { days: 0, from: '', to: '', source: 'Backend API Error' },
      temperatureTrend: [],
      rainfallTrend: [],
      summary: {
        averageTemperatureC: null,
        minTemperatureC: null,
        maxTemperatureC: null,
        totalRainfallMm: null,
        rainyDaysCount: 0,
        totalRecordedDays: 0,
      },
      insight: {
        title: 'Unable to Load Climate Data',
        description: err.message || 'Unable to connect to WeatherGPT backend API server.',
      },
      error: err.message || 'Unable to fetch historical climate data.',
    };
  }
}
