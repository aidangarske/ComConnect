import { useNavigate } from 'react-router-dom'
import { useRole } from '../components/RoleContext'
import { Box, HStack, VStack, Text, Button, Heading, Image } from '@chakra-ui/react'

import comconnectLogo from "../logo/COMCONNECT_Logo.png";

export default function Messages() {
  const navigate = useNavigate()
  const { role } = useRole()

  const getDashboardPath = () => {
    switch(role) {
      case 'seeker': return '/dashboard-seeker'
      case 'admin': return '/admin'
      default: return '/dashboard-provider'
    }
  }

  return (
    <Box minH="100vh" bg="#0f0f0f">
      {/* Header */}
      <Box bg="#0a0e27" borderBottom="1px solid #1a1f3a" py={4} px={8}>
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
              <Text color="white" fontSize="sm" cursor="pointer" onClick={() => navigate('/profile')}>
                Profile
              </Text>
              <Text color="#d97baa" fontSize="sm" fontWeight="bold" cursor="pointer" onClick={() => navigate('/messages')}>
                Messages
              </Text>
            </HStack>
          </HStack>
      </Box>

      {/* Main Content */}
      <Box py={8} px={8}>
        <VStack align="start" spacing={8} w="full" maxW="600px">
          {/* Title Section */}
          <VStack align="start" spacing={4}>
            <Heading as="h1" size="2xl" color="white">
              Messages
                      </Heading>
            <Text color="#aaa" fontSize="md">
              Your messaging feature is coming soon
                      </Text>
          </VStack>

          {/* Placeholder */}
          <Box bg="#1a1f3a" p={8} borderRadius="md" w="full">
            <Text color="#999" textAlign="center">
              Messaging system will be available soon. Stay tuned!
                </Text>
          </Box>
          </VStack>
      </Box>
    </Box>
  )
}
