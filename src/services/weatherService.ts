import { WEATHER_ENDPOINT } from './weatherGptApi';

export interface YesterdayWeatherData {
  date: string;
  day: string;
  temp_c: number;
  max_temp: number;
  min_temp: number;
  feelslike_c: number;
  condition: {
    text: string;
    icon: string;
  };
  humidity: number;
  wind_kph: number;
  wind_dir: string;
  precip_mm: number;
  pressure_mb: number;
  uv: number;
  visibility_km: number;
  aqi?: number;
  summary: string;
}

export const getWeatherData = async (city: string = 'Rajkot') => {
  const getYesterdayDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const defaultYesterday: YesterdayWeatherData = {
    date: getYesterdayDate(),
    day: "Yesterday",
    temp_c: 26,
    max_temp: 31,
    min_temp: 23,
    feelslike_c: 28,
    condition: {
      text: "Scattered Rain",
      icon: "cloud-rain"
    },
    humidity: 76,
    wind_kph: 17.5,
    wind_dir: "SW",
    precip_mm: 8.4,
    pressure_mb: 1010,
    uv: 5,
    visibility_km: 8.5,
    aqi: 45,
    summary: "Yesterday experienced scattered rainfall (8.4 mm) with highs of 31°C and humid southwest winds."
  };

  try {
    const url = `${WEATHER_ENDPOINT}?city=${encodeURIComponent(city)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const data = await response.json();
    if (!data.yesterday) {
      data.yesterday = defaultYesterday;
    }
    return data;
  } catch (err) {
    console.warn('Falling back to mock weather data:', err);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      location: {
        name: city,
        region: "Gujarat",
        country: "India",
        lat: 22.3039,
        lon: 70.8022,
      },
      current: {
        temp_c: 28,
        condition: {
          text: "Partly Cloudy",
          icon: "cloud-sun"
        },
        wind_kph: 15.4,
        humidity: 68,
        feelslike_c: 30,
        uv: 6,
        visibility_km: 10,
        pressure_mb: 1012,
        precip_mm: 0.0
      },
      yesterday: defaultYesterday,
      hourly: [
        { time: "09:00", temp_c: 27, icon: "sun", chance_of_rain: 10 },
        { time: "10:00", temp_c: 28, icon: "cloud-sun", chance_of_rain: 20 },
        { time: "11:00", temp_c: 29, icon: "cloud-sun", chance_of_rain: 30 },
        { time: "12:00", temp_c: 30, icon: "cloud", chance_of_rain: 40 },
        { time: "13:00", temp_c: 31, icon: "cloud-rain", chance_of_rain: 60 },
        { time: "14:00", temp_c: 31, icon: "cloud-rain", chance_of_rain: 80 },
        { time: "15:00", temp_c: 30, icon: "cloud-rain", chance_of_rain: 90 },
        { time: "16:00", temp_c: 29, icon: "cloud", chance_of_rain: 50 },
      ],
      forecast: [
        { date: "2026-09-08", day: "Mon", min_temp: 24, max_temp: 32, condition: "Rain", chance_of_rain: 80 },
        { date: "2026-09-09", day: "Tue", min_temp: 23, max_temp: 31, condition: "Thunderstorm", chance_of_rain: 90 },
        { date: "2026-09-10", day: "Wed", min_temp: 25, max_temp: 33, condition: "Partly Cloudy", chance_of_rain: 30 },
        { date: "2026-09-11", day: "Thu", min_temp: 26, max_temp: 34, condition: "Sunny", chance_of_rain: 10 },
        { date: "2026-09-12", day: "Fri", min_temp: 26, max_temp: 35, condition: "Sunny", chance_of_rain: 0 },
        { date: "2026-09-13", day: "Sat", min_temp: 27, max_temp: 35, condition: "Sunny", chance_of_rain: 0 },
        { date: "2026-09-14", day: "Sun", min_temp: 26, max_temp: 34, condition: "Partly Cloudy", chance_of_rain: 20 },
      ],
      insights: [
        { title: "Rain Advisory", type: "warning", message: "Heavy rain may occur between 1 PM and 4 PM today.", icon: "rain" },
        { title: "Travel Recommendation", type: "info", message: "Travel conditions may become difficult during afternoon rainfall.", icon: "car" },
        { title: "Agriculture Insight", type: "success", message: "High humidity and rainfall will benefit local Kharif crops.", icon: "leaf" },
      ]
    };
  }
};
