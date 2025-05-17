import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import Layout from '../layout/Layout';
import { fetchCSV, parseCSV } from '../../utils/csvParser';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
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
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Home as HomeIcon,
  LocationOn as LocationIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Receipt as ReceiptIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Map as MapIcon
} from '@mui/icons-material';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
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

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { error: showError, success: showSuccess } = useContext(AlertContext);
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [mapType, setMapType] = useState('street'); // 'street', 'satellite', or 'hybrid'
  
  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        
        // Try to load property from Zillow dataset
        try {
          // Use relative path to the data file
          const zillowData = await fetch('/data/zillow-properties-listing-information.csv')
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
              }
              return response.text();
            })
            .then(csvText => {
              console.log('CSV loaded, first 100 chars:', csvText.substring(0, 100));
              return parseCSV(csvText);
            });
          
          // Find the property by zpid
          const zillowProperty = zillowData.find(prop => prop.zpid === id);
          
          if (zillowProperty) {
            console.log('Found property in Zillow dataset:', zillowProperty);
            
            // Transform Zillow data to our property format
            const hasValidCoordinates = 
              zillowProperty.latitude && 
              zillowProperty.longitude && 
              !isNaN(parseFloat(zillowProperty.latitude)) && 
              !isNaN(parseFloat(zillowProperty.longitude));
            
            // Parse price and other numeric values
            const price = zillowProperty.price ? 
              parseFloat(zillowProperty.price.replace(/[^0-9.-]+/g, '')) : 
              (zillowProperty.zestimate ? parseFloat(zillowProperty.zestimate.replace(/[^0-9.-]+/g, '')) : 0);
            
            const livingArea = zillowProperty.livingArea ? parseFloat(zillowProperty.livingArea) : 0;
            const lotSize = zillowProperty.lotSize ? parseFloat(zillowProperty.lotSize) : 0;
            const bedrooms = zillowProperty.bedrooms ? parseInt(zillowProperty.bedrooms) : 0;
            const bathrooms = zillowProperty.bathrooms ? parseFloat(zillowProperty.bathrooms) : 0;
            const yearBuilt = zillowProperty.yearBuilt ? parseInt(zillowProperty.yearBuilt) : null;
            
            // Extract tax information
            const taxAssessedValue = zillowProperty.taxAssessedValue ? 
              parseFloat(zillowProperty.taxAssessedValue.replace(/[^0-9.-]+/g, '')) : 0;
            const taxAssessedYear = zillowProperty.taxAssessedYear ? 
              parseInt(zillowProperty.taxAssessedYear) : new Date().getFullYear();
            const propertyTaxRate = zillowProperty.propertyTaxRate ? 
              parseFloat(zillowProperty.propertyTaxRate) : 0;
            
            // Extract features from Zillow data
            const features = [];
            if (zillowProperty.hasHeating) features.push('Heating');
            if (zillowProperty.hasCooling) features.push('Cooling');
            if (zillowProperty.hasGarage) features.push('Garage');
            if (zillowProperty.hasPool) features.push('Pool');
            if (zillowProperty.hasFireplace) features.push('Fireplace');
            
            // Get image URL if available, otherwise use default
            const imageUrl = zillowProperty.imgSrc || zillowProperty.image || 
              'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80';
            
            // Create property object from Zillow data
            const transformedProperty = {
              id: zillowProperty.zpid,
              address: {
                street: zillowProperty.streetAddress || '',
                city: zillowProperty.city || '',
                state: zillowProperty.state || '',
                zipCode: zillowProperty.zipcode || '',
                formattedAddress: zillowProperty.address || `${zillowProperty.streetAddress || ''}, ${zillowProperty.city || ''}, ${zillowProperty.state || ''} ${zillowProperty.zipcode || ''}`
              },
              location: {
                coordinates: hasValidCoordinates ? 
                  [parseFloat(zillowProperty.longitude), parseFloat(zillowProperty.latitude)] : 
                  [0, 0] // Default coordinates if missing
              },
              propertyType: zillowProperty.homeType || 'residential',
              propertySubType: zillowProperty.propertySubType || '',
              size: {
                buildingSize: livingArea,
                lotSize: lotSize,
                bedrooms: bedrooms,
                bathrooms: bathrooms
              },
              value: {
                estimatedValue: price,
                assessedValue: taxAssessedValue,
                lastSalePrice: zillowProperty.lastSoldPrice ? parseFloat(zillowProperty.lastSoldPrice.replace(/[^0-9.-]+/g, '')) : 0,
                lastSaleDate: zillowProperty.dateSold || zillowProperty.dateSoldString || ''
              },
              yearBuilt: yearBuilt,
              features: features,
              images: [imageUrl],
              description: zillowProperty.description || `This ${zillowProperty.homeType || 'property'} is located in ${zillowProperty.city || 'the city'}, ${zillowProperty.state || 'state'}. It has ${bedrooms} bedrooms and ${bathrooms} bathrooms with a total of ${livingArea} square feet of living area.`,
              owners: [
                {
                  owner: {
                    id: '101',
                    name: 'Property Owner',
                    ownerType: 'individual',
                    individual: {
                      firstName: 'Property',
                      lastName: 'Owner',
                      age: 45,
                      occupation: 'Professional'
                    },
                    wealthData: {
                      estimatedNetWorth: price * 4,
                      confidenceLevel: 70,
                      wealthComposition: {
                        realEstate: price * 2,
                        stocks: price,
                        cash: price * 0.5,
                        other: price * 0.5
                      },
                      incomeEstimate: price * 0.1,
                      wealthTier: price > 1000000 ? 'high' : (price > 500000 ? 'medium' : 'standard')
                    }
                  },
                  ownershipPercentage: 100,
                  startDate: zillowProperty.dateSold || zillowProperty.dateSoldString || '2020-01-01',
                  isCurrentOwner: true
                }
              ],
              transactions: [
                {
                  transactionType: 'sale',
                  date: zillowProperty.dateSold || zillowProperty.dateSoldString || '2020-01-01',
                  price: zillowProperty.lastSoldPrice ? parseFloat(zillowProperty.lastSoldPrice.replace(/[^0-9.-]+/g, '')) : price,
                  seller: 'Previous Owner',
                  buyer: 'Current Owner',
                  documentNumber: `DOC-${Math.floor(Math.random() * 1000000)}`
                }
              ],
              taxInfo: {
                parcelNumber: zillowProperty.parcelId || `PARCEL-${Math.floor(Math.random() * 1000000)}`,
                taxAssessment: taxAssessedValue,
                taxYear: taxAssessedYear,
                propertyTax: taxAssessedValue * (propertyTaxRate / 100)
              },
              rawZillowData: zillowProperty // Store the raw data for reference
            };
            
            setProperty(transformedProperty);
            setIsBookmarked(Math.random() > 0.5);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error loading property from Zillow dataset:', error);
          // Fall back to mock data if there's an error loading the CSV or property not found
        }
        
        // If we get here, either the CSV loading failed or the property wasn't found
        // Use mock data as fallback
        console.log('Using mock property data as fallback');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock property data
        const mockProperty = {
          id: id,
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            formattedAddress: '123 Main St, New York, NY 10001'
          },
          location: {
            coordinates: [-73.9934, 40.7501] // [longitude, latitude]
          },
          propertyType: 'residential',
          propertySubType: 'single-family',
          size: {
            buildingSize: 2500, // square feet
            lotSize: 5000, // square feet
            bedrooms: 4,
            bathrooms: 3
          },
          value: {
            estimatedValue: 1250000,
            assessedValue: 1150000,
            lastSalePrice: 1100000,
            lastSaleDate: '2020-06-15'
          },
          yearBuilt: 1985,
          features: ['Central Air', 'Hardwood Floors', 'Fireplace', 'Garage', 'Updated Kitchen'],
          images: [
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
          ],
          description: 'Beautiful single-family home in a prime location. This spacious property features 4 bedrooms, 3 bathrooms, and numerous upgrades throughout. The home includes a modern kitchen, hardwood floors, central air conditioning, and a cozy fireplace. The property is situated on a generous lot with a well-maintained garden and attached garage.',
          owners: [
            {
              owner: {
                id: '101',
                name: 'John Smith',
                ownerType: 'individual',
                individual: {
                  firstName: 'John',
                  lastName: 'Smith',
                  age: 45,
                  occupation: 'Executive'
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
                  wealthTier: 'high'
                }
              },
              ownershipPercentage: 100,
              startDate: '2020-06-15',
              isCurrentOwner: true
            }
          ],
          transactions: [
            {
              transactionType: 'sale',
              date: '2020-06-15',
              price: 1100000,
              seller: 'Previous Owner',
              buyer: 'John Smith',
              documentNumber: 'DOC-123456'
            },
            {
              transactionType: 'sale',
              date: '2010-03-22',
              price: 850000,
              seller: 'Original Builder',
              buyer: 'Previous Owner',
              documentNumber: 'DOC-789012'
            }
          ],
          taxInfo: {
            parcelNumber: 'PARCEL-123456',
            taxAssessment: 950000,
            taxYear: 2023,
            propertyTax: 12500
          }
        };
        
        setProperty(mockProperty);
        
        // Check if property is bookmarked (mock implementation)
        setIsBookmarked(Math.random() > 0.5);
      } catch (err) {
        console.error('Error fetching property details:', err);
        showError('Failed to load property details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPropertyDetails();
  }, [id, showError]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Check if property is bookmarked when component loads
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      try {
        // Get the current user token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token || !property) return;
        
        const response = await fetch(`/api/bookmark/check/${property.id}`, {
          headers: {
            'x-auth-token': token
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setIsBookmarked(data.isBookmarked);
        }
      } catch (err) {
        console.error('Error checking bookmark status:', err);
      }
    };
    
    checkBookmarkStatus();
  }, [property]);
  
  const toggleBookmark = async () => {
    try {
      // Get the current user token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        showError('You must be logged in to bookmark properties');
        return;
      }
      
      const method = isBookmarked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/bookmark/property/${property.id}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update bookmark');
      }
      
      setIsBookmarked(!isBookmarked);
      
      if (!isBookmarked) {
        showSuccess('Property added to bookmarks');
      } else {
        showSuccess('Property removed from bookmarks');
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      showError(err.message || 'Failed to update bookmarks');
    }
  };
  
  const handleExportReport = async (format = 'pdf') => {
    try {
      // Get the current user token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        showError('You must be logged in to export reports');
        return;
      }
      
      const response = await fetch(`/api/export/property/${property.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ format })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to export report');
      }
      
      // If there's a download URL, open it in a new tab
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      }
      
      showSuccess('Property report exported successfully');
    } catch (err) {
      console.error('Error exporting report:', err);
      showError(err.message || 'Failed to export report');
    }
  };
  
  const handleShareProperty = async () => {
    try {
      // For simplicity, we'll use a prompt to get the email
      // In a real app, you'd use a modal or form component
      const email = prompt('Enter email address to share with:');
      
      if (!email) return; // User canceled
      
      // Validate email (simple validation)
      if (!email.includes('@')) {
        showError('Please enter a valid email address');
        return;
      }
      
      // Get the current user token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        showError('You must be logged in to share properties');
        return;
      }
      
      const response = await fetch(`/api/export/share/property/${property.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ 
          email,
          message: `Check out this property: ${property.address.formattedAddress}`
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to share property');
      }
      
      showSuccess(`Property shared with ${email} successfully`);
    } catch (err) {
      console.error('Error sharing property:', err);
      showError(err.message || 'Failed to share property');
    }
  };
  
  const handleViewOwner = (ownerId) => {
    navigate(`/owners/${ownerId}`);
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
  
  if (loading) {
    return (
      <Layout title="Property Details">
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
  
  if (!property) {
    return (
      <Layout title="Property Details">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          minHeight="80vh"
        >
          <Typography variant="h5" gutterBottom>
            Property Not Found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/map')}
            sx={{ mt: 2 }}
          >
            Back to Map
          </Button>
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout title="Property Details">
      {/* Property Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {property.address.formattedAddress}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocationIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body1">
                {property.address.city}, {property.address.state} {property.address.zipCode}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip
                icon={<HomeIcon />}
                label={`${property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)} - ${property.propertySubType.charAt(0).toUpperCase() + property.propertySubType.slice(1)}`}
              />
              <Chip
                icon={<MoneyIcon />}
                label={formatCurrency(property.value.estimatedValue)}
                color="primary"
              />
              <Chip
                label={`${property.size.buildingSize.toLocaleString()} sq ft`}
              />
              <Chip
                label={`Built ${property.yearBuilt}`}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                onClick={toggleBookmark}
              >
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={handleShareProperty}
              >
                Share
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportReport('pdf')}
              >
                Export PDF
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportReport('json')}
              >
                Export JSON
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Property Content */}
      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2}>
            {/* Property Images */}
            <Box sx={{ height: 400, overflow: 'hidden', mb: 2 }}>
              <img
                src={property.images[0]}
                alt={property.address.formattedAddress}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
            
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="property tabs">
                <Tab label="Overview" id="property-tab-0" aria-controls="property-tabpanel-0" />
                <Tab label="Owner Information" id="property-tab-1" aria-controls="property-tabpanel-1" />
                <Tab label="Transaction History" id="property-tab-2" aria-controls="property-tabpanel-2" />
                <Tab label="Tax Information" id="property-tab-3" aria-controls="property-tabpanel-3" />
              </Tabs>
            </Box>
            
            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Property Description
              </Typography>
              <Typography variant="body1" paragraph>
                {property.description}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Property Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Property Type
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Property Subtype
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {property.propertySubType.charAt(0).toUpperCase() + property.propertySubType.slice(1)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Year Built
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {property.yearBuilt}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Building Size
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {property.size.buildingSize.toLocaleString()} sq ft
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Lot Size
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {property.size.lotSize.toLocaleString()} sq ft
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Bedrooms / Bathrooms
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {property.size.bedrooms} / {property.size.bathrooms}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Property Features
              </Typography>
              <Grid container spacing={1}>
                {property.features.map((feature, index) => (
                  <Grid item key={index}>
                    <Chip label={feature} />
                  </Grid>
                ))}
              </Grid>
              
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Valuation
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Estimated Value
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatCurrency(property.value.estimatedValue)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Assessed Value
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatCurrency(property.value.assessedValue)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Last Sale Price
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatCurrency(property.value.lastSalePrice)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Last Sale Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(property.value.lastSaleDate)}
                  </Typography>
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Owner Information Tab */}
            <TabPanel value={tabValue} index={1}>
              {property.owners.map((ownerInfo, index) => (
                <Card key={index} variant="outlined" sx={{ mb: 3 }}>
                  <CardHeader
                    avatar={
                      <Avatar>
                        {ownerInfo.owner.ownerType === 'individual' ? <PersonIcon /> : <BusinessIcon />}
                      </Avatar>
                    }
                    title={ownerInfo.owner.name}
                    subheader={`${ownerInfo.ownershipPercentage}% ownership since ${formatDate(ownerInfo.startDate)}`}
                    action={
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleViewOwner(ownerInfo.owner.id)}
                      >
                        View Owner
                      </Button>
                    }
                  />
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Owner Type
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {ownerInfo.owner.ownerType.charAt(0).toUpperCase() + ownerInfo.owner.ownerType.slice(1)}
                        </Typography>
                        
                        {ownerInfo.owner.ownerType === 'individual' && (
                          <>
                            <Typography variant="subtitle2" color="textSecondary">
                              Age
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {ownerInfo.owner.individual.age}
                            </Typography>
                            
                            <Typography variant="subtitle2" color="textSecondary">
                              Occupation
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {ownerInfo.owner.individual.occupation}
                            </Typography>
                          </>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Estimated Net Worth
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {formatCurrency(ownerInfo.owner.wealthData.estimatedNetWorth)}
                          <Chip
                            size="small"
                            label={`${ownerInfo.owner.wealthData.confidenceLevel}% confidence`}
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        
                        <Typography variant="subtitle2" color="textSecondary">
                          Wealth Tier
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {ownerInfo.owner.wealthData.wealthTier.charAt(0).toUpperCase() + ownerInfo.owner.wealthData.wealthTier.slice(1)}
                        </Typography>
                        
                        <Typography variant="subtitle2" color="textSecondary">
                          Estimated Annual Income
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {formatCurrency(ownerInfo.owner.wealthData.incomeEstimate)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Wealth Composition
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="textSecondary">
                              Real Estate
                            </Typography>
                            <Typography variant="body1">
                              {formatCurrency(ownerInfo.owner.wealthData.wealthComposition.realEstate)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="textSecondary">
                              Stocks
                            </Typography>
                            <Typography variant="body1">
                              {formatCurrency(ownerInfo.owner.wealthData.wealthComposition.stocks)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="textSecondary">
                              Cash
                            </Typography>
                            <Typography variant="body1">
                              {formatCurrency(ownerInfo.owner.wealthData.wealthComposition.cash)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Typography variant="body2" color="textSecondary">
                              Other
                            </Typography>
                            <Typography variant="body1">
                              {formatCurrency(ownerInfo.owner.wealthData.wealthComposition.other)}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </TabPanel>
            
            {/* Transaction History Tab */}
            <TabPanel value={tabValue} index={2}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell>Seller</TableCell>
                      <TableCell>Buyer</TableCell>
                      <TableCell>Document #</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {property.transactions.map((transaction, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>
                          {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                        </TableCell>
                        <TableCell>{formatCurrency(transaction.price)}</TableCell>
                        <TableCell>{transaction.seller}</TableCell>
                        <TableCell>{transaction.buyer}</TableCell>
                        <TableCell>{transaction.documentNumber}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
            
            {/* Tax Information Tab */}
            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Parcel Number
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {property.taxInfo.parcelNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tax Assessment
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatCurrency(property.taxInfo.taxAssessment)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tax Year
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {property.taxInfo.taxYear}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Annual Property Tax
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatCurrency(property.taxInfo.propertyTax)}
                  </Typography>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Map */}
          <Paper elevation={2} sx={{ mb: 3 }}>
            <Box sx={{ height: 300 }}>
              <MapContainer
                center={[property.location.coordinates[1], property.location.coordinates[0]]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                {mapType === 'street' && (
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                )}
                {mapType === 'satellite' && (
                  <TileLayer
                    attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                )}
                {mapType === 'hybrid' && (
                  <>
                    <TileLayer
                      attribution='&copy; <a href="https://www.esri.com">Esri</a>'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.png"
                      zIndex={1000}
                    />
                  </>
                )}
                <Marker position={[property.location.coordinates[1], property.location.coordinates[0]]}>
                  <Popup>
                    {property.address.formattedAddress}
                  </Popup>
                </Marker>
              </MapContainer>
            </Box>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Location
              </Typography>
              <Typography variant="body2">
                {property.address.formattedAddress}
              </Typography>
              
              {/* Map Type Selector */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 2 }}>
                <Button 
                  variant={mapType === 'street' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setMapType('street')}
                >
                  Street
                </Button>
                <Button 
                  variant={mapType === 'satellite' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setMapType('satellite')}
                >
                  Satellite
                </Button>
                <Button 
                  variant={mapType === 'hybrid' ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setMapType('hybrid')}
                >
                  Hybrid
                </Button>
              </Box>
              
              <Button
                variant="outlined"
                fullWidth
                startIcon={<MapIcon />}
                onClick={() => navigate('/map')}
                sx={{ mt: 2 }}
              >
                View on Full Map
              </Button>
            </Box>
          </Paper>
          
          {/* Quick Actions */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <PrintIcon />
                </ListItemIcon>
                <ListItemText primary="Print Property Details" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <ShareIcon />
                </ListItemIcon>
                <ListItemText primary="Share Property" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <DownloadIcon />
                </ListItemIcon>
                <ListItemText primary="Export Property Report" />
              </ListItem>
            </List>
          </Paper>
          
          {/* Current Owner Summary */}
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Current Owner
            </Typography>
            {property.owners.filter(o => o.isCurrentOwner).map((ownerInfo, index) => (
              <Box key={index}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ mr: 2 }}>
                    {ownerInfo.owner.ownerType === 'individual' ? <PersonIcon /> : <BusinessIcon />}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1">
                      {ownerInfo.owner.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Since {formatDate(ownerInfo.startDate)}
                    </Typography>
                  </Box>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="subtitle2" color="textSecondary">
                  Estimated Net Worth
                </Typography>
                <Typography variant="h6" gutterBottom>
                  {formatCurrency(ownerInfo.owner.wealthData.estimatedNetWorth)}
                </Typography>
                
                <Typography variant="subtitle2" color="textSecondary">
                  Wealth Tier
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {ownerInfo.owner.wealthData.wealthTier.charAt(0).toUpperCase() + ownerInfo.owner.wealthData.wealthTier.slice(1)}
                </Typography>
                
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleViewOwner(ownerInfo.owner.id)}
                  sx={{ mt: 2 }}
                >
                  View Owner Details
                </Button>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default PropertyDetails;
