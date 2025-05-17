import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import SecuritySettings from './SecuritySettings';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  Avatar,
  Grid,
  Button
} from '@mui/material';
import {
  Person,
  Security,
  Notifications,
  Business,
  Settings
} from '@mui/icons-material';

// Tab Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
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

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'center', sm: 'flex-start' },
              gap: 2
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                fontSize: '2.5rem'
              }}
            >
              {user?.firstName?.charAt(0) || ''}
              {user?.lastName?.charAt(0) || ''}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" gutterBottom>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {user?.email}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} • {user?.company?.name}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                  Edit Profile
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Profile Tabs */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              aria-label="profile tabs"
            >
              <Tab icon={<Person />} label="Personal Info" />
              <Tab icon={<Security />} label="Security" />
              <Tab icon={<Notifications />} label="Notifications" />
              <Tab icon={<Business />} label="Company" />
              <Tab icon={<Settings />} label="Preferences" />
            </Tabs>
            
            <Divider />
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Typography variant="body2" paragraph>
                This section will contain personal information settings.
              </Typography>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <SecuritySettings />
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <Typography variant="body2" paragraph>
                This section will contain notification settings.
              </Typography>
            </TabPanel>
            
            <TabPanel value={tabValue} index={3}>
              <Typography variant="h6" gutterBottom>
                Company Settings
              </Typography>
              <Typography variant="body2" paragraph>
                This section will contain company settings.
              </Typography>
            </TabPanel>
            
            <TabPanel value={tabValue} index={4}>
              <Typography variant="h6" gutterBottom>
                User Preferences
              </Typography>
              <Typography variant="body2" paragraph>
                This section will contain user preferences.
              </Typography>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;
