import React from 'react';
import { Box, Typography } from '@mui/material';

const CalendarHeader = ({ view }) => {
  if (view === 'day') {
    return (
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '60px 1fr',
        gap: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        mb: 1
      }}>
        <Box sx={{ 
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Time
          </Typography>
        </Box>
        <Box sx={{ 
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            Events
          </Typography>
        </Box>
      </Box>
    );
  }

  if (view === 'week') {
    return (
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        mb: 1
      }}>
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
          <Box
            key={day}
            sx={{
              p: 1,
              textAlign: 'center',
              borderRight: '1px solid',
              borderColor: 'divider',
              '&:last-child': {
                borderRight: 'none'
              }
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {day}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(7, 1fr)',
      gap: 1,
      mb: 1
    }}>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <Box
          key={day}
          sx={{
            p: 1,
            textAlign: 'center'
          }}
        >
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            {day}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default CalendarHeader; 