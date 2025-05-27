import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { format, isSameDay, isToday } from 'date-fns';
import { useDrop } from 'react-dnd';
import EventItem from './EventItem';

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const DayCell = ({ day, isOutsideMonth, events, holidays, onAddEvent, onEditEvent, onDeleteEvent, onEventDrop, view }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'EVENT',
    drop: (item) => {
      if (onEventDrop) onEventDrop(item.id, day);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  // Find holidays for this day
  const dayHolidays = Array.isArray(holidays)
    ? holidays.filter(h => h.date && isSameDay(new Date(h.date), day))
    : [];

  return (
    <Box
      ref={drop}
      onClick={(e) => { if (e.target === e.currentTarget) onAddEvent(day); }}
      sx={{
        minHeight: '120px',
        padding: '12px',
        border: '1px solid',
        borderColor: alpha('#1976d2', 0.1),
        backgroundColor: isOver ? alpha('#1976d2', 0.05) : 'white',
        opacity: isOutsideMonth ? 0.5 : 1,
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: alpha('#1976d2', 0.05),
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
        '&::before': isToday(day) ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #1976d2, #64b5f6)',
          borderRadius: '4px 4px 0 0',
        } : {},
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: isToday(day) ? 'bold' : 'normal',
          color: isToday(day) ? '#1976d2' : 'text.primary',
          marginBottom: '8px',
          fontSize: { xs: '0.875rem', sm: '1rem' },
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {format(day, 'd')}
        {isToday(day) && (
          <Box
            sx={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#1976d2',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
                '50%': {
                  transform: 'scale(1.5)',
                  opacity: 0.5,
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
              },
            }}
          />
        )}
      </Typography>
      {/* Render holidays at the top */}
      {dayHolidays.map(holiday => (
        <Box 
          key={holiday.localName || holiday.name} 
          sx={{ 
            mb: 0.5, 
            background: alpha('#fff3e0', 0.8),
            borderRadius: 1, 
            px: 1, 
            py: 0.5, 
            border: '1px solid #ffe082',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          }}
        >
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#e65100',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {holiday.localName || holiday.name}
          </Typography>
        </Box>
      ))}
      {/* Render events below holidays */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 1,
        mt: 1,
      }}>
        {events.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            onEdit={onEditEvent}
            onDelete={onDeleteEvent}
            view={view}
          />
        ))}
      </Box>
    </Box>
  );
};

const CalendarGrid = ({ days, events, currentDate, onAddEvent, onEditEvent, onDeleteEvent, view, categories, holidays, onEventDrop }) => {
  const getEventsForDay = (day) => {
    const dayDate = day instanceof Date ? day : (day.date || day);
    return events.filter(event => isSameDay(new Date(event.date), dayDate));
  };

  // Week view: single row of 7 days
  if (view === 'week') {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '1px',
          backgroundColor: alpha('#1976d2', 0.1),
          border: '1px solid',
          borderColor: alpha('#1976d2', 0.2),
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        {days.map((day, index) => (
          <React.Fragment key={index}>
            <DayCell
              day={typeof day === 'object' && 'date' in day ? day.date : day}
              isOutsideMonth={typeof day === 'object' && 'isOutsideMonth' in day ? day.isOutsideMonth : false}
              events={getEventsForDay(typeof day === 'object' && 'date' in day ? day.date : day)}
              holidays={holidays}
              onAddEvent={onAddEvent}
              onEditEvent={onEditEvent}
              onDeleteEvent={onDeleteEvent}
              onEventDrop={onEventDrop}
              view={view}
            />
          </React.Fragment>
        ))}
      </Box>
    );
  }

  // Day view: single column with time slots
  if (view === 'day') {
    const day = days[0];
    const dayEvents = getEventsForDay(day);
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        border: '1px solid',
        borderColor: alpha('#1976d2', 0.2),
        backgroundColor: 'white',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}>
        {HOURS.map(hour => (
          <Box
            key={hour}
            sx={{
              minHeight: 48,
              borderBottom: '1px solid',
              borderColor: alpha('#1976d2', 0.1),
              display: 'flex',
              alignItems: 'flex-start',
              position: 'relative',
              px: 2,
              py: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: alpha('#1976d2', 0.05),
              },
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onAddEvent(new Date(new Date(day).setHours(hour, 0, 0, 0))); }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                width: 40, 
                color: 'text.secondary',
                mr: 2,
                fontWeight: hour === new Date().getHours() ? 'bold' : 'normal',
                color: hour === new Date().getHours() ? '#1976d2' : 'text.secondary',
              }}
            >
              {hour}:00
            </Typography>
            <Box sx={{ flex: 1, position: 'relative' }}>
              {dayEvents
                .filter(event => new Date(event.date).getHours() === hour)
                .map(event => (
                  <EventItem
                    key={event.id}
                    event={event}
                    onEdit={onEditEvent}
                    onDelete={onDeleteEvent}
                    view={view}
                  />
                ))}
            </Box>
          </Box>
        ))}
      </Box>
    );
  }

  // Default: month view
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '1px',
        backgroundColor: alpha('#1976d2', 0.1),
        border: '1px solid',
        borderColor: alpha('#1976d2', 0.2),
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      {days.map((day, index) => (
        <React.Fragment key={index}>
          <DayCell
            day={typeof day === 'object' && 'date' in day ? day.date : day}
            isOutsideMonth={typeof day === 'object' && 'isOutsideMonth' in day ? day.isOutsideMonth : false}
            events={getEventsForDay(typeof day === 'object' && 'date' in day ? day.date : day)}
            holidays={holidays}
            onAddEvent={onAddEvent}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
            onEventDrop={onEventDrop}
            view={view}
          />
        </React.Fragment>
      ))}
    </Box>
  );
};

export default CalendarGrid; 