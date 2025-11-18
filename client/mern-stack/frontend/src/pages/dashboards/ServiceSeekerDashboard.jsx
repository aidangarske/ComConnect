import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, HStack, VStack, Text, Button, Heading, Image, Wrap, WrapItem, Badge } from '@chakra-ui/react'
import { useRole } from '../../components/RoleContext'

// Imports static assets (logo and example profile picture).
import comconnectLogo from "../../logo/COMCONNECT_Logo.png";
import exampleProfilepic from "../../profile_picture/OIP.jpg";

const API_URL = 'http://localhost:8080/api';

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
 * Handles both mock and real provider data
 */
function ProviderCard({ provider, onHire }) {
  // Handle both mock and real provider data
  const username = provider.username || `@${provider.firstName?.toLowerCase() || 'user'}`
  const rating = provider.rating || 0
  const name = provider.name || `${provider.firstName} ${provider.lastName}`.trim() || 'Service Provider'
  const specialties = provider.specialties && provider.specialties.length > 0 
    ? provider.specialties 
    : ['Professional Services']
  const hourlyRate = provider.hourlyRate || 0
  const distance = provider.distance || 0
  
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
          {username}
        </Text>
        <Text fontSize="sm" color="white">{rating}⭐</Text>
      </HStack>

      {/* Circular profile image with pink border */}
      <Image 
        position="absolute" 
        borderRadius="50%" 
        boxSize="90px" 
        top="70px" 
        left="50%" 
        transform="translateX(-50%)" 
        src={provider.image || exampleProfilepic} 
        alt={name}
        border="3px solid #d97baa"
      />

      {/* Provider's full name - centered below image */}
      <Text 
        position="absolute" 
        fontSize="18px" 
        fontWeight="bold"
        left="50%" 
        top="165px" 
        color="white" 
        transform="translateX(-50%)"
        textAlign="center"
        maxW="90%"
        noOfLines={1}
      >
        {name}
      </Text>

      {/* List of services/skills the provider offers */}
      <VStack 
        position="absolute" 
        top="200px"
        left="50%" 
        transform="translateX(-50%)" 
        spacing={0}
        align="center"
        w="80%"
      >
        {specialties.slice(0, 2).map((specialty, idx) => (
          <Text key={idx} fontSize="xs" color="#aaa" noOfLines={1}>
            • {specialty}
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
        w="90%"
        noOfLines={1}
      >
        📍 {distance}mi | ${hourlyRate}/hr
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

  // Router navigation for clicks on logo and header links.
  const navigate = useNavigate()
  const { role } = useRole()
  const [filterType, setFilterType] = useState('Relevance')
  const [filteredProviders, setFilteredProviders] = useState([])
  const [realProviders, setRealProviders] = useState([])
  const [jobs, setJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [loadingProviders, setLoadingProviders] = useState(false)
  const [currentUserId, setCurrentUserId] = useState(null)
  const [deletingJobId, setDeletingJobId] = useState(null)

  // Fetch real jobs, providers, and current user on component mount
  useEffect(() => {
    fetchJobs()
    fetchProviders()
    fetchCurrentUser()

    // Refresh providers every 30 seconds
    const interval = setInterval(() => {
      fetchProviders()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true)
      const response = await fetch(`${API_URL}/jobs`)
      const data = await response.json()
      
      if (response.ok && data.jobs) {
        setJobs(data.jobs)
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
    } finally {
      setLoadingJobs(false)
    }
  }

  const fetchProviders = async () => {
    try {
      setLoadingProviders(true)
      const response = await fetch(`${API_URL}/users/providers`)
      const data = await response.json()
      if (response.ok && data.providers) {
        setRealProviders(data.providers)
        setFilteredProviders(data.providers)
      }
    } catch (err) {
      console.error('Failed to fetch providers:', err)
      // Fall back to mock providers if API fails
      setFilteredProviders(mockProviders)
    } finally {
      setLoadingProviders(false)
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (response.ok) {
        setCurrentUserId(data.id)
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err)
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return
    }

    setDeletingJobId(jobId)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Remove job from list
        setJobs(jobs.filter(job => job._id !== jobId))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete job')
      }
    } catch (err) {
      console.error('Delete job error:', err)
      alert('Connection error. Make sure backend is running.')
    } finally {
      setDeletingJobId(null)
    }
  }

  // Auto-refresh jobs when page regains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchJobs()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

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
    let sorted = [...realProviders]
    switch(filter) {
      case 'Price':
        sorted.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0))
        break
      case 'Location':
        sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0))
        break
      case 'Rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      default:
        // 'Relevance' - keep original order
        break
    }
    setFilteredProviders(sorted)
  }

  // Called when user clicks "Hire Now" button on a provider card
  const handleHireProvider = (provider) => {
    const name = provider.name || provider.firstName || 'Provider'
    alert(`You've selected ${name}! Sending hire request...`)
  }

  return (
    // Full page container with dark background
    <Box minH="100vh" bg="#0a0e27">
      {/* Header - White background with logo and navigation links */}
      <Box bg="white" borderBottom="1px solid #1a1f3a" py={4} px={8}>
        
        {/* Clickable brand logo; navigates via getDashboardPath() */}
          <HStack justify="space-between" align="center">
            {/* Logo */}
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
          <HStack w="full" justify="space-between" align="start">
            <VStack align="start" spacing={4} flex={1}>
              <Heading as="h1" size="2xl" color="white">
                Find the help you need.
              </Heading>
              <Text color="#aaa" fontSize="md">
                Search trusted providers, compare reviews, and book with confidence.
              </Text>
            </VStack>
            <Button
              bg="#d97baa"
              color="white"
              _hover={{ bg: '#c55a8f' }}
              fontWeight="bold"
              onClick={() => navigate('/create-job')}
              px={6}
              py={6}
              borderRadius="md"
            >
              + Post a Job
            </Button>
          </HStack>

          {/* Show posted jobs section - only for current user's jobs */}
          {currentUserId && jobs.filter(job => {
            // Handle both object and string formats for postedBy
            const jobPosterId = typeof job.postedBy === 'object' ? job.postedBy._id : job.postedBy
            return jobPosterId === currentUserId
          }).length > 0 && (
            <VStack align="start" w="full" spacing={4}>
              <Heading as="h2" size="lg" color="white">
                My Posted Jobs ({jobs.filter(job => {
                  const jobPosterId = typeof job.postedBy === 'object' ? job.postedBy._id : job.postedBy
                  return jobPosterId === currentUserId
                }).length})
              </Heading>
              <VStack w="full" spacing={3}>
                {jobs.filter(job => {
                  const jobPosterId = typeof job.postedBy === 'object' ? job.postedBy._id : job.postedBy
                  return jobPosterId === currentUserId
                }).map((job) => (
                  <Box
                    key={job._id}
                    w="full"
                    bg="#1a1f3a"
                    p={4}
                    borderRadius="md"
                    border="1px solid #3a4456"
                    _hover={{ borderColor: '#d97baa' }}
                    transition="all 0.2s"
                  >
                    <VStack align="start" w="full" spacing={3}>
                      <HStack w="full" justify="space-between" align="start">
                        <VStack align="start" flex={1} spacing={2}>
                          <Text color="white" fontWeight="bold" fontSize="md">{job.title}</Text>
                          <Text color="#aaa" fontSize="sm" maxW="300px" noOfLines={2}>{job.description}</Text>
                          <HStack spacing={4}>
                            <Badge bg="#d97baa" color="white">{job.category}</Badge>
                            <Text color="#999" fontSize="sm">Budget: ${job.budget}</Text>
                          </HStack>
                        </VStack>
                        <HStack spacing={2}>
                          <Button
                            bg="#d97baa"
                            color="white"
                            size="sm"
                            _hover={{ bg: '#c55a8f' }}
                            onClick={() => alert(`Job: ${job.title}\n\nDescription: ${job.description}\n\nBudget: $${job.budget}\n\nCategory: ${job.category}\n\nStatus: ${job.status}`)}
                          >
                            Details
                          </Button>
                          {/* Only show delete button if current user is the job creator */}
                          {currentUserId && (typeof job.postedBy === 'object' ? job.postedBy._id : job.postedBy) === currentUserId && (
                            <Button
                              bg="#dc3545"
                              color="white"
                              size="sm"
                              _hover={{ bg: '#c82333' }}
                              isDisabled={deletingJobId === job._id}
                              onClick={() => handleDeleteJob(job._id)}
                            >
                              {deletingJobId === job._id ? '...' : 'Delete'}
                            </Button>
                          )}
                        </HStack>
                      </HStack>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </VStack>
          )}

          {/* Filter buttons - click to sort providers by different criteria */}
          <HStack spacing={4} w="full" justify="space-between" align="center" flexWrap="wrap">
            <HStack spacing={3} align="center">
              <Heading as="h2" size="lg" color="white">
                Browse Service Providers
              </Heading>
              <Button
                size="xs"
                bg="transparent"
                color="#d97baa"
                border="1px solid #d97baa"
                _hover={{ bg: 'rgba(217, 123, 170, 0.1)' }}
                onClick={fetchProviders}
                isDisabled={loadingProviders}
              >
                {loadingProviders ? '⟳ Refreshing...' : '⟳ Refresh'}
              </Button>
            </HStack>
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
