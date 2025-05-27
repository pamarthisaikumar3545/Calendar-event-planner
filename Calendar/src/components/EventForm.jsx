import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Checkbox,
  FormControlLabel,
  Typography,
  Divider,
  IconButton,
  Paper,
  alpha,
  DialogContentText,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { endOfDay } from 'date-fns';
import { Share as ShareIcon, Close as CloseIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { keyframes } from '@mui/system';

// Add color theme constants
const COLORS = {
  primary: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    gradient: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
  },
  secondary: {
    main: '#FF4081',
    light: '#FF80AB',
    dark: '#F50057',
    gradient: 'linear-gradient(135deg, #FF4081 0%, #FF80AB 100%)',
  },
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
    gradient: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
  },
  background: {
    light: 'rgba(255, 255, 255, 0.9)',
    dark: 'rgba(33, 33, 33, 0.9)',
    gradient: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
  },
  text: {
    primary: '#1A237E',
    secondary: '#455A64',
  }
};

// Enhanced Animation keyframes
const slideIn = keyframes`
  from {
    transform: translateY(30px) scale(0.95);
    opacity: 0;
    filter: blur(10px);
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
    filter: blur(0);
  }
`;

const rotateIn = keyframes`
  from {
    transform: perspective(1000px) rotateX(-15deg) translateY(30px);
    opacity: 0;
    filter: blur(10px);
  }
  to {
    transform: perspective(1000px) rotateX(0) translateY(0);
    opacity: 1;
    filter: blur(0);
  }
`;

const floatAnimation = keyframes`
  0% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(1deg);
  }
  100% {
    transform: translateY(0px) rotate(0deg);
  }
`;

const glowAnimation = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(33, 150, 243, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(33, 150, 243, 0.6);
  }
  100% {
    box-shadow: 0 0 5px rgba(33, 150, 243, 0.3);
  }
`;

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const REMINDER_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
];

const EventForm = ({ open, onClose, onSave, event, categories, initialDate, isMobile }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date(),
    category: '',
    duration: 60,
    isAllDay: false,
    endDate: new Date(),
    repeat: 'never',
    repeatInterval: 1,
    repeatDays: [],
    repeatEndDate: null,
    repeatCount: null,
    repeatEndType: 'never',
    reminder: 0,
    shareWith: [],
  });

  const [shareEmail, setShareEmail] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || '',
        date: new Date(event.date),
        category: event.category || '',
        duration: event.duration || 60,
        isAllDay: event.isAllDay || false,
        endDate: event.endDate ? new Date(event.endDate) : new Date(new Date(event.date).getTime() + (event.duration || 60) * 60000),
        repeat: event.repeat || 'never',
        repeatInterval: event.repeatInterval || 1,
        repeatDays: event.repeatDays || [],
        repeatEndDate: event.repeatEndDate ? new Date(event.repeatEndDate) : null,
        repeatCount: event.repeatCount || null,
        repeatEndType: event.repeatEndType || 'never',
        reminder: event.reminder || 0,
        shareWith: event.shareWith || [],
      });
    } else {
      const now = initialDate ? new Date(initialDate) : new Date();
      const initialEndDate = new Date(now.getTime() + 60 * 60000);
      setFormData({
        title: '',
        description: '',
        date: now,
        category: '',
        duration: 60,
        isAllDay: false,
        endDate: initialEndDate,
        repeat: 'never',
        repeatInterval: 1,
        repeatDays: [],
        repeatEndDate: null,
        repeatCount: null,
        repeatEndType: 'never',
        reminder: 0,
        shareWith: [],
      });
    }
  }, [event, open, initialDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const eventData = {
      ...formData,
      date: formData.date,
      endDate: formData.isAllDay ? endOfDay(formData.date) : formData.endDate,
    };
    onSave(eventData);
  };

  const handleShare = () => {
    if (!shareEmail) return;
    
    // In a real application, you would send an email invitation here
    // For now, we'll just add it to the shareWith array
    setFormData({
      ...formData,
      shareWith: [...formData.shareWith, shareEmail]
    });
    setShareEmail('');
  };

  const handleRemoveShare = (email) => {
    setFormData({
      ...formData,
      shareWith: formData.shareWith.filter(e => e !== email)
    });
  };

  const handleDelete = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    onSave({ ...formData, isDeleted: true });
    setDeleteConfirmOpen(false);
    onClose();
  };

  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4 hours' },
    { value: 480, label: '8 hours' },
  ];

  const renderRecurrenceOptions = () => {
    if (formData.repeat === 'never') return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" gutterBottom>
          Recurrence Details
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              type="number"
              label="Repeat every"
              value={formData.repeatInterval}
              onChange={(e) => setFormData({ ...formData, repeatInterval: parseInt(e.target.value) || 1 })}
              InputProps={{ inputProps: { min: 1 } }}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {formData.repeat === 'daily' ? 'days' :
               formData.repeat === 'weekly' ? 'weeks' :
               formData.repeat === 'monthly' ? 'months' : 'times'}
            </Typography>
          </Grid>
        </Grid>

        {formData.repeat === 'weekly' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Repeat on:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {WEEKDAYS.map((day) => (
                <FormControlLabel
                  key={day.value}
                  control={
                    <Checkbox
                      checked={formData.repeatDays.includes(day.value)}
                      onChange={(e) => {
                        const newDays = e.target.checked
                          ? [...formData.repeatDays, day.value]
                          : formData.repeatDays.filter(d => d !== day.value);
                        setFormData({ ...formData, repeatDays: newDays });
                      }}
                    />
                  }
                  label={day.label}
                />
              ))}
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Ends</InputLabel>
            <Select
              value={formData.repeatEndType}
              onChange={(e) => setFormData({ ...formData, repeatEndType: e.target.value })}
              label="Ends"
            >
              <MenuItem value="never">Never</MenuItem>
              <MenuItem value="on">On</MenuItem>
              <MenuItem value="after">After</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {formData.repeatEndType === 'on' && (
          <Box sx={{ mt: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={formData.repeatEndDate}
                onChange={(newDate) => {
                  if (newDate) {
                    setFormData({ ...formData, repeatEndDate: newDate });
                  }
                }}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
          </Box>
        )}

        {formData.repeatEndType === 'after' && (
          <Box sx={{ mt: 2 }}>
            <TextField
              type="number"
              label="Number of occurrences"
              value={formData.repeatCount}
              onChange={(e) => setFormData({ ...formData, repeatCount: parseInt(e.target.value) || null })}
              InputProps={{ inputProps: { min: 1 } }}
              fullWidth
            />
          </Box>
        )}
      </Box>
    );
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            animation: `${slideIn} 0.4s cubic-bezier(0.4, 0, 0.2, 1)`,
            transform: 'perspective(1000px)',
            background: COLORS.background.gradient,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            '&:hover': {
              transform: 'perspective(1000px) rotateX(2deg)',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: 3,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: COLORS.primary.gradient,
            color: 'white',
            animation: `${rotateIn} 0.5s cubic-bezier(0.4, 0, 0.2, 1)`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '24px 32px',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" sx={{ 
              fontWeight: 600, 
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              letterSpacing: '0.5px'
            }}>
              {event ? 'Edit Event' : 'Add New Event'}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'white',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'rotate(90deg) scale(1.1)',
                backgroundColor: 'rgba(255,255,255,0.2)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            animation: `${slideIn} 0.5s cubic-bezier(0.4, 0, 0.2, 1)`,
            padding: '32px',
            background: COLORS.background.gradient,
            '& > *': {
              animation: `${floatAnimation} 3s ease-in-out infinite`,
              animationDelay: (theme) => theme.transitions.duration.standard,
            }
          }}
        >
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Basic Information Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ 
                  color: COLORS.text.primary,
                  mb: 2,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  Basic Information
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.2)}`,
                      },
                      '&.Mui-focused': {
                        animation: `${glowAnimation} 2s infinite`,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: COLORS.primary.main,
                          borderWidth: 2,
                        }
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: COLORS.text.secondary,
                      '&.Mui-focused': {
                        color: COLORS.primary.main,
                      }
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.2)}`,
                      }
                    }
                  }}
                />
              </Grid>

              {/* Date and Time Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ 
                  color: COLORS.text.primary,
                  mb: 2,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  Date and Time
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Start Date & Time"
                    value={formData.date}
                    onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            transition: 'all 0.3s ease',
                            borderRadius: 2,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.2)}`,
                            }
                          }
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: COLORS.text.secondary }}>Duration</InputLabel>
                  <Select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    label="Duration"
                    sx={{
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.2)}`,
                      }
                    }}
                  >
                    {durationOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Category and Settings Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ 
                  color: COLORS.text.primary,
                  mb: 2,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  Category and Settings
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: COLORS.text.secondary }}>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Category"
                    sx={{
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.2)}`,
                      }
                    }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: category.color,
                              boxShadow: `0 0 8px ${alpha(category.color, 0.5)}`,
                            }}
                          />
                          {category.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isAllDay}
                      onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                      sx={{
                        color: COLORS.primary.main,
                        '&.Mui-checked': {
                          color: COLORS.primary.main,
                        }
                      }}
                    />
                  }
                  label="All Day Event"
                  sx={{ color: COLORS.text.secondary }}
                />
              </Grid>

              {/* Recurrence Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ 
                  color: COLORS.text.primary,
                  mb: 2,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  Recurrence
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: COLORS.text.secondary }}>Repeat</InputLabel>
                  <Select
                    value={formData.repeat}
                    onChange={(e) => setFormData({ ...formData, repeat: e.target.value })}
                    label="Repeat"
                    sx={{
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.2)}`,
                      }
                    }}
                  >
                    <MenuItem value="never">Never</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {renderRecurrenceOptions()}

              {/* Reminder Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ 
                  color: COLORS.text.primary,
                  mb: 2,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  Reminder
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: COLORS.text.secondary }}>Reminder</InputLabel>
                  <Select
                    value={formData.reminder}
                    onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
                    label="Reminder"
                    sx={{
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.2)}`,
                      }
                    }}
                  >
                    {REMINDER_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Sharing Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ 
                  color: COLORS.text.primary,
                  mb: 2,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  Share Event
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <TextField
                    label="Email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    type="email"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.2)}`,
                        }
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleShare}
                    startIcon={<ShareIcon />}
                    sx={{
                      background: COLORS.secondary.gradient,
                      transition: 'all 0.3s ease',
                      borderRadius: 2,
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: `0 4px 12px ${alpha(COLORS.secondary.main, 0.4)}`,
                      }
                    }}
                  >
                    Share
                  </Button>
                </Box>
              </Grid>

              {formData.shareWith.length > 0 && (
                <Grid item xs={12}>
                  <Box sx={{ 
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    background: alpha(COLORS.primary.main, 0.05),
                    border: `1px solid ${alpha(COLORS.primary.main, 0.1)}`,
                  }}>
                    <Typography variant="subtitle2" sx={{ color: COLORS.text.secondary, mb: 1 }}>
                      Shared with:
                    </Typography>
                    {formData.shareWith.map((email) => (
                      <Box
                        key={email}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1,
                          mb: 1,
                          borderRadius: 1,
                          background: 'white',
                          boxShadow: `0 2px 4px ${alpha(COLORS.primary.main, 0.1)}`,
                        }}
                      >
                        <Typography variant="body2" sx={{ color: COLORS.text.primary }}>
                          {email}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveShare(email)}
                          sx={{
                            color: COLORS.text.secondary,
                            '&:hover': {
                              color: COLORS.secondary.main,
                              transform: 'scale(1.1)',
                            }
                          }}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
        </DialogContent>

        <DialogActions
          sx={{
            padding: '24px 32px',
            background: `linear-gradient(135deg, ${alpha(COLORS.primary.light, 0.1)} 0%, ${alpha(COLORS.primary.main, 0.05)} 100%)`,
            animation: `${slideIn} 0.6s cubic-bezier(0.4, 0, 0.2, 1)`,
            borderTop: `1px solid ${alpha(COLORS.primary.main, 0.1)}`,
            gap: 2,
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', gap: 2 }}>
            {event && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                startIcon={<DeleteIcon />}
                sx={{
                  transition: 'all 0.3s ease',
                  borderRadius: 2,
                  px: 3,
                  borderColor: alpha(COLORS.secondary.main, 0.5),
                  color: COLORS.secondary.main,
                  '&:hover': {
                    transform: 'scale(1.05)',
                    backgroundColor: alpha(COLORS.secondary.main, 0.1),
                    borderColor: COLORS.secondary.main,
                  }
                }}
              >
                Delete Event
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              onClick={onClose}
              sx={{
                transition: 'all 0.3s ease',
                color: COLORS.text.secondary,
                borderRadius: 2,
                px: 3,
                '&:hover': {
                  transform: 'scale(1.05)',
                  backgroundColor: alpha(COLORS.primary.main, 0.1),
                  color: COLORS.primary.main,
                }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              onClick={handleSubmit}
              sx={{
                background: COLORS.primary.gradient,
                transition: 'all 0.3s ease',
                borderRadius: 2,
                px: 4,
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: `0 4px 12px ${alpha(COLORS.primary.main, 0.4)}`,
                  background: COLORS.primary.dark,
                }
              }}
            >
              {event ? 'Update Event' : 'Add Event'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            background: COLORS.background.gradient,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          color: COLORS.secondary.main,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <DeleteIcon color="error" />
          Delete Event
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: COLORS.text.secondary }}>
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px', gap: 2 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{
              transition: 'all 0.3s ease',
              color: COLORS.text.secondary,
              borderRadius: 2,
              px: 3,
              '&:hover': {
                transform: 'scale(1.05)',
                backgroundColor: alpha(COLORS.primary.main, 0.1),
                color: COLORS.primary.main,
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{
              background: COLORS.secondary.gradient,
              transition: 'all 0.3s ease',
              borderRadius: 2,
              px: 4,
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: `0 4px 12px ${alpha(COLORS.secondary.main, 0.4)}`,
                background: COLORS.secondary.dark,
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EventForm; 