import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Box, HStack, VStack, Text, Button, Heading, Image } from '@chakra-ui/react';
import comconnectLogo from "../../logo/COMCONNECT_Logo.png"; // Make sure this path is correct

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation(); // Gets current browser location

  // Helper function to check if a navigation path is active
  const isActive = (path) => location.pathname === path;

  return (
    <Box minH="100vh" bg="#0a0e27">
      {/* --- 1. IMPROVED HEADER --- */}
      <Box bg="white" borderBottom="1px solid #1a1f3a" py={4} px={8}>
        <HStack justify="space-between" align="center">
          
          {/* Logo and Title are grouped on the left */}
          <HStack spacing={4} align="center" onClick={() => navigate('/')} cursor="pointer">
            <Image 
              src={comconnectLogo} 
              alt="ComConnect" 
              h="40px" // Smaller, cleaner logo size
            />
            <Heading as="h1" size="lg" color="black" letterSpacing="tight">
              ComConnect
            </Heading>
          </HStack>

          {/* Profile links are on the right */}
          <HStack spacing={6}>
            <Text 
              color="gray.600" 
              fontSize="md" 
              fontWeight="medium" 
              cursor="pointer"
              _hover={{ color: 'black' }}
              onClick={() => navigate('/profile')}
            >
              Profile
            </Text>
            <Text 
              color="gray.600" 
              fontSize="md" 
              fontWeight="medium" 
              cursor="pointer"
              _hover={{ color: 'black' }}
              onClick={() => navigate('/messages')}
            >
              Messages
            </Text>
          </HStack>
        </HStack>
      </Box>

      {/* --- 2. MAIN CONTENT AREA --- */}
      <Box py={8} px={8}>
        <VStack align="start" spacing={8} w="full">
          {/* Dashboard Title */}
          <VStack align="start" spacing={1}>
            <Heading as="h1" size="2xl" color="white">
              Admin Dashboard
            </Heading>
            <Text color="#aaa" fontSize="lg">
              Manage users, support tickets, and content, platform settings.
            </Text>
          </VStack>

          <Box bg="#1a1f3a" p={4} borderRadius="lg" w="full">
            <HStack spacing={4} wrap="wrap">
              <Button
                bg={isActive('/admin/users') ? '#d97baa' : '#2a2f4a'}
                color="white"
                _hover={{ bg: '#c55a8f' }}
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
              <Button
                bg={isActive('/admin/support') ? '#d97baa' : '#2a2f4a'}
                color="white"
                _hover={{ bg: '#c55a8f' }}
                onClick={() => navigate('/admin/support')}
              >
                Support Users
              </Button>
              <Button
                bg={isActive('/admin/content') ? '#d97baa' : '#2a2f4a'}
                color="white"
                _hover={{ bg: '#c55a8f' }}
                onClick={() => navigate('/admin/content')}
              >
                Manage Content
              </Button>
              <Button
                bg={isActive('/admin/reports') ? '#d97baa' : '#2a2f4a'}
                color="white"
                _hover={{ bg: '#c55a8f' }}
                onClick={() => navigate('/admin/reports')}
              >
                View Reports
              </Button>
              <Button
                bg={isActive('/admin/settings') ? '#d97baa' : '#2a2f4a'}
                color="white"
                _hover={{ bg: '#c55a8f' }}
                onClick={() => navigate('/admin/settings')}
              >
                Settings
              </Button>
            </HStack>
          </Box>

          {/* This Outlet renders your sub-pages */}
          <Box w="full" pt={4}>
            <Outlet />
          </Box>
          
        </VStack>
      </Box>
    </Box>
  );
}