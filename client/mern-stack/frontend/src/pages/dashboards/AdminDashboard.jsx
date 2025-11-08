import { useNavigate } from 'react-router-dom'
import { Box, HStack, VStack, Text, Button, Heading, Image } from '@chakra-ui/react'

import comconnectLogo from "../../logo/COMCONNECT_Logo.png";

export default function AdminDashboard() {
  const navigate = useNavigate()

  return (
    <Box minH="100vh" bg="#0a0e27">
      {/* Header */}
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
              onClick={() => navigate(getDashboardPath())}
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
