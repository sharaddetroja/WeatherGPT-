import { useState } from 'react';
import { Car, ShieldCheck, AlertTriangle, Clock, CloudRain, Sun, Navigation } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export interface RouteOption {
  id: string;
  name: string;
  distance: string;
  travelTime: string;
  safetyScore: number;
  hazardSummary: string;
  bestDeparture: string;
  waypoints: Array<{
    city: string;
    weather: string;
    temp: string;
    rainProb: number;
    wind: string;
    visibility: string;
  }>;
}

const ROUTES: RouteOption[] = [
  {
    id: 'rajkot-ahmedabad',
    name: 'Rajkot ➔ Ahmedabad (NH47 Highway)',
    distance: '215 km',
    travelTime: '3h 45m',
    safetyScore: 78,
    hazardSummary: 'Moderate rain band near Chotila & Sayla (ETA 4:30 PM). Reduced visibility to 3.5 km.',
    bestDeparture: 'Saturday 8:00 AM (95% dry road window)',
    waypoints: [
      { city: 'Rajkot', weather: 'Partly Cloudy', temp: '28°C', rainProb: 20, wind: '12 km/h', visibility: '10 km' },
      { city: 'Chotila', weather: 'Heavy Showers', temp: '26°C', rainProb: 80, wind: '28 km/h', visibility: '3.5 km' },
      { city: 'Limbdi', weather: 'Light Drizzle', temp: '27°C', rainProb: 40, wind: '18 km/h', visibility: '6 km' },
      { city: 'Ahmedabad', weather: 'Overcast', temp: '30°C', rainProb: 30, wind: '14 km/h', visibility: '8 km' },
    ]
  },
  {
    id: 'mumbai-pune',
    name: 'Mumbai ➔ Pune (Yashwantrao Chavan Expressway)',
    distance: '148 km',
    travelTime: '2h 30m',
    safetyScore: 64,
    hazardSummary: 'Dense fog & heavy downpours at Khandala Ghat. High risk of hydroplaning.',
    bestDeparture: 'Tomorrow 7:30 AM',
    waypoints: [
      { city: 'Mumbai', weather: 'Thunderstorms', temp: '27°C', rainProb: 90, wind: '35 km/h', visibility: '2.5 km' },
      { city: 'Lonavala / Ghat', weather: 'Heavy Fog & Torrential Rain', temp: '22°C', rainProb: 95, wind: '45 km/h', visibility: '1.2 km' },
      { city: 'Pune', weather: 'Moderate Rain', temp: '25°C', rainProb: 60, wind: '20 km/h', visibility: '5 km' },
    ]
  },
  {
    id: 'delhi-jaipur',
    name: 'Delhi ➔ Jaipur (NH48 Highway)',
    distance: '280 km',
    travelTime: '4h 50m',
    safetyScore: 92,
    hazardSummary: 'Clear highway conditions. High UV exposure at noon.',
    bestDeparture: 'Anytime today',
    waypoints: [
      { city: 'Delhi', weather: 'Sunny', temp: '34°C', rainProb: 10, wind: '10 km/h', visibility: '10 km' },
      { city: 'Gurugram', weather: 'Sunny', temp: '35°C', rainProb: 10, wind: '12 km/h', visibility: '10 km' },
      { city: 'Behror', weather: 'Clear', temp: '36°C', rainProb: 0, wind: '14 km/h', visibility: '10 km' },
      { city: 'Jaipur', weather: 'Sunny', temp: '37°C', rainProb: 0, wind: '15 km/h', visibility: '10 km' },
    ]
  }
];

export default function TravelPlannerPage() {
  const { t } = useLanguage();
  const [selectedRoute, setSelectedRoute] = useState<RouteOption>(ROUTES[0]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-200 font-bold text-xs uppercase tracking-wider mb-1">
              <Car className="w-4 h-4" />
              <span>Smart Travel Weather & Highway Radar</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black">{t('travel_title', 'Highway & Trip Safety Planner')}</h1>
            <p className="text-sm text-blue-100 mt-1 max-w-xl">
              {t('travel_subtitle', 'Real-time road weather conditions, highway visibility, and travel recommendations.')}
            </p>
          </div>
        </div>
      </div>

      {/* Select Route Tabs */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider">Select Highway Route:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ROUTES.map((route) => (
            <button
              key={route.id}
              onClick={() => setSelectedRoute(route)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedRoute.id === route.id
                  ? 'bg-primary/10 border-primary shadow-md ring-2 ring-primary/20'
                  : 'bg-card hover:bg-muted border-border'
              }`}
            >
              <div className="font-extrabold text-sm text-foreground">{route.name}</div>
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>{route.distance} • {route.travelTime}</span>
                <span className={`font-bold ${route.safetyScore > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  Safety Score: {route.safetyScore}/100
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Route Detailed Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border shadow-lg space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-foreground">{selectedRoute.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Total Distance: {selectedRoute.distance} • Approx Drive: {selectedRoute.travelTime}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-muted-foreground block uppercase">Highway Safety Index</span>
                <span className={`text-2xl font-black ${selectedRoute.safetyScore > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {selectedRoute.safetyScore} / 100
                </span>
              </div>
            </div>

            {/* Optimal Departure Time Window Box */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-500 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Recommended Departure Window</div>
                <div className="text-sm font-extrabold text-foreground">{selectedRoute.bestDeparture}</div>
              </div>
            </div>

            {/* Hazard Warning Callout */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-700 dark:text-amber-300 text-xs">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong className="font-bold">Live Highway Hazard: </strong>
                <span>{selectedRoute.hazardSummary}</span>
              </div>
            </div>

            {/* Hour-by-Hour Waypoints Breakdown */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Route Waypoint Weather Conditions</h3>
              <div className="divide-y divide-border/60">
                {selectedRoute.waypoints.map((pt, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-[120px]">
                      <Navigation className="w-4 h-4 text-primary" />
                      <span className="font-extrabold text-sm text-foreground">{pt.city}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {pt.rainProb > 50 ? <CloudRain className="w-4 h-4 text-blue-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
                      <span className="font-semibold text-foreground">{pt.weather}</span>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-bold text-foreground block">{pt.temp}</span>
                      <span className="text-[10px] text-muted-foreground">Vis: {pt.visibility} • Rain: {pt.rainProb}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Driving Tips Sidebar */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-card border border-border shadow-lg space-y-3">
            <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Monsoon Driving Safety Checklist</span>
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Check windshield wiper blades & washer fluid reservoir.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Keep headlights on low-beam during heavy rain bands.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span>Maintain 4-second braking distance on wet highway pavement.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
