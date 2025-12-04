import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Box, HStack, VStack, Text, Button, Heading, Image } from '@chakra-ui/react';
import comconnectLogo from "../../logo/COMCONNECT_Logo.png"; 
import UserManagement from '../admin/UserManagement';       
import ContentManagement from '../admin/ContentManagement'; 

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation(); 

  const isActive = (path) => location.pathname === path;

  return (
    <Box minH="100vh" bg="#0a0e27">
      <Box bg="white" borderBottom="1px solid #1a1f3a" py={4} px={8}>
        <HStack justify="space-between" align="center">
          <Image 
            src={comconnectLogo} 
            alt="ComConnect" 
            h={["80px", "80px", "80px"]}
            w="auto"
            objectFit="contain"
            maxW="100%"
            cursor="pointer"
            onClick={() => window.location.reload()}
          />

          <HStack spacing={6}>
            <Text color="black" fontSize="md" cursor="pointer" onClick={() => navigate('/profile')}>
              Profile
            </Text>
            <Text color="black" fontSize="md" cursor="pointer" onClick={() => navigate('/messages')}>
              Messages
            </Text>
          </HStack>
        </HStack>
      </Box>

      <Box py={8} px={8}>
        <VStack align="start" spacing={8} w="full">
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
              {/* View Reports REMOVED */}
              {/* Settings REMOVED */}
            </HStack>
          </Box>

          <Box w="full" pt={4}>
            <Outlet />
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
