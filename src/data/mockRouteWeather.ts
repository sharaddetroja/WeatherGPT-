export interface RouteLocation {
  name: string;
  latitude: number;
  longitude: number;
}

export interface RouteSummaryInfo {
  source: RouteLocation;
  destination: RouteLocation;
  distance_km: number;
  duration_minutes: number;
  departure_time: string;
}

export interface RoutePlaceWeather {
  temp_c?: number;
  condition?: string;
  icon?: string;
  humidity?: number;
  wind_kph?: number;
  rain_probability?: number;
}

export interface RoutePlace {
  name: string;
  type: 'source' | 'route_place' | 'destination';
  latitude: number;
  longitude: number;
  distance_from_start_km: number;
  estimated_arrival: string;
  weather: RoutePlaceWeather | null;
}

export interface RouteAlert {
  id?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location?: string;
}

export interface RouteWeatherData {
  success: boolean;
  route: RouteSummaryInfo;
  places: RoutePlace[];
  alerts: RouteAlert[];
}

export const mockRouteWeather: RouteWeatherData = {
  success: true,
  route: {
    source: {
      name: "Morbi",
      latitude: 22.8004,
      longitude: 70.8862
    },
    destination: {
      name: "Surat",
      latitude: 21.1702,
      longitude: 72.8311
    },
    distance_km: 438.5,
    duration_minutes: 500,
    departure_time: "2026-09-12T17:47:09.160Z"
  },
  places: [
    {
      name: "Morbi",
      type: "source",
      latitude: 22.8004,
      longitude: 70.8862,
      distance_from_start_km: 0,
      estimated_arrival: "2026-09-12T17:47:09.160Z",
      weather: null
    },
    {
      name: "Wankaner",
      type: "route_place",
      latitude: 22.612,
      longitude: 70.9438,
      distance_from_start_km: 25.5,
      estimated_arrival: "2026-09-12T18:16:09.160Z",
      weather: null
    },
    {
      name: "Chotila",
      type: "route_place",
      latitude: 22.4227,
      longitude: 71.1864,
      distance_from_start_km: 62.2,
      estimated_arrival: "2026-09-12T18:58:09.160Z",
      weather: null
    },
    {
      name: "Doliya",
      type: "route_place",
      latitude: 22.5229971,
      longitude: 71.3677411,
      distance_from_start_km: 84.7,
      estimated_arrival: "2026-09-12T19:24:09.160Z",
      weather: null
    },
    {
      name: "Chuda",
      type: "route_place",
      latitude: 22.5456,
      longitude: 71.5788,
      distance_from_start_km: 107,
      estimated_arrival: "2026-09-12T19:49:09.160Z",
      weather: null
    },
    {
      name: "Limbdi",
      type: "route_place",
      latitude: 22.5659,
      longitude: 71.7229,
      distance_from_start_km: 122.1,
      estimated_arrival: "2026-09-12T20:06:09.160Z",
      weather: null
    },
    {
      name: "Bagodra",
      type: "route_place",
      latitude: 22.5745,
      longitude: 72.0138,
      distance_from_start_km: 152.2,
      estimated_arrival: "2026-09-12T20:41:09.160Z",
      weather: null
    },
    {
      name: "Bavla",
      type: "route_place",
      latitude: 22.616,
      longitude: 72.1507,
      distance_from_start_km: 167.1,
      estimated_arrival: "2026-09-12T20:58:09.160Z",
      weather: null
    },
    {
      name: "Tarapur",
      type: "route_place",
      latitude: 22.4953,
      longitude: 72.6417,
      distance_from_start_km: 227,
      estimated_arrival: "2026-09-12T22:06:09.160Z",
      weather: null
    },
    {
      name: "Petlad",
      type: "route_place",
      latitude: 22.4268,
      longitude: 72.7664,
      distance_from_start_km: 242.2,
      estimated_arrival: "2026-09-12T22:23:09.160Z",
      weather: null
    },
    {
      name: "Borsad",
      type: "route_place",
      latitude: 22.4111,
      longitude: 72.9006,
      distance_from_start_km: 255.6,
      estimated_arrival: "2026-09-12T22:38:09.160Z",
      weather: null
    },
    {
      name: "Surat",
      type: "destination",
      latitude: 21.1702,
      longitude: 72.8311,
      distance_from_start_km: 438.5,
      estimated_arrival: "2026-09-13T02:07:09.160Z",
      weather: null
    }
  ],
  alerts: []
};
