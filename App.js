import { ConfigDialog } from './ConfigDialog';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  TextField,
  Select,
  MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addDays from 'date-fns/addDays';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { GoogleOAuthProvider, useGoogleLogin, googleLogout } from '@react-oauth/google';
import useGoogleCalendarService from './services/GoogleCalendarService';

const clientId = 'YOUR_GOOGLE_CLIENT_ID';

const DragAndDropCalendar = withDragAndDrop(Calendar);

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const EventComponent = ({ event, onDeleteEvent }) => (
  <div style={{
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px'
  }}>
    <span style={{ flex: 1 }}>{event.title}</span>
    <IconButton
      size="small"
      onClick={(e) => {
        e.stopPropagation();
        onDeleteEvent(event);
      }}
      style={{ color: 'white', padding: 2 }}
    >
      <DeleteIcon style={{ fontSize: '14px' }} />
    </IconButton>
  </div>
);

const DraggableTaskTemplate = ({ template, onClick, isActive, remainingSessions }) => (
  <Paper
    elevation={1}
    onClick={onClick}
    sx={{
      p: 2,
      my: 1,
      cursor: remainingSessions > 0 ? 'pointer' : 'not-allowed',
      opacity: remainingSessions > 0 ? 1 : 0.5,
      backgroundColor: isActive ? '#e3f2fd' : 'inherit',
      '&:hover': { backgroundColor: isActive ? '#bbdefb' : '#f5f5f5' },
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: isActive ? '2px solid #2196f3' : '1px solid #e0e0e0',
    }}
  >
    <div>
      <Typography variant="subtitle1">{template.title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {template.duration || 30} minutes
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {remainingSessions} sessions remaining
      </Typography>
    </div>
  </Paper>
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const now = new Date();
    const nineAM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
    setCurrentDate(nineAM);
  }, []);

  const [weekMode, setWeekMode] = useState(() => {
    return localStorage.getItem('weekMode') || 'normal';
  });

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('events');
    return saved ? JSON.parse(saved, (key, value) => {
      if (key === 'start' || key === 'end') {
        return new Date(value);
      }
      return value;
    }) : [];
  });

  const [activeTemplate, setActiveTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [usedSessions, setUsedSessions] = useState(() => {
    const saved = localStorage.getItem('usedSessions');
    return saved ? JSON.parse(saved) : {};
  });
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  const [weekConfigs, setWeekConfigs] = useState(() => {
    const saved = localStorage.getItem('weekConfigs');
    return saved ? JSON.parse(saved) : [
      {
        name: 'Normal',
        value: 'normal',
        totalSessions: 30,
        tasks: [
          { id: 'reading', title: 'Reading Session', sessions: 6 },
          { id: 'exercise', title: 'Exercise', sessions: 5 }
        ]
      },
      {
        name: 'Reduced',
        value: 'reduced',
        totalSessions: 20,
        tasks: [
          { id: 'reading', title: 'Reading Session', sessions: 4 },
          { id: 'exercise', title: 'Exercise', sessions: 3 }
        ]
      }
    ];
  });

  const [googleEvents, setGoogleEvents] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const { signIn, logout, isLoggedIn, getEvents, createEvent, updateEvent, deleteEvent } = useGoogleCalendarService();

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('usedSessions', JSON.stringify
