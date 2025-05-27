import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, ToggleButton, ToggleButtonGroup, Alert, Snackbar, Button } from '@mui/material';
import { ChevronLeft, ChevronRight, Search as SearchIcon, ViewWeek, CalendarViewMonth, ViewDay, Today, Download as DownloadIcon, Upload as UploadIcon, Sync as SyncIcon } from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays, isSameDay, getYear, setYear, startOfDay, parseISO, addYears, addMinutes, isBefore, isAfter } from 'date-fns';
import CalendarHeader from './CalendarHeader.jsx';
import CalendarGrid from './CalendarGrid.jsx';
import EventForm from './EventForm.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.jsx';
import axios from 'axios';
import { useMediaQuery, useTheme } from '@mui/material';
import { syncWithGoogleCalendar } from '../services/calendarSync';

const PREDEFINED_CATEGORIES = [
  { value: 'work', label: 'Work', color: '#1976d2' },
  { value: 'personal', label: 'Personal', color: '#2e7d32' },
  { value: 'meeting', label: 'Meeting', color: '#ed6c02' },
  { value: 'appointment', label: 'Appointment', color: '#9c27b0' },
  { value: 'reminder', label: 'Reminder', color: '#d32f2f' },
  { value: 'other', label: 'Other', color: '#757575' }
];

const generateRecurringEvents = (event, startDate, endDate) => {
  if (event.repeat === 'never') return [event];

  const instances = [];
  let currentDate = new Date(event.date);
  const eventEndDate = event.repeatEndType === 'on' ? new Date(event.repeatEndDate) : null;
  let count = 0;

  while (currentDate <= endDate) {
    if (currentDate >= startDate) {
      // For weekly events, check if the current day is in the repeatDays array
      if (event.repeat === 'weekly' && event.repeatDays.length > 0) {
        if (event.repeatDays.includes(currentDate.getDay())) {
          instances.push({
            ...event,
            date: new Date(currentDate),
            isRecurring: true,
            originalEventId: event.id
          });
        }
      } else {
        instances.push({
          ...event,
          date: new Date(currentDate),
          isRecurring: true,
          originalEventId: event.id
        });
      }
    }

    // Increment the date based on the repeat type
    switch (event.repeat) {
      case 'daily':
        currentDate = addDays(currentDate, event.repeatInterval);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, event.repeatInterval);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, event.repeatInterval);
        break;
      case 'yearly':
        currentDate = addYears(currentDate, event.repeatInterval);
        break;
      default:
        return instances;
    }

    // Check if we've reached the end conditions
    if (event.repeatEndType === 'after') {
      count++;
      if (count >= event.repeatCount) break;
    } else if (event.repeatEndType === 'on' && currentDate > eventEndDate) {
      break;
    }
  }

  return instances;
};

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useLocalStorage('calendarEvents', []);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [view, setView] = useState('month');
  const [conflictAlert, setConflictAlert] = useState({ open: false, message: '' });
  const [holidays, setHolidays] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const getDaysInView = () => {
    if (view === 'month') {
      const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
      const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
      // Filter out days outside the current month but keep the grid structure
      // We'll need to handle the visual hiding in CalendarGrid
      const allDaysInGrid = eachDayOfInterval({ start, end });
      return allDaysInGrid.map(day => {
        if (day.getMonth() !== currentDate.getMonth()) {
          // Explicitly include the date object for days outside the month
          return { date: day, isOutsideMonth: true };
        } else {
          // For days within the month, return the Date object directly
          return day;
        }
      });
    } else if (view === 'week') {
      return eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 0 }),
        end: endOfWeek(currentDate, { weekStartsOn: 0 }),
      });
    } else {
      return [currentDate];
    }
  };

  const handlePrevPeriod = () => {
    if (view === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const handleNextPeriod = () => {
    if (view === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleYearChange = (event) => {
    const newYear = parseInt(event.target.value);
    setCurrentDate(setYear(currentDate, newYear));
  };

  const handleAddEvent = (date) => {
    setCurrentDate(new Date(date));
    setSelectedEvent(null);
    setSelectedDate(new Date(date));
    setIsEventFormOpen(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setIsEventFormOpen(true);
  };

  const handleDeleteEvent = (eventId) => {
    const eventToDelete = events.find(event => event.id === eventId);
    if (eventToDelete?.isRecurring) {
      const shouldDeleteAll = window.confirm(
        'This is a recurring event. Would you like to delete all instances of this event?'
      );
      
      if (shouldDeleteAll) {
        // Delete all instances of the recurring event
        setEvents(events.filter(event => 
          event.originalEventId !== eventToDelete.originalEventId
        ));
      } else {
        // Delete only this instance
        setEvents(events.filter(event => event.id !== eventId));
      }
    } else {
      setEvents(events.filter(event => event.id !== eventId));
    }
  };

  const checkEventConflict = (newEvent) => {
    return events.some(event => {
      if (event.id === newEvent.id) return false; // Skip the event being edited

      const newEventStart = new Date(newEvent.date);
      const newEventEnd = new Date(newEventStart.getTime() + (newEvent.duration * 60000));
      const existingEventStart = new Date(event.date);
      const existingEventEnd = new Date(existingEventStart.getTime() + (event.duration * 60000));

      // Check if events are on the same day
      if (!isSameDay(newEventStart, existingEventStart)) return false;

      // Check for time overlap
      return (
        (newEventStart >= existingEventStart && newEventStart < existingEventEnd) || // New event starts during existing event
        (newEventEnd > existingEventStart && newEventEnd <= existingEventEnd) || // New event ends during existing event
        (newEventStart <= existingEventStart && newEventEnd >= existingEventEnd) // New event completely encompasses existing event
      );
    });
  };

  const handleSaveEvent = (eventData) => {
    if (checkEventConflict(eventData)) {
      setConflictAlert({
        open: true,
        message: 'This event conflicts with an existing event. Please choose a different time.'
      });
      return;
    }

    // Set the color based on the category
    const categoryInfo = PREDEFINED_CATEGORIES.find(cat => cat.value === eventData.category);
    const eventWithColor = {
      ...eventData,
      color: categoryInfo ? categoryInfo.color : '#757575',
      duration: eventData.duration || 60
    };

    if (selectedEvent) {
      // If editing a recurring event, show confirmation dialog
      if (selectedEvent.isRecurring) {
        const shouldUpdateAll = window.confirm(
          'This is a recurring event. Would you like to update all instances of this event?'
        );
        
        if (shouldUpdateAll) {
          // Update all instances of the recurring event
          setEvents(events.map(event => 
            event.originalEventId === selectedEvent.originalEventId
              ? { ...eventWithColor, id: event.id, originalEventId: event.originalEventId }
              : event
          ));
        } else {
          // Update only this instance
          setEvents(events.map(event => 
            event.id === selectedEvent.id
              ? { ...eventWithColor, id: event.id }
              : event
          ));
        }
      } else {
        setEvents(events.map(event => 
          event.id === selectedEvent.id ? { ...eventWithColor, id: event.id } : event
        ));
      }
    } else {
      setEvents([...events, { ...eventWithColor, id: Date.now() }]);
    }
    setIsEventFormOpen(false);
    setSelectedEvent(null);
  };

  const filteredEvents = events.filter(event => {
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
    
    const matchesSearch = searchTerms.every(term => 
      event.title.toLowerCase().includes(term) ||
      (event.description && event.description.toLowerCase().includes(term)) ||
      (event.category && event.category.toLowerCase().includes(term))
    );
    
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (searchQuery && filteredEvents.length > 0) {
      // Navigate to the month of the first filtered event
      setCurrentDate(startOfDay(new Date(filteredEvents[0].date)));
    } else if (!searchQuery && !isSameDay(currentDate, new Date())) {
       // If search query is cleared and not on today's date, go back to the original month (optional, can remove if prefer staying)
      // setCurrentDate(new Date()); 
    }
  }, [filteredEvents, searchQuery, currentDate]); // Added currentDate to dependency array

  const categories = ['all', ...PREDEFINED_CATEGORIES.map(cat => cat.value)];

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const getViewTitle = () => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        return `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
      default:
        return '';
    }
  };

  const currentYear = getYear(currentDate);
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  useEffect(() => {
    const fetchHolidays = async () => {
      const year = getYear(currentDate);
      const countryCode = 'IN'; // India
      try {
        const response = await axios.get(`https://date.nager.at/api/v3/publicholidays/${year}/${countryCode}`);
        // Parse the date strings into Date objects
        console.log('Raw holiday API response data:', response.data);
        const holidaysWithDates = Array.isArray(response.data)
          ? response.data.map(holiday => ({
              ...holiday,
              date: parseISO(holiday.date)
            }))
          : [];
        setHolidays(holidaysWithDates);
      } catch (error) {
        console.error('Error fetching holidays:', error);
        setHolidays([]); // Clear holidays on error
      }
    };

    fetchHolidays();
  }, [currentDate]); // Rerun when currentDate (and thus year) changes

  const getEventsForDate = (date) => {
    const startOfView = startOfMonth(currentDate);
    const endOfView = endOfMonth(currentDate);
    
    return events.flatMap(event => {
      const recurringInstances = generateRecurringEvents(event, startOfView, endOfView);
      return recurringInstances.filter(instance => 
        isSameDay(new Date(instance.date), date)
      );
    });
  };

  const handleEventDrop = (eventId, newDate) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // Check for conflicts with the new date
    const newEventData = {
      ...event,
      date: newDate,
      endDate: new Date(new Date(newDate).getTime() + event.duration * 60000)
    };

    if (checkEventConflict(newEventData)) {
      setConflictAlert({
        open: true,
        message: 'Cannot move event: There is a conflict at the new time.'
      });
      return;
    }

    // Update the event with the new date
    setEvents(events.map(event => 
      event.id === eventId
        ? {
            ...event,
            date: newDate,
            endDate: new Date(new Date(newDate).getTime() + event.duration * 60000)
          }
        : event
    ));
  };

  const checkReminders = () => {
    const now = new Date();
    const upcomingReminders = events.filter(event => {
      if (!event.reminder) return false;
      
      const reminderTime = new Date(event.date.getTime() - (event.reminder * 60000));
      return isBefore(reminderTime, now) && isAfter(event.date, now);
    });

    setReminders(upcomingReminders);
  };

  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [events]);

  const handleExportEvents = () => {
    const eventsToExport = events.map(event => ({
      ...event,
      date: event.date.toISOString(),
      endDate: event.endDate ? event.endDate.toISOString() : null,
      repeatEndDate: event.repeatEndDate ? event.repeatEndDate.toISOString() : null
    }));

    const blob = new Blob([JSON.stringify(eventsToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calendar-events-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportEvents = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedEvents = JSON.parse(e.target.result).map(event => ({
          ...event,
          date: new Date(event.date),
          endDate: event.endDate ? new Date(event.endDate) : null,
          repeatEndDate: event.repeatEndDate ? new Date(event.repeatEndDate) : null
        }));

        // Check for conflicts
        const hasConflicts = importedEvents.some(newEvent => 
          events.some(existingEvent => checkEventConflict(newEvent))
        );

        if (hasConflicts) {
          setConflictAlert({
            open: true,
            message: 'Some imported events have conflicts with existing events. Please review them.'
          });
        }

        setEvents([...events, ...importedEvents]);
      } catch (error) {
        setConflictAlert({
          open: true,
          message: 'Error importing events. Please check the file format.'
        });
      }
    };
    reader.readAsText(file);
  };

  const handleSyncCalendar = async () => {
    setIsSyncing(true);
    try {
      const result = await syncWithGoogleCalendar(events);
      if (result.success) {
        setConflictAlert({
          open: true,
          message: result.message
        });
      } else {
        setConflictAlert({
          open: true,
          message: 'Failed to sync calendar. Please try again.'
        });
      }
    } catch (error) {
      setConflictAlert({
        open: true,
        message: 'Error syncing calendar: ' + error.message
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      p: { xs: 1, sm: 2, md: 3 },
      width: '100%',
      overflow: 'hidden'
    }}>
      {reminders.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {reminders.map(event => (
            <Alert 
              key={event.id}
              severity="info"
              sx={{ mb: 1 }}
              onClose={() => setReminders(reminders.filter(r => r.id !== event.id))}
            >
              Upcoming event: {event.title} at {format(new Date(event.date), 'h:mm a')}
            </Alert>
          ))}
        </Box>
      )}
      <Paper elevation={3} sx={{ p: { xs: 1, sm: 2 } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          gap: { xs: 2, sm: 0 },
          mb: 2 
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            <IconButton onClick={handlePrevPeriod} size={isMobile ? "small" : "medium"}>
              <ChevronLeft />
            </IconButton>
            <Typography variant={isMobile ? "h6" : "h4"}>
              {getViewTitle()}
            </Typography>
            <IconButton onClick={handleNextPeriod} size={isMobile ? "small" : "medium"}>
              <ChevronRight />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<Today />}
              onClick={handleToday}
              size={isMobile ? "small" : "medium"}
            >
              Today
            </Button>
            <FormControl sx={{ minWidth: { xs: 80, sm: 100 } }}>
              <Select
                value={currentYear}
                onChange={handleYearChange}
                size={isMobile ? "small" : "medium"}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-end' }
          }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportEvents}
              size={isMobile ? "small" : "medium"}
            >
              Export
            </Button>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              size={isMobile ? "small" : "medium"}
            >
              Import
              <input
                type="file"
                hidden
                accept=".json"
                onChange={handleImportEvents}
              />
            </Button>
            <Button
              variant="outlined"
              startIcon={<SyncIcon />}
              onClick={handleSyncCalendar}
              disabled={isSyncing}
              size={isMobile ? "small" : "medium"}
            >
              {isSyncing ? 'Syncing...' : 'Sync'}
            </Button>
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={handleViewChange}
              aria-label="calendar view"
              size={isMobile ? "small" : "medium"}
            >
              <ToggleButton value="month" aria-label="month view">
                <CalendarViewMonth />
              </ToggleButton>
              <ToggleButton value="week" aria-label="week view">
                <ViewWeek />
              </ToggleButton>
              <ToggleButton value="day" aria-label="day view">
                <ViewDay />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2, 
          mb: 2 
        }}>
          <TextField
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ flexGrow: 1 }}
            size={isMobile ? "small" : "medium"}
            helperText={searchQuery && `Found ${filteredEvents.length} matching events`}
          />
          <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              label="Category"
              size={isMobile ? "small" : "medium"}
            >
              {categories.map((category) => (
                <MenuItem
                  key={category}
                  value={category}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {category === 'all' ? (
                    'All Categories'
                  ) : (
                    <>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: PREDEFINED_CATEGORIES.find(cat => cat.value === category)?.color || '#757575'
                        }}
                      />
                      {PREDEFINED_CATEGORIES.find(cat => cat.value === category)?.label || category}
                    </>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <CalendarHeader view={view} isMobile={isMobile} />
        <CalendarGrid
          days={getDaysInView()}
          events={filteredEvents}
          currentDate={currentDate}
          onAddEvent={handleAddEvent}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
          onEventDrop={handleEventDrop}
          view={view}
          categories={PREDEFINED_CATEGORIES}
          holidays={holidays}
          isMobile={isMobile}
        />
      </Paper>

      {isEventFormOpen && (
        <EventForm
          open={isEventFormOpen}
          onClose={() => {
            setIsEventFormOpen(false);
            setSelectedEvent(null);
          }}
          onSave={handleSaveEvent}
          event={selectedEvent}
          categories={PREDEFINED_CATEGORIES}
          initialDate={selectedDate}
          isMobile={isMobile}
        />
      )}

      <Snackbar
        open={conflictAlert.open}
        autoHideDuration={6000}
        onClose={() => setConflictAlert({ ...conflictAlert, open: false })}
      >
        <Alert severity="warning" onClose={() => setConflictAlert({ ...conflictAlert, open: false })}>
          {conflictAlert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Calendar;