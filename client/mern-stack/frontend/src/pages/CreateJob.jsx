import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, HStack, VStack, Text, Button, Heading, Input, Textarea, Image } from '@chakra-ui/react'
import { getToken } from '../utils/tokenUtils'

import comconnectLogo from "../logo/COMCONNECT_Logo.png";

import { API_URL } from '../config/api.js';

const CustomCheckbox = ({ isChecked, onChange, label }) => (
  <HStack 
    w="full" 
    bg="#1a1f3a"
    border="1px solid" 
    borderColor={isChecked ? "#d97baa" : "#3a4456"} 
    borderRadius="md" 
    px={4} 
    py={3} 
    cursor="pointer" 
    onClick={() => onChange(!isChecked)} 
    spacing={3} 
    align="center"
    userSelect="none"
    transition="all 0.2s"
    _hover={{ borderColor: '#d97baa' }} 
  >
    <Box
      w="20px"
      h="20px"
      border="1px solid"
      borderColor={isChecked ? "#d97baa" : "#555"}
      bg={isChecked ? "#d97baa" : "transparent"}
      borderRadius="4px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      transition="all 0.2s"
    >
      {isChecked && <Text color="white" fontSize="xs" fontWeight="bold">✓</Text>}
    </Box>
  
    <Text color="white" fontSize="sm">
      {label}
    </Text>
  </HStack>
);

export default function CreateJob() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('')
  const [category, setCategory] = useState('other')
  const [isRemote, setIsRemote] = useState(false)

  const handleCreateJob = async () => {
    if (!title || !description || !budget) {
      setError('Please fill in all required fields')
      return
    }

    if (isNaN(budget) || parseFloat(budget) <= 0) {
      setError('Budget must be a valid positive number')
      return
    }

    if (isNaN(estimatedDuration) || parseFloat(estimatedDuration) <= 0) {
      setError('Estimated Duration must be a valid positive number')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = getToken()
      if (!token) {
        navigate('/login')
        return
      }

      const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          budget: parseFloat(budget),
          estimatedDuration: parseFloat(estimatedDuration),
          category,
          isRemote
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Job posted successfully!')
        setTitle('')
        setDescription('')
        setBudget('')
        setEstimatedDuration('')
        setCategory('other')
        setTimeout(() => {
          navigate('/dashboard-seeker')
        }, 1500)
      } else {
        // Show more detailed error
        if (response.status === 403) {
          setError('You must be logged in as a Seeker to post jobs. Please log out and log back in.')
        } else if (response.status === 401) {
          setError('Your session has expired. Please log in again.')
          setTimeout(() => navigate('/login'), 2000)
        } else {
          setError(data.error || 'Failed to create job')
        }
      }
    } catch (err) {
      setError('Connection error. Make sure backend is running.')
      console.error('Create job error:', err)
    } finally {
      setLoading(false)
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
            onClick={() => navigate('/dashboard-seeker')}
          />
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
        <VStack align="start" spacing={8} w="full" maxW="600px">
          {/* Title Section */}
          <VStack align="start" spacing={4}>
            <Heading as="h1" size="2xl" color="white">
              Post a New Job
            </Heading>
            <Text color="#aaa" fontSize="md">
              Describe the work you need done and let service providers apply
            </Text>
          </VStack>

          {/* Job Form */}
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

            {/* Job Title */}
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">
                Job Title *
              </Text>
              <Input
                placeholder="e.g., Need plumbing repair"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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

            {/* Job Description */}
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">
                Description *
              </Text>
              <Textarea
                placeholder="Describe the work needed in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                bg="#1a1f3a"
                border="1px solid #3a4456"
                borderRadius="md"
                color="white"
                _placeholder={{ color: '#666' }}
                _focus={{ borderColor: '#d97baa' }}
                py={3}
                fontSize="sm"
                minH="120px"
              />
            </VStack>

            {/* Category */}
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">
                Category
              </Text>
              <Box 
                as="select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                bg="#1a1f3a"
                border="1px solid #3a4456"
                borderRadius="md"
                color="white"
                _focus={{ borderColor: '#d97baa', outline: 'none' }}
                p={3}
                fontSize="sm"
                w="full"
                cursor="pointer"
              >
                <option value="other">Other</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="manual labor">Manual Labor</option>
                <option value="cleaning">Cleaning</option>
                <option value="gardening">Gardening</option>
                <option value="painting">Painting</option>
                <option value="photography">Photography</option>
                <option value="tutoring">Tutoring</option>
                <option value="writing">Writing</option>
              </Box>
            </VStack>

            {/* Budget */}
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">
                Budget ($) *
              </Text>
              <Input
                placeholder="e.g., 150"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
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

            {/* Estimated Duration */}
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">
                Estimated Duration (hrs) *
              </Text>
              <Input
                placeholder="e.g., 1.5"
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
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

            <CustomCheckbox 
              isChecked={isRemote}
              onChange={setIsRemote}
              label="This is a remote job (can be done from anywhere)"
            />

            {/* Action Buttons */}
            <HStack spacing={4} w="full" pt={4}>
              <Button
                flex={1}
                bg="#d97baa"
                color="white"
                isDisabled={loading}
                _hover={!loading ? { bg: '#c55a8f' } : {}}
                py={6}
                borderRadius="md"
                fontWeight="bold"
                fontSize="md"
                onClick={handleCreateJob}
                cursor={loading ? 'not-allowed' : 'pointer'}
              >
                {loading ? 'Posting...' : 'Post Job'}
              </Button>
              <Button
                flex={1}
                bg="#3a3f5e"
                color="white"
                _hover={{ bg: '#4a4f6e' }}
                py={6}
                borderRadius="md"
                fontWeight="bold"
                fontSize="md"
                onClick={() => navigate('/dashboard-seeker')}
              >
                Cancel
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </Box>
  )
}

