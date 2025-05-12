import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import Layout from '../layout/Layout';
import axios from 'axios';
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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  Chip,
  CircularProgress,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  Clear as ClearIcon,
  Save as SaveIcon
} from '@mui/icons-material';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
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

const SearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const { error: showError, success: showSuccess } = useContext(AlertContext);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState(0); // 0 = properties, 1 = owners
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    propertyType: 'all',
    propertySubType: 'all',
    minValue: 0,
    maxValue: 10000000,
    state: '',
    city: '',
    zipCode: '',
    ownerType: 'all',
    ownerWealthMin: 0,
    ownerWealthMax: 100000000
  });
  
  // Results state
  const [propertyResults, setPropertyResults] = useState([]);
  const [ownerResults, setOwnerResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Handle search query change
  const handleSearchQueryChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length >= 2) {
      fetchSuggestions(query);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  // Fetch autocomplete suggestions
  const fetchSuggestions = async (query) => {
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll use mock data
      
      // Mock suggestions based on search type
      let mockSuggestions = [];
      
      if (searchType === 0) { // Properties
        mockSuggestions = [
          { type: 'property', text: '123 Main St, New York, NY 10001', id: '1' },
          { type: 'property', text: '456 Park Ave, New York, NY 10022', id: '2' },
          { type: 'city', text: 'New York, NY' },
          { type: 'city', text: 'Newark, NJ' }
        ];
      } else { // Owners
        mockSuggestions = [
          { type: 'owner', text: 'John Smith', ownerType: 'individual', id: '101' },
          { type: 'owner', text: 'ABC Corporation', ownerType: 'entity', id: '102' },
          { type: 'owner', text: 'Jane Doe', ownerType: 'individual', id: '103' },
          { type: 'owner', text: 'XYZ Investments', ownerType: 'entity', id: '104' }
        ];
      }
      
      // Filter suggestions based on query
      const filteredSuggestions = mockSuggestions.filter(suggestion => 
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      );
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };
  
  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    
    if (suggestion.type === 'property' && suggestion.id) {
      navigate(`/properties/${suggestion.id}`);
    } else if (suggestion.type === 'owner' && suggestion.id) {
      navigate(`/owners/${suggestion.id}`);
    } else {
      // For city or other types, just set the query and perform search
      handleSearch();
    }
  };
  
  // Handle search tab change
  const handleSearchTypeChange = (event, newValue) => {
    setSearchType(newValue);
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
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
  
  // Handle owner wealth range change
  const handleWealthRangeChange = (event, newValue) => {
    setFilters({
      ...filters,
      ownerWealthMin: newValue[0],
      ownerWealthMax: newValue[1]
    });
  };
  
  // Handle search
  const handleSearch = async () => {
    if (!searchQuery && !showFilters) return;
    
    try {
      setLoading(true);
      
      // In a real implementation, this would call the backend API
      // For now, we'll use mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (searchType === 0) { // Properties
        // Mock property results
        const mockPropertyResults = [
          {
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
          }
        ];
        
        setPropertyResults(mockPropertyResults);
        setTotalPages(2); // Mock pagination
      } else { // Owners
        // Mock owner results
        const mockOwnerResults = [
          {
            id: '101',
            name: 'John Smith',
            ownerType: 'individual',
            wealthData: {
              estimatedNetWorth: 5000000,
              confidenceLevel: 85,
              wealthTier: 'high'
            },
            properties: [
              { id: '1', address: { formattedAddress: '123 Main St, New York, NY 10001' } }
            ]
          },
          {
            id: '102',
            name: 'ABC Corporation',
            ownerType: 'entity',
            wealthData: {
              estimatedNetWorth: 50000000,
              confidenceLevel: 90,
              wealthTier: 'ultra-high'
            },
            properties: [
              { id: '2', address: { formattedAddress: '456 Park Ave, New York, NY 10022' } }
            ]
          },
          {
            id: '103',
            name: 'Jane Doe',
            ownerType: 'individual',
            wealthData: {
              estimatedNetWorth: 8500000,
              confidenceLevel: 80,
              wealthTier: 'high'
            },
            properties: [
              { id: '3', address: { formattedAddress: '789 Broadway, New York, NY 10003' } }
            ]
          }
        ];
        
        setOwnerResults(mockOwnerResults);
        setTotalPages(2); // Mock pagination
      }
    } catch (err) {
      console.error('Error performing search:', err);
      showError('Failed to perform search');
    } finally {
      setLoading(false);
      setShowSuggestions(false);
    }
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    // In a real implementation, this would fetch the next page of results
  };
  
  // Save search
  const saveSearch = async () => {
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll just show a success message
      showSuccess('Search saved successfully');
    } catch (err) {
      console.error('Error saving search:', err);
      showError('Failed to save search');
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
  
  return (
    <Layout title="Search">
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={searchType} onChange={handleSearchTypeChange} aria-label="search tabs">
            <Tab label="Properties" id="search-tab-0" aria-controls="search-tabpanel-0" />
            <Tab label="Owners" id="search-tab-1" aria-controls="search-tabpanel-1" />
          </Tabs>
        </Box>
        
        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            placeholder={searchType === 0 ? "Search for properties by address, city, or zip code" : "Search for property owners by name"}
            value={searchQuery}
            onChange={handleSearchQueryChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />
          
          {/* Search Suggestions */}
          {showSuggestions && (
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 1,
                mt: 1
              }}
            >
              <List>
                {suggestions.map((suggestion, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {suggestion.type === 'property' ? (
                          <HomeIcon />
                        ) : suggestion.type === 'owner' ? (
                          suggestion.ownerType === 'individual' ? <PersonIcon /> : <BusinessIcon />
                        ) : (
                          <LocationIcon />
                        )}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={suggestion.text}
                      secondary={suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          <Box>
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={saveSearch}
              disabled={!searchQuery && !showFilters}
            >
              Save Search
            </Button>
          </Box>
        </Box>
        
        {/* Filters */}
        {showFilters && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 3 }} />
            
            {searchType === 0 ? (
              // Property Filters
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
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
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Property Subtype</InputLabel>
                    <Select
                      name="propertySubType"
                      value={filters.propertySubType}
                      onChange={handleFilterChange}
                      label="Property Subtype"
                    >
                      <MenuItem value="all">All Subtypes</MenuItem>
                      <MenuItem value="single-family">Single Family</MenuItem>
                      <MenuItem value="multi-family">Multi-Family</MenuItem>
                      <MenuItem value="condo">Condo</MenuItem>
                      <MenuItem value="office">Office</MenuItem>
                      <MenuItem value="retail">Retail</MenuItem>
                      <MenuItem value="warehouse">Warehouse</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="State"
                    name="state"
                    value={filters.state}
                    onChange={handleFilterChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="City"
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
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
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="textSecondary">
                      {formatCurrency(filters.minValue)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatCurrency(filters.maxValue)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              // Owner Filters
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Owner Type</InputLabel>
                    <Select
                      name="ownerType"
                      value={filters.ownerType}
                      onChange={handleFilterChange}
                      label="Owner Type"
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="individual">Individual</MenuItem>
                      <MenuItem value="entity">Entity</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Owner Net Worth Range
                  </Typography>
                  <Slider
                    value={[filters.ownerWealthMin, filters.ownerWealthMax]}
                    onChange={handleWealthRangeChange}
                    valueLabelDisplay="auto"
                    min={0}
                    max={100000000}
                    step={1000000}
                    valueLabelFormat={(value) => formatCurrency(value)}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="textSecondary">
                      {formatCurrency(filters.ownerWealthMin)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {formatCurrency(filters.ownerWealthMax)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </Paper>
      
      {/* Search Results */}
      {(propertyResults.length > 0 || ownerResults.length > 0) && (
        <Paper elevation={2} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Search Results
            <Chip
              label={searchType === 0 ? `${propertyResults.length} properties found` : `${ownerResults.length} owners found`}
              size="small"
              sx={{ ml: 1 }}
            />
          </Typography>
          
          <Divider sx={{ mb: 3 }} />
          
          {searchType === 0 ? (
            // Property Results
            <List>
              {propertyResults.map((property) => (
                <ListItem
                  key={property.id}
                  alignItems="flex-start"
                  sx={{ borderBottom: '1px solid #eee', py: 2 }}
                  button
                  onClick={() => navigate(`/properties/${property.id}`)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <HomeIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={property.address.formattedAddress}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)} - {formatCurrency(property.value.estimatedValue)}
                        </Typography>
                        <Typography component="div" variant="body2">
                          Owner: {property.owners[0].owner.name} - Net Worth: {formatCurrency(property.owners[0].owner.wealthData.estimatedNetWorth)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            // Owner Results
            <List>
              {ownerResults.map((owner) => (
                <ListItem
                  key={owner.id}
                  alignItems="flex-start"
                  sx={{ borderBottom: '1px solid #eee', py: 2 }}
                  button
                  onClick={() => navigate(`/owners/${owner.id}`)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      {owner.ownerType === 'individual' ? <PersonIcon /> : <BusinessIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={owner.name}
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {owner.ownerType.charAt(0).toUpperCase() + owner.ownerType.slice(1)} - Net Worth: {formatCurrency(owner.wealthData.estimatedNetWorth)}
                        </Typography>
                        <Typography component="div" variant="body2">
                          Properties: {owner.properties.length} - Wealth Tier: {owner.wealthData.wealthTier.charAt(0).toUpperCase() + owner.wealthData.wealthTier.slice(1)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
          
          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </Paper>
      )}
    </Layout>
  );
};

export default SearchResults;
