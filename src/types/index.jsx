// Type definitions for SmartRoomBooker
// These are JavaScript object templates since we're using JS instead of TS

export const User = {
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  role: 'USER',
  createdAt: '',
  updatedAt: '',
};

export const AuthResponse = {
  user: User,
  accessToken: '',
  refreshToken: '',
};

export const LoginCredentials = {
  email: '',
  password: '',
};

export const RegisterData = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
};

export const Room = {
  id: '',
  name: '',
  description: '',
  capacity: 0,
  location: '',
  pricePerHour: 0,
  equipment: [],
  images: [],
  availability: [],
  rating: 0,
  reviews: [],
};

export const Equipment = {
  id: '',
  name: '',
  type: '',
  description: '',
  available: false,
  maintenanceHistory: [],
};

export const MaintenanceRecord = {
  id: '',
  date: '',
  description: '',
  performedBy: '',
};

export const TimeSlot = {
  start: '',
  end: '',
  available: false,
};

export const Review = {
  id: '',
  userId: '',
  rating: 0,
  comment: '',
  createdAt: '',
};

export const Booking = {
  id: '',
  roomId: '',
  userId: '',
  startTime: '',
  endTime: '',
  purpose: '',
  attendees: 0,
  status: 'PENDING',
  totalCost: 0,
  equipmentRequests: [],
  createdAt: '',
  updatedAt: '',
};

export const EquipmentRequest = {
  id: '',
  equipmentId: '',
  quantity: 0,
  approved: false,
};

export const Event = {
  id: '',
  title: '',
  description: '',
  date: '',
  location: '',
  organizer: '',
  attendees: 0,
  maxAttendees: 0,
  public: false,
  registrationRequired: false,
};

export const Recommendation = {
  id: '',
  userId: '',
  roomId: '',
  score: 0,
  reason: '',
  basedOn: 'PREFERENCES',
};

export const BookingFormData = {
  roomId: '',
  startTime: '',
  endTime: '',
  purpose: '',
  attendees: 0,
  equipmentRequests: [],
};

export const RoomFilters = {
  capacity: 0,
  location: '',
  equipment: [],
  priceRange: [0, 0],
  availableOnly: false,
  rating: 0,
};

export const DashboardStats = {
  totalBookings: 0,
  totalRevenue: 0,
  activeRooms: 0,
  totalUsers: 0,
  popularRooms: [],
  recentBookings: [],
  upcomingEvents: [],
};

export const ApiResponse = {
  data: null,
  message: '',
  success: false,
};

export const PaginatedResponse = {
  data: [],
  page: 0,
  limit: 0,
  total: 0,
  totalPages: 0,
};


