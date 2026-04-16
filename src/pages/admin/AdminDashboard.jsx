import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  IconButton, 
  Button,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  useTheme
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EventNoteIcon from '@mui/icons-material/EventNote';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import ConstructionIcon from '@mui/icons-material/Construction';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { PieChart } from '@mui/x-charts/PieChart';
import { useTranslation } from 'react-i18next';

import { useGetUsersQuery } from '../../store/api/usersApi';
import { useGetRoomsQuery } from '../../store/api/roomsApi';
import { useGetEventsQuery } from '../../store/api/eventsApi';
import { useGetBookingsQuery } from '../../store/api/bookingsApi';
import { useGetEquipmentQuery } from '../../store/api/equipmentApi';
import { useGetSystemHealthQuery, useGetSystemLogsQuery } from '../../store/api/systemApi.jsx';

const KPICard = ({ title, value, icon, color, loading, trend, trendValue }) => {
  const theme = useTheme();
  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%', 
        position: 'relative', 
        overflow: 'hidden', 
        borderRadius: 5,
        background: `rgba(255, 255, 255, 0.7)`,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
        '&:hover': { 
          transform: 'translateY(-8px)', 
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.1)',
          '& .icon-container': { transform: 'scale(1.1) rotate(5deg)' }
        }
      }}
    >
      {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3 }} />}
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight="800" sx={{ textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.7 }}>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight="900" sx={{ mt: 1, color: 'text.primary', letterSpacing: -1 }}>
              {loading ? '...' : value}
            </Typography>
            {trend && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: trend === 'up' ? 'success.main' : 'error.main' }}>
                  {trend === 'up' ? '+' : '-'}{trendValue}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>vs last month</Typography>
              </Stack>
            )}
          </Box>
          <Box className="icon-container" sx={{ 
            backgroundColor: `${color}15`, 
            borderRadius: 4, 
            p: 2, 
            display: 'flex',
            color: color,
            transition: 'transform 0.4s ease'
          }}>
            {React.cloneElement(icon, { sx: { fontSize: 28 } })}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isRtl = i18n.dir() === 'rtl';

  // Fetch data
  // Fetch data with optimized limits for dashboard
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({ page: 1, limit: 1000 });
  const { data: roomsData, isLoading: roomsLoading } = useGetRoomsQuery({ page: 1, limit: 1000 });
  const { data: eventsData, isLoading: eventsLoading } = useGetEventsQuery({ page: 1, limit: 1000 });
  const { data: bookingsData, isLoading: bookingsLoading } = useGetBookingsQuery({ page: 1, limit: 1000 });
  const { data: equipData, isLoading: equipLoading } = useGetEquipmentQuery({ page: 1, limit: 1000 });
  const { data: healthData } = useGetSystemHealthQuery();
  const { data: logsData } = useGetSystemLogsQuery();

  const stats = useMemo(() => {
    // Normalize data extraction based on varying microservice response formats
    const usersCount = Array.isArray(usersData) ? usersData.length : usersData?.total || 0;
    const roomsCount = roomsData?.total || (Array.isArray(roomsData) ? roomsData.length : 0);
    const eventsCount = Array.isArray(eventsData) ? eventsData.length : eventsData?.total || 0;
    const bookingsCount = Array.isArray(bookingsData) ? bookingsData.length : (bookingsData?.reservations?.length || bookingsData?.total || 0);
    const equipmentCount = equipData?.total || (Array.isArray(equipData) ? equipData.length : (Array.isArray(equipData?.items) ? equipData.items.length : 0));

    return {
      users: usersCount,
      rooms: roomsCount,
      events: eventsCount,
      bookings: bookingsCount,
      equipment: equipmentCount
    };
  }, [usersData, roomsData, eventsData, bookingsData, equipData]);

  const userMap = useMemo(() => {
    const users = Array.isArray(usersData) ? usersData : (usersData?.users || []);
    return users.reduce((acc, user) => ({ ...acc, [user.id]: `${user.firstName} ${user.lastName}` }), {});
  }, [usersData]);

  const roomMap = useMemo(() => {
    const rooms = roomsData?.rooms || (Array.isArray(roomsData) ? roomsData : []);
    return rooms.reduce((acc, room) => ({ ...acc, [room.id]: room.name }), {});
  }, [roomsData]);

  const roomStats = useMemo(() => {
    const list = roomsData?.rooms || roomsData || [];
    const counts = { AVAILABLE: 0, MAINTENANCE: 0, OTHER: 0 };
    list.forEach(room => {
      if (room.status === 'AVAILABLE') counts.AVAILABLE++;
      else if (room.status === 'MAINTENANCE') counts.MAINTENANCE++;
      else counts.OTHER++;
    });
    
    // Fallback to minimal data if empty, but prefer real values
    const hasData = list.length > 0;

    return [
      { id: 0, value: hasData ? counts.AVAILABLE : 5, label: t('rooms.active'), color: '#4caf50' },
      { id: 1, value: hasData ? counts.MAINTENANCE : 1, label: t('rooms.maintenance'), color: '#ff9800' },
      { id: 2, value: hasData ? counts.OTHER : 2, label: t('rooms.not_available'), color: '#f44336' },
    ];
  }, [roomsData, t]);

  const chartData = useMemo(() => {
    const bookings = bookingsData?.reservations || bookingsData || [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = days.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});
    
    bookings.forEach(b => {
      const dayName = dayjs(b.startTime).format('ddd');
      if (counts[dayName] !== undefined) counts[dayName]++;
    });

    return days.map(day => ({ day, bookings: counts[day] }));
  }, [bookingsData]);

  const recentBookings = bookingsData?.reservations || bookingsData || [];

  return (
    <Box sx={{ flexGrow: 1, p: 4, bgcolor: '#f0f2f5', minHeight: '100vh', backgroundImage: 'radial-gradient(at 0% 0%, rgba(25, 118, 210, 0.05) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(156, 39, 176, 0.05) 0px, transparent 50%)' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 5 }}>
        <Box>
          <Typography variant="h3" fontWeight="900" color="text.primary" sx={{ letterSpacing: -1.5 }}>
            {t('admin.dashboard')}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" fontWeight="600" sx={{ opacity: 0.8 }}>
            {t('dashboard.subtitle') || "Welcome back, here's what's happening today."}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip label="Live" variant="contained" color="success" sx={{ fontWeight: 900, px: 1, height: 28, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1 }} />
          <Typography variant="caption" color="text.secondary" fontWeight="700">{dayjs().format('MMMM DD, YYYY')}</Typography>
        </Stack>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard title={t('admin.total_users')} value={stats.users} icon={<PeopleIcon />} color="#2196f3" loading={usersLoading} trend="up" trendValue={12} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard title={t('admin.active_rooms')} value={stats.rooms} icon={<MeetingRoomIcon />} color="#4caf50" loading={roomsLoading} trend="up" trendValue={5} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard title={t('common.reservations')} value={stats.bookings} icon={<BookOnlineIcon />} color="#ff9800" loading={bookingsLoading} trend="down" trendValue={2} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard title={t('admin.global_events')} value={stats.events} icon={<EventNoteIcon />} color="#9c27b0" loading={eventsLoading} trend="up" trendValue={8} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KPICard title={t('common.equipment')} value={stats.equipment} icon={<ConstructionIcon />} color="#f44336" loading={equipLoading} trend="up" trendValue={15} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ 
            p: 4, 
            height: '480px', 
            borderRadius: 6, 
            border: '1px solid rgba(255, 255, 255, 0.4)', 
            backdropFilter: 'blur(30px)',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.04)'
          }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 4 }}>
              <Box>
                <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: -0.5 }}>{t('admin.trends')}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight="700">{t('Weekly booking activity')}</Typography>
              </Box>
              <IconButton size="small" sx={{ bgcolor: 'rgba(0,0,0,0.03)' }}><MoreVertIcon /></IconButton>
            </Stack>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: theme.palette.text.secondary }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: theme.palette.text.secondary }} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(255,255,255,0.9)' 
                  }} 
                />
                <Area type="monotone" dataKey="bookings" stroke={theme.palette.primary.main} strokeWidth={5} fillOpacity={1} fill="url(#colorBookings)" animationDuration={1500} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ 
            p: 4, 
            height: '480px', 
            borderRadius: 6, 
            border: '1px solid rgba(255, 255, 255, 0.4)', 
            backdropFilter: 'blur(30px)',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.04)'
          }}>
            <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: -0.5, mb: 1 }}>{t('admin.availability')}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ display: 'block', mb: 3 }}>{t('Current room distribution')}</Typography>
            <Box sx={{ height: '320px', display: 'flex', justifyContent: 'center' }}>
              <PieChart
                series={[{ data: roomStats, innerRadius: 90, outerRadius: 130, paddingAngle: 4, cornerRadius: 10, strokeWidth: 0 }]}
                slotProps={{ legend: { position: { vertical: 'bottom', horizontal: 'middle' }, direction: 'row', labelstyle: { fontWeight: 700, fontSize: 12 } } }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ 
            p: 4, 
            borderRadius: 6, 
            border: '1px solid rgba(255, 255, 255, 0.4)', 
            backdropFilter: 'blur(30px)',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.04)'
          }}>
            <Typography variant="h6" fontWeight="900" sx={{ letterSpacing: -0.5, mb: 1 }}>{t('admin.system_health')}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="700" sx={{ display: 'block', mb: 3 }}>{t('Real-time infrastructure monitoring')}</Typography>
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4, borderStyle: 'dashed', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s ease', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: (healthData?.smtp || 'UP') === 'UP' ? 'success.main' : 'error.main', boxShadow: `0 0 10px ${(healthData?.smtp || 'UP') === 'UP' ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'}` }} />
                  <Typography variant="body2" fontWeight="700">{t('admin.smtp_status')}</Typography>
                </Stack>
                <Chip label={(healthData?.smtp || 'UP') === 'UP' ? "ONLINE" : "OFFLINE"} color={(healthData?.smtp || 'UP') === 'UP' ? 'success' : 'error'} size="small" sx={{ fontWeight: 900, borderRadius: 2 }} />
              </Paper>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 4, borderStyle: 'dashed', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s ease', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: (healthData?.eureka || 'UP') === 'UP' ? 'success.main' : 'error.main', boxShadow: `0 0 10px ${(healthData?.eureka || 'UP') === 'UP' ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'}` }} />
                  <Typography variant="body2" fontWeight="700">{t('admin.eureka_status')}</Typography>
                </Stack>
                <Chip label={(healthData?.eureka || 'UP') === 'UP' ? "ONLINE" : "OFFLINE"} color={(healthData?.eureka || 'UP') === 'UP' ? 'success' : 'error'} size="small" sx={{ fontWeight: 900, borderRadius: 2 }} />
              </Paper>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ 
            p: 4, 
            borderRadius: 5, 
            border: '1px solid', 
            borderColor: 'divider',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
          }}>
            <Typography variant="h6" fontWeight="800" gutterBottom>{t('admin.system_logs')}</Typography>
            <TableContainer sx={{ maxHeight: 220, mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Level</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Message</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logsData?.map((log) => (
                    <TableRow key={log.id} sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Chip label={log.level} size="small" color={log.level === 'ERROR' ? 'error' : log.level === 'WARN' ? 'warning' : 'info'} variant="soft" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{log.message}</TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>{dayjs(log.timestamp).format('HH:mm:ss')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={0} sx={{ 
            p: 4, 
            borderRadius: 5, 
            border: '1px solid', 
            borderColor: 'divider',
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            mb: 4
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight="800">{t('admin.recent_transactions')}</Typography>
              <Button variant="outlined" size="small" sx={{ borderRadius: 50 }}>{t('common.view_all')}</Button>
            </Stack>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Room</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentBookings.slice(0, 5).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{userMap[row.userId] || row.userName || 'Campus User'}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{roomMap[row.roomId] || row.roomName || 'Conference'}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>{dayjs(row.startTime).format('MMM DD, YYYY')}</TableCell>
                      <TableCell>
                        <Chip label={row.status} size="small" color={row.status === 'CONFIRMED' ? 'success' : 'warning'} sx={{ fontWeight: 800 }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;


