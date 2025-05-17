import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import Layout from '../layout/Layout';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchCSV, parseCSV } from '../../utils/csvParser';
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
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [mapType, setMapType] = useState('street'); // 'street', 'satellite', or 'hybrid'
  const [filters, setFilters] = useState({
    propertyType: 'all',
    minValue: 0,
    maxValue: 100000000, // Increased maximum value to $100M
    radius: 10000, // meters (10km)
    customMinValue: '', // For direct text input
    customMaxValue: '' // For direct text input
  });
  
  // Loading state
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  
  // Load initial properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        // Try to load Zillow dataset
        try {
          // Use relative path to the data file
          const zillowData = await fetch('./data/zillow-properties-listing-information.csv')
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
          
          // Transform Zillow data to our property format
          const transformedProperties = zillowData.map((property, index) => {
            // Check if we have valid latitude and longitude
            const hasValidCoordinates = 
              property.latitude && 
              property.longitude && 
              !isNaN(parseFloat(property.latitude)) && 
              !isNaN(parseFloat(property.longitude));
            
            return {
              id: property.zpid || `zillow-${index}`,
              address: {
                street: property.streetAddress || '',
                city: property.city || '',
                state: property.state || '',
                zipCode: property.zipcode || '',
                formattedAddress: property.address || `${property.streetAddress || ''}, ${property.city || ''}, ${property.state || ''} ${property.zipcode || ''}`
              },
              location: {
                coordinates: hasValidCoordinates ? 
                  [parseFloat(property.longitude), parseFloat(property.latitude)] : 
                  [0, 0] // Default coordinates if missing
              },
              propertyType: property.homeType || 'residential',
              propertySubType: '',
              value: {
                estimatedValue: property.price ? parseFloat(property.price.replace(/[^0-9.-]+/g, '')) : 
                                (property.zestimate ? parseFloat(property.zestimate.replace(/[^0-9.-]+/g, '')) : 0)
              },
              size: {
                buildingSize: property.livingArea ? parseFloat(property.livingArea) : 0,
                lotSize: property.lotSize ? parseFloat(property.lotSize) : 0,
                bedrooms: property.bedrooms ? parseInt(property.bedrooms) : 0,
                bathrooms: property.bathrooms ? parseFloat(property.bathrooms) : 0
              },
              yearBuilt: property.yearBuilt ? parseInt(property.yearBuilt) : null,
              description: property.description || '',
              hasValidCoordinates: hasValidCoordinates,
              rawData: property // Store the raw data for additional details
            };
          }).filter(property => property.hasValidCoordinates); // Only include properties with valid coordinates
          
          if (transformedProperties.length > 0) {
            setProperties(transformedProperties);
            
            // Set map center to the first property with valid coordinates
            const firstProperty = transformedProperties[0];
            if (firstProperty && firstProperty.location && firstProperty.location.coordinates) {
              setMapCenter([firstProperty.location.coordinates[1], firstProperty.location.coordinates[0]]);
            }
            
            setLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error loading Zillow dataset:', error);
          // Fall back to mock data if there's an error loading the CSV
        }
        
        // If we get here, either the CSV loading failed or there were no valid properties
        // Use mock data as fallback
        console.log('Using mock property data as fallback');
        
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
            size: {
              buildingSize: 2500,
              lotSize: 5000,
              bedrooms: 4,
              bathrooms: 3
            },
            yearBuilt: 1985,
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
            size: {
              buildingSize: 10000,
              lotSize: 8000,
              bedrooms: 0,
              bathrooms: 4
            },
            yearBuilt: 1975,
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
            size: {
              buildingSize: 5000,
              lotSize: 3000,
              bedrooms: 2,
              bathrooms: 2
            },
            yearBuilt: 1990,
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
  
  // Fetch address suggestions
  const fetchAddressSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      setSuggestionsLoading(true);
      
      // Use Geoapify API for geocoding with autocomplete
      const encodedAddress = encodeURIComponent(query);
      const apiKey = '82cbd0a49c114b5aa703605e25ead6d3';
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodedAddress}&apiKey=${apiKey}&limit=5&format=json`
      );
      
      if (!response.ok) {
        throw new Error(`Autocomplete failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.results && data.results.length > 0) {
        // Format suggestions for display
        const suggestions = data.results.map(result => ({
          text: result.formatted,
          data: result
        }));
        
        setSearchSuggestions(suggestions);
        setShowSuggestions(true);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error('Error fetching address suggestions:', err);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSuggestionsLoading(false);
    }
  };
  
  // Handle search input change
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchAddress(value);
    
    // Debounce the API call
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    window.searchTimeout = setTimeout(() => {
      fetchAddressSuggestions(value);
    }, 300); // Wait 300ms after typing stops
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchAddress(suggestion.text);
    setShowSuggestions(false);
    
    // Use the selected suggestion data to update the map
    const location = suggestion.data;
    const lat = location.lat;
    const lon = location.lon;
    
    // Update map center
    setMapCenter([lat, lon]);
    
    // Determine appropriate zoom level
    let newZoom = 15;
    const locationType = location.result_type || '';
    
    if (locationType.includes('country')) {
      newZoom = 5;
    } else if (locationType.includes('state') || locationType.includes('region')) {
      newZoom = 7;
    } else if (locationType.includes('city') || locationType.includes('municipality')) {
      newZoom = 10;
    } else if (locationType.includes('postcode') || locationType.includes('district')) {
      newZoom = 12;
    } else if (locationType.includes('street')) {
      newZoom = 14;
    } else if (locationType.includes('building') || locationType.includes('address')) {
      newZoom = 16;
    }
    
    setZoom(newZoom);
    
    // Find nearby properties
    findNearbyProperties(lat, lon, newZoom);
  };
  
  // Find properties near a location
  const findNearbyProperties = (lat, lon, newZoom) => {
    if (!window.originalProperties) return;
    
    const nearbyProperties = window.originalProperties.filter(property => {
      if (!property.location || !property.location.coordinates) return false;
      
      // Calculate distance using Haversine formula
      const propLat = property.location.coordinates[1];
      const propLon = property.location.coordinates[0];
      
      const R = 6371; // Earth's radius in km
      const dLat = (lat - propLat) * Math.PI / 180;
      const dLon = (lon - propLon) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(propLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c; // Distance in km
      
      // Adjust threshold based on zoom level
      let threshold = 5;
      
      if (newZoom <= 5) { // Country level
        threshold = 500;
      } else if (newZoom <= 7) { // State level
        threshold = 200;
      } else if (newZoom <= 10) { // City level
        threshold = 50;
      } else if (newZoom <= 12) { // District level
        threshold = 20;
      } else if (newZoom <= 14) { // Street level
        threshold = 10;
      } else { // Building level
        threshold = 5;
      }
      
      return distance < threshold;
    });
    
    if (nearbyProperties.length > 0) {
      setProperties(nearbyProperties);
      console.log(`Found ${nearbyProperties.length} properties near this location`);
    } else {
      console.log('No properties found near this location');
    }
  };
  
  // Handle address search
  const handleAddressSearch = async () => {
    if (!searchAddress) return;
    setShowSuggestions(false);
    
    try {
      setSearchLoading(true);
      
      // Use Geoapify API for geocoding with autocomplete
      const encodedAddress = encodeURIComponent(searchAddress);
      const apiKey = '82cbd0a49c114b5aa703605e25ead6d3'; // Using the provided API key
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodedAddress}&apiKey=${apiKey}&limit=1&format=json`
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.results && data.results.length > 0) {
        const location = data.results[0];
        const lat = location.lat;
        const lon = location.lon;
        
        // Update map center with the found location
        setMapCenter([lat, lon]);
        
        // Adjust zoom level based on the result type
        let newZoom = 15; // Default zoom level for addresses
        
        // Determine location type and set appropriate zoom level
        const locationType = location.result_type || '';
        
        if (locationType.includes('country')) {
          newZoom = 5;
        } else if (locationType.includes('state') || locationType.includes('region')) {
          newZoom = 7;
        } else if (locationType.includes('city') || locationType.includes('municipality')) {
          newZoom = 10;
        } else if (locationType.includes('postcode') || locationType.includes('district')) {
          newZoom = 12;
        } else if (locationType.includes('street')) {
          newZoom = 14;
        } else if (locationType.includes('building') || locationType.includes('address')) {
          newZoom = 16;
        }
        
        setZoom(newZoom);
        
        // Find properties near this location if we have the original data
        if (window.originalProperties) {
          // Filter properties by proximity to the searched location
          const nearbyProperties = window.originalProperties.filter(property => {
            if (!property.location || !property.location.coordinates) return false;
            
            // Calculate distance between points
            const propLat = property.location.coordinates[1];
            const propLon = property.location.coordinates[0];
            
            // Calculate distance using Haversine formula for more accuracy
            const R = 6371; // Earth's radius in km
            const dLat = (lat - propLat) * Math.PI / 180;
            const dLon = (lon - propLon) * Math.PI / 180;
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(propLat * Math.PI / 180) * Math.cos(lat * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c; // Distance in km
            
            // Adjust the distance threshold based on zoom level
            let threshold = 5; // Default threshold in km
            
            if (newZoom <= 5) { // Country level
              threshold = 500;
            } else if (newZoom <= 7) { // State level
              threshold = 200;
            } else if (newZoom <= 10) { // City level
              threshold = 50;
            } else if (newZoom <= 12) { // District level
              threshold = 20;
            } else if (newZoom <= 14) { // Street level
              threshold = 10;
            } else { // Building level
              threshold = 5;
            }
            
            return distance < threshold;
          });
          
          if (nearbyProperties.length > 0) {
            setProperties(nearbyProperties);
            console.log(`Found ${nearbyProperties.length} properties near ${location.formatted}`);
          } else {
            // If no properties found nearby, keep the current set but notify the user
            console.log(`No properties found near ${location.formatted}`);
            showError(`No properties found near ${location.formatted}. Showing the location on the map.`);
          }
        }
        
        // Display success message
        console.log(`Found location: ${location.formatted}`);
      } else {
        // No results found
        showError(`No results found for "${searchAddress}". Try a different search term.`);
      }
    } catch (err) {
      console.error('Error searching address:', err);
      showError('Failed to search address. Please try again.');
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
  
  // Handle value range change from slider
  const handleValueRangeChange = (event, newValue) => {
    setFilters({
      ...filters,
      minValue: newValue[0],
      maxValue: newValue[1],
      // Update custom value fields to match slider
      customMinValue: newValue[0].toString(),
      customMaxValue: newValue[1].toString()
    });
  };
  
  // Handle custom min value input
  const handleCustomMinValueChange = (event) => {
    const value = event.target.value;
    // Allow empty string or numbers only
    if (value === '' || /^\d+$/.test(value)) {
      setFilters({
        ...filters,
        customMinValue: value,
        // Update slider if valid number
        minValue: value === '' ? 0 : parseInt(value, 10)
      });
    }
  };
  
  // Handle custom max value input
  const handleCustomMaxValueChange = (event) => {
    const value = event.target.value;
    // Allow empty string or numbers only
    if (value === '' || /^\d+$/.test(value)) {
      setFilters({
        ...filters,
        customMaxValue: value,
        // Update slider if valid number and not exceeding max limit
        maxValue: value === '' ? 100000000 : Math.min(parseInt(value, 10), 100000000)
      });
    }
  };
  
  // Parse Indian number format (e.g., "13,82,700") to number
  const parseIndianFormat = (value) => {
    if (!value) return 0;
    // Remove all commas and convert to integer
    return parseInt(value.replace(/,/g, ''), 10);
  };
  
  // Format number to Indian format (e.g., 1382700 to "13,82,700")
  const formatIndianNumber = (value) => {
    if (!value && value !== 0) return '';
    const number = value.toString();
    let result = '';
    let count = 0;
    
    // Process from right to left
    for (let i = number.length - 1; i >= 0; i--) {
      result = number[i] + result;
      count++;
      
      // Add comma after first 3 digits, then after every 2 digits
      if (i > 0 && count === 3) {
        result = ',' + result;
        count = 0;
      } else if (i > 0 && count === 2 && result.length > 4) {
        result = ',' + result;
        count = 0;
      }
    }
    
    return result;
  };
  
  // Apply filters
  const applyFilters = () => {
    // Store the original properties if we haven't already
    if (!window.originalProperties) {
      window.originalProperties = [...properties];
    }
    
    // Start with all properties
    let allProperties = window.originalProperties || properties;
    
    // Filter properties based on criteria
    const filteredProperties = allProperties.filter(property => {
      // Skip properties without necessary data
      if (!property || !property.propertyType || !property.value || typeof property.value.estimatedValue === 'undefined') {
        return false;
      }
      
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
    console.log(`Filtered to ${filteredProperties.length} properties`);
    
    // Close filter panel
    setShowFilters(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      propertyType: 'all',
      minValue: 0,
      maxValue: 100000000,
      radius: 10000,
      customMinValue: '',
      customMaxValue: ''
    });
  };
  
  // Reset all filters and restore original properties
  const resetAllFilters = () => {
    // Reset filter values
    resetFilters();
    
    // Restore original properties if available
    if (window.originalProperties) {
      setProperties(window.originalProperties);
      console.log('Restored all original properties');
    }
    
    // Close filter panel
    setShowFilters(false);
  };
  
  // Save current map view
  const saveMapView = async () => {
    try {
      // Get the current user token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        showError('You must be logged in to save map views');
        return;
      }
      
      // Prepare the map view data
      const mapViewData = {
        name: `Map View ${new Date().toLocaleDateString()}`,
        center: {
          lat: mapCenter[0],
          lng: mapCenter[1]
        },
        zoom: zoom,
        filters: filters
      };
      
      // Call the backend API
      const response = await fetch('/api/mapview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify(mapViewData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || 'Failed to save map view');
      }
      
      showSuccess('Map view saved successfully!');
      console.log('Saved map views:', data.savedMapViews);
    } catch (err) {
      console.error('Error saving map view:', err);
      showError(err.message || 'Failed to save map view');
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
                <Typography variant="subtitle1" component="div">
                  {property.address.formattedAddress}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {property.propertyType}
                </Typography>
                {property.value && property.value.estimatedValue ? (
                  <Typography variant="body2" color="text.secondary">
                    Value: ₹{property.value.estimatedValue.toLocaleString()}
                  </Typography>
                ) : null}
                {property.size && (
                  <Typography variant="body2" color="text.secondary">
                    {property.size.bedrooms > 0 ? `${property.size.bedrooms} bed, ` : ''}
                    {property.size.bathrooms > 0 ? `${property.size.bathrooms} bath` : ''}
                    {property.size.buildingSize ? `, ${property.size.buildingSize.toLocaleString()} sqft` : ''}
                  </Typography>
                )}
                {property.yearBuilt ? (
                  <Typography variant="body2" color="text.secondary">
                    Built: {property.yearBuilt}
                  </Typography>
                ) : null}
                {property.owners && property.owners[0] && (
                  <Typography variant="body2" color="text.secondary">
                    Owner: {property.owners[0].owner.name}
                  </Typography>
                )}
                <Button 
                  variant="contained" 
                  size="small" 
                  sx={{ mt: 1 }}
                  onClick={() => {
                    // Store the property ID for navigation
                    // If it's a Zillow property, use the zpid
                    const propertyId = property.rawData?.zpid || property.id;
                    navigate(`/properties/${propertyId}`);
                  }}
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
          
          {/* Address Search with Autocomplete */}
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Box sx={{ display: 'flex' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter address, city, state, or zip code"
                value={searchAddress}
                onChange={handleSearchInputChange}
                onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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
            
            {/* Autocomplete Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <Paper
                elevation={3}
                sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 2000,
                  mt: 0.5,
                  maxHeight: 250,
                  overflow: 'auto'
                }}
              >
                {suggestionsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  searchSuggestions.map((suggestion, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                        borderBottom: index < searchSuggestions.length - 1 ? '1px solid #eee' : 'none'
                      }}
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <Typography variant="body2">{suggestion.text}</Typography>
                    </Box>
                  ))
                )}
              </Paper>
            )}
          </Box>
          
          {/* Filter Toggle and Reset All */}
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              fullWidth
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={resetAllFilters}
            >
              Reset All
            </Button>
          </Box>
          
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
              
              {/* Custom value input fields */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Min Value"
                    value={filters.customMinValue}
                    onChange={handleCustomMinValueChange}
                    placeholder="Min value"
                    InputProps={{
                      startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>₹</Typography>
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Max Value"
                    value={filters.customMaxValue}
                    onChange={handleCustomMaxValueChange}
                    placeholder="Max value"
                    InputProps={{
                      startAdornment: <Typography variant="body2" sx={{ mr: 0.5 }}>₹</Typography>
                    }}
                  />
                </Grid>
              </Grid>
              
              <Slider
                value={[filters.minValue, filters.maxValue]}
                onChange={handleValueRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={100000000}
                step={1000000}
                valueLabelFormat={(value) => `₹${formatIndianNumber(value)}`}
                marks={[
                  { value: 0, label: '₹0' },
                  { value: 20000000, label: '₹2Cr' },
                  { value: 50000000, label: '₹5Cr' },
                  { value: 100000000, label: '₹10Cr' },
                ]}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="caption" color="textSecondary">
                ₹{formatIndianNumber(filters.minValue)} - ₹{formatIndianNumber(filters.maxValue)}
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
                <Typography variant="body2" color="text.secondary">
                  Property Type
                </Typography>
                <Typography variant="body1">
                  {selectedProperty.propertyType.charAt(0).toUpperCase() + selectedProperty.propertyType.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  {selectedProperty.value && selectedProperty.value.estimatedValue ? 
                    `Value: $${selectedProperty.value.estimatedValue.toLocaleString()}` : 
                    'Value: Not available'}
                </Typography>
                {selectedProperty.size && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedProperty.size.bedrooms} bed, {selectedProperty.size.bathrooms} bath
                    {selectedProperty.size.buildingSize ? `, ${selectedProperty.size.buildingSize.toLocaleString()} sqft` : ''}
                  </Typography>
                )}
                {selectedProperty.owners && selectedProperty.owners[0] && (
                  <Typography variant="body2" color="text.secondary">
                    Owner: {selectedProperty.owners[0].owner.name}
                  </Typography>
                )}
              </Grid>
            </Grid>
            
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Owner Information
            </Typography>
            
            {selectedProperty.owners && selectedProperty.owners.map((ownerInfo, index) => (
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
