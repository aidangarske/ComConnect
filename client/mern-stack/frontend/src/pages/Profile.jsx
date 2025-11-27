import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../components/RoleContext'
import { Box, HStack, VStack, Text, Button, Heading, Input, Image, Textarea, Badge, Spinner } from '@chakra-ui/react'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-toastify'
import { startChatWithRecipient } from '../utils/chatUtils.js'
import JobDetailModal from '../components/JobDetailModal'
import { getToken } from '../utils/tokenUtils'
import { getSocket } from '../utils/socket'
import LocationSelector from '../components/LocationSelector'; 

import comconnectLogo from "../logo/COMCONNECT_Logo.png";

const API_URL = 'http://localhost:8080/api';

// Specialty icons mapping
const SPECIALTY_ICONS = {
  'manual labor': '🔨',
  'tutoring': '📚',
  'painting': '🎨',
  'cleaning': '🧹',
  'gardening': '🌱',
  'automotive': '🚗',
  'design': '🎨',
  'assembly': '🔧',
  'plumbing': '🚿',
  'electrical': '⚡',
  'photography': '📷',
  'music': '🎵',
  'writing': '✍️',
  'construction': '🏗️',
  'carpentry': '🪵',
  'other': '⭐'
};

const AVAILABLE_SPECIALTIES = [
  'manual labor',
  'tutoring',
  'painting',
  'cleaning',
  'gardening',
  'automotive',
  'design',
  'assembly',
  'plumbing',
  'electrical',
  'photography',
  'music',
  'writing',
  'construction',
  'carpentry',
  'other'
];

// Specialty Selector Component with Dropdowns
function SpecialtySelector({ selectedSpecialties, onSpecialtiesChange }) {
  const [customSpecialty, setCustomSpecialty] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Filter out invalid specialties (like bio text that might have been saved)
  const validSpecialties = selectedSpecialties.filter(s => {
    if (typeof s !== 'string') return false;
    const sLower = s.toLowerCase().trim();
    // Reject if too long (likely bio text)
    if (sLower.length > 30) return false;
    // Accept if it's a known specialty or a short custom one
    return AVAILABLE_SPECIALTIES.includes(sLower) || sLower.length <= 20;
  });

  const handleAddSpecialty = (specialty) => {
    if (!specialty || specialty === '') return;
    
    const specialtyLower = specialty.toLowerCase();
    
    // If "other" is selected, show custom input
    if (specialtyLower === 'other') {
      setShowCustomInput(true);
      return;
    }
    
    // Don't add if already selected
    if (validSpecialties.includes(specialtyLower)) return;
    
    // Add the specialty
    onSpecialtiesChange([...validSpecialties, specialtyLower]);
  };

  const handleAddCustomSpecialty = () => {
    if (!customSpecialty.trim()) return;
    
    const customLower = customSpecialty.trim().toLowerCase();
    
    // Don't add if already selected
    if (validSpecialties.includes(customLower)) {
      setCustomSpecialty('');
      setShowCustomInput(false);
      return;
    }
    
    // Add custom specialty
    onSpecialtiesChange([...validSpecialties, customLower]);
    setCustomSpecialty('');
    setShowCustomInput(false);
  };

  const handleRemoveSpecialty = (specialtyToRemove) => {
    onSpecialtiesChange(validSpecialties.filter(s => s !== specialtyToRemove));
  };

  // Get available specialties that aren't already selected
  const availableOptions = AVAILABLE_SPECIALTIES.filter(s => !validSpecialties.includes(s));

  return (
    <Box w="full">
      <VStack align="stretch" spacing={3}>
        {/* Display selected specialties */}
        {validSpecialties.length > 0 && (
          <Box w="full">
            <Text color="#999" fontSize="xs" mb={2}>Selected Specialties:</Text>
            <HStack spacing={2} flexWrap="wrap">
              {validSpecialties.map((specialty, idx) => (
                <Badge 
                  key={idx} 
                  bg="#d97baa" 
                  color="white" 
                  px={3} 
                  py={2} 
                  borderRadius="full"
                  fontSize="sm"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <Text fontSize="md">{SPECIALTY_ICONS[specialty] || '⭐'}</Text>
                  <Text textTransform="capitalize">{specialty}</Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
                    onClick={() => handleRemoveSpecialty(specialty)}
                    ml={1}
                    minW="auto"
                    h="auto"
                    p={0}
                    fontSize="xs"
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </HStack>
          </Box>
        )}

        {/* Dropdown to add new specialty */}
        <Box w="full">
          <Box
            as="select"
            placeholder="Select a specialty to add"
            value=""
            onChange={(e) => {
              if (e.target.value) {
                handleAddSpecialty(e.target.value);
                e.target.value = ''; // Reset dropdown
              }
            }}
            bg="#1a1f3a"
            border="1px solid #3a4456"
            borderRadius="md"
            color="white"
            p={3}
            fontSize="sm"
            cursor="pointer"
            _focus={{ borderColor: '#d97baa', outline: 'none' }}
            _hover={{ borderColor: '#d97baa' }}
            sx={{
              '& option': {
                background: '#1a1f3a',
                color: 'white'
              }
            }}
          >
            <option value="" disabled style={{ background: '#1a1f3a', color: '#666' }}>
              Select a specialty to add
            </option>
            {availableOptions.map((specialty) => (
              <option key={specialty} value={specialty} style={{ background: '#1a1f3a', color: 'white' }}>
                {SPECIALTY_ICONS[specialty] || '⭐'} {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
              </option>
            ))}
            <option value="other" style={{ background: '#1a1f3a', color: 'white' }}>
              ⭐ Other (Custom)
            </option>
          </Box>
        </Box>

        {/* Custom specialty input (shown when "other" is selected) */}
        {showCustomInput && (
          <HStack spacing={2} w="full">
            <Input
              placeholder="Enter custom specialty"
              value={customSpecialty}
              onChange={(e) => setCustomSpecialty(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomSpecialty();
                }
              }}
              bg="#1a1f3a"
              border="1px solid #3a4456"
              borderRadius="md"
              color="white"
              _placeholder={{ color: '#666' }}
              _focus={{ borderColor: '#d97baa' }}
            />
            <Button
              bg="#d97baa"
              color="white"
              _hover={{ bg: '#c55a8f' }}
              onClick={handleAddCustomSpecialty}
              isDisabled={!customSpecialty.trim()}
            >
              Add
            </Button>
            <Button
              bg="transparent"
              border="1px solid #3a4456"
              color="white"
              _hover={{ bg: '#2a2f4a' }}
              onClick={() => {
                setShowCustomInput(false);
                setCustomSpecialty('');
              }}
            >
              Cancel
            </Button>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}

export default function Profile() {
  const navigate = useNavigate()
  const { role, user } = useRole()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Profile form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [locationAddress, setLocationAddress] = useState('')
  const [specialties, setSpecialties] = useState([])
  const [profilePicture, setProfilePicture] = useState('')
  const [rating, setRating] = useState(0)
  const [userId, setUserId] = useState('')
  const [privacySettings, setPrivacySettings] = useState({ showEmail: false, showPhone: false })

  // Job management state (for seekers)
  const [myJobs, setMyJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Applications state (for providers)
  const [myApplications, setMyApplications] = useState([])
  const [loadingApplications, setLoadingApplications] = useState(false)

  // Fetch user profile on mount
  useEffect(() => {
    fetchProfile()
    fetchPrivacySettings()
    if (role === 'seeker') {
      fetchMyJobs()
    } else if (role === 'provider') {
      fetchMyApplications()
    }
  }, [role])

  // Re-fetch privacy settings when profile tab is active
  useEffect(() => {
    if (activeTab === 'profile') {
      fetchPrivacySettings()
    }
  }, [activeTab])

  // Socket.io real-time updates for Profile page
  useEffect(() => {
    const socket = getSocket();
    if (role === 'seeker') {
      // Listen for job updates and applications
      socket.on('jobApplication', handleJobApplication);
      socket.on('jobUpdated', handleJobUpdated);
      socket.on('jobProviderSelected', handleJobProviderSelected);
      socket.on('jobDeleted', handleJobDeleted);

      return () => {
        socket.off('jobApplication', handleJobApplication);
        socket.off('jobUpdated', handleJobUpdated);
        socket.off('jobProviderSelected', handleJobProviderSelected);
        socket.off('jobDeleted', handleJobDeleted);
      };
    } else if (role === 'provider') {
      // Listen for job updates (when application status changes)
      socket.on('jobUpdated', handleJobUpdatedForProvider);
      socket.on('jobProviderSelected', handleJobProviderSelectedForProvider);
      socket.on('jobDeleted', handleJobDeletedForProvider);

      return () => {
        socket.off('jobUpdated', handleJobUpdatedForProvider);
        socket.off('jobProviderSelected', handleJobProviderSelectedForProvider);
        socket.off('jobDeleted', handleJobDeletedForProvider);
      };
    }
  }, [role, myJobs, myApplications]);

  const handleJobDeleted = (data) => {
    if (data.jobId) {
      // Remove deleted job from myJobs list
      setMyJobs(prevJobs => prevJobs.filter(job => job._id !== data.jobId));
    }
  };

  const handleJobDeletedForProvider = (data) => {
    if (data.jobId) {
      // Remove deleted job from myApplications list
      setMyApplications(prevApps => prevApps.filter(job => job._id !== data.jobId));
    }
  };

  const handleJobApplication = (data) => {
    // Update job when new application is received
    if (data.jobId && data.job) {
      const token = getToken();
      if (!token) return;
      
      try {
        const decodedUser = jwtDecode(token);
        const currentUserId = decodedUser.id;
        
        // Check if this job belongs to the current user
        const jobPosterId = typeof data.job.postedBy === 'object' 
          ? data.job.postedBy._id 
          : data.job.postedBy;
        
        if (jobPosterId === currentUserId) {
          // Update the job in the list
          setMyJobs(prevJobs => 
            prevJobs.map(job => 
              job._id === data.jobId ? data.job : job
            )
          );
          
          // Show notification
          const providerName = data.application?.providerName || 'A provider';
          toast.info(`New application from ${providerName} for "${data.job.title}"!`);
        }
      } catch (e) {
        console.error('Error handling job application:', e);
      }
    }
  };

  const handleJobUpdated = (data) => {
    // Update job when it's updated (e.g., application status changed)
    if (data.jobId && data.job) {
      setMyJobs(prevJobs => 
        prevJobs.map(job => 
          job._id === data.jobId ? data.job : job
        )
      );
    }
  };

  const handleJobProviderSelected = (data) => {
    // Update job when provider is selected/hired
    if (data.jobId && data.job) {
      setMyJobs(prevJobs => 
        prevJobs.map(job => 
          job._id === data.jobId ? data.job : job
        )
      );
      toast.success('Provider hired successfully!');
    }
  };

  const handleJobUpdatedForProvider = (data) => {
    // Update application status for providers
    if (data.jobId && data.job) {
      setMyApplications(prevApps => 
        prevApps.map(app => 
          app._id === data.jobId ? { ...app, ...data.job } : app
        )
      );
    }
  };

  const handleJobProviderSelectedForProvider = (data) => {
    // Update when a provider is selected (might be this user)
    if (data.jobId && data.job) {
      setMyApplications(prevApps => 
        prevApps.map(app => 
          app._id === data.jobId ? { ...app, ...data.job } : app
        )
      );
      
      // Check if this user was selected
      const token = getToken();
      if (token) {
        try {
          const decodedUser = jwtDecode(token);
          if (data.providerId === decodedUser.id) {
            toast.success('Congratulations! You were hired for this job!');
          }
        } catch (e) {}
      }
    }
  };

  const fetchProfile = async () => {
    try {
      const token = getToken()
      if (!token) {
        navigate('/login')
        return
      }

      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setFullName(data.fullName || '')
        setEmail(data.email || '')
        setBio(data.bio || '')
        setPhone(data.phone || '')

        if (data.address && data.address.city) {
          setLocationAddress(data.address.city);
        }
        // Filter out invalid specialties (like bio text that might have been saved)
        // Only keep strings that are short (max 30 chars) and either match known specialties or are custom
        const validSpecialties = (data.specialties || []).filter(s => {
          if (typeof s !== 'string') return false;
          const sLower = s.toLowerCase().trim();
          // Reject if too long (likely bio text)
          if (sLower.length > 30) return false;
          // Accept if it's a known specialty or a short custom one
          return AVAILABLE_SPECIALTIES.includes(sLower) || sLower.length <= 20;
        });
        setSpecialties(validSpecialties)
        setProfilePicture(data.profilePicture || '')
        setRating(data.rating || 0)
        setUserId(data.id || '')
      } else {
        setError(data.error || 'Failed to load profile')
      }
    } catch (err) {
      setError('Connection error. Make sure backend is running.')
      console.error('Fetch profile error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPrivacySettings = async () => {
    try {
      const token = getToken()
      if (!token) return

      const response = await fetch(`${API_URL}/users/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Privacy settings fetched:', data.privacySettings)
        if (data.privacySettings) {
          const newSettings = {
            showEmail: data.privacySettings.showEmail ?? false,
            showPhone: data.privacySettings.showPhone ?? false
          }
          console.log('Setting privacy settings state:', newSettings)
          setPrivacySettings(newSettings)
        } else {
          console.log('No privacy settings found, using defaults')
          setPrivacySettings({ showEmail: false, showPhone: false })
        }
      } else {
        console.error('Failed to fetch privacy settings:', response.status)
      }
    } catch (err) {
      console.error('Failed to fetch privacy settings:', err)
    }
  }

  const fetchMyJobs = async () => {
    setLoadingJobs(true)
    try {
      const token = getToken()
      if (!token) return
      
      // Get user ID from token
      const decodedUser = jwtDecode(token)
      const userId = decodedUser.id || user?.id
      if (!userId) return

      const response = await fetch(`${API_URL}/jobs/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok && data.jobs) {
        console.log('Fetched jobs:', data.jobs)
        // Log applications for debugging
        data.jobs.forEach(job => {
          console.log(`Job ${job.title} has ${job.applications?.length || 0} applications:`, job.applications)
        })
        setMyJobs(data.jobs)
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
    } finally {
      setLoadingJobs(false)
    }
  }

  const fetchMyApplications = async () => {
    setLoadingApplications(true)
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/jobs/applications/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok && data.jobs) {
        setMyApplications(data.jobs)
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err)
    } finally {
      setLoadingApplications(false)
    }
  }

  const handleSave = async () => {
    if (!fullName || !email) {
      setError('Please fill in required fields')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = getToken()
      
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName,
          email,
          bio,
          phone,
          specialties: specialties.filter(s => {
            if (typeof s !== 'string') return false;
            const sLower = s.toLowerCase().trim();
            return sLower.length <= 30 && (AVAILABLE_SPECIALTIES.includes(sLower) || sLower.length <= 20);
          }),
          profilePicture
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Profile updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
        // Refresh privacy settings to update display
        fetchPrivacySettings()
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('Connection error')
      console.error('Save profile error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async (jobId, providerId) => {
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/jobs/${jobId}/select-provider`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ providerId })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Provider approved and hired!')
        // Refresh jobs to get updated data
        setTimeout(() => fetchMyJobs(), 500)
      } else {
        toast.error(data.error || 'Failed to approve provider')
      }
    } catch (err) {
      console.error('Failed to approve:', err)
      toast.error('Failed to approve provider')
    }
  }

  const handleReject = async (jobId, providerId) => {
    if (!window.confirm('Are you sure you want to reject this application?')) return

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/jobs/${jobId}/reject-application`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ providerId })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Application rejected')
        // Refresh jobs to get updated data
        setTimeout(() => fetchMyJobs(), 500)
      } else {
        toast.error(data.error || 'Failed to reject application')
      }
    } catch (err) {
      console.error('Failed to reject:', err)
      toast.error('Failed to reject application')
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Job deleted successfully')
        // Remove from local state immediately
        setMyJobs(prevJobs => prevJobs.filter(job => job._id !== jobId))
      } else {
        toast.error(data.error || 'Failed to delete job')
      }
    } catch (err) {
      console.error('Failed to delete job:', err)
      toast.error('Failed to delete job')
    }
  }

  const handleWithdrawApplication = async (jobId) => {
    if (!window.confirm('Are you sure you want to withdraw your application? This action cannot be undone.')) return

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/jobs/${jobId}/withdraw-application`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Application withdrawn successfully')
        // Remove from local state immediately
        setMyApplications(prevApps => prevApps.filter(job => job._id !== jobId))
      } else {
        toast.error(data.error || 'Failed to withdraw application')
      }
    } catch (err) {
      console.error('Failed to withdraw application:', err)
      toast.error('Failed to withdraw application')
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 3MB for original file - base64 will be ~33% larger)
    if (file.size > 3 * 1024 * 1024) {
      setError('Image size must be less than 3MB. Please compress or resize your image.')
      return
    }

    setError('') // Clear any previous errors

    // If file is small enough, use it directly without resizing
    if (file.size < 500 * 1024) { // Less than 500KB
      const reader = new FileReader()
      reader.onloadend = () => {
        console.log('Small image loaded, setting profile picture')
        setProfilePicture(reader.result)
        setError('')
      }
      reader.onerror = () => {
        setError('Failed to read image file')
      }
      reader.readAsDataURL(file)
      return
    }

    // Resize image before converting to base64 to reduce size
    const reader = new FileReader()
    reader.onloadend = () => {
      const img = new Image()
      img.onload = () => {
        // Create canvas to resize image
        const canvas = document.createElement('canvas')
        const MAX_WIDTH = 800
        const MAX_HEIGHT = 800
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width)
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height)
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress image
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to base64 with compression (0.85 quality for JPEG)
        const base64String = canvas.toDataURL('image/jpeg', 0.85)
        console.log('Canvas conversion complete, base64 length:', base64String?.length)
        if (base64String) {
          setProfilePicture(base64String)
          setError('')
          console.log('Profile picture state updated')
        } else {
          // Fallback: use original image if canvas conversion fails
          console.log('Canvas conversion failed, using original')
          setProfilePicture(reader.result)
          setError('')
        }
      }
      img.onerror = () => {
        // Fallback: use original file reader result
        setProfilePicture(reader.result)
        setError('')
      }
      img.src = reader.result
    }
    reader.onerror = () => {
      setError('Failed to read image file')
    }
    reader.readAsDataURL(file)
  }

  const getDashboardPath = () => {
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
              <Text color="black" fontSize="md" cursor="pointer" onClick={() => navigate('/settings')}>
                Settings
              </Text>
              <Text color="black" fontSize="md" cursor="pointer" onClick={() => navigate('/messages')}>
                Messages
              </Text>
            </HStack>
        </HStack>
      </Box>

      {/* Tabs */}
      <Box bg="#1a1f3a" borderBottom="1px solid #3a4456" px={8}>
        <HStack spacing={4}>
          <Button
            variant="ghost"
            color={activeTab === 'profile' ? '#d97baa' : 'white'}
            borderBottom={activeTab === 'profile' ? '2px solid #d97baa' : 'none'}
            borderRadius="0"
            onClick={() => setActiveTab('profile')}
            _hover={{ bg: 'transparent', color: '#d97baa' }}
          >
            Profile
          </Button>
          {role === 'seeker' && (
            <Button
              variant="ghost"
              color={activeTab === 'jobs' ? '#d97baa' : 'white'}
              borderBottom={activeTab === 'jobs' ? '2px solid #d97baa' : 'none'}
              borderRadius="0"
              onClick={() => {
                setActiveTab('jobs')
                fetchMyJobs()
              }}
              _hover={{ bg: 'transparent', color: '#d97baa' }}
            >
              My Jobs ({myJobs.length})
            </Button>
          )}
          {role === 'provider' && (
            <Button
              variant="ghost"
              color={activeTab === 'applications' ? '#d97baa' : 'white'}
              borderBottom={activeTab === 'applications' ? '2px solid #d97baa' : 'none'}
              borderRadius="0"
              onClick={() => {
                setActiveTab('applications')
                fetchMyApplications()
              }}
              _hover={{ bg: 'transparent', color: '#d97baa' }}
            >
              My Applications ({myApplications.length})
            </Button>
          )}
        </HStack>
      </Box>

      {/* Main Content */}
      <Box py={8} px={8}>
        {activeTab === 'profile' && (
          <VStack align="start" spacing={8} w="full" maxW="600px">
            <VStack align="start" spacing={4}>
              <Heading as="h1" size="2xl" color="white">
                My Profile
              </Heading>
              <Text color="#aaa" fontSize="md">
                View and manage your account information
              </Text>
            </VStack>

            <VStack spacing={6} w="full" align="stretch">
              {error && (
                <Box bg="red.900" color="red.200" p={3} borderRadius="md" w="full">
                  <Text fontSize="sm">{error}</Text>
                </Box>
              )}

              {success && (
                <Box bg="green.900" color="green.200" p={3} borderRadius="md" w="full">
                  <Text fontSize="sm">{success}</Text>
                </Box>
              )}

              {/* Profile Picture Section */}
              <VStack align="center" w="full" spacing={4}>
                <Box position="relative">
                  {profilePicture ? (
                    <Box
                      as="img"
                      src={profilePicture}
                      alt="Profile"
                      borderRadius="full"
                      w="150px"
                      h="150px"
                      objectFit="cover"
                      border="3px solid #d97baa"
                      display="block"
                    />
                  ) : (
                    <Box
                      borderRadius="full"
                      boxSize="150px"
                      bg="#1a1f3a"
                      border="3px solid #d97baa"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text color="#666" fontSize="4xl">👤</Text>
                    </Box>
                  )}
                </Box>
                <Box>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                    id="profile-picture-upload"
                  />
                  <Button
                    as="label"
                    htmlFor="profile-picture-upload"
                    cursor="pointer"
                    bg="transparent"
                    border="1px solid #d97baa"
                    color="#d97baa"
                    _hover={{ bg: 'rgba(217, 123, 170, 0.1)' }}
                    size="sm"
                  >
                    {profilePicture ? 'Change Picture' : 'Upload Picture'}
                  </Button>
                </Box>
              </VStack>

              {/* Rating Display */}
              {rating > 0 && userId && (
                <Box w="full" bg="#1a1f3a" p={4} borderRadius="md" border="1px solid #3a4456">
                  <HStack justify="space-between" align="center">
                    <VStack align="start" spacing={1}>
                      <Text color="white" fontSize="md" fontWeight="bold">
                        Rating: {rating.toFixed(1)} ⭐
                      </Text>
                      <Text color="#aaa" fontSize="sm">
                        Based on reviews
                      </Text>
                    </VStack>
                    <Button
                      size="sm"
                      bg="transparent"
                      border="1px solid #d97baa"
                      color="#d97baa"
                      _hover={{ bg: 'rgba(217, 123, 170, 0.1)' }}
                      onClick={() => navigate(`/ratings/${userId}`)}
                    >
                      View All Reviews
                    </Button>
                  </HStack>
                </Box>
              )}

              {/* Specialties Display (for providers) */}
              {role === 'provider' && specialties.length > 0 && (
                <Box w="full" bg="#1a1f3a" p={4} borderRadius="md" border="1px solid #3a4456">
                  <Text color="#999" fontSize="xs" fontWeight="bold" mb={3}>YOUR SPECIALTIES</Text>
                  <HStack spacing={2} flexWrap="wrap">
                    {specialties.map((specialty, idx) => (
                      <Badge 
                        key={idx} 
                        bg="#d97baa" 
                        color="white" 
                        px={3} 
                        py={2} 
                        borderRadius="full"
                        fontSize="sm"
                        display="flex"
                        alignItems="center"
                        gap={1}
                      >
                        <Text fontSize="md">{SPECIALTY_ICONS[specialty] || '⭐'}</Text>
                        <Text textTransform="capitalize">{specialty}</Text>
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              )}

              <VStack align="start" w="full" spacing={2}>
                <Text color="#999" fontSize="sm" fontWeight="bold">Full Name *</Text>
                <Input
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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

              {/* Display Email if privacy setting allows */}
              {privacySettings?.showEmail && email ? (
                <Box w="full" bg="#1a1f3a" p={4} borderRadius="md" border="1px solid #d97baa">
                  <VStack align="start" spacing={1}>
                    <Text color="#d97baa" fontSize="xs" fontWeight="bold">📧 Email (Public)</Text>
                    <Text color="white" fontSize="md" fontWeight="medium">{email}</Text>
                  </VStack>
                </Box>
              ) : null}

              <VStack align="start" w="full" spacing={2}>
                <Text color="#999" fontSize="sm" fontWeight="bold">Email *</Text>
                <Input
                  placeholder="john@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

              <VStack align="start" w="full" spacing={2}>
                <Text color="#999" fontSize="sm" fontWeight="bold">About</Text>
                <Textarea
                  placeholder="Tell us about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  bg="#1a1f3a"
                  border="1px solid #3a4456"
                  borderRadius="md"
                  color="white"
                  _placeholder={{ color: '#666' }}
                  _focus={{ borderColor: '#d97baa' }}
                  py={3}
                  fontSize="sm"
                  minH="100px"
                />
              </VStack>

              <VStack align="start" w="full" spacing={2}>
                <Text color="#999" fontSize="sm" fontWeight="bold">Location</Text>
                  {locationAddress && (
                <Text color="white" fontSize="sm" mb={1}>
                  📍 Currently set to: <Text as="span" color="#d97baa">{locationAddress}</Text>
                </Text>
                  )}
                    <LocationSelector 
                    onLocationSave={(updatedUser) => {
                    // Update the UI immediately when they pick a new place
                    if (updatedUser && updatedUser.address) {
                      setLocationAddress(updatedUser.address.city); 
                    }
                  }} 
                />
              </VStack>

              {/* Display Phone if privacy setting allows */}
              {privacySettings?.showPhone && phone ? (
                <Box w="full" bg="#1a1f3a" p={4} borderRadius="md" border="1px solid #d97baa">
                  <VStack align="start" spacing={1}>
                    <Text color="#d97baa" fontSize="xs" fontWeight="bold">📞 Phone Number (Public)</Text>
                    <Text color="white" fontSize="md" fontWeight="medium">{phone}</Text>
                  </VStack>
                </Box>
              ) : null}

              <VStack align="start" w="full" spacing={2}>
                <Text color="#999" fontSize="sm" fontWeight="bold">Phone Number</Text>
                <Input
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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

              {role === 'provider' && (
                <VStack align="start" w="full" spacing={3}>
                  <Text color="#999" fontSize="sm" fontWeight="bold">Specialties</Text>
                  <Text color="#666" fontSize="xs">Select your areas of expertise</Text>
                  <SpecialtySelector 
                    selectedSpecialties={specialties} 
                    onSpecialtiesChange={setSpecialties} 
                  />
                </VStack>
              )}

              <HStack spacing={4} w="full" pt={4}>
                <Button
                  flex={1}
                  bg="#d97baa"
                  color="white"
                  isDisabled={saving || loading}
                  _hover={!saving && !loading ? { bg: '#c55a8f' } : {}}
                  py={6}
                  borderRadius="md"
                  fontWeight="bold"
                  fontSize="md"
                  onClick={handleSave}
                >
                  {loading ? 'Loading...' : saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </HStack>
            </VStack>
          </VStack>
        )}

        {/* My Jobs Tab - For Seekers */}
        {activeTab === 'jobs' && role === 'seeker' && (
          <VStack align="start" spacing={6} w="full">
            <HStack justify="space-between" w="full" align="center">
              <VStack align="start" spacing={2}>
                <Heading as="h1" size="2xl" color="white">
                  My Posted Jobs
                </Heading>
                <Text color="#aaa" fontSize="md">
                  Manage your job postings and review applicants
                </Text>
              </VStack>
              <Button
                size="sm"
                bg="transparent"
                border="1px solid #d97baa"
                color="#d97baa"
                _hover={{ bg: 'rgba(217, 123, 170, 0.1)' }}
                onClick={fetchMyJobs}
                isDisabled={loadingJobs}
              >
                {loadingJobs ? 'Loading...' : 'Refresh'}
              </Button>
            </HStack>

            {loadingJobs ? (
              <VStack spacing={4} py={8} w="full">
                <Spinner size="xl" color="#d97baa" />
                <Text color="white">Loading jobs...</Text>
              </VStack>
            ) : myJobs.length === 0 ? (
              <Box w="full" p={8} bg="#1a1f3a" borderRadius="md" textAlign="center">
                <Text color="#aaa">You haven't posted any jobs yet.</Text>
                <Button
                  mt={4}
                  bg="#d97baa"
                  color="white"
                  _hover={{ bg: '#c55a8f' }}
                  onClick={() => navigate('/create-job')}
                >
                  Post Your First Job
                </Button>
              </Box>
            ) : (
              <VStack spacing={4} w="full">
                {myJobs.map((job) => {
                  const applications = Array.isArray(job.applications) ? job.applications : []
                  const pendingApplications = applications.filter(app => app.status === 'pending')
                  const acceptedApplications = applications.filter(app => app.status === 'accepted')
                  const rejectedApplications = applications.filter(app => app.status === 'rejected')

                  return (
                    <Box
                      key={job._id}
                      w="full"
                      bg="#1a1f3a"
                      p={6}
                      borderRadius="md"
                      border="1px solid #3a4456"
                    >
                      <VStack align="start" spacing={4} w="full">
                        <HStack justify="space-between" w="full" align="start">
                          <VStack align="start" spacing={2} flex={1}>
                            <HStack spacing={2}>
                              <Text color="white" fontWeight="bold" fontSize="lg">{job.title}</Text>
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
                            </HStack>
                            <Text color="#aaa" fontSize="sm" noOfLines={2}>{job.description}</Text>
                            <HStack spacing={4}>
                              <Badge bg="#3a3f5e" color="white">{job.category}</Badge>
                              <Text color="#999" fontSize="sm">${job.budget}</Text>
                            </HStack>
                          </VStack>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              bg="#d97baa"
                              color="white"
                              _hover={{ bg: '#c55a8f' }}
                              onClick={() => {
                                setSelectedJobId(job._id)
                                setIsModalOpen(true)
                              }}
                            >
                              View Details
                            </Button>
                            <Button
                              size="sm"
                              bg="#dc3545"
                              color="white"
                              _hover={{ bg: '#c82333' }}
                              onClick={() => handleDeleteJob(job._id)}
                            >
                              Delete
                            </Button>
                          </HStack>
                        </HStack>

                        {/* Applicants Summary */}
                        <Box w="full" pt={4} borderTop="1px solid #3a4456">
                          <Text color="white" fontWeight="bold" mb={3}>
                            Applicants ({applications.length})
                          </Text>
                          {applications.length > 0 ? (
                            <VStack spacing={2} align="start" w="full">
                              {applications.map((app, idx) => {
                                const providerId = app.providerId?._id || app.providerId
                                const providerName = app.providerName || 'Unknown Provider'
                                const providerRating = app.providerRating || 0
                                const isSelected = job.selectedProvider && 
                                  (job.selectedProvider._id || job.selectedProvider).toString() === providerId.toString()

                                return (
                                  <Box
                                    key={idx}
                                    w="full"
                                    p={3}
                                    bg="#0a0e27"
                                    borderRadius="md"
                                    border="1px solid #3a4456"
                                  >
                                    <HStack justify="space-between" align="center" w="full">
                                      <VStack align="start" spacing={1}>
                                        <Text color="white" fontWeight="bold">{providerName}</Text>
                                        {providerRating > 0 && (
                                          <Text color="#aaa" fontSize="xs">⭐ {providerRating}</Text>
                                        )}
                                        <Badge
                                          bg={
                                            app.status === 'accepted' ? '#4CAF50' :
                                            app.status === 'rejected' ? '#dc3545' :
                                            '#3a3f5e'
                                          }
                                          color="white"
                                          fontSize="xs"
                                        >
                                          {app.status === 'accepted' ? 'Accepted' :
                                           app.status === 'rejected' ? 'Rejected' :
                                           'Pending'}
                                        </Badge>
                                      </VStack>
                                      <HStack spacing={2}>
                                        {!isSelected && app.status === 'pending' && job.status === 'open' && (
                                          <>
                                            <Button
                                              size="xs"
                                              bg="transparent"
                                              border="1px solid #d97baa"
                                              color="#d97baa"
                                              _hover={{ bg: 'rgba(217, 123, 170, 0.1)' }}
                                              onClick={() => startChatWithRecipient(providerId, navigate)}
                                            >
                                              Message
                                            </Button>
                                            <Button
                                              size="xs"
                                              bg="#dc3545"
                                              color="white"
                                              _hover={{ bg: '#c82333' }}
                                              onClick={() => handleReject(job._id, providerId)}
                                            >
                                              Reject
                                            </Button>
                                            <Button
                                              size="xs"
                                              bg="#4CAF50"
                                              color="white"
                                              _hover={{ bg: '#45a049' }}
                                              onClick={() => handleApprove(job._id, providerId)}
                                            >
                                              Approve
                                            </Button>
                                          </>
                                        )}
                                        {isSelected && (
                                          <Badge bg="#4CAF50" color="white" fontSize="xs">Hired</Badge>
                                        )}
                                      </HStack>
                                    </HStack>
                                  </Box>
                                )
                              })}
                            </VStack>
                          ) : (
                            <Text color="#aaa" fontSize="sm">No applications yet</Text>
                          )}
                        </Box>

                        {/* Hired Provider */}
                        {job.selectedProvider && (
                          <Box w="full" pt={4} borderTop="1px solid #4CAF50">
                            <HStack justify="space-between" align="center">
                              <VStack align="start" spacing={1}>
                                <Text color="white" fontWeight="bold">Hired Provider</Text>
                                <Text color="#aaa">
                                  {typeof job.selectedProvider === 'object'
                                    ? `${job.selectedProvider.firstName} ${job.selectedProvider.lastName}`.trim()
                                    : 'Provider'}
                                </Text>
                              </VStack>
                              {job.status === 'completed' && (
                                <Button
                                  size="sm"
                                  bg="#d97baa"
                                  color="white"
                                  _hover={{ bg: '#c55a8f' }}
                                  onClick={() => {
                                    const providerId = typeof job.selectedProvider === 'object'
                                      ? job.selectedProvider._id || job.selectedProvider
                                      : job.selectedProvider
                                    navigate(`/ratings/submit/${job._id}/${providerId}`)
                                  }}
                                >
                                  Rate Provider
                                </Button>
                              )}
                            </HStack>
                          </Box>
                        )}
                      </VStack>
                    </Box>
                  )
                })}
              </VStack>
            )}
          </VStack>
        )}

        {/* My Applications Tab - For Providers */}
        {activeTab === 'applications' && role === 'provider' && (
          <VStack align="start" spacing={6} w="full">
            <Heading as="h1" size="2xl" color="white">
              My Applications
            </Heading>
            <Text color="#aaa" fontSize="md">
              Track the status of jobs you've applied to
            </Text>

            {loadingApplications ? (
              <VStack spacing={4} py={8} w="full">
                <Spinner size="xl" color="#d97baa" />
                <Text color="white">Loading applications...</Text>
              </VStack>
            ) : myApplications.length === 0 ? (
              <Box w="full" p={8} bg="#1a1f3a" borderRadius="md" textAlign="center">
                <Text color="#aaa">You haven't applied to any jobs yet.</Text>
                <Button
                  mt={4}
                  bg="#d97baa"
                  color="white"
                  _hover={{ bg: '#c55a8f' }}
                  onClick={() => navigate('/dashboard-provider')}
                >
                  Browse Jobs
                </Button>
              </Box>
            ) : (
              <VStack spacing={4} w="full">
                {myApplications.map((job) => {
                  const myApp = job.myApplication
                  const status = myApp?.status || 'pending'
                  
                  // Get user ID from token
                  const token = getToken()
                  let currentUserId = user?.id
                  if (token) {
                    try {
                      const decodedUser = jwtDecode(token)
                      currentUserId = decodedUser.id || currentUserId
                    } catch (e) {}
                  }
                  
                  const isHired = job.selectedProvider && currentUserId &&
                    (job.selectedProvider._id || job.selectedProvider).toString() === currentUserId.toString()

                  return (
                    <Box
                      key={job._id}
                      w="full"
                      bg="#1a1f3a"
                      p={6}
                      borderRadius="md"
                      border="1px solid #3a4456"
                    >
                      <VStack align="start" spacing={4} w="full">
                        <HStack justify="space-between" w="full" align="start">
                          <VStack align="start" spacing={2} flex={1}>
                            <HStack spacing={2}>
                              <Text color="white" fontWeight="bold" fontSize="lg">{job.title}</Text>
                              <Badge
                                bg={
                                  status === 'accepted' || isHired ? '#4CAF50' :
                                  status === 'rejected' ? '#dc3545' :
                                  '#3a3f5e'
                                }
                                color="white"
                                fontSize="xs"
                              >
                                {isHired ? 'Hired' :
                                 status === 'accepted' ? 'Accepted' :
                                 status === 'rejected' ? 'Rejected' :
                                 'Pending'}
                              </Badge>
                            </HStack>
                            <Text color="#aaa" fontSize="sm" noOfLines={2}>{job.description}</Text>
                            <HStack spacing={4}>
                              <Badge bg="#3a3f5e" color="white">{job.category}</Badge>
                              <Text color="#999" fontSize="sm">${job.budget}</Text>
                              {typeof job.postedBy === 'object' && (
                                <Text color="#aaa" fontSize="sm">
                                  Posted by: {job.postedBy.firstName} {job.postedBy.lastName}
                                </Text>
                              )}
                            </HStack>
                          </VStack>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              bg="#d97baa"
                              color="white"
                              _hover={{ bg: '#c55a8f' }}
                              onClick={() => {
                                setSelectedJobId(job._id)
                                setIsModalOpen(true)
                              }}
                            >
                              View Details
                            </Button>
                            {status === 'pending' && !isHired && (
                              <Button
                                size="sm"
                                bg="#dc3545"
                                color="white"
                                _hover={{ bg: '#c82333' }}
                                onClick={() => handleWithdrawApplication(job._id)}
                              >
                                Withdraw
                              </Button>
                            )}
                          </HStack>
                        </HStack>

                        {myApp && (
                          <Box w="full" pt={4} borderTop="1px solid #3a4456">
                            <VStack align="start" spacing={3} w="full">
                              <Text color="#aaa" fontSize="sm">
                                Applied on: {new Date(myApp.appliedAt).toLocaleDateString()}
                              </Text>
                              {isHired && job.status === 'completed' && job.postedBy && (
                                <Button
                                  size="sm"
                                  bg="#d97baa"
                                  color="white"
                                  _hover={{ bg: '#c55a8f' }}
                                  onClick={() => {
                                    const seekerId = typeof job.postedBy === 'object'
                                      ? job.postedBy._id || job.postedBy
                                      : job.postedBy;
                                    navigate(`/ratings/submit/${job._id}/${seekerId}`);
                                  }}
                                >
                                  Rate Seeker
                                </Button>
                              )}
                            </VStack>
                          </Box>
                        )}
                      </VStack>
                    </Box>
                  )
                })}
              </VStack>
            )}
          </VStack>
        )}
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

      {/* Job Detail Modal */}
      <JobDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedJobId(null)
        }}
        jobId={selectedJobId}
      />
    </Box>
  )
}
