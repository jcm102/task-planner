import { useGoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

const useGoogleCalendarService = () => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('googleAccessToken'));

  const login = useGoogleLogin({
    onSuccess: (response) => {
      console.log('Login Success:', response);
      if (response.access_token) {
        setAccessToken(response.access_token);
        localStorage.setItem('googleAccessToken', response.access_token);
        return response.access_token;
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setAccessToken(null);
      localStorage.removeItem('googleAccessToken');
      throw new Error('Failed to connect to Google Calendar');
    },
    scope: 'https://www.googleapis.com/auth/calendar',
    flow: 'implicit'
  });

  const logout = () => {
    setAccessToken(null);
    localStorage.removeItem('googleAccessToken');
  };

  const isLoggedIn = () => {
    return !!accessToken;
  };

const getEvents = async (start, end) => {
  const token = accessToken || localStorage.getItem('googleAccessToken');
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?` + 
      `timeMin=${start.toISOString()}&` +
      `timeMax=${end.toISOString()}&` +
      `singleEvents=true&` +
      `orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        throw new Error('Authentication expired. Please reconnect to Google Calendar.');
      }
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch events');
    }

    const data = await response.json();
    console.log('Fetched Google Calendar events:', data.items); // Debug log

    return data.items
      .filter(event => event.start?.dateTime && event.end?.dateTime) // Only include events with times
      .map(event => ({
        id: event.id,
        title: event.summary || 'Untitled Event',
        start: new Date(event.start.dateTime),
        end: new Date(event.end.dateTime),
        googleEventId: event.id,
        isExternalEvent: true,
        backgroundColor: '#808080', // Gray color for external events
        editable: false // Make external events non-editable
      }));
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
};

  const createEvent = async (event) => {
    const token = accessToken || localStorage.getItem('googleAccessToken');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.title,
          start: {
            dateTime: event.start.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: event.end.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        })
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        throw new Error('Authentication expired. Please reconnect to Google Calendar.');
      }
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to create event');
    }

    const data = await response.json();
    return data.id;
  };

  const updateEvent = async (event) => {
    const token = accessToken || localStorage.getItem('googleAccessToken');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.googleEventId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: event.title,
          start: {
            dateTime: event.start.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: event.end.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        })
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        logout();
        throw new Error('Authentication expired. Please reconnect to Google Calendar.');
      }
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to update event');
    }

    return true;
  };

  const deleteEvent = async (eventId) => {
    const token = accessToken || localStorage.getItem('googleAccessToken');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );

    if (!response.ok && response.status !== 410) {
      if (response.status === 401) {
        logout();
        throw new Error('Authentication expired. Please reconnect to Google Calendar.');
      }
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to delete event');
    }

    return true;
  };

  return {
    login,
    logout,
    isLoggedIn,
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent
  };
};

export default useGoogleCalendarService;
