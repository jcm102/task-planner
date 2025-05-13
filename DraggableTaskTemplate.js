import React from 'react';
import { Paper, Typography } from '@mui/material';

function DraggableTaskTemplate({ template, onClick, isActive, remainingSessions }) {
  return (
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
}

export default DraggableTaskTemplate;
