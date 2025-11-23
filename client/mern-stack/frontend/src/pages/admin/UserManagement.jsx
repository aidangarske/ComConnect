import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Grid,
  Text,
  Badge,
  Button,
  Input,
  Flex,
  Spacer,
  Spinner,
} from '@chakra-ui/react';

const API_BASE_URL = 'http://localhost:8080/api'; // Your backend URL

// Helper function for badge styles
const getStatusStyles = (user) => {
  if (user.isBanned) {
    return { bg: 'red.500', color: 'white', label: 'Banned' };
  }
  if (user.isSuspended) {
    return { bg: 'orange.500', color: 'white', label: 'Suspended' };
  }
  if (user.isActive) {
    return { bg: 'green.500', color: 'white', label: 'Active' };
  }
  return { bg: 'gray.500', color: 'white', label: 'Inactive' };
};

// Ban Modal Component (using basic overlay)
function BanModal({ isOpen, onClose, user, onSuccess }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleBan = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for banning');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${user._id}/ban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (data.success) {
        alert('User banned successfully');
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Failed to ban user');
      }
    } catch (error) {
      alert('Error banning user');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(0,0,0,0.7)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="1000"
      onClick={onClose}
    >
      <Box
        bg="#1a1f3a"
        p={6}
        borderRadius="lg"
        maxW="500px"
        w="90%"
        onClick={(e) => e.stopPropagation()}
      >
        <Heading size="lg" color="white" mb={4}>
          Ban User: {user?.username}
        </Heading>
        
        <VStack spacing={4} align="stretch">
          <Box>
            <Text color="white" mb={2} fontWeight="bold">Reason for Ban</Text>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for banning this user..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '10px',
                backgroundColor: '#0a0e27',
                color: 'white',
                border: '1px solid #4a5568',
                borderRadius: '6px',
                fontFamily: 'inherit'
              }}
            />
          </Box>

          <HStack spacing={3} justify="flex-end">
            <Button onClick={onClose} variant="ghost" color="white">
              Cancel
            </Button>
            <Button
              bg="red.600"
              color="white"
              _hover={{ bg: 'red.700' }}
              onClick={handleBan}
              disabled={loading}
            >
              {loading ? 'Banning...' : 'Ban User'}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}

// Suspend Modal Component (using basic overlay)
function SuspendModal({ isOpen, onClose, user, onSuccess }) {
  const [reason, setReason] = useState('');
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSuspend = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for suspension');
      return;
    }

    if (days < 1) {
      alert('Suspension must be at least 1 day');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${user._id}/suspend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason, days })
      });

      const data = await response.json();

      if (data.success) {
        alert(`User suspended for ${days} days`);
        onSuccess();
        onClose();
      } else {
        alert(data.message || 'Failed to suspend user');
      }
    } catch (error) {
      alert('Error suspending user');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(0,0,0,0.7)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="1000"
      onClick={onClose}
    >
      <Box
        bg="#1a1f3a"
        p={6}
        borderRadius="lg"
        maxW="500px"
        w="90%"
        onClick={(e) => e.stopPropagation()}
      >
        <Heading size="lg" color="white" mb={4}>
          Suspend User: {user?.username}
        </Heading>
        
        <VStack spacing={4} align="stretch">
          <Box>
            <Text color="white" mb={2} fontWeight="bold">Suspension Duration (Days)</Text>
            <Input
              type="number"
              min="1"
              max="365"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 1)}
              bg="#0a0e27"
              color="white"
              borderColor="gray.600"
            />
          </Box>

          <Box>
            <Text color="white" mb={2} fontWeight="bold">Reason for Suspension</Text>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for suspending this user..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '10px',
                backgroundColor: '#0a0e27',
                color: 'white',
                border: '1px solid #4a5568',
                borderRadius: '6px',
                fontFamily: 'inherit'
              }}
            />
          </Box>

          <HStack spacing={3} justify="flex-end">
            <Button onClick={onClose} variant="ghost" color="white">
              Cancel
            </Button>
            <Button
              bg="orange.500"
              color="white"
              _hover={{ bg: 'orange.600' }}
              onClick={handleSuspend}
              disabled={loading}
            >
              {loading ? 'Suspending...' : 'Suspend User'}
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}

// User Details Panel
function UserDetailsPanel({ user, onBack, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const handleUnban = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${user._id}/unban`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('User unbanned successfully');
        onRefresh();
      } else {
        alert(data.message || 'Failed to unban user');
      }
    } catch (error) {
      alert('Error unbanning user');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${user._id}/unsuspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('User unsuspended successfully');
        onRefresh();
      } else {
        alert(data.message || 'Failed to unsuspend user');
      }
    } catch (error) {
      alert('Error unsuspending user');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statusStyles = getStatusStyles(user);

  return (
    <Box bg="#1a1f3a" p={6} borderRadius="lg" w="full">
      <VStack align="start" spacing={6}>
        <Button onClick={onBack} bg="#d97baa" color="white" _hover={{ bg: '#c55a8f' }}>
          &larr; Back to User List
        </Button>

        {/* User Info Box */}
        <Box w="full" bg="#2a2f4a" p={6} borderRadius="md">
          <VStack align="start" spacing={4}>
            <Heading as="h3" size="lg" color="white">
              {user.firstName} {user.lastName} (@{user.username})
            </Heading>
            <HStack>
              <Text color="gray.400" fontWeight="bold">Email:</Text>
              <Text color="gray.200">{user.email}</Text>
            </HStack>
            <HStack>
              <Text color="gray.400" fontWeight="bold">Role:</Text>
              <Text color="gray.200" textTransform="capitalize">{user.role}</Text>
            </HStack>
            <HStack>
              <Text color="gray.400" fontWeight="bold">Joined:</Text>
              <Text color="gray.200">{new Date(user.createdAt).toLocaleDateString()}</Text>
            </HStack>
            <HStack>
              <Text color="gray.400" fontWeight="bold">Status:</Text>
              <Badge
                bg={statusStyles.bg}
                color={statusStyles.color}
                py={1}
                px={2}
                borderRadius="md"
              >
                {statusStyles.label}
              </Badge>
            </HStack>
            
            {user.isBanned && (
              <Box w="full" bg="red.900" p={3} borderRadius="md">
                <Text color="white" fontWeight="bold">Ban Reason:</Text>
                <Text color="gray.200">{user.banReason}</Text>
                <Text color="gray.400" fontSize="sm" mt={2}>
                  Banned on: {new Date(user.bannedAt).toLocaleString()}
                </Text>
              </Box>
            )}
            
            {user.isSuspended && (
              <Box w="full" bg="orange.900" p={3} borderRadius="md">
                <Text color="white" fontWeight="bold">Suspension Reason:</Text>
                <Text color="gray.200">{user.suspensionReason}</Text>
                <Text color="gray.400" fontSize="sm" mt={2}>
                  Suspended until: {new Date(user.suspendedUntil).toLocaleString()}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
        
        {/* Moderation Actions */}
        <Box w="full" bg="#2a2f4a" p={6} borderRadius="md">
          <Heading as="h4" size="md" color="white" mb={4}>
            Moderation Actions
          </Heading>
          
          <HStack spacing={4}>
            {user.isBanned ? (
              <Button
                bg="green.600"
                color="white"
                _hover={{ bg: 'green.700' }}
                onClick={handleUnban}
                disabled={loading}
              >
                {loading ? 'Unbanning...' : 'Unban User'}
              </Button>
            ) : (
              <Button
                bg="red.600"
                color="white"
                _hover={{ bg: 'red.700' }}
                onClick={() => setShowBanModal(true)}
              >
                Ban User
              </Button>
            )}
            
            {user.isSuspended ? (
              <Button
                bg="green.600"
                color="white"
                _hover={{ bg: 'green.700' }}
                onClick={handleUnsuspend}
                disabled={loading}
              >
                {loading ? 'Unsuspending...' : 'Unsuspend User'}
              </Button>
            ) : (
              <Button
                bg="orange.500"
                color="white"
                _hover={{ bg: 'orange.600' }}
                onClick={() => setShowSuspendModal(true)}
                disabled={user.isBanned}
              >
                Suspend User
              </Button>
            )}
          </HStack>
        </Box>
      </VStack>

      <BanModal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        user={user}
        onSuccess={onRefresh}
      />
      <SuspendModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        user={user}
        onSuccess={onRefresh}
      />
    </Box>
  );
}

// Main User Management Component
export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        alert('Failed to fetch users');
      }
    } catch (error) {
      alert('Error fetching users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    fetchUsers();
    setSelectedUser(null);
  };

  if (selectedUser) {
    return (
      <UserDetailsPanel 
        user={selectedUser} 
        onBack={() => setSelectedUser(null)}
        onRefresh={handleRefresh}
      />
    );
  }

  if (loading) {
    return (
      <Box bg="#1a1f3a" p={6} borderRadius="lg" w="full" textAlign="center">
        <Spinner size="xl" color="white" />
        <Text color="white" mt={4}>Loading users...</Text>
      </Box>
    );
  }

  return (
    <Box bg="#1a1f3a" p={6} borderRadius="lg" w="full">
      <VStack align="start" spacing={6}>
        <Flex w="full" direction={{ base: 'column', md: 'row' }} gap={4}>
          <Heading as="h3" size="lg" color="white">
            User Management ({filteredUsers.length})
          </Heading>
          <Spacer />
          <Input
            placeholder="Search by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="#0a0e27"
            borderColor="gray.600"
            color="white"
            w={{ base: 'full', md: '300px' }}
          />
        </Flex>

        <Box w="full" overflowX="auto">
          <VStack w="full" minW="800px">
            <Grid
              w="full"
              templateColumns="repeat(6, 1fr)"
              gap={4}
              px={4}
              py={3}
              borderBottom="2px solid"
              borderColor="gray.600"
            >
              <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Username</Text>
              <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Email</Text>
              <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Role</Text>
              <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Status</Text>
              <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Joined</Text>
              <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Actions</Text>
            </Grid>

            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const statusStyles = getStatusStyles(user);
                return (
                  <Grid
                    key={user._id}
                    w="full"
                    templateColumns="repeat(6, 1fr)"
                    gap={4}
                    px={4}
                    py={4}
                    borderRadius="md"
                    _hover={{ bg: '#2a2f4a' }}
                    transition="all 0.2s ease-in-out"
                    color="white"
                    borderBottom="1px solid"
                    borderColor="gray.700"
                    cursor="pointer"
                    onClick={() => setSelectedUser(user)}
                    alignItems="center"
                  >
                    <Text fontWeight="medium">{user.username}</Text>
                    <Text noOfLines={1} color="gray.300">{user.email}</Text>
                    <Text textTransform="capitalize">{user.role}</Text>
                    <Badge
                      bg={statusStyles.bg}
                      color={statusStyles.color}
                      py={1}
                      px={2}
                      borderRadius="md"
                      w="fit-content"
                    >
                      {statusStyles.label}
                    </Badge>
                    <Text color="gray.300">{new Date(user.createdAt).toLocaleDateString()}</Text>
                    <Text color="gray.400" fontSize="sm">View Details →</Text>
                  </Grid>
                );
              })
            ) : (
              <Text color="gray.400" p={10}>No users found matching your search.</Text>
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}