import { useState, useEffect } from 'react';
import { Waves, Anchor, ShieldAlert, Thermometer, Wind, Eye } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { fetchBackendWeather } from '../services/weatherGptApi';

export interface CoastalZone {
  id: string;
  name: string;
  region: string;
  waveHeight: string;
  seaTemp: string;
  windSpeed: string;
  visibility: string;
  alertLevel: 'Red Alert' | 'Orange Advisory' | 'Clear Safe';
  highTide: string;
  lowTide: string;
  advisoryEn: string;
}

const COASTAL_ZONES: CoastalZone[] = [
  {
    id: 'saurashtra',
    name: 'Saurashtra Coast & Gulf of Khambhat',
    region: 'Gujarat Coastal Belt',
    waveHeight: '2.8 - 3.4 meters (Rough Sea)',
    seaTemp: '27.4°C',
    windSpeed: '45 - 62 km/h NW',
    visibility: '3.0 km',
    alertLevel: 'Red Alert',
    highTide: '03:45 PM (4.2m)',
    lowTide: '09:20 PM (0.8m)',
    advisoryEn: 'High wave warning and gale squalls up to 62 km/h. Fishermen are strictly advised not to venture into sea.'
  },
  {
    id: 'porbandar-dwarka',
    name: 'Porbandar & Dwarka Coastline',
    region: 'Arabian Sea Corridor',
    waveHeight: '2.1 - 2.6 meters (Moderate to Rough)',
    seaTemp: '26.8°C',
    windSpeed: '32 - 40 km/h W',
    visibility: '5.0 km',
    alertLevel: 'Orange Advisory',
    highTide: '04:10 PM (3.8m)',
    lowTide: '10:05 PM (1.1m)',
    advisoryEn: 'Moderate sea state. Small boat operators should exercise caution near shore and avoid open reef zones.'
  },
  {
    id: 'mumbai-coast',
    name: 'Konkan & Mumbai Coastal Waters',
    region: 'Maharashtra Coastline',
    waveHeight: '1.5 - 2.0 meters (Slight)',
    seaTemp: '28.2°C',
    windSpeed: '20 - 28 km/h SW',
    visibility: '7.5 km',
    alertLevel: 'Clear Safe',
    highTide: '02:30 PM (3.4m)',
    lowTide: '08:45 PM (1.3m)',
    advisoryEn: 'Sea conditions normal. Safe for offshore fishing, commercial shipping, and harbor navigation.'
  }
];

export default function MarineSafetyPage() {
  const { t } = useLanguage();
  const [selectedZone, setSelectedZone] = useState<CoastalZone>(COASTAL_ZONES[0]);
  const [liveWeather, setLiveWeather] = useState<any>(null);

  useEffect(() => {
    const zoneCityMap: Record<string, string> = {
      'saurashtra': 'Bhavnagar',
      'porbandar-dwarka': 'Dwarka',
      'mumbai-coast': 'Mumbai'
    };
    const targetCity = zoneCityMap[selectedZone.id] || 'Bhavnagar';
    fetchBackendWeather(targetCity).then(res => {
      if (res && res.success && res.data?.current) {
        setLiveWeather(res.data.current);
      }
    }).catch(() => {});
  }, [selectedZone.id]);

  const alertColor = 
    selectedZone.alertLevel === 'Red Alert' ? 'bg-red-500/15 text-red-600 border-red-500/30' :
    selectedZone.alertLevel === 'Orange Advisory' ? 'bg-orange-500/15 text-orange-600 border-orange-500/30' :
    'bg-emerald-500/15 text-emerald-600 border-emerald-500/30';

  return (
    <div className="space-y-4 sm:space-y-6 pb-2 sm:pb-4 animate-in fade-in duration-300 text-white">
      {/* Header Banner */}
      <div className="glass-panel p-4 xs:p-5 sm:p-7 rounded-2xl xs:rounded-3xl border border-white/20 shadow-xl backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider mb-1">
            <Anchor className="w-4 h-4" />
            <span>Marine & Coastal Safety</span>
          </div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-white">{t('marine_title', 'Marine Safety Advisory')}</h1>
          <p className="text-xs text-white/70 mt-1 max-w-xl">
            {t('marine_subtitle', 'Tidal height, wave dynamics, sea surface temperature, and fisherman warnings.')}
          </p>
        </div>
      </div>

      {/* Select Coastal Zone */}
      <div className="space-y-3">
        <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">Select Coastal Zone:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 xs:gap-3">
          {COASTAL_ZONES.map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              className={`p-3.5 xs:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedZone.id === zone.id
                  ? 'glass-pill-active border-teal-400 text-white shadow-md ring-2 ring-teal-400/20 scale-[1.01]'
                  : 'glass-panel hover:bg-white/10 border-white/15 text-white/90'
              }`}
            >
              <div className="font-extrabold text-xs xs:text-sm text-white">{zone.name}</div>
              <div className="text-[11px] xs:text-xs text-white/60 mt-0.5">{zone.region}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Zone Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="glass-panel p-4 xs:p-5 sm:p-6 rounded-2xl xs:rounded-3xl border border-white/20 shadow-xl backdrop-blur-xl space-y-4 xs:space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg xs:text-xl font-black text-white">{selectedZone.name}</h2>
                <p className="text-xs text-white/70">{selectedZone.region}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[11px] xs:text-xs font-black border uppercase tracking-wider ${alertColor}`}>
                {selectedZone.alertLevel}
              </span>
            </div>

            {/* Warning Callout */}
            <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
              selectedZone.alertLevel === 'Red Alert' ? 'bg-red-500/20 border-red-400/40 text-red-200' : 'bg-amber-500/20 border-amber-400/40 text-amber-200'
            }`}>
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-300" />
              <div>
                <strong className="font-extrabold block text-sm mb-0.5">Maritime Safety Advisory:</strong>
                <span>{selectedZone.advisoryEn}</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 xs:gap-3">
              <div className="p-3 xs:p-3.5 rounded-2xl glass-panel border border-white/15">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white/70">
                  <Waves className="w-4 h-4 text-cyan-400" />
                  <span>Wave Height</span>
                </div>
                <div className="text-xs xs:text-sm font-black text-white mt-1">{selectedZone.waveHeight}</div>
              </div>

              <div className="p-3 xs:p-3.5 rounded-2xl glass-panel border border-white/15">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white/70">
                  <Wind className="w-4 h-4 text-teal-400" />
                  <span>Wind Velocity</span>
                </div>
                <div className="text-xs xs:text-sm font-black text-white mt-1">
                  {liveWeather ? `${liveWeather.windSpeed} km/h` : selectedZone.windSpeed}
                </div>
              </div>

              <div className="p-3 xs:p-3.5 rounded-2xl glass-panel border border-white/15">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white/70">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <span>Sea Surface Temp</span>
                </div>
                <div className="text-xs xs:text-sm font-black text-white mt-1">
                  {liveWeather ? `${liveWeather.temperature}°C` : selectedZone.seaTemp}
                </div>
              </div>

              <div className="p-3 xs:p-3.5 rounded-2xl glass-panel border border-white/15">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white/70">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>Coastal Visibility</span>
                </div>
                <div className="text-xs xs:text-sm font-black text-white mt-1">
                  {liveWeather?.visibility ? `${Math.round(liveWeather.visibility / 1000)} km` : selectedZone.visibility}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* High / Low Tide Timetable */}
        <div className="space-y-4">
          <div className="glass-panel p-4 xs:p-5 rounded-2xl xs:rounded-3xl border border-white/20 shadow-xl backdrop-blur-xl space-y-3">
            <h3 className="font-extrabold text-xs xs:text-sm text-white uppercase tracking-wider">Tide Schedule</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-cyan-300 uppercase">High Tide</span>
                  <div className="text-sm xs:text-base font-black text-white mt-0.5">{selectedZone.highTide}</div>
                </div>
                <Waves className="w-7 h-7 xs:w-8 xs:h-8 text-cyan-300 animate-pulse" />
              </div>

              <div className="p-4 rounded-2xl glass-panel border border-white/15 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-white/70 uppercase">Low Tide</span>
                  <div className="text-sm xs:text-base font-black text-white mt-0.5">{selectedZone.lowTide}</div>
                </div>
                <Anchor className="w-5 h-5 xs:w-6 xs:h-6 text-white/60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
