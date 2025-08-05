import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { tournamentService } from '../services/tournamentService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    completedTournaments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const tournaments = await tournamentService.getAllTournaments();
        
        const activeTournaments = tournaments.filter(
          (tournament) => tournament.status === 'open' || tournament.status === 'started'
        ).length;
        
        const completedTournaments = tournaments.filter(
          (tournament) => tournament.status === 'completed'
        ).length;
        
        setStats({
          totalTournaments: tournaments.length,
          activeTournaments,
          completedTournaments,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tournaments
              </Typography>
              <Typography variant="h3">{stats.totalTournaments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Active Tournaments
              </Typography>
              <Typography variant="h3">{stats.activeTournaments}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Completed Tournaments
              </Typography>
              <Typography variant="h3">{stats.completedTournaments}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Welcome to the Gamin App Admin Panel
        </Typography>
        <Typography variant="body1">
          Use the sidebar to navigate to different sections. You can manage tournaments, 
          set entry fees, winning prizes, and configure player limits.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard;