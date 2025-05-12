import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Service for handling report-related API calls
 */
class ReportAPI {
  /**
   * Generate a property report based on filters
   * @param {Object} filters - Property report filters
   * @param {string} format - Report format (pdf, csv, excel)
   * @returns {Promise} - Promise with report data
   */
  async generatePropertyReport(filters, format) {
    try {
      const response = await axios.post(`${API_URL}/reports/properties`, {
        filters,
        format
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating property report:', error);
      throw error;
    }
  }
  
  /**
   * Generate an owner report based on filters
   * @param {Object} filters - Owner report filters
   * @param {string} format - Report format (pdf, csv, excel)
   * @returns {Promise} - Promise with report data
   */
  async generateOwnerReport(filters, format) {
    try {
      const response = await axios.post(`${API_URL}/reports/owners`, {
        filters,
        format
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating owner report:', error);
      throw error;
    }
  }
  
  /**
   * Generate a wealth analysis report based on filters
   * @param {Object} filters - Wealth analysis filters
   * @param {string} format - Report format (pdf, csv, excel)
   * @returns {Promise} - Promise with report data
   */
  async generateWealthAnalysisReport(filters, format) {
    try {
      const response = await axios.post(`${API_URL}/reports/wealth-analysis`, {
        filters,
        format
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating wealth analysis report:', error);
      throw error;
    }
  }
  
  /**
   * Export a report to the specified format
   * @param {string} reportId - ID of the generated report
   * @param {string} format - Export format (pdf, csv, excel)
   * @returns {Promise} - Promise with export URL or blob
   */
  async exportReport(reportId, format) {
    try {
      const response = await axios.get(`${API_URL}/reports/export/${reportId}`, {
        params: { format },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        responseType: format === 'pdf' ? 'blob' : 'json'
      });
      
      if (format === 'pdf') {
        // For PDF, return a blob URL
        const blob = new Blob([response.data], { type: 'application/pdf' });
        return URL.createObjectURL(blob);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }
  
  /**
   * Get mock data for report preview
   * @param {string} reportType - Type of report (property, owner, wealth-analysis)
   * @param {Object} filters - Report filters
   * @returns {Promise} - Promise with mock report data
   */
  async getMockReportData(reportType, filters) {
    // In a real implementation, this would call the backend API
    // For now, we'll return mock data based on the report type
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (reportType) {
      case 'property':
        return this.getMockPropertyReportData(filters);
      case 'owner':
        return this.getMockOwnerReportData(filters);
      case 'wealth-analysis':
        return this.getMockWealthAnalysisData(filters);
      default:
        throw new Error('Invalid report type');
    }
  }
  
  /**
   * Get mock property report data
   * @param {Object} filters - Property report filters
   * @returns {Object} - Mock property report data
   */
  getMockPropertyReportData(filters) {
    // Mock property data
    return [
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
        ],
        lastTransactionDate: '2020-06-15'
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
        ],
        lastTransactionDate: '2019-03-22'
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
        ],
        lastTransactionDate: '2021-11-05'
      },
      {
        id: '4',
        address: {
          street: '101 Fifth Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10003',
          formattedAddress: '101 Fifth Ave, New York, NY 10003'
        },
        propertyType: 'commercial',
        propertySubType: 'retail',
        value: {
          estimatedValue: 3200000
        },
        owners: [
          {
            owner: {
              id: '104',
              name: 'XYZ Investments',
              wealthData: {
                estimatedNetWorth: 35000000,
                wealthTier: 'high'
              }
            }
          }
        ],
        lastTransactionDate: '2022-02-18'
      },
      {
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
        ],
        lastTransactionDate: '2018-07-30'
      }
    ];
  }
  
  /**
   * Get mock owner report data
   * @param {Object} filters - Owner report filters
   * @returns {Object} - Mock owner report data
   */
  getMockOwnerReportData(filters) {
    // Mock owner data
    return [
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
          { id: '1', address: { formattedAddress: '123 Main St, New York, NY 10001' } },
          { id: '5', address: { formattedAddress: '555 Lake View Dr, Miami, FL 33139' } }
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
      },
      {
        id: '104',
        name: 'XYZ Investments',
        ownerType: 'entity',
        wealthData: {
          estimatedNetWorth: 35000000,
          confidenceLevel: 88,
          wealthTier: 'high'
        },
        properties: [
          { id: '4', address: { formattedAddress: '101 Fifth Ave, New York, NY 10003' } }
        ]
      },
      {
        id: '105',
        name: 'Robert Johnson',
        ownerType: 'individual',
        wealthData: {
          estimatedNetWorth: 2500000,
          confidenceLevel: 75,
          wealthTier: 'affluent'
        },
        properties: [
          { id: '6', address: { formattedAddress: '222 Ocean Dr, Miami, FL 33139' } }
        ]
      }
    ];
  }
  
  /**
   * Get mock wealth analysis data
   * @param {Object} filters - Wealth analysis filters
   * @returns {Object} - Mock wealth analysis data
   */
  getMockWealthAnalysisData(filters) {
    // Different mock data based on analysis type
    switch (filters.analysisType) {
      case 'wealth-distribution':
        return {
          wealthTiers: {
            'ultra-high': 85000000,
            'high': 51000000,
            'affluent': 12500000,
            'mass-affluent': 5000000
          },
          topTierPercentage: 5,
          topTierWealthPercentage: 55,
          wealthInequalityIndex: 0.78,
          wealthTierStats: {
            'ultra-high': {
              count: 2,
              totalNetWorth: 85000000,
              averageNetWorth: 42500000,
              percentageOfTotalWealth: 55
            },
            'high': {
              count: 5,
              totalNetWorth: 51000000,
              averageNetWorth: 10200000,
              percentageOfTotalWealth: 33
            },
            'affluent': {
              count: 8,
              totalNetWorth: 12500000,
              averageNetWorth: 1562500,
              percentageOfTotalWealth: 8
            },
            'mass-affluent': {
              count: 15,
              totalNetWorth: 5000000,
              averageNetWorth: 333333,
              percentageOfTotalWealth: 4
            }
          }
        };
      
      case 'property-concentration':
        return {
          topOwnerPercentage: 10,
          topOwnerPropertyPercentage: 45,
          top10OwnerPropertyCount: 28,
          top10OwnerPropertyValue: 75000000,
          propertyConcentrationIndex: 0.65,
          geographicConcentration: [
            {
              name: 'New York, NY',
              propertyCount: 42,
              totalValue: 120000000,
              concentrationIndex: 0.72
            },
            {
              name: 'Miami, FL',
              propertyCount: 23,
              totalValue: 45000000,
              concentrationIndex: 0.58
            },
            {
              name: 'Los Angeles, CA',
              propertyCount: 18,
              totalValue: 65000000,
              concentrationIndex: 0.61
            },
            {
              name: 'Chicago, IL',
              propertyCount: 15,
              totalValue: 28000000,
              concentrationIndex: 0.45
            },
            {
              name: 'Dallas, TX',
              propertyCount: 12,
              totalValue: 22000000,
              concentrationIndex: 0.39
            }
          ],
          topOwners: [
            {
              name: 'ABC Corporation',
              type: 'Entity',
              propertyCount: 8,
              totalValue: 28000000,
              marketPercentage: 10.5
            },
            {
              name: 'XYZ Investments',
              type: 'Entity',
              propertyCount: 6,
              totalValue: 18500000,
              marketPercentage: 7.2
            },
            {
              name: 'John Smith',
              type: 'Individual',
              propertyCount: 3,
              totalValue: 7200000,
              marketPercentage: 2.8
            },
            {
              name: 'Global Properties LLC',
              type: 'Entity',
              propertyCount: 5,
              totalValue: 12500000,
              marketPercentage: 4.9
            },
            {
              name: 'Jane Doe',
              type: 'Individual',
              propertyCount: 2,
              totalValue: 5800000,
              marketPercentage: 2.3
            }
          ]
        };
      
      case 'ownership-network':
        return {
          networkSummary: 'Analysis reveals significant interconnections between major property owners, with several key influencers controlling multiple entities and properties across different regions.',
          networkDensity: 0.38,
          averageConnections: 4.2,
          networkClusters: 5,
          centralityIndex: 0.65,
          keyInfluencers: [
            {
              name: 'ABC Corporation',
              type: 'Entity',
              centrality: 0.85,
              connections: 12,
              primaryCluster: 'Financial District'
            },
            {
              name: 'John Smith',
              type: 'Individual',
              centrality: 0.72,
              connections: 8,
              primaryCluster: 'Residential Luxury'
            },
            {
              name: 'XYZ Investments',
              type: 'Entity',
              centrality: 0.68,
              connections: 9,
              primaryCluster: 'Commercial Real Estate'
            },
            {
              name: 'Global Properties LLC',
              type: 'Entity',
              centrality: 0.65,
              connections: 7,
              primaryCluster: 'Mixed-Use Development'
            },
            {
              name: 'Jane Doe',
              type: 'Individual',
              centrality: 0.61,
              connections: 6,
              primaryCluster: 'Residential Luxury'
            }
          ]
        };
      
      case 'wealth-trends':
        return {
          timePeriod: '5-Year Analysis (2018-2023)',
          trendSummary: 'Analysis of wealth trends over the past 5 years shows significant growth in the ultra-high net worth segment, with moderate growth in other wealth tiers. The wealth gap has widened during this period.',
          wealthTrends: {
            ultraHigh: [55, 62, 68, 75, 80, 85],
            high: [38, 42, 45, 48, 50, 51],
            affluent: [8, 9, 10, 11, 12, 12.5]
          },
          growthRates: {
            'ultra-high': 54.5,
            'high': 34.2,
            'affluent': 56.3,
            'mass-affluent': 25.0,
            'overall': 42.1
          },
          insights: {
            wealthConcentration: 'The concentration of wealth among ultra-high net worth individuals has increased by 12% over the 5-year period.',
            marketVolatility: 'Despite market volatility in 2020, high and ultra-high net worth segments showed resilience and recovered quickly.',
            geographicShifts: 'There has been a notable shift of wealth from traditional financial centers to emerging tech hubs and tax-advantaged locations.',
            futureProjections: 'Based on current trends, we project continued growth in wealth concentration, with the top 5% potentially controlling over 60% of total wealth by 2028.'
          }
        };
      
      default:
        return {};
    }
  }
}

export default new ReportAPI();
