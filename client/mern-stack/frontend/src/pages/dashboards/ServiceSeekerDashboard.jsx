import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, HStack, VStack, Text, Button,  Menu, Portal, Image, Heading, Wrap, WrapItem, Badge } from '@chakra-ui/react'
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

const mockProviders = [
  {
    id: 1,
    username: 'johndoe',
    name: 'John Pork',
    rating: 4.8,
    distance: 2.7,
    image: exampleProfilepic,
    specialties: ['Manual Labor', 'Tutoring', 'Painting'],
    hourlyRate: 35
  },
  {
    id: 2,
    username: 'sarahjones',
    name: 'Sarah Jones',
    rating: 4.9,
    distance: 1.2,
    image: exampleProfilepic,
    specialties: ['Tutoring', 'Writing', 'Design'],
    hourlyRate: 50
  },
];
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 3959; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

function ProviderCard({ provider, onClick }) {
  const username = provider.username || `@${provider.firstName?.toLowerCase() || 'user'}`
  const rating = provider.rating || 0
  const name = provider.name || `${provider.firstName} ${provider.lastName}`.trim() || 'Service Provider'
  const specialties = provider.specialties && provider.specialties.length > 0 
    ? provider.specialties 
    : ['Professional Services']
  const hourlyRate = provider.hourlyRate || 0
  const distance = provider.distance;
  const formatDistance = (dist) => {
    if (dist === null || dist === undefined || dist === '') return 'Location N/A';
    const numDist = parseFloat(dist);
    if (numDist > 12000) return 'Location N/A'; 
    return `${numDist.toFixed(1)} miles`;
  };
  
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
      <HStack position="absolute" top="20px" left="20px" right="20px" justify="space-between">
        <Text fontSize="sm" fontWeight="bold" color="#d97baa">{username}</Text>
        <Text fontSize="sm" color="white">{rating}⭐</Text>
      </HStack>

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
        📍 {formatDistance(distance)} | ${hourlyRate}/hr
      </Text>
    </Box>
  );
}

const OTHER_SKILL_LABEL = 'Other skills ⭐';

  const SKILL_OPTIONS = [
    'Manual labor 🔨',
    'Tutoring📚',
    'Painting 🎨',
    'Cleaning 🧹',
    'Gardening 🌱',
    'Automotive 🚗',
    'Design 🎨',
    'Assembly 🔧',
    'Plumbing 🚿',
    'Electrical ⚡',
    'Photography 📷',
    'Music 🎵',
    'Writing ✍️',
    'Construction 🏗️',
    'Carpentry 🪵',
    OTHER_SKILL_LABEL,
  ];


export default function ServiceSeekerDashboard() {

  const navigate = useNavigate()
  const { role } = useRole()
  const [filterType, setFilterType] = useState('Skills')
  const [filteredProviders, setFilteredProviders] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([]);
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
  }, [currentUserId]);

  const handleJobCreated = (data) => {
    if (data.job && currentUserId) {
      const jobPosterId = data.job.postedBy?._id || data.job.postedBy;
      
      if (jobPosterId === currentUserId) {
        setJobs(prevJobs => {
          if (!prevJobs.find(j => j._id === data.job._id)) {
            return [data.job, ...prevJobs];
          }
          return prevJobs;
        });
      }
    }
  };

  const handleJobUpdated = (data) => {
    if (data.jobId && data.job) {
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job._id === data.jobId ? data.job : job
        )
      );
    }
  };

  const handleJobApplication = (data) => {
    if (data.jobId && data.job) {
      const jobPosterId = data.job.postedBy?._id || data.job.postedBy;
      if (jobPosterId === currentUserId) {
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

const normalizeSkill = (str) =>
  str
    ?.toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}]/gu, '')
    .trim();

useEffect(() => {
  const source = realProviders.length ? realProviders : mockProviders;

  if (selectedSkills.length === 0) {
    setFilteredProviders(source);
    return;
  }

  const hasOtherSelected = selectedSkills.includes(OTHER_SKILL_LABEL);

  // normalized names for the "normal" selected skills (not including Other)
  const normalizedSelectedSkills = selectedSkills
    .filter((s) => s !== OTHER_SKILL_LABEL)
    .map(normalizeSkill);

  // all "known" skills in the menu (excluding Other), normalized
  const knownSkillNames = SKILL_OPTIONS
    .filter((s) => s !== OTHER_SKILL_LABEL)
    .map(normalizeSkill);

  const filtered = source.filter((provider) => {
    const providerSkills = (provider.specialties || []).map(normalizeSkill);

    // 1) match when provider has any of the selected skills
    const matchesSelected =
      normalizedSelectedSkills.length > 0 &&
      providerSkills.some((skill) =>
        normalizedSelectedSkills.includes(skill)
      );

    // 2) match when "Other skills" is selected AND provider has at least one
    //    specialty NOT in the known SKILL_OPTIONS list
    const matchesOther =
      hasOtherSelected &&
      providerSkills.some(
        (skill) => skill && !knownSkillNames.includes(skill)
      );

    return matchesSelected || matchesOther;
  });

  setFilteredProviders(filtered);
}, [selectedSkills, realProviders]);



  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)   // remove if already selected
        : [...prev, skill]                  // add if not selected
    );
  };

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
    setLoadingProviders(true);
    const token = getToken();
    let userCoordinates = null;

    if (token) {
        try {
            const profileRes = await fetch(`${API_URL}/users/profile`, { headers: { 'Authorization': `Bearer ${token}` } });
            const profileData = await profileRes.json();
            if (profileData.location?.coordinates) {
                const [lng, lat] = profileData.location.coordinates;
                if (lat !== 0 || lng !== 0) userCoordinates = [lng, lat];
            }
        } catch(e) {}
      } 

    const response = await fetch(`${API_URL}/users/providers`);
    const data = await response.json();

    if (response.ok && data.providers) {
        const mappedProviders = data.providers.map((provider) => {
          let specialties = [];
          if (Array.isArray(provider.specialties)) specialties = provider.specialties;
          else if (typeof provider.specialties === 'string' && provider.specialties.trim().length > 0) {
            specialties = provider.specialties.split(',').map((s) => s.trim()).filter(Boolean);
          }
          let dist = null;
          if (userCoordinates && provider.location?.coordinates) {
             const [pLng, pLat] = provider.location.coordinates;
             dist = calculateDistance(userCoordinates[1], userCoordinates[0], pLat, pLng);
          }

          return {
            ...provider,
            image: provider.profilePicture || provider.image || exampleProfilepic,
            name: `${provider.firstName || ''} ${provider.lastName || ''}`.trim() || provider.username || 'Service Provider',
            username: provider.username ? (provider.username.startsWith('@') ? provider.username : `@${provider.username}`) : `@${provider.firstName?.toLowerCase() || 'user'}`,
            rating: provider.rating || 0,
            hourlyRate: provider.hourlyRate || 0,
            specialties,
            distance: dist, 
          };
        });

        setRealProviders(mappedProviders);
        setFilteredProviders(mappedProviders);
      } else {
        setFilteredProviders(mockProviders);
      }
    } catch (err) {
      console.error('Failed to fetch providers:', err);
      setFilteredProviders(mockProviders);
    } finally {
      setLoadingProviders(false);
    }
};


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

  const handleMessageProvider = (recipientId) => {
     startChatWithRecipient(recipientId, navigate);
  };

  const handleFilterChange = (filter) => {
    setFilterType(filter)
    let sorted = [...realProviders]
    switch(filter) {
      case 'Price':
        sorted.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0))
        break
      case 'Location':
        sorted.sort((a, b) => {
            const dA = a.distance ? parseFloat(a.distance) : 99999;
            const dB = b.distance ? parseFloat(b.distance) : 99999;
            return dA - dB;
        });
        break
      case 'Rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'Skills':
      default:
        break
    }
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

          {currentUserId && jobs.filter(job => {
            const jobPosterId = job.postedBy?._id || job.postedBy;
            return jobPosterId === currentUserId
          }).length > 0 && (
            <VStack align="start" w="full" spacing={4}>
              <Heading as="h2" size="lg" color="white">
                My Posted Jobs ({jobs.filter(job => {
                  const jobPosterId = job.postedBy?._id || job.postedBy;
                  return jobPosterId === currentUserId
                }).length})
              </Heading>
              <VStack w="full" spacing={3}>
                {jobs.filter(job => {
                  const jobPosterId = job.postedBy?._id || job.postedBy;
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
                            <Text color="#999" fontSize="sm">Estimated Duration: ~{job.estimatedDuration} hrs</Text>
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
                          {currentUserId && (job.postedBy?._id || job.postedBy) === currentUserId && (
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
            </HStack>
            <VStack align="flex-end" spacing={2}>
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button
                    size="sm"
                    bg={selectedSkills.length ? '#d97baa' : 'transparent'}
                    color="white"
                    borderColor="#3a3f5e"
                    border="1px solid"
                    _hover={{ bg: '#d97baa' }}
                    transition="all 0.2s"
                  >
                    {selectedSkills.length === 0
                      ? 'Skills'
                      : `${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} selected`}
                  </Button>
                </Menu.Trigger>

                <Portal>
                  <Menu.Positioner>
                    <Menu.Content
                      bg="#11152f"
                      borderColor="#3a3f5e"
                      borderWidth="1px"
                      borderRadius="lg"
                      py={2}
                      minW="220px"
                    >
                      {SKILL_OPTIONS.map((skill) => {
                        const isSelected = selectedSkills.includes(skill)
                        return (
                          <Menu.Item
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            _hover={{ bg: 'rgba(217, 123, 170, 0.12)' }}
                            px={3}
                            py={2}
                          >
                            <HStack justify="space-between" w="full">
                              <Text fontSize="sm" color="white">
                                {skill}
                              </Text>
                              {isSelected && (
                                <Box
                                  boxSize="8px"
                                  borderRadius="full"
                                  bg="#d97baa"
                                />
                              )}
                            </HStack>
                          </Menu.Item>
                        )
                      })}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>

              {selectedSkills.length > 0 && (
                <Wrap spacing={2} justify="flex-end" maxW="260px">
                  {selectedSkills.map((skill) => (
                    <WrapItem key={skill}>
                      <Badge
                        px={2}
                        py={1}
                        borderRadius="full"
                        bg="rgba(217, 123, 170, 0.15)"
                        color="#d97baa"
                        border="1px solid #d97baa"
                        fontSize="xs"
                        cursor="pointer"
                        onClick={() => toggleSkill(skill)} // click pill to remove
                      >
                        {skill} ✕
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              )}
            </VStack>

            <HStack spacing={2} flex={1}>
              {['Location', 'Price', 'Rating'].map((filter) => (
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

      <ProviderDetailModal isOpen={isProviderDetailModalOpen} onClose={() => { setIsProviderDetailModalOpen(false); setSelectedProvider(null); }} provider={selectedProvider} onHire={handleHireProvider} />
      <DirectHireModal isOpen={isDirectHireModalOpen} onClose={() => { setIsDirectHireModalOpen(false); setSelectedProvider(null); }} provider={selectedProvider} onSuccess={handleDirectHireSuccess} />
    </Box>
  )
}
