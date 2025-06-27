import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import URLShortenerPage from '../components/URLShortenerPage';
import StatsPage from '../components/StatsPage';
import RedirectHandler from '../components/RedirectHandler';
import { Log } from '../utils/logger';

// Component to log route changes
const RouteLogger: React.FC<{ children: React.ReactNode; routeName: string }> = ({ children, routeName }) => {
  React.useEffect(() => {
    Log('client', 'info', 'Router', `Navigated to route: ${routeName}`);
  }, [routeName]);

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Home page - URL Shortener */}
      <Route 
        path="/" 
        element={
          <RouteLogger routeName="URLShortener">
            <URLShortenerPage />
          </RouteLogger>
        } 
      />
      
      {/* Stats page */}
      <Route 
        path="/stats" 
        element={
          <RouteLogger routeName="Stats">
            <StatsPage />
          </RouteLogger>
        } 
      />
      
      {/* Dynamic redirect route for shortcodes */}
      <Route 
        path="/:shortcode" 
        element={
          <RouteLogger routeName="Redirect">
            <RedirectHandler />
          </RouteLogger>
        } 
      />
      
      {/* Catch-all route - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;