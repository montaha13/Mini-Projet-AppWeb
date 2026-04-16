import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Dashboard,
  People,
  MeetingRoom,
  CalendarToday,
  AttachMoney,
  Edit,
  Delete,
  Add,
  Visibility,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const TabPanel = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const AdminPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const mockStats = {
    totalUsers: 156,
    totalRooms: 24,
    totalBookings: 892,
    totalRevenue: 45670,
    monthlyRevenue: [
      { month: 'Jan', revenue: 12000 },
      { month: 'Feb', revenue: 15000 },
      { month: 'Mar', revenue: 18000 },
      { month: 'Apr', revenue: 14000 },
      { month: 'May', revenue: 22000 },
      { month: 'Jun', revenue: 25000 },
    ],
    roomUsage: [
      { name: 'Conference', value: 45, color: '#1976d2' },
      { name: 'Meeting', value: 30, color: '#4caf50' },
      { name: 'Training', value: 25, color: '#f44336' },
    ],
  };

  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'USER', status: 'Active', joinDate: '2024-01-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'ADMIN', status: 'Active', joinDate: '2024-01-10' },
    { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'USER', status: 'Inactive', joinDate: '2024-01-20' },
  ];

  const mockRooms = [
    { id: '1', name: 'Conference Room A', capacity: 20, location: 'Floor 1', status: 'Available', pricePerHour: 50 },
    { id: '2', name: 'Meeting Room B', capacity: 8, location: 'Floor 2', status: 'Available', pricePerHour: 30 },
    { id: '3', name: 'Training Room', capacity: 50, location: 'Floor 3', status: 'Maintenance', pricePerHour: 100 },
  ];

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" color={color}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ fontSize: 40, color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ flexGrow: 1, py: 3 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
          <StatCard
            title="Total Users"
            value={mockStats.totalUsers}
            icon={<People />}
            color="primary.main"
          />
          <StatCard
            title="Total Rooms"
            value={mockStats.totalRooms}
            icon={<MeetingRoom />}
            color="secondary.main"
          />
          <StatCard
            title="Total Bookings"
            value={mockStats.totalBookings}
            icon={<CalendarToday />}
            color="info.main"
          />
          <StatCard
            title="Total Revenue"
            value={`$${mockStats.totalRevenue}`}
            icon={<AttachMoney />}
            color="success.main"
          />
        </Box>

        {/* Charts */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3, mb: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Revenue Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockStats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#1976d2" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Room Usage Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockStats.roomUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {mockStats.roomUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Admin Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Users Management" />
            <Tab label="Rooms Management" />
            <Tab label="System Settings" />
          </Tabs>
        </Box>

        {/* Users Management */}
        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Users Management</Typography>
                <Button variant="contained" startIcon={<Add />}>
                  Add User
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Join Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role} 
                            color={user.role === 'ADMIN' ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.status} 
                            color={user.status === 'Active' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => setSelectedUser(user)}>
                            <Visibility />
                          </IconButton>
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Rooms Management */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Rooms Management</Typography>
                <Button variant="contained" startIcon={<Add />}>
                  Add Room
                </Button>
              </Box>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Room Name</TableCell>
                      <TableCell>Capacity</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Price/Hour</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockRooms.map((room) => (
                      <TableRow key={room.id}>
                        <TableCell>{room.name}</TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>{room.location}</TableCell>
                        <TableCell>
                          <Chip 
                            label={room.status} 
                            color={room.status === 'Available' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{room.pricePerHour} DT</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </TabPanel>

        {/* System Settings */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                System configuration and maintenance tools will be available here.
              </Typography>
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default AdminPage;


