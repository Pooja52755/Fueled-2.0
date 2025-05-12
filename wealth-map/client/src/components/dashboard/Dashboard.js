import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import Layout from '../layout/Layout';
import axios from 'axios';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton
} from '@mui/material';
import {
  Home as HomeIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon,
  Map as MapIcon,
  Search as SearchIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { error: showError } = useContext(AlertContext);
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    propertyCount: 0,
    ownerCount: 0,
    averagePropertyValue: 0,
    propertyTypeDistribution: [],
    recentProperties: [],
    wealthTierDistribution: []
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, these would be actual API calls
        // For now, we'll use mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockData = {
          propertyCount: 1254,
          ownerCount: 876,
          averagePropertyValue: 1250000,
          propertyTypeDistribution: [
            { type: 'Residential', count: 850 },
            { type: 'Commercial', count: 280 },
            { type: 'Industrial', count: 85 },
            { type: 'Land', count: 39 }
          ],
          recentProperties: [
            {
              id: '1',
              address: '123 Main St, New York, NY 10001',
              propertyType: 'Residential',
              value: 1250000,
              ownerName: 'John Smith'
            },
            {
              id: '2',
              address: '456 Park Ave, New York, NY 10022',
              propertyType: 'Commercial',
              value: 4500000,
              ownerName: 'ABC Corporation'
            },
            {
              id: '3',
              address: '789 Broadway, New York, NY 10003',
              propertyType: 'Mixed-Use',
              value: 2800000,
              ownerName: 'Jane Doe'
            },
            {
              id: '4',
              address: '101 5th Ave, New York, NY 10011',
              propertyType: 'Commercial',
              value: 5200000,
              ownerName: 'XYZ Investments'
            }
          ],
          wealthTierDistribution: [
            { tier: 'Ultra-High', count: 45 },
            { tier: 'High', count: 120 },
            { tier: 'Upper-Middle', count: 230 },
            { tier: 'Middle', count: 310 },
            { tier: 'Lower-Middle', count: 125 },
            { tier: 'Low', count: 46 }
          ]
        };
        
        setStats(mockData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        showError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [showError]);
  
  // Prepare chart data for property type distribution
  const propertyTypeChartData = {
    labels: stats.propertyTypeDistribution.map(item => item.type),
    datasets: [
      {
        data: stats.propertyTypeDistribution.map(item => item.count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Prepare chart data for wealth tier distribution
  const wealthTierChartData = {
    labels: stats.wealthTierDistribution.map(item => item.tier),
    datasets: [
      {
        label: 'Owner Count',
        data: stats.wealthTierDistribution.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };
  
  const wealthTierChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Owner Wealth Distribution'
      }
    }
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  if (loading) {
    return (
      <Layout title="Dashboard">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="80vh"
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout title="Dashboard">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, {user ? `${user.firstName} ${user.lastName}` : 'User'}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's an overview of your property and wealth data
        </Typography>
      </Box>
      
      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <HomeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    {stats.propertyCount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Properties
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    {stats.ownerCount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Property Owners
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card elevation={2}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    {formatCurrency(stats.averagePropertyValue)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Average Property Value
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Quick Actions */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<MapIcon />}
              onClick={() => navigate('/map')}
              sx={{ py: 1 }}
            >
              Explore Map
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<SearchIcon />}
              onClick={() => navigate('/search')}
              sx={{ py: 1 }}
            >
              Search Properties
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ReportIcon />}
              onClick={() => navigate('/reports')}
              sx={{ py: 1 }}
            >
              Generate Reports
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<BusinessIcon />}
              onClick={() => navigate('/admin/company')}
              sx={{ py: 1 }}
              disabled={user && user.role !== 'admin'}
            >
              Company Settings
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Charts and Recent Properties */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Property Type Distribution
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box height={300} display="flex" justifyContent="center" alignItems="center">
              <Pie data={propertyTypeChartData} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Owner Wealth Distribution
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box height={300} display="flex" justifyContent="center" alignItems="center">
              <Bar data={wealthTierChartData} options={wealthTierChartOptions} />
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recently Added Properties
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {stats.recentProperties.map((property) => (
                <ListItem
                  key={property.id}
                  secondaryAction={
                    <IconButton edge="end" aria-label="view" onClick={() => navigate(`/properties/${property.id}`)}>
                      <ViewIcon />
                    </IconButton>
                  }
                  sx={{ borderBottom: '1px solid #eee' }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <HomeIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={property.address}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textPrimary">
                          {property.propertyType} • {formatCurrency(property.value)}
                        </Typography>
                        <Typography component="span" variant="body2" display="block">
                          Owner: {property.ownerName}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                variant="contained"
                onClick={() => navigate('/search')}
              >
                View All Properties
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Dashboard;
