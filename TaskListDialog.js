// src/components/Dialogs/TaskListDialog.js
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Box,
  Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';

const TaskListDialog = ({ 
  open, 
  onClose, 
  tasks = [], 
  onEditTask, 
  onAddTask 
}) => {
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
        <Typography variant="h6">Manage Task Templates</Typography>
      </DialogTitle>
      <DialogContent>
        {tasks.length === 0 ? (
          <Typography color="textSecondary" sx={{ py: 2, textAlign: 'center' }}>
            No templates yet. Click 'Add Template' to create one.
          </Typography>
        ) : (
          <List>
            {tasks.map((task, index) => (
              <React.Fragment key={task.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText 
                    primary={task.title}
                    secondary={
                      <Box component="span">
                        <Typography variant="body2" component="span">
                          {task.sessions} sessions
                        </Typography>
                        <Typography 
                          variant="body2" 
                          component="span" 
                          sx={{ ml: 2 }}
                        >
                          {task.duration || 30} minutes
                        </Typography>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => onEditTask(task)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button 
          onClick={onAddTask}
          startIcon={<AddIcon />}
          variant="contained"
          color="primary"
        >
          Add Template
        </Button>
        <Button 
          onClick={onClose}
          variant="outlined"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskListDialog;
