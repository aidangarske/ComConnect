import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../components/RoleContext'
import { Box, HStack, VStack, Text, Button, Heading, Input, Image, Textarea } from '@chakra-ui/react'

import comconnectLogo from "../logo/COMCONNECT_Logo.png";

const API_URL = 'http://localhost:8080/api';

export default function Profile() {
  const navigate = useNavigate()
  const { role } = useRole()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [specialties, setSpecialties] = useState('')

  // Fetch user profile on mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
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
        setSpecialties(data.specialties?.join(', ') || '')
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

  const handleSave = async () => {
    if (!fullName || !email) {
      setError('Please fill in required fields')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      
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
          specialties: specialties.split(',').map(s => s.trim()).filter(s => s)
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Profile updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
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
            {/* Error Message */}
            {error && (
              <Box bg="red.900" color="red.200" p={3} borderRadius="md" w="full">
                <Text fontSize="sm">{error}</Text>
              </Box>
            )}

            {/* Success Message */}
            {success && (
              <Box bg="green.900" color="green.200" p={3} borderRadius="md" w="full">
                <Text fontSize="sm">{success}</Text>
              </Box>
            )}

            {/* Name Field */}
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">
                Full Name *
              </Text>
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

            {/* Email Field */}
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">
                Email *
              </Text>
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

            {/* Bio/About Field */}
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">
                About
              </Text>
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

            {/* Phone Field */}
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">
                Phone Number
              </Text>
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

            {/* Specialties Field - Only for Providers */}
            {role === 'provider' && (
              <VStack align="start" w="full" spacing={2}>
                <Text color="#999" fontSize="sm" fontWeight="bold">
                  Specialties (comma-separated)
                </Text>
                <Textarea
                  placeholder="e.g., Plumbing, Electrical, Carpentry"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  bg="#1a1f3a"
                  border="1px solid #3a4456"
                  borderRadius="md"
                  color="white"
                  _placeholder={{ color: '#666' }}
                  _focus={{ borderColor: '#d97baa' }}
                  py={3}
                  fontSize="sm"
                  minH="80px"
                />
              </VStack>
            )}

            {/* Action Buttons */}
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
                cursor={saving || loading ? 'not-allowed' : 'pointer'}
            >
                {loading ? 'Loading...' : saving ? 'Saving...' : 'Save Changes'}
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
