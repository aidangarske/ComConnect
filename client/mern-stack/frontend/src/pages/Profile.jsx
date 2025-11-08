import { useNavigate } from 'react-router-dom'
import { useRole } from '../components/RoleContext'
import { Box, HStack, VStack, Text, Button, Heading, Input, Image } from '@chakra-ui/react'

import comconnectLogo from "../logo/COMCONNECT_Logo.png";

export default function Profile() {
  const navigate = useNavigate()
  const { role } = useRole()
  const handleSave = () => {
    // Implement save functionality here
  }
  const getDashboardPath = () => {
    switch(role) {
      case 'seeker': return '/dashboard-seeker'
      case 'admin': return '/admin'
      default: return '/dashboard-provider'
    }
  }

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
              <Text color="#d97baa" fontSize="md" fontWeight="bold" cursor="pointer" onClick={() => navigate('/profile')}>
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
        <VStack align="start" spacing={8} w="full" maxW="600px">
          {/* Title Section */}
          <VStack align="start" spacing={4}>
            <Heading as="h1" size="2xl" color="white">
              My Profile
            </Heading>
            <Text color="#aaa" fontSize="md">
              View and manage your account information
            </Text>
          </VStack>

          {/* Profile Form */}
          <VStack spacing={6} w="full" align="stretch">
            {/* Name Field */}
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">
                Full Name
              </Text>
              <Input
                placeholder="John Doe"
                bg="#1a1f3a"
                border="1px solid #3a4456"
                borderRadius="md"
                color="white"
                _placeholder={{ color: '#666' }}
                _focus={{ borderColor: '#d97baa' }}
                py={3}
                fontSize="sm"
              />
            </VStack>

            {/* Email Field */}
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">
                Email
              </Text>
              <Input
                placeholder="john@example.com"
                type="email"
                bg="#1a1f3a"
                border="1px solid #3a4456"
                borderRadius="md"
                color="white"
                _placeholder={{ color: '#666' }}
                _focus={{ borderColor: '#d97baa' }}
                py={3}
                fontSize="sm"
              />
            </VStack>

            {/* Bio/About Field */}
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">
                About
              </Text>
              <Input
                placeholder="Tell us about yourself"
                bg="#1a1f3a"
                border="1px solid #3a4456"
                borderRadius="md"
                color="white"
                _placeholder={{ color: '#666' }}
                _focus={{ borderColor: '#d97baa' }}
                py={3}
                fontSize="sm"
              />
            </VStack>

            {/* Phone Field */}
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">
                Phone Number
              </Text>
              <Input
                placeholder="+1 (555) 123-4567"
                type="tel"
                bg="#1a1f3a"
                border="1px solid #3a4456"
                borderRadius="md"
                color="white"
                _placeholder={{ color: '#666' }}
                _focus={{ borderColor: '#d97baa' }}
                py={3}
                fontSize="sm"
              />
            </VStack>

            {/* Action Buttons */}
            <HStack spacing={4} w="full" pt={4}>
            <Button
                flex={1}
                bg="#d97baa"
                color="white"
                _hover={{ bg: '#c55a8f' }}
                py={6}
                borderRadius="md"
                fontWeight="bold"
                fontSize="md"
                onClick={handleSave}
            >
                Save Changes
            </Button>
            </HStack>
          </VStack>
        </VStack>
      </Box>
      <Box display="flex" justifyContent="flex-end" px={8} mt={4}>
        <Button
        colorScheme="pink"
        variant="outline"
        size="sm"
        onClick={() => navigate('/')}
        >
          Log Out
        </Button>
      </Box>
    </Box>
  )
}
