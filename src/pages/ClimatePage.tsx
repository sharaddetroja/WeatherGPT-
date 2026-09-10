import { BarChart2, TrendingUp, Droplets, ThermometerSun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage } from '../hooks/useLanguage';

const rawTempTrend = [
  { month: 'Jan', tempC: 20 },
  { month: 'Feb', tempC: 23 },
  { month: 'Mar', tempC: 28 },
  { month: 'Apr', tempC: 33 },
  { month: 'May', tempC: 37 },
  { month: 'Jun', tempC: 35 },
  { month: 'Jul', tempC: 31 },
  { month: 'Aug', tempC: 30 },
  { month: 'Sep', tempC: 32 },
  { month: 'Oct', tempC: 30 },
  { month: 'Nov', tempC: 26 },
  { month: 'Dec', tempC: 21 },
];

const rainTrend = [
  { month: 'Jan', rain: 5 },
  { month: 'Feb', rain: 2 },
  { month: 'Mar', rain: 1 },
  { month: 'Apr', rain: 5 },
  { month: 'May', rain: 15 },
  { month: 'Jun', rain: 120 },
  { month: 'Jul', rain: 280 },
  { month: 'Aug', rain: 210 },
  { month: 'Sep', rain: 90 },
  { month: 'Oct', rain: 30 },
  { month: 'Nov', rain: 10 },
  { month: 'Dec', rain: 2 },
];

export default function ClimatePage() {
  const { convertTemp, tempUnitSymbol, preferences } = useUserProfile();
  const { t } = useLanguage();

  const tempTrend = rawTempTrend.map(item => ({
    month: item.month,
    temp: convertTemp(item.tempC),
  }));

  const increaseText = preferences.tempUnit === 'fahrenheit' ? '2.2°F' : '1.2°C';

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <BarChart2 className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">{t('climate_title', 'Climate Trends & Historical Intelligence')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500 text-white rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">Climate Insight</h3>
                <p className="mt-1 text-foreground leading-relaxed">
                  Average temperature has increased by {increaseText} compared with the historical baseline (1990-2020). 
                  Monsoon patterns show higher intensity rainfall over shorter periods.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ThermometerSun className="w-5 h-5 text-orange-500" />
                Average Temperature Trend
              </CardTitle>
              <span className="text-xs font-semibold text-muted-foreground">Unit: {tempUnitSymbol}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tempTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}${tempUnitSymbol}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val) => [`${val}${tempUnitSymbol}`, 'Temperature']}
                  />
                  <Line type="monotone" dataKey="temp" name="Temperature" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              Monthly Rainfall Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rainTrend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}mm`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Bar dataKey="rain" name="Rainfall" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
