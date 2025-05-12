import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import Layout from '../layout/Layout';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Component to recenter map
const MapRecenter = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 13);
    }
  }, [map, position]);
  return null;
};

const PropertyMap = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { error: showError } = useContext(AlertContext);
  
  // Map state
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // Default to NYC
  const [zoom, setZoom] = useState(12);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // Search and filter state
  const [searchAddress, setSearchAddress] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [mapType, setMapType] = useState('street'); // 'street', 'satellite', or 'hybrid'
  const [filters, setFilters] = useState({
    propertyType: 'all',
    minValue: 0,
    maxValue: 10000000,
    radius: 5000 // meters
  });
  
  // Loading state
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Load initial properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would call the backend API
        // For now, we'll use mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock property data
        const mockProperties = [
          {
            id: '1',
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
            value: {
              estimatedValue: 1250000
            },
            owners: [
              {
                owner: {
                  id: '101',
                  name: 'John Smith',
                  wealthData: {
                    estimatedNetWorth: 5000000,
                    wealthTier: 'high'
                  }
                }
              }
            ]
          },
          {
            id: '2',
            address: {
              street: '456 Park Ave',
              city: 'New York',
              state: 'NY',
              zipCode: '10022',
              formattedAddress: '456 Park Ave, New York, NY 10022'
            },
            location: {
              coordinates: [-73.9654, 40.7621]
            },
            propertyType: 'commercial',
            propertySubType: 'office',
            value: {
              estimatedValue: 4500000
            },
            owners: [
              {
                owner: {
                  id: '102',
                  name: 'ABC Corporation',
                  wealthData: {
                    estimatedNetWorth: 50000000,
                    wealthTier: 'ultra-high'
                  }
                }
              }
            ]
          },
          {
            id: '3',
            address: {
              street: '789 Broadway',
              city: 'New York',
              state: 'NY',
              zipCode: '10003',
              formattedAddress: '789 Broadway, New York, NY 10003'
            },
            location: {
              coordinates: [-73.9883, 40.7384]
            },
            propertyType: 'mixed-use',
            propertySubType: 'retail',
            value: {
              estimatedValue: 2800000
            },
            owners: [
              {
                owner: {
                  id: '103',
                  name: 'Jane Doe',
                  wealthData: {
                    estimatedNetWorth: 8500000,
                    wealthTier: 'high'
                  }
                }
              }
            ]
          },
          {
            id: '4',
            address: {
              street: '101 5th Ave',
              city: 'New York',
              state: 'NY',
              zipCode: '10011',
              formattedAddress: '101 5th Ave, New York, NY 10011'
            },
            location: {
              coordinates: [-73.9925, 40.7399]
            },
            propertyType: 'commercial',
            propertySubType: 'retail',
            value: {
              estimatedValue: 5200000
            },
            owners: [
              {
                owner: {
                  id: '104',
                  name: 'XYZ Investments',
                  wealthData: {
                    estimatedNetWorth: 75000000,
                    wealthTier: 'ultra-high'
                  }
                }
              }
            ]
          }
        ];
        
        setProperties(mockProperties);
      } catch (err) {
        console.error('Error fetching properties:', err);
        showError('Failed to load properties');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperties();
  }, [showError]);
  
  // Handle address search
  const handleAddressSearch = async () => {
    if (!searchAddress) return;
    
    try {
      setSearchLoading(true);
      
      // In a real implementation, this would call the geocoding API
      // For now, we'll use mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock geocoding response
      const mockLocation = {
        lat: 40.7501,
        lng: -73.9934,
        displayName: '123 Main St, New York, NY 10001'
      };
      
      // Update map center
      setMapCenter([mockLocation.lat, mockLocation.lng]);
      setZoom(15);
      
      // In a real implementation, we would also fetch properties near this location
      // For now, we'll just use our existing mock data
      
    } catch (err) {
      console.error('Error searching address:', err);
      showError('Failed to search address');
    } finally {
      setSearchLoading(false);
    }
  };
  
  // Handle filter changes
  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };
  
  // Handle value range change
  const handleValueRangeChange = (event, newValue) => {
    setFilters({
      ...filters,
      minValue: newValue[0],
      maxValue: newValue[1]
    });
  };
  
  // Apply filters
  const applyFilters = () => {
    // In a real implementation, this would call the backend API with filters
    // For now, we'll just filter our mock data
    
    // Filter properties based on criteria
    const filteredProperties = properties.filter(property => {
      // Filter by property type
      if (filters.propertyType !== 'all' && property.propertyType !== filters.propertyType) {
        return false;
      }
      
      // Filter by value range
      if (property.value.estimatedValue < filters.minValue || 
          property.value.estimatedValue > filters.maxValue) {
        return false;
      }
      
      return true;
    });
    
    // Update properties
    setProperties(filteredProperties);
    
    // Close filter panel
    setShowFilters(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      propertyType: 'all',
      minValue: 0,
      maxValue: 10000000,
      radius: 5000
    });
  };
  
  // Save current map view
  const saveMapView = () => {
    // In a real implementation, this would call the backend API
    // For now, we'll just show a success message
    alert('Map view saved successfully!');
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Get marker color based on property type
  const getMarkerColor = (propertyType) => {
    switch (propertyType) {
      case 'residential':
        return '#4CAF50'; // Green
      case 'commercial':
        return '#2196F3'; // Blue
      case 'industrial':
        return '#FF9800'; // Orange
      case 'mixed-use':
        return '#9C27B0'; // Purple
      case 'land':
        return '#795548'; // Brown
      default:
        return '#757575'; // Gray
    }
  };
  
  return (
    <Layout title="Property Map">
      <Box sx={{ position: 'relative', height: 'calc(100vh - 100px)' }}>
        {/* Map Container */}
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
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
          
          {/* Property Markers */}
          {properties.map(property => (
            <Marker
              key={property.id}
              position={[property.location.coordinates[1], property.location.coordinates[0]]}
              icon={createCustomIcon(getMarkerColor(property.propertyType))}
              eventHandlers={{
                click: () => setSelectedProperty(property)
              }}
            >
              <Popup>
                <Typography variant="subtitle1">{property.address.formattedAddress}</Typography>
                <Typography variant="body2">
                  {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                </Typography>
                <Typography variant="body2">
                  Value: {formatCurrency(property.value.estimatedValue)}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() => navigate(`/properties/${property.id}`)}
                >
                  View Details
                </Button>
              </Popup>
            </Marker>
          ))}
          
          {/* Map Recenter Component */}
          <MapRecenter position={mapCenter} />
        </MapContainer>
        
        {/* Map Type Selector */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1000,
            p: 1,
            display: 'flex',
            justifyContent: 'space-between',
            width: 280
          }}
        >
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
        </Paper>
        
        {/* Map Controls */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1000,
            p: 2,
            width: 300
          }}
        >
          <Typography variant="h6" gutterBottom>
            Property Search
          </Typography>
          
          {/* Address Search */}
          <Box sx={{ display: 'flex', mb: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter address or location"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              sx={{ mr: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleAddressSearch}
              disabled={searchLoading}
            >
              {searchLoading ? <CircularProgress size={24} /> : <SearchIcon />}
            </Button>
          </Box>
          
          {/* Filter Toggle */}
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            fullWidth
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          {/* Filters */}
          {showFilters && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 1 }} />
              
              {/* Property Type Filter */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Property Type</InputLabel>
                <Select
                  name="propertyType"
                  value={filters.propertyType}
                  onChange={handleFilterChange}
                  label="Property Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="residential">Residential</MenuItem>
                  <MenuItem value="commercial">Commercial</MenuItem>
                  <MenuItem value="industrial">Industrial</MenuItem>
                  <MenuItem value="mixed-use">Mixed-Use</MenuItem>
                  <MenuItem value="land">Land</MenuItem>
                </Select>
              </FormControl>
              
              {/* Value Range Filter */}
              <Typography variant="body2" gutterBottom>
                Property Value Range
              </Typography>
              <Slider
                value={[filters.minValue, filters.maxValue]}
                onChange={handleValueRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={10000000}
                step={100000}
                valueLabelFormat={(value) => formatCurrency(value)}
                sx={{ mb: 2 }}
              />
              <Typography variant="caption" color="textSecondary">
                {formatCurrency(filters.minValue)} - {formatCurrency(filters.maxValue)}
              </Typography>
              
              {/* Filter Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
                <Button
                  variant="contained"
                  onClick={applyFilters}
                >
                  Apply Filters
                </Button>
              </Box>
            </Box>
          )}
          
          {/* Save Map View */}
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={saveMapView}
            fullWidth
            sx={{ mt: 2 }}
          >
            Save Map View
          </Button>
        </Paper>
        
        {/* Selected Property Details */}
        {selectedProperty && (
          <Paper
            elevation={3}
            sx={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              zIndex: 1000,
              width: 350,
              p: 2
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Property Details</Typography>
              <IconButton size="small" onClick={() => setSelectedProperty(null)}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              {selectedProperty.address.formattedAddress}
            </Typography>
            
            <Grid container spacing={1} sx={{ mb: 2 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Property Type
                </Typography>
                <Typography variant="body1">
                  {selectedProperty.propertyType.charAt(0).toUpperCase() + selectedProperty.propertyType.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Property Value
                </Typography>
                <Typography variant="body1">
                  {formatCurrency(selectedProperty.value.estimatedValue)}
                </Typography>
              </Grid>
            </Grid>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Owner Information
            </Typography>
            
            {selectedProperty.owners.map((ownerInfo, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 1 }}>
                <CardContent sx={{ py: 1, px: 2, '&:last-child': { pb: 1 } }}>
                  <Typography variant="subtitle2">
                    {ownerInfo.owner.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Net Worth: {formatCurrency(ownerInfo.owner.wealthData.estimatedNetWorth)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Wealth Tier: {ownerInfo.owner.wealthData.wealthTier.charAt(0).toUpperCase() + ownerInfo.owner.wealthData.wealthTier.slice(1)}
                  </Typography>
                </CardContent>
              </Card>
            ))}
            
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => navigate(`/properties/${selectedProperty.id}`)}
            >
              View Full Details
            </Button>
          </Paper>
        )}
        
        {/* Loading Overlay */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1100
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Layout>
  );
};

export default PropertyMap;
