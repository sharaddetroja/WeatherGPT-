import { User, Settings, Bell, MapPin, Moon, Sun, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { useTheme } from '../hooks/useTheme';

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <User className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-3xl font-bold">
              JD
            </div>
            <div className="flex-1 text-center md:text-left space-y-2">
              <h2 className="text-2xl font-bold">John Doe</h2>
              <p className="text-muted-foreground">john.doe@example.com</p>
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm font-medium text-primary bg-primary/10 w-fit mx-auto md:mx-0 px-3 py-1 rounded-full">
                <MapPin className="w-4 h-4" />
                Rajkot, Gujarat
              </div>
            </div>
            <button className="px-4 py-2 border rounded-xl hover:bg-muted font-medium transition-colors">
              Edit Profile
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Temperature Unit</p>
                <p className="text-sm text-muted-foreground">Celsius or Fahrenheit</p>
              </div>
              <select className="border rounded-lg px-3 py-2 bg-background focus:ring-2 focus:ring-primary outline-none">
                <option>Celsius (°C)</option>
                <option>Fahrenheit (°F)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Appearance</p>
                <p className="text-sm text-muted-foreground">Light or dark theme</p>
              </div>
              <div className="flex bg-muted rounded-xl p-1">
                <button 
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${theme === 'light' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weather Alerts</p>
                <p className="text-sm text-muted-foreground">Severe weather warnings</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Forecast</p>
                <p className="text-sm text-muted-foreground">Morning weather summary</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>
    </div>
  );
}
