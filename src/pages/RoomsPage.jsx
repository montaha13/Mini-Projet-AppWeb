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
  Chip,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Pagination,
  LinearProgress,
  Stack,
  InputAdornment,
  Grid,
} from '@mui/material';
import { Search, ViewList, ViewModule, People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetRoomsQuery } from '../store/api/roomsApi';
import { useGetRecommendationsQuery } from '../store/api/recommendationsApi';
import PageHeader from '../components/layout/PageHeader';
import room2Jpg from '../assets/room2.jpg';

const RoomsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [capacity, setCapacity] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  
  // Recommendation state
  const [recTitle, setRecTitle] = useState('');
  const [recParticipants, setRecParticipants] = useState('');
  const [recType, setRecType] = useState('');
  const [showRecs, setShowRecs] = useState(false);

  const handleRecInputChange = (setter) => (e) => {
    setter(e.target.value);
    setShowRecs(false); // Hide results when input changes
  };

  // Backend getAllRooms() returns a plain List<Room> with no pagination/filter params.
  // roomsApi transformResponse normalises the response to a plain array.
  const { data: roomsRaw, isLoading } = useGetRoomsQuery();

  const { data: recData, isFetching: recLoading } = useGetRecommendationsQuery(
    { title: recTitle, participants: recParticipants, type: recType, limit: 3 },
    { skip: !showRecs || (!recTitle && !recParticipants && !recType) }
  );

  // recommendationsApi transformResponse already returns a flat array.
  const recommendations = Array.isArray(recData) ? recData : [];

  // roomsApi transformResponse already returns a flat array.
  // Client-side filter for search & capacity since backend has no filter params on getAllRooms.
  const allRooms = Array.isArray(roomsRaw) ? roomsRaw : [];
  const roomsList = allRooms.filter((room) => {
    const matchesSearch = !searchQuery || room.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCapacity = !capacity || (room.capacity && room.capacity >= parseInt(capacity, 10));
    return matchesSearch && matchesCapacity;
  });
  const isRtl = i18n.dir() === 'rtl';

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleViewMode = (event, nextView) => {
    if (nextView !== null) {
      setViewMode(nextView);
    }
  };

  const RoomCard = ({ room }) => (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: 4, 
        overflow: 'hidden', 
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box sx={{ height: 200, position: 'relative', overflow: 'hidden' }}>
        <img 
          src={room.imageUrl || room2Jpg} 
          alt={room.name} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
          <Chip 
            label={room.type ? t(`rooms.${room.type.toLowerCase()}`) : t('rooms.workspace') || 'Workspace'} 
            size="small" 
            sx={{ fontWeight: 'bold', bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)' }} 
          />
        </Box>
      </Box>
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.2 }}>
            {room.name}
          </Typography>
        </Stack>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 40 }}>
          {room.location || t('rooms.any')}
        </Typography>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <People sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" fontWeight="600">{room.capacity} {t('rooms.seats')}</Typography>
            </Stack>
            <Chip 
              label={room.status === 'AVAILABLE' ? t('rooms.active') : t('rooms.not_available')} 
              size="small" 
              color={room.status === 'AVAILABLE' ? 'success' : 'default'}
              variant="soft"
              sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
            />
          </Stack>
          <Typography variant="h6" color="primary.main" fontWeight="800">
            {room.price || 0} DT<Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.5, fontWeight: 600 }}>/hr</Typography>
          </Typography>
        </Stack>

        <Button 
          variant={room.status === 'AVAILABLE' ? "contained" : "outlined"} 
          fullWidth 
          onClick={() => navigate(`/book/${room.id}`)}
          disabled={room.status !== 'AVAILABLE'}
          sx={{ py: 1.2 }}
        >
          {room.status === 'AVAILABLE' ? t('rooms.reserve') : t('rooms.not_available')}
        </Button>
      </CardContent>
    </Card>
  );

  const RecommendationCard = ({ rec }) => (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: 4, 
        border: '2px solid',
        borderColor: 'primary.main',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'primary.50'
      }}
    >
      <Box sx={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}>
        <Chip label="MATCH" color="primary" size="small" sx={{ fontWeight: 900, fontSize: '0.65rem' }} />
      </Box>
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Typography variant="h6" fontWeight="800" gutterBottom>
          {rec.room.name}
        </Typography>
        <Typography variant="body2" color="primary.main" fontWeight="600" sx={{ mb: 2, fontStyle: 'italic' }}>
          "{rec.reasoning}"
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
           <Typography variant="caption" fontWeight="700">Capacity: {rec.room.capacity}</Typography>
           <Typography variant="caption" fontWeight="700">Price: {rec.room.price} DT/hr</Typography>
        </Stack>
        <Button 
          variant="contained" 
          fullWidth 
          onClick={() => navigate(`/book/${rec.room.id}`)}
          sx={{ borderRadius: 2 }}
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <PageHeader 
        title={t('rooms.title')}
        subtitle={t('dashboard.hero_desc')}
        breadcrumbs={[{ label: t('rooms.title') }]}
      />

      <Container maxWidth="lg">
        {/* Advanced Recommendations Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 6, 
            borderRadius: 6, 
            background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
            color: 'white',
            position: 'relative'
          }}
        >
          <Typography variant="h5" fontWeight="800" sx={{ mb: 1 }}>Smart Recommendations</Typography>
          <Typography variant="body2" sx={{ mb: 4, opacity: 0.8 }}>Tell us about your event and we'll find the perfect space.</Typography>
          
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} md={4}>
              <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 700, opacity: 0.9 }}>What are you planning?</Typography>
              <TextField 
                fullWidth 
                placeholder="e.g. Board Meeting, Workshop..." 
                value={recTitle}
                onChange={handleRecInputChange(setRecTitle)}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } 
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
               <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 700, opacity: 0.9 }}>Type</Typography>
               <FormControl fullWidth sx={{ bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <Select
                    value={recType}
                    onChange={handleRecInputChange(setRecType)}
                    displayEmpty
                    sx={{ 
                      color: 'white', 
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                      '& .MuiSvgIcon-root': { color: 'white' }
                    }}
                  >
                    <MenuItem value="">Any Type</MenuItem>
                    <MenuItem value="MEETING_ROOM">Meeting Room</MenuItem>
                    <MenuItem value="CONFERENCE_ROOM">Conference Room</MenuItem>
                    <MenuItem value="AUDITORIUM">Auditorium</MenuItem>
                    <MenuItem value="LABORATORY">Laboratory</MenuItem>
                    <MenuItem value="OFFICE">Office</MenuItem>
                  </Select>
               </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
               <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 700, opacity: 0.9 }}>Participants</Typography>
               <TextField 
                type="number"
                fullWidth 
                value={recParticipants}
                onChange={handleRecInputChange(setRecParticipants)}
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)', 
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': { color: 'white', '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } } 
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Button 
                variant="contained" 
                fullWidth 
                size="large"
                onClick={() => setShowRecs(true)}
                sx={{ 
                  bgcolor: 'white', 
                  color: 'primary.main', 
                  fontWeight: 800, 
                  height: 56,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
              >
                Find Best Match
              </Button>
            </Grid>
          </Grid>

          {showRecs && (
            <Box sx={{ mt: 4 }}>
              {recLoading ? (
                <LinearProgress color="secondary" sx={{ borderRadius: 2 }} />
              ) : recommendations.length > 0 ? (
                <Grid container spacing={3}>
                  {recommendations.map((rec, idx) => (
                    <Grid item xs={12} md={4} key={idx}>
                      <RecommendationCard rec={rec} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography sx={{ textAlign: 'center', py: 2, opacity: 0.7 }}>No specific matches found. Try different criteria.</Typography>
              )}
            </Box>
          )}
        </Paper>

        {/* Filters Panel */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 6, 
            borderRadius: 4, 
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex', 
            gap: 3, 
            flexWrap: 'wrap', 
            alignItems: 'center' 
          }}
        >
          <TextField
            fullWidth
            placeholder={t('rooms.search_placeholder')}
            value={searchQuery}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ flex: { xs: '1 1 100%', md: '1' } }}
          />
          
          <FormControl sx={{ minWidth: 200, flex: { xs: '1 1 100%', md: '0 0 auto' } }}>
            <InputLabel>{t('rooms.min_capacity')}</InputLabel>
            <Select
              value={capacity}
              label={t('rooms.min_capacity')}
              onChange={(e) => setCapacity(e.target.value)}
              sx={{ borderRadius: 3 }}
            >
              <MenuItem value="">{t('rooms.any')}</MenuItem>
              <MenuItem value="5">5+ {t('rooms.seats')}</MenuItem>
              <MenuItem value="10">10+ {t('rooms.seats')}</MenuItem>
              <MenuItem value="20">20+ {t('rooms.seats')}</MenuItem>
              <MenuItem value="50">50+ {t('rooms.seats')}</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewMode}
            aria-label="View mode"
            sx={{ bgcolor: 'background.default', p: 0.5, borderRadius: 3 }}
          >
            <ToggleButton value="grid" sx={{ px: 2, border: 'none', borderRadius: '8px !important' }}>
              <ViewModule />
            </ToggleButton>
            <ToggleButton value="list" sx={{ px: 2, border: 'none', borderRadius: '8px !important' }}>
              <ViewList />
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>

        {isLoading ? (
          <Box sx={{ width: '100%', mt: 4 }}>
            <LinearProgress sx={{ borderRadius: 4, height: 8 }} />
          </Box>
        ) : (
          <>
            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                gap: 4,
                mb: 6 
              }}
            >
              {roomsList.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </Box>

            {roomsList.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 12 }}>
                <Typography variant="h5" color="text.secondary" fontWeight="600">
                  {t('rooms.no_rooms')}
                </Typography>
              </Box>
            )}

            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Pagination
                count={Math.ceil((roomsRaw?.total || roomsList.length || 0) / 12)}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                size="large"
                sx={{
                  '& .MuiPaginationItem-root': { borderRadius: 2, fontWeight: 700 }
                }}
              />
            </Stack>
          </>
        )}
      </Container>
    </Box>
  );
};

export default RoomsPage;


