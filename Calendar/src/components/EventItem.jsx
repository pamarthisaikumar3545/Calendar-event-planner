import React from 'react';
import { Box, Typography, IconButton, alpha } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const EventItem = ({ event, onEdit, onDelete, view }) => {
  const startTime = format(new Date(event.date), 'h:mm a');
  const endTime = format(new Date(new Date(event.date).getTime() + event.duration * 60000), 'h:mm a');

  return (
    <Box
      onClick={() => onEdit(event)}
      sx={{
        backgroundColor: alpha(event.color || '#1976d2', 0.9),
        color: 'white',
        padding: { xs: '4px 8px', sm: '6px 12px' },
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          '& .event-actions': {
            opacity: 1,
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          background: alpha(event.color || '#1976d2', 1),
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontWeight: 600,
              lineHeight: 1.2,
              mb: 0.5,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {event.title}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontSize: { xs: '0.625rem', sm: '0.75rem' },
              opacity: 0.9,
              display: 'block',
            }}
          >
            {startTime} - {endTime}
          </Typography>
        </Box>
        <Box
          className="event-actions"
          sx={{
            opacity: 0,
            transition: 'opacity 0.2s ease',
            display: 'flex',
            gap: 0.5,
            ml: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(event);
            }}
            sx={{
              color: 'white',
              padding: '2px',
              '&:hover': {
                backgroundColor: alpha('#fff', 0.2),
              },
            }}
          >
            <EditIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(event.id);
            }}
            sx={{
              color: 'white',
              padding: '2px',
              '&:hover': {
                backgroundColor: alpha('#fff', 0.2),
              },
            }}
          >
            <DeleteIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />
          </IconButton>
        </Box>
      </Box>
      {event.description && (
        <Typography
          variant="caption"
          sx={{
            fontSize: { xs: '0.625rem', sm: '0.75rem' },
            opacity: 0.9,
            display: 'block',
            mt: 0.5,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {event.description}
        </Typography>
      )}
    </Box>
  );
};

export default EventItem; 