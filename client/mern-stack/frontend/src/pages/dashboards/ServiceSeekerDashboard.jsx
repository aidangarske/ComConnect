import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, HStack, VStack, Text, Button, Heading, Image, Wrap, WrapItem, Badge } from '@chakra-ui/react'
import { useRole } from '../../components/RoleContext'

import comconnectLogo from "../../logo/COMCONNECT_Logo.png";
import exampleProfilepic from "../../profile_picture/OIP.jpg";

/**
 * Mock provider profiles data - used to display available service providers
 * Each provider has: id, username, name, rating, distance, image, specialties, and hourly rate
 * In production, this would come from a backend API
 */
const mockProviders = [
  {
    id: 1,
    username: '@johndoe',
    name: 'John Pork',
    rating: 4.8,
    distance: 2.7,
    image: exampleProfilepic,
    specialties: ['Manual Labor', 'Tutoring', 'Painting'],
    hourlyRate: 35
  },
  {
    id: 2,
    username: '@sarahjones',
    name: 'Sarah Jones',
    rating: 4.9,
    distance: 1.2,
    image: exampleProfilepic,
    specialties: ['Tutoring', 'Writing', 'Design'],
    hourlyRate: 50
  },
  {
    id: 3,
    username: '@mikedavis',
    name: 'Mike Davis',
    rating: 4.6,
    distance: 3.5,
    image: exampleProfilepic,
    specialties: ['Plumbing', 'Electrical', 'Repairs'],
    hourlyRate: 60
  },
  {
    id: 4,
    username: '@emilywilson',
    name: 'Emily Wilson',
    rating: 5.0,
    distance: 0.8,
    image: exampleProfilepic,
    specialties: ['Cleaning', 'Organization', 'Cooking'],
    hourlyRate: 40
  },
  {
    id: 5,
    username: '@tomanderson',
    name: 'Tom Anderson',
    rating: 4.7,
    distance: 2.1,
    image: exampleProfilepic,
    specialties: ['Landscaping', 'Yard Work', 'Maintenance'],
    hourlyRate: 45
  },
  {
    id: 6,
    username: '@alexchen',
    name: 'Alex Chen',
    rating: 4.9,
    distance: 1.9,
    image: exampleProfilepic,
    specialties: ['Web Design', 'Graphics', 'Branding'],
    hourlyRate: 75
  },
  {
    id: 7,
    username: '@lisabrown',
    name: 'Lisa Brown',
    rating: 4.8,
    distance: 4.2,
    image: exampleProfilepic,
    specialties: ['Photography', 'Editing', 'Videography'],
    hourlyRate: 80
  },
  {
    id: 8,
    username: '@roberttaylor',
    name: 'Robert Taylor',
    rating: 4.5,
    distance: 5.0,
    image: exampleProfilepic,
    specialties: ['Handyman', 'Assembly', 'Installation'],
    hourlyRate: 55
  },
];

/**
 * ProviderCard Component - displays individual provider profile in a beautiful card format
 * Features: profile image, specialties, rating, distance, hourly rate, and hire button
 * Includes hover effect (lifts up with shadow) for better interactivity
 */
function ProviderCard({ provider, onHire }) {
  return (
    <Box
      m="20px"
      bg="linear-gradient(135deg, rgba(255, 255, 255, 0.15) 100%, rgba(248, 63, 125, 0.1) 50%)"
      border="2px solid #d97baa"
      borderRadius="2xl"
      p={[6, 8]}
      backdropFilter="blur(10px)"
      width="320px"
      height="400px"
      cursor="pointer"
      position="relative"
      _hover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(217, 123, 170, 0.3)' }}
      transition="all 0.3s ease"
      onClick={() => onHire(provider)}
    >
      {/* Top section: Username (left) and Rating (right) */}
      <HStack position="absolute" top="20px" left="20px" right="20px" justify="space-between">
        <Text 
          fontSize="sm" 
          fontWeight="bold"
          color="#d97baa"
        >
          {provider.username}
        </Text>
        <Text fontSize="sm" color="white">{provider.rating}⭐</Text>
      </HStack>

      {/* Circular profile image with pink border */}
      <Image 
        position="absolute" 
        borderRadius="50%" 
        boxSize="90px" 
        top="70px" 
        left="50%" 
        transform="translateX(-50%)" 
        src={provider.image} 
        alt={provider.name}
        border="3px solid #d97baa"
      />

      {/* Provider's full name - centered below image */}
      <Text 
        position="absolute" 
        fontSize="22px" 
        fontWeight="bold"
        left="50%" 
        top="170px" 
        color="white" 
        transform="translateX(-50%)"
        textAlign="center"
      >
        {provider.name}
      </Text>

      {/* List of services/skills the provider offers */}
      <VStack 
        position="absolute" 
        top="210px"
        left="50%" 
        transform="translateX(-50%)" 
        spacing={1}
        align="center"
        w="90%"
      >
        {provider.specialties.map((specialty, idx) => (
          <Text key={idx} fontSize="sm" color="#aaa">
            - {specialty}
          </Text>
        ))}
      </VStack>

      {/* Distance from user and hourly rate - shown at bottom */}
      <Text 
        position="absolute" 
        fontSize="sm" 
        left="50%" 
        bottom="65px" 
        color="#aaa" 
        transform="translateX(-50%)"
        textAlign="center"
      >
        📍 {provider.distance} miles | ${provider.hourlyRate}/hr
      </Text>

      {/* Action button - click to send hire request */}
      <Button
        position="absolute"
        bottom="15px"
        left="50%"
        transform="translateX(-50%)"
        width="calc(100% - 40px)"
        bg="#d97baa"
        color="white"
        _hover={{ bg: '#c55a8f' }}
        borderRadius="md"
        fontSize="sm"
        fontWeight="bold"
      >
        Hire Now
      </Button>
    </Box>
  );
}

/**
 * ServiceSeekerDashboard - Main page for service seekers to find and hire providers
 * Features: filter system (by relevance, location, price, rating), provider cards with hire buttons
 */
export default function ServiceSeekerDashboard() {
  const navigate = useNavigate()
  const { role } = useRole()
  const [filterType, setFilterType] = useState('Relevance') // Tracks which filter button is active
  const [filteredProviders, setFilteredProviders] = useState(mockProviders) // Stores sorted providers

  // Returns the correct dashboard path based on user role
  const getDashboardPath = () => {
    switch(role) {
      case 'seeker': return '/dashboard-seeker'
      case 'admin': return '/admin'
      default: return '/dashboard-provider'
    }
  }

  /**
   * Handles filter button clicks - sorts providers based on selected filter
   * Supports: Relevance (original), Location (nearest), Price (cheapest), Rating (best)
   */
  const handleFilterChange = (filter) => {
    setFilterType(filter)
    let sorted = [...mockProviders]
    switch(filter) {
      case 'Price':
        sorted.sort((a, b) => a.hourlyRate - b.hourlyRate)
        break
      case 'Location':
        sorted.sort((a, b) => a.distance - b.distance)
        break
      case 'Rating':
        sorted.sort((a, b) => b.rating - a.rating)
        break
      default:
        // 'Relevance' - keep original order
        break
    }
    setFilteredProviders(sorted)
  }

  // Called when user clicks "Hire Now" button on a provider card
  const handleHireProvider = (provider) => {
    alert(`You've selected ${provider.name}! Sending hire request...`)
  }

  return (
    <Box minH="100vh" bg="#0a0e27">
      {/* Header - White background with logo and navigation links */}
      <Box bg="white" borderBottom="1px solid #1a1f3a" py={4} px={8}>
          <HStack justify="space-between" align="center">
            {/* Logo - clicking goes to home page */}
            <Image 
              src={comconnectLogo} 
              alt="ComConnect" 
              h={["80px", "80px", "80px"]}
              w="auto"
              objectFit="contain"
              maxW="100%"
              cursor="pointer"
              onClick={() => navigate('/')}
            />
            {/* Navigation links on the right */}
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

      {/* Main content area */}
      <Box py={8} px={8}>
        <VStack align="start" spacing={8} w="full">
          {/* Page title and description */}
          <VStack align="start" spacing={4}>
            <Heading as="h1" size="2xl" color="white">
              Find the help you need.
            </Heading>
            <Text color="#aaa" fontSize="md">
              Search trusted providers, compare reviews, and book with confidence.
            </Text>
          </VStack>

          {/* Filter buttons - click to sort providers by different criteria */}
          <HStack spacing={4} w="full" justify="space-between" flexWrap="wrap">
            <HStack spacing={2} flex={1}>
              {['Relevance', 'Location', 'Price', 'Rating'].map((filter) => (
                <Button
                  key={filter}
                  size="sm"
                  bg={filterType === filter ? '#d97baa' : 'transparent'} // Active filter is pink
                  color="white"
                  borderColor="#3a3f5e"
                  border="1px solid"
                  _hover={{ bg: '#d97baa' }}
                  onClick={() => handleFilterChange(filter)}
                  transition="all 0.2s"
                >
                  {filter}
                </Button>
              ))}
            </HStack>
          </HStack>

          {/* Grid of provider cards - displays all providers with hire buttons */}
          <VStack align="center" w="full">
            <Wrap spacingX="40px" spacingY="60px" justify="center" align="center" w="full">
              {filteredProviders.map((provider) => (
                <WrapItem key={provider.id}>
                  <ProviderCard provider={provider} onHire={handleHireProvider} />
                </WrapItem>
              ))}
            </Wrap>
          </VStack>
        </VStack>
      </Box>
    </Box>
  )
}
