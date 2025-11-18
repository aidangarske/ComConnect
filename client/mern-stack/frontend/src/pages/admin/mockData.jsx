export const mockUsers = [
  { 
    id: 'u1', 
    name: 'Alice Johnson', 
    email: 'alice@example.com', 
    role: 'seeker', 
    status: 'active', 
    joinedDate: '2025-01-15T10:30:00Z' 
  },
  { 
    id: 'u2', 
    name: 'Bob Smith', 
    email: 'bob.smith@example.com', 
    role: 'provider', 
    status: 'active', 
    joinedDate: '2025-02-10T14:22:00Z' 
  },
  { 
    id: 'u3', 
    name: 'Charlie Brown', 
    email: 'charlie@example.com', 
    role: 'seeker', 
    status: 'banned', 
    joinedDate: '2025-03-05T08:15:00Z' 
  },
  { 
    id: 'u4', 
    name: 'David Lee', 
    email: 'd.lee@example.com', 
    role: 'provider', 
    status: 'pending', 
    joinedDate: '2025-04-20T17:45:00Z' 
  },
  { 
    id: 'u5', 
    name: 'Eve Davis', 
    email: 'eve@example.com', 
    role: 'admin', 
    status: 'active', 
    joinedDate: '2025-01-01T12:00:00Z' 
  },
];

export const mockReportsData = {
  keyMetrics: {
    totalUsers: 1320,
    totalProviders: 450,
    totalTransactions: 5201,
    totalRevenue: 12540.50
  },
  usersPerDay: [
    { name: 'Mon', users: 15 },
    { name: 'Tue', users: 22 },
    { name: 'Wed', users: 18 },
    { name: 'Thu', users: 30 },
    { name: 'Fri', users: 25 },
    { name: 'Sat', users: 40 },
    { name: 'Sun', users: 32 },
  ]
};

export const mockSettingsData = {
  siteName: "ComConnect",
  maintenanceMode: false,
  commissionRate: 0.15, // 15%
  newRegistrations: true,
  featuredProviderId: 'u2'
};

export const mockServices = [
  { 
    id: 's1', 
    title: 'Professional Logo Design', 
    providerName: 'Bob Smith', 
    providerId: 'u2', 
    category: 'Design', 
    status: 'pending', 
    submittedDate: '2025-11-15T10:00:00Z' 
  },
  { 
    id: 's2', 
    title: 'I will be your virtual assistant', 
    providerName: 'David Lee', 
    providerId: 'u4', 
    category: 'Admin', 
    status: 'pending', 
    submittedDate: '2025-11-14T08:30:00Z' 
  },
  { 
    id: 's3', 
    title: 'Full Website Creation (React)', 
    providerName: 'Bob Smith', 
    providerId: 'u2', 
    category: 'Web Development', 
    status: 'approved', 
    submittedDate: '2025-11-13T12:00:00Z' 
  },
  { 
    id: 's4', 
    title: 'Spanish Tutoring Lessons', 
    providerName: 'Eve Davis', 
    providerId: 'u5', 
    category: 'Tutoring', 
    status: 'approved', 
    submittedDate: '2025-11-12T17:45:00Z' 
  },
];

export const mockTickets = [
  { 
    id: 't1', 
    subject: 'Issue with my payment', 
    userName: 'Alice Johnson', 
    userId: 'u1', 
    status: 'open', 
    submittedDate: '2025-11-15T09:30:00Z',
    message: 'My payment for service s3 failed but my card was charged. Please help.'
  },
  { 
    id: 't2', 
    subject: 'Cannot login', 
    userName: 'Charlie Brown', 
    userId: 'u3', 
    status: 'open', 
    submittedDate: '2025-11-14T11:00:00Z',
    message: 'I try to reset my password but I am not getting the email.'
  },
  { 
    id: 't3', 
    subject: 'Service not as described', 
    userName: 'Eve Davis', 
    userId: 'u5', 
    status: 'closed', 
    submittedDate: '2025-11-13T16:45:00Z',
    message: 'The provider did not deliver what was promised.'
  },
];

export const myUserId = 'u5'; 

export const mockConversations = [
  {
    id: 'c1',
    userId: 'u1',
    userName: 'Alice Johnson',
    lastMessage: 'My payment for service s3 failed but...',
    timestamp: '2025-11-15T09:30:00Z',
  },
  {
    id: 'c2',
    userId: 'u3',
    userName: 'Charlie Brown',
    lastMessage: 'I try to reset my password but I am...',
    timestamp: '2025-11-14T11:00:00Z',
  },
  {
    id: 'c3',
    userId: 'u2',
    userName: 'Bob Smith',
    lastMessage: 'Sounds good, thanks!',
    timestamp: '2025-11-13T17:00:00Z',
  },
];

export const mockMessages = {
  c1: [
    { id: 'm1', senderId: 'u1', text: 'My payment for service s3 failed but my card was charged. Please help.' },
    { id: 'm2', senderId: 'u5', text: 'Hi Alice, I am looking into this for you right now. Can you confirm the last 4 digits of your card?' },
  ],
  c2: [
    { id: 'm3', senderId: 'u3', text: 'I try to reset my password but I am not getting the email.' },
    { id: 'm4', senderId: 'u3', text: 'Can you manually reset it for me?' },
    { id: 'm5', senderId: 'u5', text: 'Hi Charlie, I see you are on the "banned" list, which is why your password reset is failing. I am escalating this to the moderation team.' },
  ],
  c3: [
    { id: 'm6', senderId: 'u2', text: 'The new service listing is ready for approval.' },
    { id: 'm7', senderId: 'u5', text: 'Great, I will approve it now.' },
    { id: 'm8', senderId: 'u2', text: 'Sounds good, thanks!' },
  ],
};