import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, HStack, VStack, Text, Button, Heading, Image, Badge, Spinner } from '@chakra-ui/react'
import { toast } from 'react-toastify'
import { getToken } from '../utils/tokenUtils'
import { jwtDecode } from 'jwt-decode'
import comconnectLogo from "../logo/COMCONNECT_Logo.png"

const API_URL = 'http://localhost:8080/api'

export default function ViewRatings() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviews, setReviews] = useState([])
  const [averageRating, setAverageRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [userName, setUserName] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    if (userId) {
      fetchRatings()
      fetchUserInfo()
    }
  }, [userId, sortBy])

  const fetchUserInfo = async () => {
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUserName(data.user?.fullName || data.user?.username || 'User')
      }
    } catch (err) {
      console.error('Failed to fetch user info:', err)
    }
  }

  const fetchRatings = async () => {
    setLoading(true)
    setError('')
    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/reviews/user/${userId}?sort=${sortBy}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()

      if (response.ok) {
        setReviews(data.reviews || [])
        setAverageRating(data.averageRating || 0)
        setReviewCount(data.reviewCount || 0)
      } else {
        setError(data.error || 'Failed to load ratings')
      }
    } catch (err) {
      setError('Connection error')
      console.error('Fetch ratings error:', err)
    } finally {
      setLoading(false)
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

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <Text
        key={star}
        fontSize="md"
        color={star <= rating ? '#d97baa' : '#666'}
        as="span"
      >
        ★
      </Text>
    ))
  }

  return (
    <Box minH="100vh" bg="#0a0e27">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid #1a1f3a" py={4} px={8}>
        <HStack justify="space-between" align="center">
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
      <Box py={8} px={8} maxW="1000px" mx="auto">
        <VStack align="start" spacing={6} w="full">
          <HStack justify="space-between" w="full" align="start">
            <VStack align="start" spacing={2}>
              <Heading as="h1" size="2xl" color="white">
                Ratings & Reviews
              </Heading>
              <Text color="#aaa" fontSize="md">
                {userName && `Reviews for ${userName}`}
              </Text>
            </VStack>
            <Box
              as="select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              bg="#1a1f3a"
              border="1px solid #3a4456"
              borderRadius="md"
              color="white"
              w="200px"
              p={2}
              fontSize="sm"
              cursor="pointer"
              _focus={{ borderColor: '#d97baa', outline: 'none' }}
              sx={{
                '& option': {
                  background: '#1a1f3a',
                  color: 'white'
                }
              }}
            >
              <option value="newest" style={{ background: '#1a1f3a' }}>Newest First</option>
              <option value="oldest" style={{ background: '#1a1f3a' }}>Oldest First</option>
              <option value="highest" style={{ background: '#1a1f3a' }}>Highest Rating</option>
              <option value="lowest" style={{ background: '#1a1f3a' }}>Lowest Rating</option>
            </Box>
          </HStack>

          {error && (
            <Box bg="red.900" color="red.200" p={3} borderRadius="md" w="full">
              <Text fontSize="sm">{error}</Text>
            </Box>
          )}

          {/* Rating Summary */}
          <Box w="full" bg="#1a1f3a" p={6} borderRadius="md" border="1px solid #3a4456">
            <HStack spacing={8} align="center">
              <VStack align="center" spacing={2}>
                <Text color="white" fontSize="4xl" fontWeight="bold">
                  {averageRating.toFixed(1)}
                </Text>
                <HStack spacing={1}>
                  {renderStars(Math.round(averageRating))}
                </HStack>
                <Text color="#aaa" fontSize="sm">
                  {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Reviews List */}
          {loading ? (
            <VStack spacing={4} py={8} w="full">
              <Spinner size="xl" color="#d97baa" />
              <Text color="white">Loading reviews...</Text>
            </VStack>
          ) : reviews.length === 0 ? (
            <Box w="full" p={8} bg="#1a1f3a" borderRadius="md" textAlign="center" border="1px solid #3a4456">
              <Text color="#aaa">No reviews yet.</Text>
            </Box>
          ) : (
            <VStack spacing={4} w="full">
              {reviews.map((review) => (
                <Box
                  key={review._id}
                  w="full"
                  bg="#1a1f3a"
                  p={6}
                  borderRadius="md"
                  border="1px solid #3a4456"
                >
                  <VStack align="start" spacing={4} w="full">
                    <HStack justify="space-between" w="full" align="start">
                      <HStack spacing={4}>
                        {review.reviewerId?.profilePicture ? (
                          <Box
                            as="img"
                            src={review.reviewerId.profilePicture}
                            alt={review.reviewerId.username}
                            borderRadius="full"
                            boxSize="50px"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <Box
                            borderRadius="full"
                            boxSize="50px"
                            bg="#0a0e27"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text color="#666" fontSize="xl">👤</Text>
                          </Box>
                        )}
                        <VStack align="start" spacing={1}>
                          <Text color="white" fontWeight="bold">
                            {review.reviewerId?.firstName && review.reviewerId?.lastName
                              ? `${review.reviewerId.firstName} ${review.reviewerId.lastName}`
                              : review.reviewerId?.username || 'Anonymous'}
                          </Text>
                          <HStack spacing={1}>
                            {renderStars(review.rating)}
                          </HStack>
                        </VStack>
                      </HStack>
                      <Text color="#aaa" fontSize="sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Text>
                    </HStack>
                    {review.comment && (
                      <Text color="#aaa" fontSize="sm" whiteSpace="pre-wrap">
                        {review.comment}
                      </Text>
                    )}
                    {review.jobId && (
                      <Badge bg="#3a3f5e" color="white" fontSize="xs">
                        Job: {review.jobId.title || 'N/A'}
                      </Badge>
                    )}
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}
        </VStack>
      </Box>
    </Box>
  )
}

