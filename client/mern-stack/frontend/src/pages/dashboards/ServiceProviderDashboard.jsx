import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, HStack, VStack, Text, Button, Heading, Image, Wrap, WrapItem, Badge } from '@chakra-ui/react'
import { useRole } from '../../components/RoleContext'

import comconnectLogo from "../../logo/COMCONNECT_Logo.png";
import exampleProfilepic from "../../profile_picture/OIP.jpg";

const API_URL = 'http://localhost:8080/api';

/**
 * Mock job postings data - sample jobs that service providers can apply to
 * Each job includes: title, price, distance, time estimate, category, poster info, rating
 * In production, this would come from a backend API
 */
const mockJobs = [
  {
    id: 1,
    title: 'Mount TV to wall',
    price: 25,
    distance: 5.7,
    time: '~1hr',
    category: 'manual labor',
    poster: '@johndoe',
    rating: 4.8,
    image: exampleProfilepic,
    name: 'John Smith'
  },
  {
    id: 2,
    title: 'Calculus 1 Tutoring',
    price: 50,
    distance: 1.3,
    time: '~1.5 hr',
    category: 'math',
    poster: '@mathteacher',
    rating: 4.9,
    image: exampleProfilepic,
    name: 'Sarah Johnson'
  },
  {
    id: 3,
    title: 'Lawn Mowing',
    price: 40,
    distance: 0.8,
    time: '~2hrs',
    category: 'gardening',
    poster: '@gardener',
    rating: 4.6,
    image: exampleProfilepic,
    name: 'Mike Davis'
  },
  {
    id: 4,
    title: 'Piano Lessons',
    price: 60,
    distance: 3.2,
    time: '~1hr',
    category: 'music',
    poster: '@pianist',
    rating: 5.0,
    image: exampleProfilepic,
    name: 'Emma Wilson'
  },
  {
    id: 5,
    title: 'House Cleaning',
    price: 80,
    distance: 2.1,
    time: '~3hrs',
    category: 'cleaning',
    poster: '@cleaner',
    rating: 4.7,
    image: exampleProfilepic,
    name: 'Lisa Brown'
  },
  {
    id: 6,
    title: 'Car Wash',
    price: 35,
    distance: 1.5,
    time: '~45min',
    category: 'automotive',
    poster: '@carwash',
    rating: 4.5,
    image: exampleProfilepic,
    name: 'Tom Anderson'
  },
  {
    id: 7,
    title: 'Web Design',
    price: 200,
    distance: 0.0,
    time: '~5days',
    category: 'design',
    poster: '@webdesigner',
    rating: 4.9,
    image: exampleProfilepic,
    name: 'Alex Chen'
  },
  {
    id: 8,
    title: 'Furniture Assembly',
    price: 55,
    distance: 2.8,
    time: '~2hrs',
    category: 'assembly',
    poster: '@handyman',
    rating: 4.8,
    image: exampleProfilepic,
    name: 'Robert Taylor'
  },
];

/**
 * JobCard Component - displays individual job posting in a beautiful card format
 * Shows job title, price, person posting it, their profile, rating, and apply button
 * Includes hover effect (lifts up with shadow) for better interactivity
 * Handles both mock jobs and real API jobs
 */
function JobCard({ job, onApply }) {
  // Handle both mock and real job data
  const title = job.title || 'Untitled Job'
  const price = job.price || job.budget || 0
  const rating = job.rating || job.posterRating || 0
  const name = job.name || job.posterName || 'Unknown'
  const poster = job.poster || `@${job.posterName?.toLowerCase().replace(' ', '') || 'user'}`
  
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
      onClick={() => onApply(job)}
    >
      {/* Top section: Job title (left) and price (right) */}
      <Text 
        position="absolute" 
        fontSize="lg" 
        fontWeight="bold"
        left="20px" 
        top="20px" 
        color="white"
        maxW="260px"
      >
        {title}
      </Text>

      {/* Price and person's rating - shows what they're paying and how good the poster is */}
      <HStack position="absolute" right="20px" top="20px" spacing={4}>
        <Text fontSize="lg" fontWeight="bold" color="#d97baa">${price}</Text>
        <Text fontSize="sm" color="white">{rating}⭐</Text>
      </HStack>

      {/* Circular profile picture of the person posting the job */}
      <Image 
        position="absolute" 
        borderRadius="50%" 
        boxSize="80px" 
        top="80px" 
        left="50%" 
        transform="translateX(-50%)" 
        src={job.image || exampleProfilepic} 
        alt="Profile" 
      />

      {/* Full name of the person who posted this job */}
      <Text 
        position="absolute" 
        fontSize="18px" 
        fontWeight="bold"
        left="50%" 
        top="160px" 
        color="white" 
        transform="translateX(-50%)"
      >
        {name}
      </Text>

      {/* Username handle of the job poster */}
      <Text 
        position="absolute" 
        fontSize="sm" 
        left="50%" 
        top="190px" 
        color="#d97baa" 
        transform="translateX(-50%)"
        fontWeight="600"
      >
        {poster}
      </Text>

      {/* Bottom section: Job category badge, distance, and time estimate */}
      <VStack 
        position="absolute" 
        bottom="80px" 
        left="50%" 
        transform="translateX(-50%)" 
        spacing={1}
        align="center"
      >
        <Badge bg="#3a3f5e" color="white" px={3} py={1} borderRadius="full">
          {job.category}
        </Badge>
        <Text fontSize="sm" color="#aaa">{job.distance} miles | {job.time}</Text>
      </VStack>

      {/* Action button - click to apply for this job */}
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
        Apply Now
      </Button>
    </Box>
  );
}

/**
 * ServiceProviderDashboard - Main page for service providers to find and apply for jobs
 * Features: filter system (by relevance, location, price, rating), job cards with apply buttons
 */
export default function ServiceProviderDashboard() {
  const navigate = useNavigate()
  const { role } = useRole()
  const [filterType, setFilterType] = useState('Relevance')
  const [filteredJobs, setFilteredJobs] = useState([])
  const [realJobs, setRealJobs] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch real jobs on mount
  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/jobs`)
      const data = await response.json()
      if (response.ok && data.jobs) {
        setRealJobs(data.jobs)
        setFilteredJobs(data.jobs)
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
      // Fall back to mock jobs if API fails
      setFilteredJobs(mockJobs)
    } finally {
      setLoading(false)
    }
  }

  // Returns the correct dashboard path based on user role
  const getDashboardPath = () => {
    switch(role) {
      case 'seeker': return '/dashboard-seeker'
      case 'admin': return '/admin'
      default: return '/dashboard-provider'
    }
  }

  /**
   * Handles filter button clicks - sorts jobs based on selected filter
   * Supports: Relevance (original), Location (nearest), Price (highest paying), Rating (best rated)
   */
  const handleFilterChange = (filter) => {
    setFilterType(filter)
    let sorted = [...realJobs]
    switch(filter) {
      case 'Price':
        sorted.sort((a, b) => a.budget - b.budget)
        break
      case 'Location':
        sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0))
        break
      case 'Rating':
        sorted.sort((a, b) => (b.posterRating || 0) - (a.posterRating || 0))
        break
      default:
        // 'Relevance' - keep original order
        break
    }
    setFilteredJobs(sorted)
  }

  // Called when user clicks "Apply Now" button on a job card
  const handleApplyJob = (job) => {
    alert(`Applied to: ${job.title} by ${job.name}!`)
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
              Provide help where it's needed.
            </Heading>
            <Text color="#aaa" fontSize="md">
              Discover nearby jobs that match your skills and schedule.
            </Text>
          </VStack>

          {/* Filter buttons - click to sort jobs by different criteria */}
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

          {/* Grid of job cards - displays all available jobs with apply buttons */}
          <VStack align="center" w="full">
            <Wrap spacingX="40px" spacingY="60px" justify="center" align="center" w="full">
              {filteredJobs.map((job) => (
                <WrapItem key={job.id}>
                  <JobCard job={job} onApply={handleApplyJob} />
                </WrapItem>
              ))}
            </Wrap>
          </VStack>
        </VStack>
      </Box>
    </Box>
  )
}
