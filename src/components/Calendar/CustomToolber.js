import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { format } from 'date-fns';

const CustomToolbar = (toolbar) => {
  const navigate = (action) => {
    toolbar.onNavigate(action);
  };

  const currentDate = toolbar.date;
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      mb: 2,
      width: '100%',
      backgroundColor: 'white',
      pt: 2,
      pb: 1,
      borderBottom: '1px solid #e0e0e0'
    }}>
      <Typography 
        variant="h6" 
        sx={{ 
          fontWeight: 'bold',
          mb: 2,
          color: 'primary.main'
        }}
      >
        Week of {format(weekStart, 'MMMM d, yyyy')}
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
      }}>
        <IconButton 
          onClick={() => navigate('PREV')}
          sx={{ 
            '&:hover': { 
              backgroundColor: 'rgba(0, 0, 0, 0.04)' 
            }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Button
          variant="contained"
          onClick={() => navigate('TODAY')}
          sx={{ 
            mx: 2,
            px: 3,
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            }
          }}
        >
          Today
        </Button>
        <IconButton 
          onClick={() => navigate('NEXT')}
          sx={{ 
            '&:hover': { 
              backgroundColor: 'rgba(0, 0, 0, 0.04)' 
            }
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CustomToolbar;
