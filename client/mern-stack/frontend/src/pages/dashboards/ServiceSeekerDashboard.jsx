import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, HStack, VStack, Text, Button, Heading, Wrap, WrapItem, Badge } from '@chakra-ui/react'
import { useRole } from '../../components/RoleContext'
// Import the utility function we created in Step 1
import { startChatWithRecipient } from '../../utils/chatUtils.js';
import JobDetailModal from '../../components/JobDetailModal';
import DirectHireModal from '../../components/DirectHireModal';
import ProviderDetailModal from '../../components/ProviderDetailModal';
import { toast } from 'react-toastify';
import { getSocket } from '../../utils/socket';
import { getToken } from '../../utils/tokenUtils';

import comconnectLogo from "../../logo/COMCONNECT_Logo.png";
import exampleProfilepic from "../../profile_picture/OIP.jpg";

const API_URL = 'http://localhost:8080/api';

// --- Mock Data (Keep this for fallback) ---
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
  // ... add other mock providers if you wish
];

// --- 1. Updated ProviderCard Component ---
// Simplified card that opens modal on click
function ProviderCard({ provider, onClick }) {
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
      height="380px"
      cursor="pointer"
      position="relative"
      _hover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(217, 123, 170, 0.3)' }}
      transition="all 0.3s ease"
      onClick={onClick}
    >
      {/* Top section */}
      <HStack position="absolute" top="20px" left="20px" right="20px" justify="space-between">
        <Text fontSize="sm" fontWeight="bold" color="#d97baa">{username}</Text>
        <Text fontSize="sm" color="white">{rating}⭐</Text>
      </HStack>

      {/* Profile Image */}
      <Box
        as="img"
        position="absolute" 
        borderRadius="50%" 
        boxSize="90px" 
        top="70px" 
        left="50%" 
        transform="translateX(-50%)" 
        src={provider.profilePicture || provider.image || exampleProfilepic} 
        alt={name}
        border="3px solid #d97baa"
        style={{ objectFit: 'cover' }}
      />

      {/* Name */}
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

      {/* Specialties Preview */}
      <VStack position="absolute" top="200px" left="50%" transform="translateX(-50%)" spacing={0} align="center" w="80%">
        {specialties.slice(0, 2).map((specialty, idx) => (
          <Text key={idx} fontSize="xs" color="#aaa" noOfLines={1}>• {specialty}</Text>
        ))}
        {specialties.length > 2 && (
          <Text fontSize="xs" color="#d97baa" noOfLines={1}>+{specialties.length - 2} more</Text>
        )}
      </VStack>

      {/* Info */}
      <Text position="absolute" fontSize="sm" left="50%" bottom="20px" color="#aaa" transform="translateX(-50%)" textAlign="center" w="90%" noOfLines={1}>
        📍 {distance}mi | ${hourlyRate}/hr
      </Text>
    </Box>
  );
}

export default function ServiceSeekerDashboard() {
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
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDirectHireModalOpen, setIsDirectHireModalOpen] = useState(false)
  const [isProviderDetailModalOpen, setIsProviderDetailModalOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState(null)

  useEffect(() => {
    fetchJobs()
    fetchProviders()
    fetchCurrentUser()
    const interval = setInterval(() => fetchProviders(), 30000)
    return () => clearInterval(interval)
  }, [])

  // Socket.io real-time updates
  useEffect(() => {
    const socket = getSocket();
    socket.on('jobCreated', handleJobCreated);
    socket.on('jobUpdated', handleJobUpdated);
    socket.on('jobApplication', handleJobApplication);

    return () => {
      socket.off('jobCreated', handleJobCreated);
      socket.off('jobUpdated', handleJobUpdated);
      socket.off('jobApplication', handleJobApplication);
    };
  }, [currentUserId]); // Removed jobs from dependencies to prevent re-subscribing

  const handleJobCreated = (data) => {
    // Add new job to the list if it belongs to current user
    if (data.job && currentUserId) {
      const jobPosterId = typeof data.job.postedBy === 'object' 
        ? data.job.postedBy._id 
        : data.job.postedBy;
      if (jobPosterId === currentUserId) {
        setJobs(prevJobs => {
          // Check if job already exists
          if (!prevJobs.find(j => j._id === data.job._id)) {
            return [data.job, ...prevJobs];
          }
          return prevJobs;
        });
      }
    }
  };

  const handleJobUpdated = (data) => {
    // Update job in the list
    if (data.jobId && data.job) {
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job._id === data.jobId ? data.job : job
        )
      );
    }
  };

  const handleJobApplication = (data) => {
    // Update job when new application is received
    if (data.jobId && data.job) {
      // Check if this is a new application for one of the user's jobs
      const jobPosterId = typeof data.job.postedBy === 'object' 
        ? data.job.postedBy._id 
        : data.job.postedBy;
      
      if (jobPosterId === currentUserId) {
        // Show notification for new application
        const providerName = data.application?.providerName || 'A provider';
        toast.info(`New application from ${providerName} for "${data.job.title}"! Click to view.`, {
          onClick: () => {
            setSelectedJobId(data.jobId);
            setIsModalOpen(true);
          },
          style: { cursor: 'pointer' }
        });
        
        // Auto-open modal if not already open
        if (!isModalOpen || selectedJobId !== data.jobId) {
          setSelectedJobId(data.jobId);
          setIsModalOpen(true);
        }
      }
      
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job._id === data.jobId ? data.job : job
        )
      );
    }
  };

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true)
      const response = await fetch(`${API_URL}/jobs`)
      const data = await response.json()
      if (response.ok && data.jobs) setJobs(data.jobs)
    } catch (err) { console.error('Failed to fetch jobs:', err) } 
    finally { setLoadingJobs(false) }
  }

  const fetchProviders = async () => {
    try {
      setLoadingProviders(true)
      const response = await fetch(`${API_URL}/users/providers`)
      const data = await response.json()
      if (response.ok && data.providers) {
        // Debug: Log provider data to see if email/phone are included
        console.log('Fetched providers:', data.providers.map(p => ({
          name: `${p.firstName} ${p.lastName}`,
          email: p.email,
          phone: p.phone,
          showEmail: p.privacySettings?.showEmail,
          showPhone: p.privacySettings?.showPhone
        })))
        
        // Map providers to ensure profilePicture is available as image for compatibility
        const mappedProviders = data.providers.map(provider => ({
          ...provider,
          image: provider.profilePicture || provider.image, // Map profilePicture to image for backward compatibility
          name: `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || provider.username || 'Service Provider',
          username: provider.username ? (provider.username.startsWith('@') ? provider.username : `@${provider.username}`) : `@${provider.firstName?.toLowerCase() || 'user'}`,
          rating: provider.rating || 0,
          hourlyRate: provider.hourlyRate || 0,
          specialties: provider.specialties || [],
          distance: provider.distance || 0
        }))
        setRealProviders(mappedProviders)
        setFilteredProviders(mappedProviders)
      }
    } catch (err) {
      console.error('Failed to fetch providers:', err)
      setFilteredProviders(mockProviders)
    } finally { setLoadingProviders(false) }
  }

  const fetchCurrentUser = async () => {
    try {
      const token = getToken()
      if (!token) return
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) setCurrentUserId(data.id)
    } catch (err) { console.error(err) }
  }

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job?')) return
    setDeletingJobId(jobId)
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) setJobs(jobs.filter(job => job._id !== jobId))
    } catch (err) { console.error(err) } 
    finally { setDeletingJobId(null) }
  }

  // --- Use the utility function ---
  const handleMessageProvider = (recipientId) => {
     // We pass the recipientId and the navigate function to our utility
     startChatWithRecipient(recipientId, navigate);
  };

  const handleFilterChange = (filter) => {
    setFilterType(filter)
    let sorted = [...realProviders]
    if (filter === 'Price') sorted.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0))
    setFilteredProviders(sorted)
  }

  const handleProviderCardClick = (provider) => {
    setSelectedProvider(provider)
    setIsProviderDetailModalOpen(true)
  }

  const handleHireProvider = (provider) => {
    setSelectedProvider(provider)
    setIsDirectHireModalOpen(true)
  }

  const handleDirectHireSuccess = () => {
    // Refresh jobs and providers after successful hire
    fetchJobs()
    fetchProviders()
  }

  return (
    <Box minH="100vh" bg="#0a0e27">
      <Box bg="white" borderBottom="1px solid #1a1f3a" py={4} px={8}>
          <HStack justify="space-between" align="center">
            <Box
              as="img"
              src={comconnectLogo} 
              alt="ComConnect" 
              h={["80px", "80px", "80px"]}
              w="auto"
              style={{ objectFit: 'contain' }}
              cursor="pointer"
              onClick={() => window.location.reload()}
            />
            <HStack spacing={6}>
              <Text color="black" fontSize="md" cursor="pointer" onClick={() => navigate('/profile')}>Profile</Text>
              <Text color="black" fontSize="md" cursor="pointer" onClick={() => navigate('/messages')}>Messages</Text>
            </HStack>
          </HStack>
      </Box>

      <Box py={8} px={8}>
        <VStack align="start" spacing={8} w="full">
          <HStack w="full" justify="space-between" align="start">
            <VStack align="start" spacing={4} flex={1}>
              <Heading as="h1" size="2xl" color="white">Find the help you need.</Heading>
              <Text color="#aaa" fontSize="md">Search trusted providers, compare reviews, and book with confidence.</Text>
            </VStack>
            <Button
              bg="#d97baa"
              color="white"
              _hover={{ bg: '#c55a8f' }}
              fontWeight="bold"
              onClick={() => navigate('/create-job')}
              px={6} py={6} borderRadius="md"
            >
              + Post a Job
            </Button>
          </HStack>

          {/* Posted Jobs Section */}
          {currentUserId && jobs.filter(job => {
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
                          <HStack spacing={2} align="center">
                            <Text color="white" fontWeight="bold" fontSize="md">{job.title}</Text>
                            <Badge
                              bg={
                                job.status === 'open' ? '#d97baa' :
                                job.status === 'in-progress' ? '#4CAF50' :
                                job.status === 'completed' ? '#2196F3' : '#999'
                              }
                              color="white"
                              fontSize="xs"
                            >
                              {job.status}
                            </Badge>
                            {job.applications && job.applications.length > 0 && (
                              <Badge bg="#3a3f5e" color="white" fontSize="xs">
                                {job.applications.length} {job.applications.length === 1 ? 'applicant' : 'applicants'}
                              </Badge>
                            )}
                          </HStack>
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
                            onClick={() => {
                              setSelectedJobId(job._id);
                              setIsModalOpen(true);
                            }}
                          >
                            Details
                          </Button>
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

          <HStack spacing={4} w="full" justify="space-between" align="center" flexWrap="wrap">
            <HStack spacing={3} align="center">
              <Heading as="h2" size="lg" color="white">Browse Service Providers</Heading>
              <Button
                size="xs" bg="transparent" color="#d97baa" border="1px solid #d97baa"
                _hover={{ bg: 'rgba(217, 123, 170, 0.1)' }}
                onClick={fetchProviders} isDisabled={loadingProviders}
              >
                {loadingProviders ? '⟳ Refreshing...' : '⟳ Refresh'}
              </Button>
            </HStack>
            <HStack spacing={2} flex={1}>
              {['Relevance', 'Location', 'Price', 'Rating'].map((filter) => (
                <Button
                  key={filter}
                  size="sm"
                  bg={filterType === filter ? '#d97baa' : 'transparent'}
                  color="white"
                  borderColor="#3a3f5e"
                  border="1px solid"
                  _hover={{ bg: '#d97baa' }}
                  onClick={() => handleFilterChange(filter)}
                >
                  {filter}
                </Button>
              ))}
            </HStack>
          </HStack>

          <VStack align="center" w="full">
            <Wrap spacingX="40px" spacingY="60px" justify="center" align="center" w="full">
              {filteredProviders.map((provider) => (
                <WrapItem key={provider.id || provider._id}>
                  <ProviderCard 
                    provider={provider} 
                    onClick={() => handleProviderCardClick(provider)}
                  />
                </WrapItem>
              ))}
            </Wrap>
          </VStack>
        </VStack>
      </Box>

      {/* Job Detail Modal */}
      <JobDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJobId(null);
        }}
        jobId={selectedJobId}
      />

      {/* Provider Detail Modal */}
      <ProviderDetailModal
        isOpen={isProviderDetailModalOpen}
        onClose={() => {
          setIsProviderDetailModalOpen(false);
          setSelectedProvider(null);
        }}
        provider={selectedProvider}
        onHire={handleHireProvider}
      />

      {/* Direct Hire Modal */}
      <DirectHireModal
        isOpen={isDirectHireModalOpen}
        onClose={() => {
          setIsDirectHireModalOpen(false);
          setSelectedProvider(null);
        }}
        provider={selectedProvider}
        onSuccess={handleDirectHireSuccess}
      />
    </Box>
  )
}