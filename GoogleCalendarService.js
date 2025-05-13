import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import { useCallback } from 'react';

const clientId = 'YOUR_GOOGLE_CLIENT_ID';

const useGoogleCalendarService = () => {
  const { signIn } = useGoogleLogin({
    onSuccess: (credentialResponse) => {
      console.log(credentialResponse);
      localStorage.setItem('googleCredential', credentialResponse.credential);
    },
    onError: (error) => {
      console.log('Login Failed:', error);
    },
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    clientId,
  });

  const logout = useCallback(() => {
    googleLogout();
    localStorage.removeItem('googleCredential');
  }, []);

  const isLoggedIn = useCallback(() => {
    return !!localStorage.getItem('googleCredential');
  }, []);

  const getEvents = useCallback(async (start, end) => {
    try {
      const credential = localStorage.getItem('googleCredential');
      if (!credential) {
        throw new Error('No credentials found. Please log in.');
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&access_token=${credential}`,
        {
          headers: {
            Authorization: `Bearer ${credential}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }, []);

  const createEvent = useCallback(async (event) => {
    try {
      const credential = localStorage.getItem('googleCredential');
      if (!credential) {
        throw new Error('No credentials found. Please log in.');
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?access_token=${credential}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${credential}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: event.title,
            start: {
              dateTime: event.start.toISOString()
            },
            end: {
              dateTime: event.start.toISOString()
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }, []);

  const updateEvent = useCallback(async (event) => {
    try {
      const credential = localStorage.getItem('googleCredential');
      if (!credential) {
        throw new Error('No credentials found. Please log in.');
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${event.googleEventId}?access_token=${credential}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${credential}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: event.title,
            start: {
              dateTime: event.start.toISOString()
            },
            end: {
              dateTime: event.end.toISOString()
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }, []);

  const deleteEvent = useCallback(async (eventId) => {
    try {
      const credential = localStorage.getItem('googleCredential');
      if (!credential) {
        throw new Error('No credentials found. Please log in.');
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}?access_token=${credential}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${credential}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  });

  return { signIn, logout, isLoggedIn, getEvents, createEvent, updateEvent, deleteEvent };
};

export default useGoogleCalendarService;
