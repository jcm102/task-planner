import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

export const ConfigDialog = ({ open, onClose, weekConfigs, onSave }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Week Configuration</DialogTitle>
      <DialogContent>
        {/* We'll add configuration options here later */}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
