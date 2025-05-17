import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Box, Snackbar, Alert } from '@mui/material';
import Header from './components/Layout/Header';
import CalendarContent from './components/Calendar/CalendarContent';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import useGoogleCalendarService from './services/GoogleCalendarService';
import useNotification from './hooks/useNotification';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import './styles/calendar.css';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('events');
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'start' || key === 'end') {
        return new Date(value);
      }
      return value;
    }) : [];
  });

  const [weekMode, setWeekMode] = useState(() => {
    return localStorage.getItem('weekMode') || 'normal';
  });

  const [weekConfigs, setWeekConfigs] = useState(() => {
    const saved = localStorage.getItem('weekConfigs');
    return saved ? JSON.parse(saved) : [
      {
        name: 'Normal',
        value: 'normal',
        totalSessions: 30,
        tasks: [
          { id: 'reading', title: 'Reading Session', sessions: 6, duration: 30 },
          { id: 'exercise', title: 'Exercise', sessions: 5, duration: 45 }
        ]
      },
      {
        name: 'Reduced',
        value: 'reduced',
        totalSessions: 20,
        tasks: [
          { id: 'reading', title: 'Reading Session', sessions: 4, duration: 30 },
          { id: 'exercise', title: 'Exercise', sessions: 3, duration: 45 }
        ]
      }
    ];
  });

  const [usedSessions, setUsedSessions] = useState(() => {
    const saved = localStorage.getItem('usedSessions');
    return saved ? JSON.parse(saved) : {};
  });

  const { notification, showNotification, hideNotification } = useNotification();
  const googleCalendarService = useGoogleCalendarService();
  const { login, logout, isLoggedIn } = googleCalendarService;
  useEffect(() => {
    const checkAuth = () => {
      if (isLoggedIn()) {
        fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('googleAccessToken')}`,
          }
        }).catch(() => {
          logout();
          showNotification('Google Calendar session expired. Please reconnect.', 'warning');
        });
      }
    };

    checkAuth();
    const interval = setInterval(checkAuth, 5 * 60 * 1000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, [isLoggedIn, logout, showNotification]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    logout(); // Also logout from Google Calendar
    setEvents([]); // Clear events
  };

  const fetchInitialEvents = async () => {
    try {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      const end = new Date();
      end.setDate(end.getDate() + 30);
      
      const googleEvents = await googleCalendarService.getEvents(start, end);
      setEvents(prev => {
        const localEvents = prev.filter(e => !e.isExternalEvent);
        return [...localEvents, ...googleEvents];
      });
    } catch (error) {
      console.error('Failed to fetch initial events:', error);
      showNotification('Failed to fetch calendar events', 'error');
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await login();
      // Wait for token to be set
      setTimeout(async () => {
        if (isLoggedIn()) {
          showNotification('Successfully connected to Google Calendar', 'success');
          await fetchInitialEvents();
        } else {
          throw new Error('Failed to connect to Google Calendar');
        }
      }, 1000);
    } catch (error) {
      console.error('Google Calendar connection error:', error);
      showNotification(`Failed to connect: ${error.message}`, 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    logout();
    setEvents(prev => prev.filter(e => !e.isExternalEvent));
    showNotification('Disconnected from Google Calendar', 'info');
  };

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('weekConfigs', JSON.stringify(weekConfigs));
  }, [weekConfigs]);

  useEffect(() => {
    localStorage.setItem('usedSessions', JSON.stringify(usedSessions));
  }, [usedSessions]);

  useEffect(() => {
    localStorage.setItem('weekMode', weekMode);
  }, [weekMode]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/" /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                  <Header
                    isLoggedIn={isLoggedIn()}
                    isConnecting={isConnecting}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    onLogout={handleLogout}
                  />
                  <CalendarContent 
                    events={events}
                    setEvents={setEvents}
                    weekMode={weekMode}
                    setWeekMode={setWeekMode}
                    weekConfigs={weekConfigs}
                    setWeekConfigs={setWeekConfigs}
                    usedSessions={usedSessions}
                    setUsedSessions={setUsedSessions}
                    isLoggedIn={isLoggedIn()}
                    googleCalendarService={googleCalendarService}
                    showNotification={showNotification}
                    localizer={localizer}
                  />
                </Box>
              </PrivateRoute>
            } 
          />
        </Routes>
        <Snackbar 
          open={notification.open} 
          autoHideDuration={6000} 
          onClose={hideNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={hideNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Router>
    </DndProvider>
  );
}

export default App;
