import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, HStack, VStack, Text, Button, Heading, Input, Image } from '@chakra-ui/react'

import comconnectLogo from "../../logo/COMCONNECT_Logo.png";

export default function ServiceSeekerDashboard() {
  const navigate = useNavigate()
  const [filterType, setFilterType] = useState('Relevance')

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
              <Text color="white" fontSize="sm" cursor="pointer" onClick={() => navigate('/messages')}>
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
              Find the help you need.
          </Heading>
          <Text color="#aaa" fontSize="md">
              Search trusted providers, compare reviews, and book with confidence.
          </Text>
        </VStack>

        {/* Search and Filters */}
          <HStack spacing={4} w="full" justify="space-between">
            <HStack spacing={2} flex={1}>
            {['Relevance', 'Location', 'Price', 'Rating'].map((filter) => (
              <Button
                key={filter}
                size="sm"
                bg={filterType === filter ? '#3a3f5e' : 'transparent'}
                color="white"
                borderColor="#3a3f5e"
                  border="1px solid"
                _hover={{ bg: '#3a3f5e' }}
                onClick={() => setFilterType(filter)}
              >
                {filter}
              </Button>
            ))}
          </HStack>
                    </HStack>
                  </VStack>
      </Box>
    </Box>
  )
}
