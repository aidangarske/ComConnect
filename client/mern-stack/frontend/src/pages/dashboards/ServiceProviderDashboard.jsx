import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, HStack, VStack, Text, Button, Heading, Image, Wrap, WrapItem, Badge, Spinner } from '@chakra-ui/react'
import { toast } from 'react-toastify'
import { useRole } from '../../components/RoleContext'
import JobDetailModal from '../../components/JobDetailModal';
import { jwtDecode } from 'jwt-decode';
import { getToken } from '../../utils/tokenUtils';
import { getSocket } from '../../utils/socket';

import comconnectLogo from "../../logo/COMCONNECT_Logo.png";
import exampleProfilepic from "../../profile_picture/OIP.jpg";

const API_URL = 'http://localhost:8080/api';

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 3959; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); 
}

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


function JobCard({ job, onApply, onCardClick, user }) {
  const title = job.title || 'Untitled Job'
  const price = job.price || job.budget || 0
  const rating = job.rating || job.posterRating || 0
  const name = job.name || job.posterName || 'Unknown'
  const poster = job.poster || `@${job.posterName?.toLowerCase().replace(' ', '') || 'user'}`

  const formatDistance = (dist) => {
    if (job.isRemote) return 'Remote'; 
    if (!dist) return 'Location Unknown'; 
    const numDist = parseFloat(dist);
    if (numDist > 10000) return 'Location Unknown'; 
    return `${numDist.toFixed(1)} miles`;
  };

  const formatDuration = (duration) => {
    if (!duration) return '';
    const durString = duration.toString();
    if (/[a-zA-Z]/.test(durString)) return durString;
    return `${durString} hrs`;
  };
  
  const hasApplied = user && job.applications?.some(
    app => (app.providerId?._id || app.providerId) === user.id
  );
  
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
      onClick={() => onCardClick && onCardClick(job)}
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
        noOfLines={2}
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
        bottom="85px" 
        left="0" 
        right="0" 
        spacing={3}
      >
        <Badge 
          bg="rgba(217, 123, 170, 0.15)" 
          color="#d97baa" 
          px={3} 
          py={1} 
          borderRadius="full" 
          fontSize="xs"
          border="1px solid rgba(217, 123, 170, 0.3)"
          textTransform="capitalize"
        >
          {job.category}
        </Badge>
        <HStack spacing={2} color="gray.400" fontSize="xs" fontWeight="medium">
          <Text>📍 {formatDistance(job.distance)}</Text>
          {(job.time || job.estimatedDuration) && (
            <>
              <Text color="gray.600">•</Text>
              <Text>⏱ {formatDuration(job.time || job.estimatedDuration)}</Text>
            </>
          )}
        </HStack>
      </VStack>

      {/* Action button - click to apply for this job */}
      <Button
        position="absolute"
        bottom="15px"
        left="50%"
        transform="translateX(-50%)"
        width="calc(100% - 40px)"
        bg={hasApplied ? "#3a3f5e" : "#d97baa"}
        color="white"
        _hover={{ bg: hasApplied ? "#3a3f5e" : '#c55a8f' }}
        borderRadius="md"
        fontSize="sm"
        fontWeight="bold"
        isDisabled={hasApplied}
        onClick={(e) => {
          e.stopPropagation();
          onApply(job, e);
        }}
      >
        {hasApplied ? 'Already Applied' : 'Apply Now'}
      </Button>
    </Box>
  );
}

export default function ServiceProviderDashboard() {
  const navigate = useNavigate()
  const { role, user } = useRole()
  const [filterType, setFilterType] = useState('Relevance')
  const [filteredJobs, setFilteredJobs] = useState([])
  const [realJobs, setRealJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hireRequests, setHireRequests] = useState([])
  const [loadingHireRequests, setLoadingHireRequests] = useState(false)

  // Fetch real jobs and hire requests on mount
  useEffect(() => {
    fetchJobs()
    fetchHireRequests()
  }, [])

  // Socket.io real-time updates
  useEffect(() => {
    const socket = getSocket();
    socket.on('jobCreated', handleJobCreated);
    socket.on('jobUpdated', handleJobUpdated);
    socket.on('directHireRequest', handleDirectHireRequest);

    return () => {
      socket.off('jobCreated', handleJobCreated);
      socket.off('jobUpdated', handleJobUpdated);
      socket.off('directHireRequest', handleDirectHireRequest);
    };
  }, [user?.id]); // Only depend on user.id to prevent re-subscribing

  const handleDirectHireRequest = (data) => {
    // Check if this notification is for the current user
    if (user && data.providerId === user.id) {
      toast.info(`New hire request from ${data.seekerName} for "${data.job.title}"!`, {
        duration: 5000,
      });
      // Refresh hire requests
      fetchHireRequests();
    }
  };

  const handleJobCreated = (data) => {
    // Add new job to the list (only open jobs)
    if (data.job && data.job.status === 'open') {
      setRealJobs(prevJobs => {
        // Check if job already exists
        if (!prevJobs.find(j => j._id === data.job._id)) {
          return [data.job, ...prevJobs];
        }
        return prevJobs;
      });
      setFilteredJobs(prevJobs => {
        if (!prevJobs.find(j => j._id === data.job._id)) {
          return [data.job, ...prevJobs];
        }
        return prevJobs;
      });
    }
  };

  const handleJobUpdated = (data) => {
    if (data.jobId && data.job) {
      setRealJobs(prevJobs => 
        prevJobs.map(job => 
          job._id === data.jobId ? data.job : job
        ).filter(job => job.status === 'open' || job.status === 'approved') // Allow approved!
      );
      setFilteredJobs(prevJobs => 
        prevJobs.map(job => 
          job._id === data.jobId ? data.job : job
        ).filter(job => job.status === 'open' || job.status === 'approved') // Allow approved!
      );
      fetchHireRequests();
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true)
      let queryParams = ''
      let userCoordinates = null
      const token = getToken()
      if (token) {
        try {
          const profileResponse = await fetch(`${API_URL}/users/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const profileData = await profileResponse.json()
          
          if (profileData.location && profileData.location.coordinates) {
            const [lng, lat] = profileData.location.coordinates
            if (lat !== 0 || lng !== 0) {
              userCoordinates = [lng, lat]
              queryParams = `?lat=${lat}&lng=${lng}&distance=50`
            }
          }
        } catch (err) {
          console.warn("Could not fetch location, defaulting to all jobs")
        }
      }
      const response = await fetch(`${API_URL}/jobs${queryParams}`)
      const data = await response.json()
      if (response.ok && data.jobs) {
        const jobsWithDistance = data.jobs.map(job => {
          let dist = null;
          if (userCoordinates && job.location && job.location.coordinates) {
            const [userLng, userLat] = userCoordinates;
            const [jobLng, jobLat] = job.location.coordinates;
            dist = calculateDistance(userLat, userLng, jobLat, jobLng);
          }
          return { ...job, distance: dist };
        });

        setRealJobs(jobsWithDistance);
        setFilteredJobs(jobsWithDistance);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
      // Fall back to mock jobs if API fails
      setFilteredJobs(mockJobs)
    } finally {
      setLoading(false)
    }
  }

  const fetchHireRequests = async () => {
    if (!user) return;
    try {
      setLoadingHireRequests(true);
      const token = getToken();
      const response = await fetch(`${API_URL}/jobs/hire-requests/my`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.hireRequests) {
        setHireRequests(data.hireRequests);
      }
    } catch (err) {
      console.error('Failed to fetch hire requests:', err);
    } finally {
      setLoadingHireRequests(false);
    }
  }

  const handleAcceptHireRequest = async (jobId) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/jobs/${jobId}/accept-hire-request`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Hire request accepted!');
        fetchHireRequests();
        fetchJobs();
      } else {
        toast.error(data.error || 'Failed to accept hire request');
      }
    } catch (err) {
      console.error('Failed to accept hire request:', err);
      toast.error('Failed to accept hire request');
    }
  }

  const handleRejectHireRequest = async (jobId) => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/jobs/${jobId}/reject-hire-request`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Hire request rejected');
        fetchHireRequests();
      } else {
        toast.error(data.error || 'Failed to reject hire request');
      }
    } catch (err) {
      console.error('Failed to reject hire request:', err);
      toast.error('Failed to reject hire request');
    }
  }

  // Returns the correct dashboard path based on user role
  const getDashboardPath = () => {
    // Always read from token to avoid stale role from context
    const token = getToken();
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        const currentRole = decodedUser.role;
        switch(currentRole) {
          case 'seeker': return '/dashboard-seeker'
          case 'admin': return '/admin'
          default: return '/dashboard-provider'
        }
      } catch (e) {
        return '/login';
      }
    }
    return '/login';
  }

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
  const handleApplyJob = async (job, e) => {
    if (e) {
      e.stopPropagation();
    }

    if (!user) {
      toast.error('Please log in to apply');
      return;
    }

    // Check if already applied
    const hasApplied = job.applications?.some(
      app => (app.providerId?._id || app.providerId) === user.id
    );

    if (hasApplied) {
      toast.info('You have already applied for this job');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/jobs/${job._id}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Application submitted successfully!');
        // Refresh jobs to get updated application status
        fetchJobs();
      } else {
        toast.error(data.error || 'Failed to apply');
      }
    } catch (err) {
      console.error('Failed to apply:', err);
      toast.error('Failed to submit application');
    }
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
              onClick={() => window.location.reload()}
            />

            <HStack spacing={6}>
              <Text color="black" fontSize="md" cursor="pointer" onClick={() => navigate('/profile')}>
                Profile
              </Text>
              <Text color="black" fontSize="md" cursor="pointer" onClick={() => navigate('/messages')}>
                Messages
              </Text>
              <Text color="black" fontSize="md" cursor="pointer" onClick={() => navigate('/support')}>
                Support
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

          {/* Pending Hire Requests Section */}
          {hireRequests.length > 0 && (
            <Box w="full" bg="#1a1f3a" p={6} borderRadius="md" border="1px solid #3a4456">
              <VStack align="start" spacing={4} w="full">
                <HStack justify="space-between" w="full" align="center">
                  <Heading as="h2" size="lg" color="white">
                    Hire Requests ({hireRequests.length})
                  </Heading>
                  <Button
                    size="sm"
                    bg="transparent"
                    color="#d97baa"
                    border="1px solid #d97baa"
                    _hover={{ bg: 'rgba(217, 123, 170, 0.1)' }}
                    onClick={fetchHireRequests}
                    isDisabled={loadingHireRequests}
                  >
                    {loadingHireRequests ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </HStack>
                <VStack spacing={3} w="full" align="stretch">
                  {hireRequests.map((job) => {
                    const seekerName = job.postedBy 
                      ? `${job.postedBy.firstName} ${job.postedBy.lastName}`.trim() || job.postedBy.username
                      : job.posterName || 'Unknown Seeker';
                    return (
                      <Box
                        key={job._id}
                        w="full"
                        p={4}
                        bg="#0a0e27"
                        borderRadius="md"
                        border="1px solid #d97baa"
                      >
                        <VStack align="start" spacing={3} w="full">
                          <HStack justify="space-between" w="full" align="start">
                            <VStack align="start" spacing={2} flex={1}>
                              <HStack spacing={2}>
                                <Text color="white" fontWeight="bold" fontSize="lg">{job.title}</Text>
                                <Badge bg="#d97baa" color="white" fontSize="xs">Hire Request</Badge>
                              </HStack>
                              <Text color="#aaa" fontSize="sm" noOfLines={2}>{job.description}</Text>
                              <HStack spacing={4}>
                                <Badge bg="#3a3f5e" color="white">{job.category}</Badge>
                                <Text color="#999" fontSize="sm">${job.budget}</Text>
                                <Text color="#999" fontSize="sm">From: {seekerName}</Text>
                              </HStack>
                            </VStack>
                          </HStack>
                          <HStack spacing={3} w="full" justify="flex-end">
                            <Button
                              size="sm"
                              bg="#dc3545"
                              color="white"
                              _hover={{ bg: '#c82333' }}
                              onClick={() => handleRejectHireRequest(job._id)}
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              bg="#4CAF50"
                              color="white"
                              _hover={{ bg: '#45a049' }}
                              onClick={() => handleAcceptHireRequest(job._id)}
                            >
                              Accept
                            </Button>
                          </HStack>
                        </VStack>
                      </Box>
                    );
                  })}
                </VStack>
              </VStack>
            </Box>
          )}

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
                <WrapItem key={job.id || job._id}>
                  <JobCard 
                    job={job} 
                    onApply={handleApplyJob}
                    onCardClick={(job) => {
                      setSelectedJob(job); 
                      setIsModalOpen(true);
                    }}
                    user={user}
                  />
                </WrapItem>
              ))}
            </Wrap>
          </VStack>
        </VStack>
      </Box>

      <JobDetailModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedJob(null); }} 
        jobId={selectedJob?._id || selectedJob?.id} // <--- THIS WAS THE FIX
      />
    </Box>
  )
}
