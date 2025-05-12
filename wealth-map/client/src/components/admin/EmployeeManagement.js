import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { AlertContext } from '../../context/AlertContext';
import Layout from '../layout/Layout';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Block as BlockIcon,
  Check as CheckIcon
} from '@mui/icons-material';

const EmployeeManagement = () => {
  const { user } = useContext(AuthContext);
  const { success: showSuccess, error: showError } = useContext(AlertContext);
  
  // Mock employee data
  const [employees, setEmployees] = useState([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      department: 'Management',
      status: 'active',
      lastLogin: '2023-05-10T14:30:00Z'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      role: 'user',
      department: 'Sales',
      status: 'active',
      lastLogin: '2023-05-11T09:15:00Z'
    },
    {
      id: 3,
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.johnson@example.com',
      role: 'user',
      department: 'Research',
      status: 'inactive',
      lastLogin: '2023-04-25T11:45:00Z'
    },
    {
      id: 4,
      firstName: 'Emily',
      lastName: 'Williams',
      email: 'emily.williams@example.com',
      role: 'user',
      department: 'Marketing',
      status: 'active',
      lastLogin: '2023-05-12T08:20:00Z'
    },
    {
      id: 5,
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@example.com',
      role: 'admin',
      department: 'IT',
      status: 'active',
      lastLogin: '2023-05-11T16:10:00Z'
    }
  ]);
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  // Form states
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'user',
    department: '',
    status: 'active'
  });
  
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Handle dialog open/close
  const handleOpenAddDialog = () => {
    setNewEmployee({
      firstName: '',
      lastName: '',
      email: '',
      role: 'user',
      department: '',
      status: 'active'
    });
    setOpenAddDialog(true);
  };
  
  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };
  
  const handleOpenEditDialog = (employee) => {
    setSelectedEmployee(employee);
    setOpenEditDialog(true);
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedEmployee(null);
  };
  
  const handleOpenDeleteDialog = (employee) => {
    setSelectedEmployee(employee);
    setOpenDeleteDialog(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedEmployee(null);
  };
  
  // Handle form input changes
  const handleNewEmployeeChange = (e) => {
    const { name, value } = e.target;
    setNewEmployee({
      ...newEmployee,
      [name]: value
    });
  };
  
  const handleEditEmployeeChange = (e) => {
    const { name, value } = e.target;
    setSelectedEmployee({
      ...selectedEmployee,
      [name]: value
    });
  };
  
  // Handle form submissions
  const handleAddEmployee = () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmployee.email)) {
      showError('Please enter a valid email address');
      return;
    }
    
    // In a real implementation, this would call the backend API
    // For now, we'll just update the state
    const newId = Math.max(...employees.map(emp => emp.id)) + 1;
    
    setEmployees([
      ...employees,
      {
        ...newEmployee,
        id: newId,
        lastLogin: null
      }
    ]);
    
    showSuccess('Employee added successfully');
    handleCloseAddDialog();
  };
  
  const handleUpdateEmployee = () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(selectedEmployee.email)) {
      showError('Please enter a valid email address');
      return;
    }
    
    // In a real implementation, this would call the backend API
    // For now, we'll just update the state
    setEmployees(
      employees.map(emp => 
        emp.id === selectedEmployee.id ? selectedEmployee : emp
      )
    );
    
    showSuccess('Employee updated successfully');
    handleCloseEditDialog();
  };
  
  const handleDeleteEmployee = () => {
    // In a real implementation, this would call the backend API
    // For now, we'll just update the state
    setEmployees(
      employees.filter(emp => emp.id !== selectedEmployee.id)
    );
    
    showSuccess('Employee deleted successfully');
    handleCloseDeleteDialog();
  };
  
  const handleToggleStatus = (employee) => {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    
    // In a real implementation, this would call the backend API
    // For now, we'll just update the state
    setEmployees(
      employees.map(emp => 
        emp.id === employee.id ? { ...emp, status: newStatus } : emp
      )
    );
    
    showSuccess(`Employee ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
  };
  
  const handleSendInvite = (employee) => {
    // In a real implementation, this would call the backend API
    // For now, we'll just show a success message
    showSuccess(`Invitation sent to ${employee.email}`);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get initials for avatar
  const getInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };
  
  return (
    <Layout title="Employee Management">
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Employees
          </Typography>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Add Employee
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2 }}>
                        {getInitials(employee.firstName, employee.lastName)}
                      </Avatar>
                      <Typography>
                        {employee.firstName} {employee.lastName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <Chip
                      label={employee.role === 'admin' ? 'Admin' : 'User'}
                      color={employee.role === 'admin' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={employee.status === 'active' ? 'Active' : 'Inactive'}
                      color={employee.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(employee.lastLogin)}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenEditDialog(employee)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    
                    <IconButton
                      color={employee.status === 'active' ? 'error' : 'success'}
                      onClick={() => handleToggleStatus(employee)}
                      title={employee.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {employee.status === 'active' ? <BlockIcon /> : <CheckIcon />}
                    </IconButton>
                    
                    <IconButton
                      color="primary"
                      onClick={() => handleSendInvite(employee)}
                      title="Send Invite"
                    >
                      <EmailIcon />
                    </IconButton>
                    
                    <IconButton
                      color="error"
                      onClick={() => handleOpenDeleteDialog(employee)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Add Employee Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Employee</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={newEmployee.firstName}
                onChange={handleNewEmployeeChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={newEmployee.lastName}
                onChange={handleNewEmployeeChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={newEmployee.email}
                onChange={handleNewEmployeeChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={newEmployee.role}
                  onChange={handleNewEmployeeChange}
                  label="Role"
                >
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                name="department"
                value={newEmployee.department}
                onChange={handleNewEmployeeChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={newEmployee.status}
                  onChange={handleNewEmployeeChange}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button
            onClick={handleAddEmployee}
            variant="contained"
            color="primary"
          >
            Add Employee
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Employee Dialog */}
      {selectedEmployee && (
        <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={selectedEmployee.firstName}
                  onChange={handleEditEmployeeChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={selectedEmployee.lastName}
                  onChange={handleEditEmployeeChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={selectedEmployee.email}
                  onChange={handleEditEmployeeChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={selectedEmployee.role}
                    onChange={handleEditEmployeeChange}
                    label="Role"
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={selectedEmployee.department}
                  onChange={handleEditEmployeeChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={selectedEmployee.status}
                    onChange={handleEditEmployeeChange}
                    label="Status"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditDialog}>Cancel</Button>
            <Button
              onClick={handleUpdateEmployee}
              variant="contained"
              color="primary"
            >
              Update Employee
            </Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* Delete Employee Dialog */}
      {selectedEmployee && (
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Delete Employee</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete {selectedEmployee.firstName} {selectedEmployee.lastName}?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
            <Button
              onClick={handleDeleteEmployee}
              variant="contained"
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Layout>
  );
};

export default EmployeeManagement;
