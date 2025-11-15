import { useState } from 'react';
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
} from '@chakra-ui/react';
import { mockUsers } from './mockData';

// Helper function for badge styles (used by both components)
const getStatusStyles = (status) => {
  switch (status) {
    case 'active':
      return { bg: 'green.500', color: 'white' };
    case 'banned':
      return { bg: 'red.500', color: 'white' };
    case 'pending':
      return { bg: 'yellow.400', color: 'black' };
    default:
      return { bg: 'gray.500', color: 'white' };
  }
};

function UserDetailsPanel({ user, onBack }) {
  // We don't need the duplicate getStatusStyles function here
  // It can use the one from the outer scope

  return (
    <Box bg="#1a1f3a" p={6} borderRadius="lg" w="full">
      <VStack align="start" spacing={6}>
        {/* Back Button */}
        <Button onClick={onBack} bg="#d97baa" color="white" _hover={{ bg: '#c55a8f' }}>
          &larr; Back to User List
        </Button>

        {/* User Info Box */}
        <Box w="full" bg="#2a2f4a" p={6} borderRadius="md">
          <VStack align="start" spacing={4}>
            <Heading as="h3" size="lg" color="white">{user.name}</Heading>
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
              <Text color="gray.200">{new Date(user.joinedDate).toLocaleDateString()}</Text>
            </HStack>
            <HStack>
              <Text color="gray.400" fontWeight="bold">Status:</Text>
              <Badge
                {...getStatusStyles(user.status)}
                py={1}
                px={2}
                borderRadius="md"
                textTransform="capitalize"
              >
                {user.status}
              </Badge>
            </HStack>
          </VStack>
        </Box>
        
        <Box w="full" bg="#2a2f4a" p={6} borderRadius="md">
          <Heading as="h4" size="md" color="white" mb={4}>
            Moderation Actions
          </Heading>
          
          {/* --- 1. ADD THE onClick HANDLERS HERE --- */}
          <HStack spacing={4}>
            <Button
              bg="red.600"
              color="white"
              _hover={{ bg: 'red.700' }}
              borderRadius="md"
              fontWeight="bold"
              size="md"
              onClick={() => alert(`Banning user: ${user.name}`)}
            >
              Ban User
            </Button>
            <Button
              bg="orange.500"
              color="white"
              _hover={{ bg: 'orange.600' }}
              borderRadius="md"
              fontWeight="bold"
              size="md"
              onClick={() => alert(`Suspending user: ${user.name}`)}
            >
              Suspend User
            </Button>
            <Button
              bg="gray.600"
              color="white"
              _hover={{ bg: 'gray.700' }}
              borderRadius="md"
              fontWeight="bold"
              size="md"
              onClick={() => alert(`Ignoring user: ${user.name}`)}
            >
              Ignore (No Action)
            </Button>
          </HStack>
        </Box>

        {/* User Logs Box */}
        <Box w="full" bg="#2a2f4a" p={6} borderRadius="md">
          <Heading as="h4" size="md" color="white" mb={4}>
            User Logs
          </Heading>
          <Box bg="#0a0e27" p={4} borderRadius="md" w="full" fontFamily="monospace" color="gray.300">
            <VStack align="start" spacing={2}>
              <Text>[2025-11-15 10:30 AM] User logged in.</Text>
              <Text>[2025-11-14 08:15 PM] User posted a new service.</Text>
              <Text>[2025-11-14 02:00 PM] User updated profile.</Text>
            </VStack>
          </Box>
        </Box>
      </VStack>
    </Box>
  );
}

// --- Main User Management Component ---
export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBanUser = (e, userId) => {
    e.stopPropagation();
    alert(`Banning user: ${userId}`);
  };

  const handleSuspendUser = (e, userId) => {
    e.stopPropagation();
    alert(`Suspending user: ${userId}`);
  };

  if (selectedUser) {
    return (
      <UserDetailsPanel 
        user={selectedUser} 
        onBack={() => setSelectedUser(null)} 
      />
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
            placeholder=" Search by name or email..."
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
            {/* --- 2. FIXED THE EMPTY HEADER GRID --- */}
            <Grid
              w="full"
              templateColumns="repeat(6, 1fr)"
              gap={4}
              px={4}
              py={3}
              borderBottom="2px solid"
              borderColor="gray.600"
            >
              <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Name</Text>
              <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Email</Text>
              <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Role</Text>
              <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Status</Text>
              <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Joined</Text>
              <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Actions</Text>
            </Grid>

            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Grid
                  key={user.id}
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
                  <Text fontWeight="medium">{user.name}</Text>
                  <Text noOfLines={1} color="gray.300">{user.email}</Text>
                  <Text textTransform="capitalize">{user.role}</Text>
                  <Text>
                    <Badge
                      {...getStatusStyles(user.status)}
                      py={1}
                      px={2}
                      borderRadius="md"
                      textTransform="capitalize"
                    >
                      {user.status}
                    </Badge>
                  </Text>
                  <Text color="gray.300">{new Date(user.joinedDate).toLocaleDateString()}</Text>
                  
                  <HStack spacing={2}>
                    <Button
                      size="xs"
                      bg="red.600"
                      color="white"
                      _hover={{ bg: 'red.700' }}
                      onClick={(e) => handleBanUser(e, user.id)}
                    >
                      Ban
                    </Button>
                    <Button
                      size="xs"
                      bg="orange.500"
                      color="white"
                      _hover={{ bg: 'orange.600' }}
                      onClick={(e) => handleSuspendUser(e, user.id)}
                    >
                      Suspend
                    </Button>
                  </HStack>
                </Grid>
              ))
            ) : (
              <Text color="gray.400" p={10}>No users found matching your search.</Text>
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}