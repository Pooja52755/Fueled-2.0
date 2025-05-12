import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar
} from '@mui/material';
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  PieChart as PieChartIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

// Format currency for display
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Property Report Preview
export const PropertyReportPreview = ({ reportData, reportTitle, reportFormat }) => {
  if (!reportData || reportData.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">
          No data available for preview. Adjust filters or generate report.
        </Typography>
      </Box>
    );
  }

  // Summary statistics
  const totalProperties = reportData.length;
  const totalValue = reportData.reduce((sum, property) => sum + property.value.estimatedValue, 0);
  const averageValue = totalValue / totalProperties;
  
  // Property types distribution for chart
  const propertyTypes = {};
  reportData.forEach(property => {
    const type = property.propertyType;
    propertyTypes[type] = (propertyTypes[type] || 0) + 1;
  });
  
  const chartData = {
    labels: Object.keys(propertyTypes).map(type => 
      type.charAt(0).toUpperCase() + type.slice(1)
    ),
    datasets: [
      {
        data: Object.values(propertyTypes),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <Box>
      {/* Report Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {reportTitle || 'Property Report'}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          Generated on {new Date().toLocaleDateString()} • {totalProperties} properties • {reportFormat.toUpperCase()} format
        </Typography>
        <Divider sx={{ mt: 2 }} />
      </Box>
      
      {/* Report Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Properties
              </Typography>
              <Typography variant="h4">
                {totalProperties}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Value
              </Typography>
              <Typography variant="h4">
                {formatCurrency(totalValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Value
              </Typography>
              <Typography variant="h4">
                {formatCurrency(averageValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Property Type Distribution */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Property Type Distribution
          </Typography>
          <Box height={300}>
            <Pie data={chartData} options={{ maintainAspectRatio: false }} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Property Locations
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Location</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Group by state and calculate counts and values */}
                {Object.entries(
                  reportData.reduce((acc, property) => {
                    const state = property.address.state;
                    if (!acc[state]) {
                      acc[state] = { count: 0, value: 0 };
                    }
                    acc[state].count += 1;
                    acc[state].value += property.value.estimatedValue;
                    return acc;
                  }, {})
                ).map(([state, data]) => (
                  <TableRow key={state}>
                    <TableCell>{state}</TableCell>
                    <TableCell align="right">{data.count}</TableCell>
                    <TableCell align="right">{formatCurrency(data.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      
      {/* Property Data Table */}
      <Typography variant="h6" gutterBottom>
        Property Details
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Address</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Value</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Last Transaction</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.slice(0, 10).map((property, index) => (
              <TableRow key={index}>
                <TableCell>{property.address.formattedAddress}</TableCell>
                <TableCell>
                  {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                </TableCell>
                <TableCell align="right">{formatCurrency(property.value.estimatedValue)}</TableCell>
                <TableCell>{property.owners[0]?.owner.name || 'N/A'}</TableCell>
                <TableCell>{formatDate(property.lastTransactionDate)}</TableCell>
              </TableRow>
            ))}
            {reportData.length > 10 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="textSecondary">
                    {reportData.length - 10} more properties not shown in preview
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Owner Report Preview
export const OwnerReportPreview = ({ reportData, reportTitle, reportFormat }) => {
  if (!reportData || reportData.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">
          No data available for preview. Adjust filters or generate report.
        </Typography>
      </Box>
    );
  }

  // Summary statistics
  const totalOwners = reportData.length;
  const totalNetWorth = reportData.reduce((sum, owner) => sum + owner.wealthData.estimatedNetWorth, 0);
  const averageNetWorth = totalNetWorth / totalOwners;
  
  // Owner types distribution for chart
  const ownerTypes = {};
  reportData.forEach(owner => {
    const type = owner.ownerType;
    ownerTypes[type] = (ownerTypes[type] || 0) + 1;
  });
  
  const chartData = {
    labels: Object.keys(ownerTypes).map(type => 
      type.charAt(0).toUpperCase() + type.slice(1)
    ),
    datasets: [
      {
        data: Object.values(ownerTypes),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Wealth tiers distribution
  const wealthTiers = {};
  reportData.forEach(owner => {
    const tier = owner.wealthData.wealthTier;
    wealthTiers[tier] = (wealthTiers[tier] || 0) + 1;
  });
  
  const wealthTierLabels = Object.keys(wealthTiers).map(tier => 
    tier.charAt(0).toUpperCase() + tier.slice(1)
  );
  
  const wealthTierData = {
    labels: wealthTierLabels,
    datasets: [
      {
        label: 'Number of Owners',
        data: Object.values(wealthTiers),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  return (
    <Box>
      {/* Report Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {reportTitle || 'Owner Report'}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          Generated on {new Date().toLocaleDateString()} • {totalOwners} owners • {reportFormat.toUpperCase()} format
        </Typography>
        <Divider sx={{ mt: 2 }} />
      </Box>
      
      {/* Report Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Owners
              </Typography>
              <Typography variant="h4">
                {totalOwners}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Net Worth
              </Typography>
              <Typography variant="h4">
                {formatCurrency(totalNetWorth)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Average Net Worth
              </Typography>
              <Typography variant="h4">
                {formatCurrency(averageNetWorth)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Owner Type and Wealth Distribution */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Owner Type Distribution
          </Typography>
          <Box height={300}>
            <Pie data={chartData} options={{ maintainAspectRatio: false }} />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Wealth Tier Distribution
          </Typography>
          <Box height={300}>
            <Bar 
              data={wealthTierData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} 
            />
          </Box>
        </Grid>
      </Grid>
      
      {/* Owner Data Table */}
      <Typography variant="h6" gutterBottom>
        Owner Details
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Net Worth</TableCell>
              <TableCell>Wealth Tier</TableCell>
              <TableCell align="right">Properties</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.slice(0, 10).map((owner, index) => (
              <TableRow key={index}>
                <TableCell>{owner.name}</TableCell>
                <TableCell>
                  {owner.ownerType.charAt(0).toUpperCase() + owner.ownerType.slice(1)}
                </TableCell>
                <TableCell align="right">{formatCurrency(owner.wealthData.estimatedNetWorth)}</TableCell>
                <TableCell>
                  {owner.wealthData.wealthTier.charAt(0).toUpperCase() + owner.wealthData.wealthTier.slice(1)}
                </TableCell>
                <TableCell align="right">{owner.properties?.length || 0}</TableCell>
              </TableRow>
            ))}
            {reportData.length > 10 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="textSecondary">
                    {reportData.length - 10} more owners not shown in preview
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Wealth Analysis Preview
export const WealthAnalysisPreview = ({ reportData, reportTitle, reportFormat, analysisType }) => {
  if (!reportData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">
          No data available for preview. Adjust filters or generate report.
        </Typography>
      </Box>
    );
  }

  // Different visualizations based on analysis type
  const renderAnalysisContent = () => {
    switch (analysisType) {
      case 'wealth-distribution':
        return renderWealthDistribution();
      case 'property-concentration':
        return renderPropertyConcentration();
      case 'ownership-network':
        return renderOwnershipNetwork();
      case 'wealth-trends':
        return renderWealthTrends();
      default:
        return (
          <Typography variant="body1">
            Select an analysis type to preview report.
          </Typography>
        );
    }
  };

  // Wealth Distribution Analysis
  const renderWealthDistribution = () => {
    const wealthTiers = reportData.wealthTiers;
    const chartData = {
      labels: Object.keys(wealthTiers).map(tier => 
        tier.charAt(0).toUpperCase() + tier.slice(1)
      ),
      datasets: [
        {
          label: 'Total Net Worth (Billions)',
          data: Object.values(wealthTiers).map(value => value / 1000000000),
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 206, 86, 0.8)'
          ],
          borderWidth: 1
        }
      ]
    };

    return (
      <>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Wealth Distribution by Tier
            </Typography>
            <Box height={300}>
              <Pie data={chartData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Key Findings
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body1" paragraph>
                  The analysis reveals significant wealth concentration among the top tier owners.
                </Typography>
                <Typography variant="body1" paragraph>
                  Ultra-high net worth individuals (${reportData.topTierPercentage}% of owners) control ${reportData.topTierWealthPercentage}% of the total wealth.
                </Typography>
                <Typography variant="body1">
                  The wealth inequality index is calculated at {reportData.wealthInequalityIndex}.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Typography variant="h6" gutterBottom>
          Wealth Distribution Statistics
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Wealth Tier</TableCell>
                <TableCell align="right">Number of Owners</TableCell>
                <TableCell align="right">Total Net Worth</TableCell>
                <TableCell align="right">Average Net Worth</TableCell>
                <TableCell align="right">% of Total Wealth</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(reportData.wealthTierStats).map(([tier, stats]) => (
                <TableRow key={tier}>
                  <TableCell>{tier.charAt(0).toUpperCase() + tier.slice(1)}</TableCell>
                  <TableCell align="right">{stats.count}</TableCell>
                  <TableCell align="right">{formatCurrency(stats.totalNetWorth)}</TableCell>
                  <TableCell align="right">{formatCurrency(stats.averageNetWorth)}</TableCell>
                  <TableCell align="right">{stats.percentageOfTotalWealth}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  // Property Concentration Analysis
  const renderPropertyConcentration = () => {
    return (
      <>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Property Ownership Concentration
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body1" paragraph>
                  <strong>{reportData.topOwnerPercentage}%</strong> of owners control <strong>{reportData.topOwnerPropertyPercentage}%</strong> of all properties.
                </Typography>
                <Typography variant="body1" paragraph>
                  The top 10 property owners collectively own {reportData.top10OwnerPropertyCount} properties valued at {formatCurrency(reportData.top10OwnerPropertyValue)}.
                </Typography>
                <Typography variant="body1">
                  Property concentration index: <strong>{reportData.propertyConcentrationIndex}</strong> (higher values indicate greater concentration)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Geographic Concentration
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Region</TableCell>
                    <TableCell align="right">Property Count</TableCell>
                    <TableCell align="right">Total Value</TableCell>
                    <TableCell align="right">Concentration Index</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.geographicConcentration.slice(0, 5).map((region, index) => (
                    <TableRow key={index}>
                      <TableCell>{region.name}</TableCell>
                      <TableCell align="right">{region.propertyCount}</TableCell>
                      <TableCell align="right">{formatCurrency(region.totalValue)}</TableCell>
                      <TableCell align="right">{region.concentrationIndex}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
        
        <Typography variant="h6" gutterBottom>
          Top Property Owners
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Owner</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Properties Owned</TableCell>
                <TableCell align="right">Total Property Value</TableCell>
                <TableCell align="right">% of Total Market</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.topOwners.slice(0, 10).map((owner, index) => (
                <TableRow key={index}>
                  <TableCell>{owner.name}</TableCell>
                  <TableCell>{owner.type}</TableCell>
                  <TableCell align="right">{owner.propertyCount}</TableCell>
                  <TableCell align="right">{formatCurrency(owner.totalValue)}</TableCell>
                  <TableCell align="right">{owner.marketPercentage}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  // Ownership Network Analysis
  const renderOwnershipNetwork = () => {
    return (
      <>
        <Typography variant="h6" gutterBottom>
          Ownership Network Analysis
        </Typography>
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" paragraph>
            This analysis identifies key ownership networks and relationships between property owners.
          </Typography>
          <Typography variant="body1" paragraph>
            {reportData.networkSummary}
          </Typography>
        </Box>
        
        <Typography variant="h6" gutterBottom>
          Key Network Metrics
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Network Density
                </Typography>
                <Typography variant="h5">
                  {reportData.networkDensity}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Average Connections
                </Typography>
                <Typography variant="h5">
                  {reportData.averageConnections}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Network Clusters
                </Typography>
                <Typography variant="h5">
                  {reportData.networkClusters}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Centrality Index
                </Typography>
                <Typography variant="h5">
                  {reportData.centralityIndex}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Typography variant="h6" gutterBottom>
          Key Network Influencers
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Owner</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Network Centrality</TableCell>
                <TableCell align="right">Connections</TableCell>
                <TableCell>Primary Cluster</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.keyInfluencers.slice(0, 10).map((influencer, index) => (
                <TableRow key={index}>
                  <TableCell>{influencer.name}</TableCell>
                  <TableCell>{influencer.type}</TableCell>
                  <TableCell align="right">{influencer.centrality}</TableCell>
                  <TableCell align="right">{influencer.connections}</TableCell>
                  <TableCell>{influencer.primaryCluster}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  };

  // Wealth Trends Analysis
  const renderWealthTrends = () => {
    // Mock data for wealth trends over time
    const trendData = {
      labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
      datasets: [
        {
          label: 'Ultra High',
          data: reportData.wealthTrends.ultraHigh,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: true
        },
        {
          label: 'High',
          data: reportData.wealthTrends.high,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true
        },
        {
          label: 'Affluent',
          data: reportData.wealthTrends.affluent,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true
        }
      ]
    };

    return (
      <>
        <Typography variant="h6" gutterBottom>
          Wealth Trends Analysis ({reportData.timePeriod})
        </Typography>
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" paragraph>
            {reportData.trendSummary}
          </Typography>
        </Box>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Wealth Growth by Tier
            </Typography>
            <Box height={300}>
              <Bar 
                data={trendData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Total Net Worth (Billions)'
                      }
                    }
                  }
                }} 
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Growth Metrics
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Wealth Tier</TableCell>
                    <TableCell align="right">Growth Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(reportData.growthRates).map(([tier, rate]) => (
                    <TableRow key={tier}>
                      <TableCell>{tier.charAt(0).toUpperCase() + tier.slice(1)}</TableCell>
                      <TableCell align="right">{rate}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
        
        <Typography variant="h6" gutterBottom>
          Key Trend Insights
        </Typography>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body1" paragraph>
              <strong>Wealth Concentration:</strong> {reportData.insights.wealthConcentration}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Market Volatility Impact:</strong> {reportData.insights.marketVolatility}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Geographic Shifts:</strong> {reportData.insights.geographicShifts}
            </Typography>
            <Typography variant="body1">
              <strong>Future Projections:</strong> {reportData.insights.futureProjections}
            </Typography>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <Box>
      {/* Report Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {reportTitle || 'Wealth Analysis Report'}
        </Typography>
        <Typography variant="subtitle2" color="textSecondary">
          Generated on {new Date().toLocaleDateString()} • {analysisType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} • {reportFormat.toUpperCase()} format
        </Typography>
        <Divider sx={{ mt: 2 }} />
      </Box>
      
      {/* Analysis Content */}
      {renderAnalysisContent()}
    </Box>
  );
};
