// src/components/Dialogs/EditTemplateDialog.js
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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const EditTemplateDialog = ({ open, onClose, template, onSave }) => {
  const [title, setTitle] = useState('');
  const [sessions, setSessions] = useState(5);
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (template) {
        setTitle(template.title || '');
        setSessions(template.sessions || 5);
        setDuration(template.duration || 30);
      } else {
        setTitle('');
        setSessions(5);
        setDuration(30);
      }
      setError('');
    }
  }, [template, open]);

  const validateForm = () => {
    const trimmedTitle = (title || '').trim();
    if (!trimmedTitle) {
      setError('Template name is required');
      return false;
    }
    if (sessions <= 0) {
      setError('Number of sessions must be greater than 0');
      return false;
    }
    if (duration <= 0) {
      setError('Duration must be greater than 0');
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    onSave({
      ...template,
      title: title.trim(),
      sessions: parseInt(sessions),
      duration: parseInt(duration),
      id: template ? template.id : Date.now().toString()
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
          {template ? 'Edit Template' : 'Add New Template'}
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
            label="Template Name"
            fullWidth
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            error={!!error && !title.trim()}
            helperText={!title.trim() ? "Template name is required" : ""}
          />
          <TextField
            margin="dense"
            label="Number of Sessions"
            type="number"
            fullWidth
            value={sessions}
            onChange={(e) => {
              setSessions(parseInt(e.target.value) || 0);
              setError('');
            }}
            error={!!error && sessions <= 0}
            helperText={sessions <= 0 ? "Number of sessions must be greater than 0" : ""}
            InputProps={{
              inputProps: { min: 1 }
            }}
          />
          <FormControl 
            fullWidth 
            margin="dense"
            error={!!error && duration <= 0}
          >
            <InputLabel>Duration</InputLabel>
            <Select
              value={duration}
              label="Duration"
              onChange={(e) => {
                setDuration(e.target.value);
                setError('');
              }}
            >
              <MenuItem value={15}>15 minutes</MenuItem>
              <MenuItem value={30}>30 minutes</MenuItem>
              <MenuItem value={45}>45 minutes</MenuItem>
              <MenuItem value={60}>1 hour</MenuItem>
              <MenuItem value={90}>1.5 hours</MenuItem>
              <MenuItem value={120}>2 hours</MenuItem>
            </Select>
          </FormControl>
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
          {template ? 'Save Changes' : 'Add Template'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTemplateDialog;
