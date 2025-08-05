import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Alert,
  Tab,
  Tabs
} from '@mui/material';
import {
  PeopleAlt as UsersIcon,
  PersonAdd as NewUsersIcon,
  TrendingUp as ActiveUsersIcon,
  Percent as RetentionIcon,
  SportsEsports as GamesIcon,
  EmojiEvents as TournamentsIcon,
  Group as ParticipantsIcon,
  Receipt as TransactionsIcon,
  AttachMoney as RevenueIcon
} from '@mui/icons-material';
import { analyticsService } from '../services/analyticsService';

// Import chart components from recharts
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const Analyzer = () => {
  const [userStats, setUserStats] = useState(null);
  const [appStats, setAppStats] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [userStatistics, appUsageStatistics, userEngagementData] = await Promise.all([
          analyticsService.getUserStatistics(),
          analyticsService.getAppUsageStatistics(),
          analyticsService.getUserEngagementData()
        ]);

        setUserStats(userStatistics);
        setAppStats(appUsageStatistics);
        setEngagementData(userEngagementData);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Format data for location pie chart
  const locationPieData = engagementData?.usersByLocation.slice(0, 5).map(item => ({
    name: item.location,
    value: item.count
  })) || [];

  // Format data for user registration bar chart
  const userRegistrationData = engagementData?.usersByDate.slice(-10).map(item => ({
    date: item.date,
    users: item.count
  })) || [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Analytics Dashboard
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="analytics tabs">
          <Tab label="Overview" />
          <Tab label="User Analytics" />
          <Tab label="App Usage" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* User Statistics */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>User Statistics</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<UsersIcon fontSize="large" color="primary" />}
                    title="Total Users"
                    value={userStats?.totalUsers || 0}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<ActiveUsersIcon fontSize="large" color="secondary" />}
                    title="Active Users"
                    value={userStats?.activeUsers || 0}
                    subtitle="Last 7 days"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<NewUsersIcon fontSize="large" style={{ color: '#4caf50' }} />}
                    title="New Users"
                    value={userStats?.newUsers || 0}
                    subtitle="Last 30 days"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<RetentionIcon fontSize="large" style={{ color: '#ff9800' }} />}
                    title="Retention Rate"
                    value={`${userStats?.retentionRate || 0}%`}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* App Usage Statistics */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>App Usage Statistics</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<GamesIcon fontSize="large" color="primary" />}
                    title="Total Games"
                    value={appStats?.totalGames || 0}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<TournamentsIcon fontSize="large" color="secondary" />}
                    title="Total Tournaments"
                    value={appStats?.totalTournaments || 0}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<ParticipantsIcon fontSize="large" style={{ color: '#4caf50' }} />}
                    title="Avg. Participants"
                    value={appStats?.avgParticipantsPerTournament || 0}
                    subtitle="Per Tournament"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<RevenueIcon fontSize="large" style={{ color: '#ff9800' }} />}
                    title="Total Revenue"
                    value={`₹${(appStats?.totalRevenue || 0).toLocaleString()}`}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* User Analytics Tab */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* User Registration Chart */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
              <Typography variant="h6" gutterBottom>User Registrations</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={userRegistrationData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" name="New Users" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* User Location Chart */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
              <Typography variant="h6" gutterBottom>Users by Location</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={locationPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {locationPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* User Statistics Cards */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>User Metrics</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<UsersIcon fontSize="large" color="primary" />}
                    title="Total Users"
                    value={userStats?.totalUsers || 0}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<ActiveUsersIcon fontSize="large" color="secondary" />}
                    title="Active Users"
                    value={userStats?.activeUsers || 0}
                    subtitle="Last 7 days"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<NewUsersIcon fontSize="large" style={{ color: '#4caf50' }} />}
                    title="New Users"
                    value={userStats?.newUsers || 0}
                    subtitle="Last 30 days"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<RetentionIcon fontSize="large" style={{ color: '#ff9800' }} />}
                    title="Retention Rate"
                    value={`${userStats?.retentionRate || 0}%`}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* App Usage Tab */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          {/* App Usage Statistics */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>App Usage Metrics</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<GamesIcon fontSize="large" color="primary" />}
                    title="Total Games"
                    value={appStats?.totalGames || 0}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<TournamentsIcon fontSize="large" color="secondary" />}
                    title="Total Tournaments"
                    value={appStats?.totalTournaments || 0}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<TransactionsIcon fontSize="large" style={{ color: '#4caf50' }} />}
                    title="Transactions"
                    value={appStats?.totalTransactions || 0}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard 
                    icon={<RevenueIcon fontSize="large" style={{ color: '#ff9800' }} />}
                    title="Total Revenue"
                    value={`₹${(appStats?.totalRevenue || 0).toLocaleString()}`}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Tournament Statistics */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
              <Typography variant="h6" gutterBottom>Tournament Insights</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h3" align="center" color="primary">
                  {appStats?.avgParticipantsPerTournament || 0}
                </Typography>
                <Typography variant="subtitle1" align="center" color="textSecondary">
                  Average Participants Per Tournament
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Revenue Statistics */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
              <Typography variant="h6" gutterBottom>Revenue Insights</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h3" align="center" color="secondary">
                  ₹{(appStats?.totalRevenue || 0).toLocaleString()}
                </Typography>
                <Typography variant="subtitle1" align="center" color="textSecondary">
                  Total Revenue Generated
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, subtitle }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              {icon}
            </Box>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="h6" component="div">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Analyzer;