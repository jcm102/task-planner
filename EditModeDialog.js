// src/components/Dialogs/EditModeDialog.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert
} from '@mui/material';

const EditModeDialog = ({ open, onClose, mode, onSave }) => {
  const [name, setName] = useState(mode ? mode.name : '');
  const [totalSessions, setTotalSessions] = useState(mode ? mode.totalSessions : 30);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode) {
      setName(mode.name);
      setTotalSessions(mode.totalSessions);
    } else {
      setName('');
      setTotalSessions(30);
    }
    setError('');
  }, [mode]);

  const validateForm = () => {
    if (!name.trim()) {
      setError('Mode name is required');
      return false;
    }
    if (totalSessions <= 0) {
      setError('Total sessions must be greater than 0');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    onSave({
      ...mode,
      name: name.trim(),
      totalSessions: parseInt(totalSessions),
      value: mode ? mode.value : name.toLowerCase().replace(/\s+/g, '-'),
      tasks: mode ? mode.tasks : []
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minWidth: '300px' }
      }}
    >
      <DialogTitle>
        <Typography variant="h6">
          {mode ? 'Edit Mode' : 'Add New Mode'}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Mode Name"
            fullWidth
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            error={!!error && !name.trim()}
            helperText={!name.trim() ? "Mode name is required" : ""}
          />
          <TextField
            margin="dense"
            label="Total Sessions"
            type="number"
            fullWidth
            value={totalSessions}
            onChange={(e) => {
              setTotalSessions(parseInt(e.target.value) || 0);
              setError('');
            }}
            error={!!error && totalSessions <= 0}
            helperText={totalSessions <= 0 ? "Total sessions must be greater than 0" : ""}
            InputProps={{
              inputProps: { min: 1 }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          color="primary"
        >
          {mode ? 'Save Changes' : 'Add Mode'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditModeDialog;
