// Imports React's useState hook for local component state
import { useState } from 'react'

// Imports React Router's navigation hook to programmatically change routes
import { useNavigate } from 'react-router-dom'

// Imports Chakra UI components for layout and styling primitives
import { Box, HStack, VStack, Text, Button, Heading, Image, Wrap, WrapItem } from '@chakra-ui/react'

// Imports static assets (logo and example profile picture).
import comconnectLogo from "../../logo/COMCONNECT_Logo.png";
import exampleProfilepic from "../../profile_picture/OIP.jpg";

/**
 * Stateless helper that renders a single "user card".
 * - Uses a glassmorphism-style gradient background with a subtle blur.
 * - Absolutely-positioned child elements place username, rating, avatar, name, skills, and distance.
 * - Entire card is clickable; currently shows an alert on click.
 */
function generateUserDiv(){
  return(     
    <Box
      m="20px"
      bg="linear-gradient(135deg, rgba(255, 255, 255, 0.15) 100%, rgba(248, 63, 125, 0.1) 50%)"
      border="2px solid #d97baa"
      borderRadius="2xl"
      p={[6, 8]}
      backdropFilter="blur(10px)"
      width="300px"
      height="350px"
      cursor="pointer"
      onClick={() => alert('User Selected')}
    >
      {/* Username (top-left) */}
      <Text position="absolute" fontSize="xl" left="5px" top="5px" color="white">@theBoy10</Text>
      
      {/* Circular avatar centered near the top third */}
      <Text position="absolute" fontSize="xl" right="5px" top="5px" color="white">4.7⭐</Text>
      
      {/* Circular avatar centered near the top third */}
      <Image position="absolute" borderRadius="50%" boxSize="100px" top="25%" left="50%" transform="translate(-50%, -50%)" src={exampleProfilepic} alt="Profile Picture" />
      
      {/* Skill tags (stacked lines) */}
      <Text position="absolute" fontSize="25px" left="50%" top="50%" color="white" transform="translate(-50%, -50%)">John Pork</Text>
      <Text position="absolute" fontSize="md" left="50%" top="65%" color="white" transform="translate(-50%, -50%)">- Manual Labor</Text>
      <Text position="absolute" fontSize="md" left="50%" top="72%" color="white" transform="translate(-50%, -50%)">- Tutoring</Text>
      <Text position="absolute" fontSize="md" left="50%" top="79%" color="white" transform="translate(-50%, -50%)">- Painting</Text>
      
      {/* Distance (bottom-center) */}
      <Text position="absolute" fontSize="sm" left="50%" transform="translate(-50%, -50%)" bottom="5px" color="white">📍2.7 miles</Text>
    </Box>
    );
}


/**
 * ServiceSeekerDashboard
 * - Page shell containing header (logo + nav) and main content.
 * - Lets users toggle a filter type (Relevance/Location/Price/Rating).
 * - Shows a responsive grid of example provider cards.
 */
export default function ServiceSeekerDashboard() {

  // Router navigation for clicks on logo and header links.
  const navigate = useNavigate()

  // Tracks the active filter pill in the UI.
  const [filterType, setFilterType] = useState('Relevance')

  return (
    // Full page container with dark background
    <Box minH="100vh" bg="#0a0e27">

      {/* Header */}
      <Box bg="white" borderBottom="1px solid #1a1f3a" py={4} px={8}>
        
        {/* Clickable brand logo; navigates via getDashboardPath() */}
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

            {/* Simple header nav links */}
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
              Find the help you need.
          </Heading>
          <Text color="#aaa" fontSize="md">
              Search trusted providers, compare reviews, and book with confidence.
          </Text>
        </VStack>

        {/*Filters */}
          <HStack spacing={4} w="full" justify="space-between">
            {/* Filter pill group; highlights the active filterType */}
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

            {/* CTA to post a new job; right-aligned within the row */}
            <Button
              ml="auto"
              alignSelf="flex-start"
              size="sm"
              bg="#ff6b81"
              color="white"
              border="1px solid rgba(255,255,255,0.12)"
              _hover={{ bg: "#ff4f6f" }}
              onClick={() => alert('Posting a job...')}
            >
              Post Job
            </Button>
          </HStack>
        </HStack>

        {/* Card Grid (responsive). Wrap auto-flows to new rows. */}
        <VStack align="center">
          <Wrap spacingX="80px" spacingY="60px" justify="center" align="center">
            {/* Eight sample user cards */}
            <WrapItem>{generateUserDiv()}</WrapItem>
            <WrapItem>{generateUserDiv()}</WrapItem>
            <WrapItem>{generateUserDiv()}</WrapItem>
            <WrapItem>{generateUserDiv()}</WrapItem>
            <WrapItem>{generateUserDiv()}</WrapItem>
            <WrapItem>{generateUserDiv()}</WrapItem>
            <WrapItem>{generateUserDiv()}</WrapItem>
            <WrapItem>{generateUserDiv()}</WrapItem>
          </Wrap>
        </VStack>
      </VStack>
      </Box>
    </Box>
  )
}
