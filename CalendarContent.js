import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Calendar, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import DraggableTaskTemplate from '../DraggableTaskTemplate';
import EditModeDialog from '../Dialogs/EditModeDialog';
import EditTemplateDialog from '../Dialogs/EditTemplateDialog';
import TaskListDialog from '../Dialogs/TaskListDialog';
import ConfirmDialog from '../Dialogs/ConfirmDialog';
import CustomToolbar from './CustomToolbar';

const DnDCalendar = withDragAndDrop(Calendar);

const eventStyleGetter = (event) => {
  if (event.isExternalEvent) {
    return {
      style: {
        backgroundColor: '#808080',
        opacity: 0.7,
        color: 'white',
        borderRadius: '3px',
        border: 'none',
        cursor: 'not-allowed',
        padding: '2px 5px'
      }
    };
  }
  return {
    style: {
      backgroundColor: '#3174ad',
      borderRadius: '3px',
      padding: '2px 5px',
      cursor: 'move'
    }
  };
};

const EventComponent = ({ event, onDeleteEvent }) => {
  const [showDelete, setShowDelete] = useState(false);

  if (event.isExternalEvent) {
    return (
      <div 
        style={{ 
          height: '100%',
          padding: '4px 8px',
          fontSize: '0.85em',
          backgroundColor: 'inherit',
          color: 'inherit'
        }}
      >
        {event.title}
      </div>
    );
  }

  return (
    <div 
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 8px',
        position: 'relative',
        backgroundColor: 'inherit',
        color: 'inherit',
        fontSize: '0.85em'
      }}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <span style={{ flex: 1 }}>{event.title}</span>
      {showDelete && !event.isExternalEvent && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteEvent(event);
          }}
          style={{ 
            color: 'white', 
            padding: 2,
            position: 'absolute',
            right: 2,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(0,0,0,0.2)'
          }}
        >
          <DeleteIcon style={{ fontSize: '14px' }} />
        </IconButton>
      )}
    </div>
  );
};
const CalendarContent = ({
  events,
  setEvents,
  weekMode,
  setWeekMode,
  weekConfigs,
  setWeekConfigs,
  usedSessions,
  setUsedSessions,
  isLoggedIn,
  googleCalendarService,
  showNotification,
  localizer
}) => {
  // ... all state declarations and handlers remain the same until the return statement

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', p: 2 }}>
      <Box sx={{ 
        width: 300, 
        mr: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%' 
      }}>
        {/* Week Mode Section */}
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel>Week Mode</InputLabel>
            <Select
              value={weekMode}
              label="Week Mode"
              onChange={(e) => handleModeChange(e.target.value)}
            >
              {weekConfigs.map(mode => (
                <MenuItem key={mode.value} value={mode.value}>
                  {mode.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            gap: 1
          }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleEditMode(null)}
              startIcon={<AddIcon />}
              fullWidth
            >
              Add Mode
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleEditMode(weekConfigs.find(m => m.value === weekMode))}
              startIcon={<EditIcon />}
              fullWidth
            >
              Edit Mode
            </Button>
          </Box>
        </Box>

        {/* Task Templates Section */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2 
          }}>
            <Typography variant="h6">Task Templates</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={() => setTaskListDialogOpen(true)}
            >
              Edit Templates
            </Button>
          </Box>

          {/* Scrollable Task List */}
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto',
            mb: 2,
            pr: 1 // Add space for scrollbar
          }}>
            {weekConfigs
              .find(config => config.value === weekMode)
              ?.tasks.map(template => (
                <Box key={template.id} sx={{ mb: 1 }}>
                  <DraggableTaskTemplate
                    template={template}
                    onClick={() => setActiveTemplate(template)}
                    isActive={activeTemplate?.id === template.id}
                    remainingSessions={
                      template.sessions - (usedSessions[template.id] || 0)
                    }
                    duration={template.duration || 30}
                  />
                </Box>
              ))}
          </Box>

          {/* Clear All Sessions Button */}
          <Button
            variant="contained"
            color="error"
            fullWidth
            onClick={() => setClearConfirmOpen(true)}
          >
            Clear All Sessions
          </Button>
        </Box>
      </Box>

      {/* Calendar Section */}
      <Box sx={{ flex: 1, height: '100%' }}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          resizable
          onSelectSlot={handleSelectSlot}
          selectable
          defaultView="week"
          views={['week']}
          step={30}
          timeslots={2}
          min={new Date(0, 0, 0, 8, 0, 0)}
          max={new Date(0, 0, 0, 18, 0, 0)}
          formats={{
            eventTimeRangeFormat: () => '',
            timeGutterFormat: (date, culture, localizer) =>
              localizer.format(date, 'HH:mm', culture),
            dayHeaderFormat: (date, culture, localizer) =>
              localizer.format(date, 'cccc', culture),
          }}
          eventPropGetter={eventStyleGetter}
          components={{
            event: (props) => (
              <EventComponent {...props} onDeleteEvent={handleDeleteEvent} />
            ),
            toolbar: CustomToolbar,
          }}
          draggableAccessor={(event) => !event.isExternalEvent}
          resizableAccessor={(event) => !event.isExternalEvent}
          style={{ height: '100%' }}
        />
      </Box>

      {/* Dialogs */}
      <EditModeDialog
        open={editModeDialogOpen}
        onClose={() => {
          setEditModeDialogOpen(false);
          setEditingMode(null);
        }}
        mode={editingMode}
        onSave={handleSaveMode}
      />

      <EditTemplateDialog
        open={editTemplateDialogOpen}
        onClose={() => {
          setEditTemplateDialogOpen(false);
          setEditingTemplate(null);
        }}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />

      <TaskListDialog
        open={taskListDialogOpen}
        onClose={() => setTaskListDialogOpen(false)}
        tasks={weekConfigs.find(config => config.value === weekMode)?.tasks || []}
        onEditTask={handleEditTaskFromList}
        onAddTask={handleAddTaskFromList}
      />

      <ConfirmDialog
        open={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={handleClearSessions}
        title="Clear All Sessions"
        message="Are you sure you want to clear all sessions? This will remove all scheduled events and reset session counts."
        confirmButtonText="Clear All"
        confirmButtonColor="error"
      />

      <ConfirmDialog
        open={modeChangeConfirmOpen}
        onClose={() => {
          setModeChangeConfirmOpen(false);
          setPendingModeChange(null);
        }}
        onConfirm={() => {
          setWeekMode(pendingModeChange);
          setModeChangeConfirmOpen(false);
          setPendingModeChange(null);
        }}
        title="Change Week Mode"
        message="Changing the week mode will clear all current sessions and reset the counts. Are you sure you want to continue?"
        confirmButtonText="Change Mode"
      />
    </Box>
  );
};

export default CalendarContent;
