import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { tournamentService } from '../services/tournamentService';

const gameTypes = [
  { value: 'ludo', label: 'Ludo' },
  { value: 'carrom', label: 'Carrom' },
  { value: 'chess', label: 'Chess' },
  { value: 'rummy', label: 'Rummy' },
];

const EditTournament = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gameType: '',
    entryFee: '',
    prizePool: '',
    maxParticipants: '',
    startTime: '',
    endTime: '',
    rules: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const tournament = await tournamentService.getTournamentById(id);
        if (!tournament) {
          setError('Tournament not found');
          return;
        }

        // Format dates for datetime-local input
        let formattedStartTime = '';
        let formattedEndTime = '';
        
        if (tournament.startTime) {
          const startDate = new Date(tournament.startTime.seconds * 1000);
          formattedStartTime = startDate.toISOString().slice(0, 16);
        }
        
        if (tournament.endTime) {
          const endDate = new Date(tournament.endTime.seconds * 1000);
          formattedEndTime = endDate.toISOString().slice(0, 16);
        }

        setFormData({
          name: tournament.name || '',
          description: tournament.description || '',
          gameType: tournament.gameType || '',
          entryFee: tournament.entryFee || '',
          prizePool: tournament.prizePool || '',
          maxParticipants: tournament.maxParticipants || '',
          startTime: formattedStartTime,
          endTime: formattedEndTime,
          rules: tournament.rules || '',
        });
      } catch (error) {
        console.error('Error fetching tournament:', error);
        setError('Failed to load tournament data');
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.gameType || !formData.entryFee || !formData.maxParticipants) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setSaving(true);
      setError('');
      
      // Convert string values to numbers where needed
      const tournamentData = {
        ...formData,
        entryFee: Number(formData.entryFee),
        prizePool: Number(formData.prizePool),
        maxParticipants: Number(formData.maxParticipants),
      };
      
      await tournamentService.updateTournament(id, tournamentData);
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/tournaments');
      }, 1500);
    } catch (error) {
      console.error('Error updating tournament:', error);
      setError('Failed to update tournament. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Edit Tournament
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Tournament updated successfully!</Alert>}
      
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Tournament Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={saving}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Game Type</InputLabel>
                <Select
                  name="gameType"
                  value={formData.gameType}
                  label="Game Type"
                  onChange={handleChange}
                  disabled={saving}
                >
                  {gameTypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Entry Fee"
                name="entryFee"
                type="number"
                value={formData.entryFee}
                onChange={handleChange}
                disabled={saving}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Prize Pool"
                name="prizePool"
                type="number"
                value={formData.prizePool}
                onChange={handleChange}
                disabled={saving}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Max Participants"
                name="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={handleChange}
                disabled={saving}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Time"
                name="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={handleChange}
                disabled={saving}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Time"
                name="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={handleChange}
                disabled={saving}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={2}
                value={formData.description}
                onChange={handleChange}
                disabled={saving}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Rules"
                name="rules"
                multiline
                rows={4}
                value={formData.rules}
                onChange={handleChange}
                disabled={saving}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/tournaments')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : null}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditTournament;