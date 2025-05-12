import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import Layout from '../layout/Layout';
import ReportAPI from '../../services/ReportAPI';
import {
  PropertyReportFilters,
  OwnerReportFilters,
  WealthAnalysisFilters
} from './ReportFilters';
import {
  PropertyReportPreview,
  OwnerReportPreview,
  WealthAnalysisPreview
} from './ReportPreview';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  Description as ExcelIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
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

const Reports = () => {
  const { user } = useContext(AuthContext);
  const { error: showError, success: showSuccess } = useContext(AlertContext);
  
  // Report state
  const [reportType, setReportType] = useState(0);
  const [reportTitle, setReportTitle] = useState('');
  const [reportFormat, setReportFormat] = useState('pdf');
  
  // Filter state
  const [propertyFilters, setPropertyFilters] = useState({
    propertyType: 'all',
    propertySubType: 'all',
    minValue: 0,
    maxValue: 10000000,
    location: 'all',
    transactionDateFrom: null,
    transactionDateTo: null
  });
  
  const [ownerFilters, setOwnerFilters] = useState({
    ownerType: 'all',
    wealthTier: 'all',
    minNetWorth: 0,
    maxNetWorth: 100000000,
    location: 'all',
    wealthSources: []
  });
  
  const [wealthAnalysisFilters, setWealthAnalysisFilters] = useState({
    analysisType: 'wealth-distribution',
    geographicScope: 'national',
    timePeriod: '5-year',
    dataConfidence: 'all'
  });
  
  // Preview state
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportUrl, setExportUrl] = useState(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Handle report type change
  const handleReportTypeChange = (event, newValue) => {
    setReportType(newValue);
    setPreviewData(null);
  };
  
  // Handle report format change
  const handleReportFormatChange = (event) => {
    setReportFormat(event.target.value);
  };
  
  // Generate report preview
  const generateReportPreview = async () => {
    try {
      setLoading(true);
      
      // Get the appropriate filters based on report type
      let filters;
      let reportTypeString;
      
      switch (reportType) {
        case 0: // Property Report
          filters = propertyFilters;
          reportTypeString = 'property';
          break;
        case 1: // Owner Report
          filters = ownerFilters;
          reportTypeString = 'owner';
          break;
        case 2: // Wealth Analysis
          filters = wealthAnalysisFilters;
          reportTypeString = 'wealth-analysis';
          break;
        default:
          throw new Error('Invalid report type');
      }
      
      // Get mock data for preview
      const data = await ReportAPI.getMockReportData(reportTypeString, filters);
      setPreviewData(data);
      
    } catch (err) {
      console.error('Error generating report preview:', err);
      showError('Failed to generate report preview');
    } finally {
      setLoading(false);
    }
  };
  
  // Export report
  const exportReport = async () => {
    try {
      setExportLoading(true);
      
      // Get the appropriate filters based on report type
      let filters;
      let apiMethod;
      
      switch (reportType) {
        case 0: // Property Report
          filters = propertyFilters;
          apiMethod = ReportAPI.generatePropertyReport;
          break;
        case 1: // Owner Report
          filters = ownerFilters;
          apiMethod = ReportAPI.generateOwnerReport;
          break;
        case 2: // Wealth Analysis
          filters = wealthAnalysisFilters;
          apiMethod = ReportAPI.generateWealthAnalysisReport;
          break;
        default:
          throw new Error('Invalid report type');
      }
      
      // In a real implementation, this would call the backend API
      // For now, we'll just show a success message and simulate a download
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For PDF format, create a mock PDF URL
      if (reportFormat === 'pdf') {
        // In a real implementation, this would be a blob URL from the API response
        setExportUrl('https://example.com/mock-report.pdf');
      }
      
      setShowExportDialog(true);
      showSuccess(`Report exported successfully in ${reportFormat.toUpperCase()} format`);
      
    } catch (err) {
      console.error('Error exporting report:', err);
      showError('Failed to export report');
    } finally {
      setExportLoading(false);
    }
  };
  
  // Save report configuration
  const saveReportConfiguration = () => {
    // In a real implementation, this would call the backend API
    // For now, we'll just show a success message
    showSuccess('Report configuration saved successfully');
  };
  
  // Print report
  const printReport = () => {
    window.print();
  };
  
  // Get report title based on type
  const getReportTitle = () => {
    if (reportTitle) return reportTitle;
    
    switch (reportType) {
      case 0:
        return 'Property Report';
      case 1:
        return 'Owner Report';
      case 2:
        return 'Wealth Analysis Report';
      default:
        return 'Report';
    }
  };
  
  // Render report preview based on type
  const renderReportPreview = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (!previewData) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            Configure your report options and click "Generate Preview" to see a preview of your report.
          </Typography>
        </Box>
      );
    }
    
    switch (reportType) {
      case 0: // Property Report
        return (
          <PropertyReportPreview 
            reportData={previewData} 
            reportTitle={getReportTitle()} 
            reportFormat={reportFormat} 
          />
        );
      case 1: // Owner Report
        return (
          <OwnerReportPreview 
            reportData={previewData} 
            reportTitle={getReportTitle()} 
            reportFormat={reportFormat} 
          />
        );
      case 2: // Wealth Analysis
        return (
          <WealthAnalysisPreview 
            reportData={previewData} 
            reportTitle={getReportTitle()} 
            reportFormat={reportFormat} 
            analysisType={wealthAnalysisFilters.analysisType}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <Layout title="Reports">
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={reportType} onChange={handleReportTypeChange} aria-label="report tabs">
            <Tab label="Property Reports" id="report-tab-0" aria-controls="report-tabpanel-0" />
            <Tab label="Owner Reports" id="report-tab-1" aria-controls="report-tabpanel-1" />
            <Tab label="Wealth Analysis" id="report-tab-2" aria-controls="report-tabpanel-2" />
          </Tabs>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Report Title"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder={getReportTitle()}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Report Format</InputLabel>
              <Select
                value={reportFormat}
                onChange={handleReportFormatChange}
                label="Report Format"
              >
                <MenuItem value="pdf">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PdfIcon sx={{ mr: 1 }} />
                    PDF
                  </Box>
                </MenuItem>
                <MenuItem value="csv">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CsvIcon sx={{ mr: 1 }} />
                    CSV
                  </Box>
                </MenuItem>
                <MenuItem value="excel">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ExcelIcon sx={{ mr: 1 }} />
                    Excel
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Report Filters
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          {/* Report Filters based on report type */}
          <TabPanel value={reportType} index={0}>
            <PropertyReportFilters 
              filters={propertyFilters} 
              setFilters={setPropertyFilters} 
            />
          </TabPanel>
          
          <TabPanel value={reportType} index={1}>
            <OwnerReportFilters 
              filters={ownerFilters} 
              setFilters={setOwnerFilters} 
            />
          </TabPanel>
          
          <TabPanel value={reportType} index={2}>
            <WealthAnalysisFilters 
              filters={wealthAnalysisFilters} 
              setFilters={setWealthAnalysisFilters} 
            />
          </TabPanel>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={saveReportConfiguration}
          >
            Save Configuration
          </Button>
          
          <Box>
            <Button
              variant="contained"
              onClick={generateReportPreview}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Generate Preview'}
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={exportReport}
              disabled={exportLoading || !previewData}
            >
              {exportLoading ? <CircularProgress size={24} /> : 'Export Report'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      {/* Report Preview */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            Report Preview
          </Typography>
          
          {previewData && (
            <Box>
              <IconButton onClick={printReport} title="Print Preview">
                <PrintIcon />
              </IconButton>
              <IconButton onClick={() => setShowExportDialog(true)} title="Export Report">
                <DownloadIcon />
              </IconButton>
              <IconButton title="Share Report">
                <ShareIcon />
              </IconButton>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {renderReportPreview()}
      </Paper>
      
      {/* Export Dialog */}
      <Dialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        aria-labelledby="export-dialog-title"
      >
        <DialogTitle id="export-dialog-title">
          Export Report
          <IconButton
            aria-label="close"
            onClick={() => setShowExportDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Your report has been successfully generated in {reportFormat.toUpperCase()} format.
          </Typography>
          
          {reportFormat === 'pdf' ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PdfIcon />}
              fullWidth
              href={exportUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View PDF Report
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              fullWidth
              onClick={() => {
                // In a real implementation, this would trigger a download
                showSuccess(`${reportFormat.toUpperCase()} file downloaded successfully`);
                setShowExportDialog(false);
              }}
            >
              Download {reportFormat.toUpperCase()} File
            </Button>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default Reports;
