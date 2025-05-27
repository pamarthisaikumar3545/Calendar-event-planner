import React from 'react';
import { useDrag } from 'react-dnd';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';

const DraggableEvent = ({ event, onEventClick, isMobile }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'EVENT',
    item: { id: event.id, date: event.date },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const startTime = format(new Date(event.date), 'h:mm a');
  const endTime = format(new Date(new Date(event.date).getTime() + event.duration * 60000), 'h:mm a');

  return (
    <Box
      ref={drag}
      onClick={() => onEventClick(event)}
      sx={{
        backgroundColor: event.color || '#1976d2',
        color: 'white',
        padding: { xs: '2px 4px', sm: '4px 8px' },
        borderRadius: '4px',
        marginBottom: { xs: '2px', sm: '4px' },
        cursor: 'move',
        opacity: isDragging ? 0.5 : 1,
        '&:hover': {
          opacity: 0.8,
        },
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: '32px', sm: '40px' },
      }}
    >
      <Typography 
        variant="subtitle2" 
        noWrap
        sx={{
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          lineHeight: { xs: 1.2, sm: 1.4 },
        }}
      >
        {event.title}
      </Typography>
      <Typography 
        variant="caption" 
        display="block" 
        noWrap
        sx={{
          fontSize: { xs: '0.625rem', sm: '0.75rem' },
          opacity: 0.9,
        }}
      >
        {startTime} - {endTime}
      </Typography>
    </Box>
  );
};

export default DraggableEvent; 