import React from 'react';
import { Box, Button } from '@mui/material';

const Header = ({ 
  isLoggedIn, 
  isConnecting, 
  onConnect, 
  onDisconnect, 
  onLogout 
}) => {
  return (
    <Box sx={{ 
      p: 2, 
      borderBottom: 1, 
      borderColor: 'divider',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 1100
    }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={onConnect}
          disabled={isLoggedIn || isConnecting}
          sx={{
            minWidth: '180px',
            '&.Mui-disabled': {
              backgroundColor: isLoggedIn ? '#4caf50' : undefined,
              color: isLoggedIn ? 'white' : undefined,
            }
          }}
        >
          {isConnecting ? 'Connecting...' : 
           isLoggedIn ? 'Connected to Google' : 
           'Connect Google Calendar'}
        </Button>
        
        {isLoggedIn && (
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={onDisconnect}
            sx={{
              minWidth: '100px'
            }}
          >
            Disconnect
          </Button>
        )}
      </Box>

      <Button 
        onClick={onLogout}
        variant="outlined"
        size="small"
        color="error"
        sx={{
          minWidth: '100px'
        }}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Header;
