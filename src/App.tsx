import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import WeatherMapPage from './pages/WeatherMapPage';
import AlertsPage from './pages/AlertsPage';
import ClimatePage from './pages/ClimatePage';
import ProfilePage from './pages/ProfilePage';
import VoiceAssistantPage from './pages/VoiceAssistantPage';
import { ThemeProvider } from './hooks/useTheme';
import { WeatherAlertsProvider } from './hooks/useWeatherAlerts';

function App() {
  return (
    <ThemeProvider>
      <WeatherAlertsProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="map" element={<WeatherMapPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="climate" element={<ClimatePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="assistant" element={<VoiceAssistantPage />} />
          <Route path="chat" element={<VoiceAssistantPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        </Routes>
      </WeatherAlertsProvider>
    </ThemeProvider>
  );
}

export default App;
