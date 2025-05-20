import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { useDrag } from 'react-dnd';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const DraggableTaskTemplate = ({ 
  template, 
  onClick, 
  isActive, 
  remainingSessions,
  duration = 30 // default duration
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { template },
    canDrag: remainingSessions > 0,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  return (
    <Paper
      ref={drag}
      elevation={1}
      onClick={remainingSessions > 0 ? onClick : undefined}
      sx={{
        p: 2,
        cursor: remainingSessions > 0 ? 'pointer' : 'not-allowed',
        opacity: isDragging ? 0.5 : remainingSessions > 0 ? 1 : 0.5,
        backgroundColor: isActive ? '#e3f2fd' : 'inherit',
        '&:hover': { 
          backgroundColor: remainingSessions > 0 
            ? (isActive ? '#bbdefb' : '#f5f5f5') 
            : 'inherit' 
        },
        border: isActive ? '2px solid #2196f3' : '1px solid #e0e0e0',
        transition: 'all 0.2s ease',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 0.5
      }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: isActive ? 'bold' : 'normal',
            color: remainingSessions > 0 ? 'text.primary' : 'text.secondary'
          }}
        >
          {template.title}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          color: 'text.secondary',
          fontSize: '0.875rem'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 0.5
          }}>
            <AccessTimeIcon sx={{ fontSize: '1rem' }} />
            <Typography variant="body2">
              {formatDuration(duration)}
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              color: remainingSessions === 0 ? 'error.main' : 
                     remainingSessions <= 2 ? 'warning.main' : 
                     'success.main'
            }}
          >
            {remainingSessions} session{remainingSessions !== 1 ? 's' : ''} left
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default DraggableTaskTemplate;
