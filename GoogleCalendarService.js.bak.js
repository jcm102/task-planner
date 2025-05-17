import { useGoogleLogin } from '@react-oauth/google';
import { useState, useEffect } from 'react';

const useGoogleCalendarService = () => {
  const [accessToken, setAccessToken] = useState(localStorage.getItem('googleAccessToken'));

  useEffect(() => {
    if (accessToken) {
      localStorage.setItem('googleAccessToken', accessToken);
    } else {
      localStorage.removeItem('googleAccessToken');
    }
  }, [accessToken]);

  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
    onSuccess: (tokenResponse) => {
      console.log('Login Success:', tokenResponse);
      if (tokenResponse.access_token) {
        setAccessToken(tokenResponse.access_token);
        return tokenResponse.access_token;
      } else {
        throw new Error('No access token received');
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      setAccessToken(null);
      throw error;
    },
    flow: 'implicit',
    prompt: 'consent'
  });

  const logout = () => {
    setAccessToken(null);
  };

  const isLoggedIn = () => {
    return !!accessToken;
  };

  const handleApiError = async (response) => {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      setAccessToken(null);
      throw new Error('Authentication expired. Please log in again.');
    }
    throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
  };

  const getEvents = async (start, end) => {
    if (!accessToken) {
      throw new Error('No access token found. Please log in.');
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      await handleApiError(response);
    }

    const data = await response.json();
    return data.items
      .filter(event => event.start?.dateTime && event.end?.dateTime)
      .map(event => ({
        id: event.id,
        title: event.summary || 'Untitled Event',
        start: new Date(event.start.dateTime),
        end: new Date(event.end.dateTime),
        googleEventId: event.id,
        isExternalEvent: true
      }));
  };

  const createEvent = async (event) => {
    if (!accessToken) {
      throw new Error('No access token found. Please log in.');
    }

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
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
      await handleApiError(response);
    }

    const data = await response.json();
    return data.id;
  };

  const updateEvent = async (event) => {
    if (!accessToken) {
      throw new Error('No access token found. Please log in.');
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.googleEventId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
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
      await handleApiError(response);
    }

    return true;
  };

  const deleteEvent = async (eventId) => {
    if (!accessToken) {
      throw new Error('No access token found. Please log in.');
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok && response.status !== 410) {
      await handleApiError(response);
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
