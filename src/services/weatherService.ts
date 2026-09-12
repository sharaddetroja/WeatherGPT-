import { WEATHER_ENDPOINT } from './weatherGptApi';

export interface YesterdayWeatherData {
  temp_c: number;
  max_temp: number;
  min_temp: number;
  condition: {
    text: string;
    icon: string;
  };
  wind_kph: number;
  humidity: number;
  precip_mm: number;
  pressure_mb: number;
  date: string;
  summary?: string;
}

export interface HistoricalWeatherDay {
  date: string;
  day: string;
  min_temp: number;
  max_temp: number;
  avg_temp: number;
  condition: string;
  rainfall_mm: number;
  humidity: number;
  wind_kph: number;
  pressure_mb: number;
  uv: number;
}

export const generateLast7DaysHistory = (baseTemp: number = 28): HistoricalWeatherDay[] => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const conditions = [
    { text: "Sunny", rain: 0.0, hum: 55, wind: 12 },
    { text: "Partly Cloudy", rain: 0.5, hum: 62, wind: 14 },
    { text: "Rain Showers", rain: 8.4, hum: 78, wind: 18 },
    { text: "Thunderstorm", rain: 22.0, hum: 85, wind: 24 },
    { text: "Clear Sky", rain: 0.0, hum: 50, wind: 10 },
    { text: "Overcast", rain: 2.1, hum: 72, wind: 16 },
    { text: "Scattered Clouds", rain: 0.0, hum: 58, wind: 13 },
  ];

  const list: HistoricalWeatherDay[] = [];
  const now = new Date();

  for (let i = 7; i >= 1; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayName = daysOfWeek[d.getDay()];
    const dateStr = d.toISOString().split('T')[0];
    const cond = conditions[(i + 2) % conditions.length];
    const offset = ((i % 3) - 1) * 1.5;
    const maxT = Math.round((baseTemp + 4 + offset) * 10) / 10;
    const minT = Math.round((baseTemp - 4 + offset) * 10) / 10;
    const avgT = Math.round(((maxT + minT) / 2) * 10) / 10;

    list.push({
      date: dateStr,
      day: dayName,
      min_temp: minT,
      max_temp: maxT,
      avg_temp: avgT,
      condition: cond.text,
      rainfall_mm: cond.rain,
      humidity: cond.hum,
      wind_kph: cond.wind,
      pressure_mb: 1010 + (i % 4),
      uv: cond.rain > 0 ? 4 : 7,
    });
  }
  return list;
};

export const getWeatherData = async (city: string = 'Rajkot') => {
  try {
    const url = `${WEATHER_ENDPOINT}?city=${encodeURIComponent(city)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const data = await response.json();
    if (!data.history7Days) {
      const baseT = data.current?.temp_c || 28;
      data.history7Days = generateLast7DaysHistory(baseT);
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
        { date: "2026-09-08", day: "Mon", min_temp: 24, max_temp: 32, condition: "Rain", chance_of_rain: 80, rainfall_mm: 12.5, humidity: 82, wind_kph: 20 },
        { date: "2026-09-09", day: "Tue", min_temp: 23, max_temp: 31, condition: "Thunderstorm", chance_of_rain: 90, rainfall_mm: 25.0, humidity: 88, wind_kph: 26 },
        { date: "2026-09-10", day: "Wed", min_temp: 25, max_temp: 33, condition: "Partly Cloudy", chance_of_rain: 30, rainfall_mm: 1.2, humidity: 65, wind_kph: 14 },
        { date: "2026-09-11", day: "Thu", min_temp: 26, max_temp: 34, condition: "Sunny", chance_of_rain: 10, rainfall_mm: 0, humidity: 55, wind_kph: 11 },
        { date: "2026-09-12", day: "Fri", min_temp: 26, max_temp: 35, condition: "Sunny", chance_of_rain: 0, rainfall_mm: 0, humidity: 50, wind_kph: 10 },
        { date: "2026-09-13", day: "Sat", min_temp: 27, max_temp: 35, condition: "Sunny", chance_of_rain: 0, rainfall_mm: 0, humidity: 48, wind_kph: 12 },
        { date: "2026-09-14", day: "Sun", min_temp: 26, max_temp: 34, condition: "Partly Cloudy", chance_of_rain: 20, rainfall_mm: 0.5, humidity: 60, wind_kph: 15 },
      ],
      history7Days: generateLast7DaysHistory(28),
      insights: [
        { title: "Rain Advisory", type: "warning", message: "Heavy rain may occur between 1 PM and 4 PM today.", icon: "rain" },
        { title: "Travel Recommendation", type: "info", message: "Travel conditions may become difficult during afternoon rainfall.", icon: "car" },
        { title: "Agriculture Insight", type: "success", message: "High humidity and rainfall will benefit local Kharif crops.", icon: "leaf" },
      ]
    };
  }
};
