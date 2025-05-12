import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import Layout from '../layout/Layout';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  Button,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tab,
  Tabs,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon,
  PieChart as PieChartIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`owner-tabpanel-${index}`}
      aria-labelledby={`owner-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const OwnerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { error: showError, success: showSuccess } = useContext(AlertContext);
  
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  useEffect(() => {
    const fetchOwnerDetails = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would call the backend API
        // For now, we'll use mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock owner data
        const mockOwner = {
          id: id,
          name: 'John Smith',
          ownerType: 'individual',
          individual: {
            firstName: 'John',
            lastName: 'Smith',
            age: 45,
            dateOfBirth: '1978-05-15',
            gender: 'male',
            occupation: 'Executive',
            employer: 'Tech Corporation',
            contactInfo: {
              email: 'john.smith@example.com',
              phone: '(555) 123-4567',
              address: {
                street: '789 Oak Lane',
                city: 'New York',
                state: 'NY',
                zipCode: '10021',
                country: 'USA'
              }
            },
            profileImage: 'https://randomuser.me/api/portraits/men/75.jpg'
          },
          wealthData: {
            estimatedNetWorth: 5000000,
            confidenceLevel: 85,
            wealthComposition: {
              realEstate: 2500000,
              stocks: 1500000,
              cash: 500000,
              other: 500000
            },
            incomeEstimate: 350000,
            wealthTier: 'high',
            dataSource: 'Wealth Engine',
            lastUpdated: '2023-01-15'
          },
          properties: [
            {
              property: {
                id: '1',
                address: {
                  street: '123 Main St',
                  city: 'New York',
                  state: 'NY',
                  zipCode: '10001',
                  formattedAddress: '123 Main St, New York, NY 10001'
                },
                propertyType: 'residential',
                propertySubType: 'single-family',
                value: {
                  estimatedValue: 1250000
                }
              },
              ownershipPercentage: 100,
              startDate: '2020-06-15',
              isCurrentOwner: true
            },
            {
              property: {
                id: '5',
                address: {
                  street: '555 Lake View Dr',
                  city: 'Miami',
                  state: 'FL',
                  zipCode: '33139',
                  formattedAddress: '555 Lake View Dr, Miami, FL 33139'
                },
                propertyType: 'residential',
                propertySubType: 'condo',
                value: {
                  estimatedValue: 950000
                }
              },
              ownershipPercentage: 100,
              startDate: '2018-03-22',
              isCurrentOwner: true
            }
          ],
          relationships: [
            {
              relatedOwner: {
                id: '201',
                name: 'Jane Smith',
                ownerType: 'individual'
              },
              relationshipType: 'family',
              description: 'Spouse'
            },
            {
              relatedOwner: {
                id: '102',
                name: 'ABC Corporation',
                ownerType: 'entity'
              },
              relationshipType: 'business',
              description: 'Board Member'
            }
          ],
          metadata: {
            source: 'Wealth Engine',
            lastUpdated: '2023-01-15',
            dataQualityScore: 85
          }
        };
        
        setOwner(mockOwner);
      } catch (err) {
        console.error('Error fetching owner details:', err);
        showError('Failed to load owner details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOwnerDetails();
  }, [id, showError]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleExportReport = () => {
    // In a real implementation, this would call the backend API
    // For now, we'll just show a success message
    showSuccess('Owner report exported successfully');
  };
  
  const handleViewProperty = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Prepare chart data for wealth composition
  const wealthCompositionChartData = owner ? {
    labels: ['Real Estate', 'Stocks', 'Cash', 'Other'],
    datasets: [
      {
        data: [
          owner.wealthData.wealthComposition.realEstate,
          owner.wealthData.wealthComposition.stocks,
          owner.wealthData.wealthComposition.cash,
          owner.wealthData.wealthComposition.other
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }
    ]
  } : null;
  
  if (loading) {
    return (
      <Layout title="Owner Details">
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
  
  if (!owner) {
    return (
      <Layout title="Owner Details">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          minHeight="80vh"
        >
          <Typography variant="h5" gutterBottom>
            Owner Not Found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/search')}
            sx={{ mt: 2 }}
          >
            Back to Search
          </Button>
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout title="Owner Details">
      {/* Owner Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={owner.ownerType === 'individual' ? owner.individual.profileImage : null}
                sx={{ width: 64, height: 64, mr: 2 }}
              >
                {owner.ownerType === 'individual' ? <PersonIcon /> : <BusinessIcon />}
              </Avatar>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {owner.name}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    icon={owner.ownerType === 'individual' ? <PersonIcon /> : <BusinessIcon />}
                    label={owner.ownerType.charAt(0).toUpperCase() + owner.ownerType.slice(1)}
                  />
                  <Chip
                    icon={<MoneyIcon />}
                    label={formatCurrency(owner.wealthData.estimatedNetWorth)}
                    color="primary"
                  />
                  <Chip
                    label={`Wealth Tier: ${owner.wealthData.wealthTier.charAt(0).toUpperCase() + owner.wealthData.wealthTier.slice(1)}`}
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportReport}
            >
              Export Report
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Owner Content */}
      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2}>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="owner tabs">
                <Tab label="Overview" id="owner-tab-0" aria-controls="owner-tabpanel-0" />
                <Tab label="Properties" id="owner-tab-1" aria-controls="owner-tabpanel-1" />
                <Tab label="Relationships" id="owner-tab-2" aria-controls="owner-tabpanel-2" />
              </Tabs>
            </Box>
            
            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              
              {owner.ownerType === 'individual' ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Full Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {owner.individual.firstName} {owner.individual.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Age
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {owner.individual.age}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Date of Birth
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formatDate(owner.individual.dateOfBirth)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Gender
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {owner.individual.gender.charAt(0).toUpperCase() + owner.individual.gender.slice(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Occupation
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {owner.individual.occupation}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Employer
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {owner.individual.employer}
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body1" gutterBottom>
                  Entity information not available
                </Typography>
              )}
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Contact Information
              </Typography>
              
              {owner.ownerType === 'individual' && owner.individual.contactInfo ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Email
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {owner.individual.contactInfo.email}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Phone
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {owner.individual.contactInfo.phone}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Address
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {owner.individual.contactInfo.address.street}, {owner.individual.contactInfo.address.city}, {owner.individual.contactInfo.address.state} {owner.individual.contactInfo.address.zipCode}
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body1" gutterBottom>
                  Contact information not available
                </Typography>
              )}
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Wealth Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Estimated Net Worth
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatCurrency(owner.wealthData.estimatedNetWorth)}
                    <Chip
                      size="small"
                      label={`${owner.wealthData.confidenceLevel}% confidence`}
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Wealth Tier
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {owner.wealthData.wealthTier.charAt(0).toUpperCase() + owner.wealthData.wealthTier.slice(1)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Estimated Annual Income
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatCurrency(owner.wealthData.incomeEstimate)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Data Source
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {owner.wealthData.dataSource}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(owner.wealthData.lastUpdated)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Data Quality Score
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {owner.metadata.dataQualityScore}/100
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Wealth Composition
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box height={300} display="flex" justifyContent="center" alignItems="center">
                    {wealthCompositionChartData && <Pie data={wealthCompositionChartData} />}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Real Estate
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatCurrency(owner.wealthData.wealthComposition.realEstate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Stocks
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatCurrency(owner.wealthData.wealthComposition.stocks)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Cash
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatCurrency(owner.wealthData.wealthComposition.cash)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Other
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatCurrency(owner.wealthData.wealthComposition.other)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Properties Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom>
                Owned Properties
                <Chip
                  label={`${owner.properties.length} properties`}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              
              <List>
                {owner.properties.map((propertyInfo, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <Typography variant="subtitle1" gutterBottom>
                            {propertyInfo.property.address.formattedAddress}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {propertyInfo.property.propertyType.charAt(0).toUpperCase() + propertyInfo.property.propertyType.slice(1)} - 
                            {propertyInfo.property.propertySubType.charAt(0).toUpperCase() + propertyInfo.property.propertySubType.slice(1)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Value: {formatCurrency(propertyInfo.property.value.estimatedValue)}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Ownership: {propertyInfo.ownershipPercentage}% since {formatDate(propertyInfo.startDate)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            onClick={() => handleViewProperty(propertyInfo.property.id)}
                          >
                            View Property
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </List>
            </TabPanel>
            
            {/* Relationships Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Relationships
                <Chip
                  label={`${owner.relationships.length} relationships`}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              
              <List>
                {owner.relationships.map((relationship, index) => (
                  <ListItem
                    key={index}
                    alignItems="flex-start"
                    sx={{ borderBottom: '1px solid #eee', py: 2 }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {relationship.relatedOwner.ownerType === 'individual' ? <PersonIcon /> : <BusinessIcon />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={relationship.relatedOwner.name}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {relationship.relationshipType.charAt(0).toUpperCase() + relationship.relationshipType.slice(1)}
                          </Typography>
                          <Typography component="div" variant="body2">
                            {relationship.description}
                          </Typography>
                        </>
                      }
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/owners/${relationship.relatedOwner.id}`)}
                      sx={{ ml: 2 }}
                    >
                      View
                    </Button>
                  </ListItem>
                ))}
              </List>
            </TabPanel>
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Wealth Summary */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Wealth Summary
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Estimated Net Worth
              </Typography>
              <Typography variant="h4" gutterBottom>
                {formatCurrency(owner.wealthData.estimatedNetWorth)}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Wealth Tier
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {owner.wealthData.wealthTier.charAt(0).toUpperCase() + owner.wealthData.wealthTier.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Confidence
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {owner.wealthData.confidenceLevel}%
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Annual Income
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatCurrency(owner.wealthData.incomeEstimate)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Property Summary */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Property Summary
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary">
                Total Properties
              </Typography>
              <Typography variant="h4" gutterBottom>
                {owner.properties.length}
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Total Property Value
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatCurrency(
                owner.properties.reduce(
                  (total, propertyInfo) => total + propertyInfo.property.value.estimatedValue,
                  0
                )
              )}
            </Typography>
            
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setTabValue(1)}
              sx={{ mt: 2 }}
            >
              View All Properties
            </Button>
          </Paper>
          
          {/* Quick Actions */}
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <PrintIcon />
                </ListItemIcon>
                <ListItemText primary="Print Owner Details" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ShareIcon />
                </ListItemIcon>
                <ListItemText primary="Share Owner Profile" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DownloadIcon />
                </ListItemIcon>
                <ListItemText primary="Export Owner Report" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default OwnerDetails;
