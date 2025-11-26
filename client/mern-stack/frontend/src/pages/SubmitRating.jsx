import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, HStack, VStack, Text, Button, Heading, Textarea, Spinner } from '@chakra-ui/react'
import { toast } from 'react-toastify'
import { getToken } from '../utils/tokenUtils'
import { jwtDecode } from 'jwt-decode'
import comconnectLogo from "../logo/COMCONNECT_Logo.png"

const API_URL = 'http://localhost:8080/api'

export default function SubmitRating() {
  const navigate = useNavigate()
  const { jobId, userId } = useParams()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [revieweeName, setRevieweeName] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  useEffect(() => {
    fetchRatingData()
  }, [jobId, userId])

  const fetchRatingData = async () => {
    setFetching(true)
    try {
      const token = getToken()
      if (!token) {
        navigate('/login')
        return
      }

      // Fetch user info if userId provided
      if (userId) {
        const userResponse = await fetch(`${API_URL}/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setRevieweeName(userData.user?.fullName || userData.user?.username || 'User')
        }
      }

      // Fetch job info if jobId provided
      if (jobId) {
        const jobResponse = await fetch(`${API_URL}/jobs/${jobId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (jobResponse.ok) {
          const jobData = await jobResponse.json()
          setJobTitle(jobData.job?.title || '')
        }
      }
    } catch (err) {
      console.error('Failed to fetch rating data:', err)
    } finally {
      setFetching(false)
    }
  }

  const getDashboardPath = () => {
    const token = getToken()
    if (token) {
      try {
        const decodedUser = jwtDecode(token)
        const currentRole = decodedUser.role
        switch(currentRole) {
          case 'seeker': return '/dashboard-seeker'
          case 'admin': return '/admin'
          default: return '/dashboard-provider'
        }
      } catch (e) {
        return '/login'
      }
    }
    return '/login'
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    if (!userId) {
      setError('User ID is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          revieweeId: userId,
          jobId: jobId || null,
          rating: rating,
          comment: comment.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Rating submitted successfully!')
        navigate(`/ratings/${userId}`)
      } else {
        setError(data.error || 'Failed to submit rating')
      }
    } catch (err) {
      setError('Connection error')
      console.error('Submit rating error:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Box
        key={star}
        as="button"
        type="button"
        fontSize="2xl"
        color={star <= (hoveredRating || rating) ? '#d97baa' : '#666'}
        cursor="pointer"
        onClick={() => setRating(star)}
        onMouseEnter={() => setHoveredRating(star)}
        onMouseLeave={() => setHoveredRating(0)}
        transition="color 0.2s"
        _hover={{ transform: 'scale(1.1)' }}
        minW="40px"
        h="40px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        ★
      </Box>
    ))
  }

  if (fetching) {
    return (
      <Box minH="100vh" bg="#0a0e27" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="#d97baa" />
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg="#0a0e27">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid #1a1f3a" py={4} px={[4, 6, 8]} boxSizing="border-box">
        <HStack justify="space-between" align="center" flexWrap="wrap" spacing={4}>
          <Box
            as="img"
            src={comconnectLogo}
            alt="ComConnect"
            h="80px"
            w="auto"
            objectFit="contain"
            maxW="100%"
            cursor="pointer"
            onClick={() => navigate(getDashboardPath())}
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
      <Box py={8} px={[4, 6, 8]} maxW="600px" mx="auto" w="full" boxSizing="border-box">
        <VStack align="start" spacing={8} w="full">
          <VStack align="start" spacing={2}>
            <Heading as="h1" size="2xl" color="white">
              Submit Rating
            </Heading>
            <Text color="#aaa" fontSize="md">
              {revieweeName && `Rate ${revieweeName}`}
              {jobTitle && ` for "${jobTitle}"`}
            </Text>
          </VStack>

          {error && (
            <Box bg="red.900" color="red.200" p={3} borderRadius="md" w="full">
              <Text fontSize="sm">{error}</Text>
            </Box>
          )}

          <Box w="full" bg="#1a1f3a" p={[4, 5, 6]} borderRadius="md" border="1px solid #3a4456" boxSizing="border-box">
            <VStack align="start" spacing={6} w="full">
              <VStack align="start" w="full" spacing={3} overflow="hidden">
                <Text color="white" fontSize="md" fontWeight="bold">Rating *</Text>
                <Box w="full" overflow="hidden">
                  <HStack spacing={2} flexWrap="nowrap" w="fit-content">
                    {renderStars()}
                  </HStack>
                </Box>
                {rating > 0 && (
                  <Text color="#aaa" fontSize="sm">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </Text>
                )}
              </VStack>

              <VStack align="start" w="full" spacing={2}>
                <Text color="white" fontSize="md" fontWeight="bold">Comment (Optional)</Text>
                <Textarea
                  placeholder="Share your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  bg="#0a0e27"
                  border="1px solid #3a4456"
                  borderRadius="md"
                  color="white"
                  _placeholder={{ color: '#666' }}
                  _focus={{ borderColor: '#d97baa' }}
                  minH="150px"
                  maxLength={1000}
                  w="full"
                  resize="vertical"
                />
                <Text color="#666" fontSize="xs" alignSelf="flex-end">
                  {comment.length}/1000 characters
                </Text>
              </VStack>

              <HStack spacing={4} w="full" pt={4}>
                <Button
                  bg="transparent"
                  border="1px solid #3a4456"
                  color="white"
                  _hover={{ bg: '#3a4456' }}
                  onClick={() => navigate(-1)}
                  isDisabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  flex={1}
                  bg="#d97baa"
                  color="white"
                  _hover={{ bg: '#c55a8f' }}
                  onClick={handleSubmit}
                  isDisabled={loading || rating === 0}
                  isLoading={loading}
                >
                  Submit Rating
                </Button>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Box>
  )
}

