import React from 'react';
import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Slider,
  Autocomplete,
  Chip,
  Box
} from '@mui/material';
// Temporarily commenting out date picker imports due to compatibility issues
// import { DatePicker } from '@mui/x-date-pickers';
// import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// import { LocalizationProvider } from '@mui/x-date-pickers';

// Property Report Filters
export const PropertyReportFilters = ({ filters, setFilters }) => {
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Property Type</InputLabel>
          <Select
            value={filters.propertyType}
            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
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
      
      <Grid item xs={12} md={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Property Subtype</InputLabel>
          <Select
            value={filters.propertySubType}
            onChange={(e) => handleFilterChange('propertySubType', e.target.value)}
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
      
      <Grid item xs={12} md={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Location</InputLabel>
          <Select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            label="Location"
          >
            <MenuItem value="all">All Locations</MenuItem>
            <MenuItem value="ny">New York</MenuItem>
            <MenuItem value="ca">California</MenuItem>
            <MenuItem value="fl">Florida</MenuItem>
            <MenuItem value="tx">Texas</MenuItem>
            <MenuItem value="il">Illinois</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Property Value Range
        </Typography>
        <Slider
          value={[filters.minValue, filters.maxValue]}
          onChange={(e, newValue) => {
            handleFilterChange('minValue', newValue[0]);
            handleFilterChange('maxValue', newValue[1]);
          }}
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
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label="Transaction Date From"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filters.transactionDateFrom || ''}
          onChange={(e) => handleFilterChange('transactionDateFrom', e.target.value)}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          size="small"
          label="Transaction Date To"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={filters.transactionDateTo || ''}
          onChange={(e) => handleFilterChange('transactionDateTo', e.target.value)}
        />
      </Grid>
    </Grid>
  );
};

// Owner Report Filters
export const OwnerReportFilters = ({ filters, setFilters }) => {
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Owner Type</InputLabel>
          <Select
            value={filters.ownerType}
            onChange={(e) => handleFilterChange('ownerType', e.target.value)}
            label="Owner Type"
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="individual">Individual</MenuItem>
            <MenuItem value="entity">Entity</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Wealth Tier</InputLabel>
          <Select
            value={filters.wealthTier}
            onChange={(e) => handleFilterChange('wealthTier', e.target.value)}
            label="Wealth Tier"
          >
            <MenuItem value="all">All Tiers</MenuItem>
            <MenuItem value="ultra-high">Ultra High</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="affluent">Affluent</MenuItem>
            <MenuItem value="mass-affluent">Mass Affluent</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Location</InputLabel>
          <Select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            label="Location"
          >
            <MenuItem value="all">All Locations</MenuItem>
            <MenuItem value="ny">New York</MenuItem>
            <MenuItem value="ca">California</MenuItem>
            <MenuItem value="fl">Florida</MenuItem>
            <MenuItem value="tx">Texas</MenuItem>
            <MenuItem value="il">Illinois</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Net Worth Range
        </Typography>
        <Slider
          value={[filters.minNetWorth, filters.maxNetWorth]}
          onChange={(e, newValue) => {
            handleFilterChange('minNetWorth', newValue[0]);
            handleFilterChange('maxNetWorth', newValue[1]);
          }}
          valueLabelDisplay="auto"
          min={0}
          max={100000000}
          step={1000000}
          valueLabelFormat={(value) => formatCurrency(value)}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="textSecondary">
            {formatCurrency(filters.minNetWorth)}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {formatCurrency(filters.maxNetWorth)}
          </Typography>
        </Box>
      </Grid>
      
      <Grid item xs={12}>
        <Autocomplete
          multiple
          options={['Real Estate', 'Stocks', 'Business Interests', 'Cash', 'Other']}
          value={filters.wealthSources}
          onChange={(e, newValue) => handleFilterChange('wealthSources', newValue)}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option}
                {...getTagProps({ index })}
                key={index}
              />
            ))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="Wealth Sources"
              placeholder="Select wealth sources"
              size="small"
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

// Wealth Analysis Filters
export const WealthAnalysisFilters = ({ filters, setFilters }) => {
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Analysis Type</InputLabel>
          <Select
            value={filters.analysisType}
            onChange={(e) => handleFilterChange('analysisType', e.target.value)}
            label="Analysis Type"
          >
            <MenuItem value="wealth-distribution">Wealth Distribution</MenuItem>
            <MenuItem value="property-concentration">Property Concentration</MenuItem>
            <MenuItem value="ownership-network">Ownership Network</MenuItem>
            <MenuItem value="wealth-trends">Wealth Trends</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Geographic Scope</InputLabel>
          <Select
            value={filters.geographicScope}
            onChange={(e) => handleFilterChange('geographicScope', e.target.value)}
            label="Geographic Scope"
          >
            <MenuItem value="national">National</MenuItem>
            <MenuItem value="state">State Level</MenuItem>
            <MenuItem value="county">County Level</MenuItem>
            <MenuItem value="city">City Level</MenuItem>
            <MenuItem value="neighborhood">Neighborhood Level</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Time Period</InputLabel>
          <Select
            value={filters.timePeriod}
            onChange={(e) => handleFilterChange('timePeriod', e.target.value)}
            label="Time Period"
          >
            <MenuItem value="1-year">1 Year</MenuItem>
            <MenuItem value="5-year">5 Years</MenuItem>
            <MenuItem value="10-year">10 Years</MenuItem>
            <MenuItem value="all-time">All Time</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth size="small">
          <InputLabel>Data Confidence</InputLabel>
          <Select
            value={filters.dataConfidence}
            onChange={(e) => handleFilterChange('dataConfidence', e.target.value)}
            label="Data Confidence"
          >
            <MenuItem value="all">All Data</MenuItem>
            <MenuItem value="high">High Confidence Only</MenuItem>
            <MenuItem value="medium">Medium+ Confidence</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );
};
