import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as StartIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { tournamentService } from '../services/tournamentService';

const statusColors = {
  open: 'primary',
  started: 'success',
  completed: 'default',
  cancelled: 'error',
};

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const data = await tournamentService.getAllTournaments();
      setTournaments(data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleCreateTournament = () => {
    navigate('/tournaments/create');
  };

  const handleEditTournament = (id) => {
    navigate(`/tournaments/edit/${id}`);
  };

  const handleDeleteClick = (tournament) => {
    setSelectedTournament(tournament);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTournament) return;
    
    try {
      setActionLoading(true);
      await tournamentService.deleteTournament(selectedTournament.id);
      setDeleteDialogOpen(false);
      setSelectedTournament(null);
      fetchTournaments();
    } catch (error) {
      console.error('Error deleting tournament:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartTournament = async (id) => {
    try {
      setActionLoading(true);
      await tournamentService.startTournament(id);
      fetchTournaments();
    } catch (error) {
      console.error('Error starting tournament:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelTournament = async (id) => {
    try {
      setActionLoading(true);
      await tournamentService.cancelTournament(id);
      fetchTournaments();
    } catch (error) {
      console.error('Error cancelling tournament:', error);
    } finally {
      setActionLoading(false);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tournaments
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTournament}
          disabled={actionLoading}
        >
          Create Tournament
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Game Type</TableCell>
              <TableCell>Entry Fee</TableCell>
              <TableCell>Prize Pool</TableCell>
              <TableCell>Players</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tournaments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No tournaments found. Create your first tournament!
                </TableCell>
              </TableRow>
            ) : (
              tournaments.map((tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell>{tournament.name}</TableCell>
                  <TableCell>{tournament.gameType}</TableCell>
                  <TableCell>₹{tournament.entryFee}</TableCell>
                  <TableCell>₹{tournament.prizePool}</TableCell>
                  <TableCell>
                    {tournament.currentParticipants}/{tournament.maxParticipants}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                      color={statusColors[tournament.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditTournament(tournament.id)}
                        disabled={actionLoading || tournament.status === 'completed'}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      
                      {tournament.status === 'open' && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleStartTournament(tournament.id)}
                          disabled={actionLoading}
                        >
                          <StartIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      {(tournament.status === 'open' || tournament.status === 'started') && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleCancelTournament(tournament.id)}
                          disabled={actionLoading}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteClick(tournament)}
                        disabled={actionLoading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Tournament</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the tournament "{selectedTournament?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={actionLoading}>
            {actionLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tournaments;