import { useNavigate } from 'react-router-dom'
import { Box, HStack, VStack, Text, Button, Heading } from '@chakra-ui/react'

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <Box minH="100vh" bg="#0f0f0f">
      {/* Header */}
      <Box bg="#0a0e27" borderBottom="1px solid #1a1f3a" py={4} px={8}>
          <HStack justify="space-between" align="center">
          <Text 
            fontWeight="bold" 
            fontSize="lg" 
                color="#d97baa"
            cursor="pointer"
            onClick={() => navigate('/')}
          >
            COMCONNECT ADMIN
          </Text>
          <HStack spacing={6}>
            <Text color="white" fontSize="sm" cursor="pointer" onClick={() => navigate('/profile')}>
              Profile
            </Text>
            <Text color="white" fontSize="sm" cursor="pointer" onClick={() => navigate('/messages')}>
              Messages
            </Text>
            <Text color="#d97baa" fontSize="sm" fontWeight="bold" cursor="pointer" onClick={() => navigate('/admin')}>
              Dashboard
            </Text>
          </HStack>
          </HStack>
      </Box>

      {/* Main Content */}
      <Box py={8} px={8}>
        <VStack align="start" spacing={8} w="full">
          {/* Title Section */}
          <VStack align="start" spacing={4}>
            <Heading as="h1" size="2xl" color="white">
              Admin Dashboard
            </Heading>
            <Text color="#aaa" fontSize="md">
              Manage users, transactions, and platform settings.
                        </Text>
          </VStack>

          {/* Admin Actions */}
          <HStack spacing={4}>
                <Button
              bg="#d97baa"
                  color="white"
              _hover={{ bg: '#c55a8f' }}
              onClick={() => {}}
                >
              Manage Users
                </Button>
                          <Button
              bg="#d97baa"
                            color="white"
              _hover={{ bg: '#c55a8f' }}
              onClick={() => {}}
                          >
              View Reports
                          </Button>
                          <Button
              bg="#d97baa"
                            color="white"
              _hover={{ bg: '#c55a8f' }}
              onClick={() => {}}
                          >
              Settings
                          </Button>
                        </HStack>
                      </VStack>
      </Box>
    </Box>
  )
}
