import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Image,
  Badge,
  Spinner
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { getToken } from '../utils/tokenUtils';
import comconnectLogo from '../logo/COMCONNECT_Logo.png';
import exampleProfilepic from '../profile_picture/OIP.jpg';

const API_URL = 'http://localhost:8080/api';

export default function HireProvider() {
  const navigate = useNavigate();
  const { jobId, providerId } = useParams();
  const [loading, setLoading] = useState(true);
  const [hiring, setHiring] = useState(false);
  const [job, setJob] = useState(null);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (jobId && providerId) {
      fetchData();
    }
  }, [jobId, providerId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch job details
      const jobResponse = await fetch(`${API_URL}/jobs/${jobId}`);
      const jobData = await jobResponse.json();
      
      if (!jobResponse.ok) {
        throw new Error(jobData.error || 'Failed to load job');
      }

      setJob(jobData.job);

      // Find the provider in applications
      const application = jobData.job.applications?.find(
        app => (app.providerId?._id || app.providerId).toString() === providerId
      );

      if (application) {
        setProvider({
          id: providerId,
          name: application.providerName || 'Unknown Provider',
          rating: application.providerRating || 0
        });
      } else {
        // Try to fetch provider details from users endpoint
        try {
          const providerResponse = await fetch(`${API_URL}/users/${providerId}`, {
            headers: {
              'Authorization': `Bearer ${getToken()}`
            }
          });
          const providerData = await providerResponse.json();
          if (providerResponse.ok) {
            setProvider({
              id: providerId,
              name: `${providerData.firstName} ${providerData.lastName}`.trim() || providerData.username,
              rating: providerData.rating || 0
            });
          }
        } catch (err) {
          console.error('Failed to fetch provider:', err);
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      toast.error(err.message || 'Failed to load job or provider details');
      navigate('/dashboard-seeker');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmHire = async () => {
    if (!job || !provider) return;

    setHiring(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error('Please log in to hire a provider');
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/jobs/${jobId}/select-provider`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ providerId: provider.id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`You have successfully hired ${provider.name} for this job.`);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard-seeker');
        }, 2000);
      } else {
        toast.error(data.error || 'Failed to hire provider');
      }
    } catch (err) {
      console.error('Failed to hire provider:', err);
      toast.error('Failed to complete hiring process');
    } finally {
      setHiring(false);
    }
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="#0a0e27" display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="xl" color="#d97baa" />
          <Text color="white">Loading...</Text>
        </VStack>
      </Box>
    );
  }

  if (!job || !provider) {
    return (
      <Box minH="100vh" bg="#0a0e27" py={8} px={8}>
        <VStack spacing={4}>
          <Text color="white" fontSize="xl">Job or provider not found</Text>
          <Button onClick={() => navigate('/dashboard-seeker')}>Go to Dashboard</Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="#0a0e27">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid #1a1f3a" py={4} px={8}>
        <HStack justify="space-between" align="center">
          <Image
            src={comconnectLogo}
            alt="ComConnect"
            h="80px"
            w="auto"
            objectFit="contain"
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
      <Box py={8} px={8} maxW="800px" mx="auto">
        <VStack align="start" spacing={8} w="full">
          <Heading as="h1" size="2xl" color="white">
            Confirm Hiring
          </Heading>
          <Text color="#aaa" fontSize="md">
            Review the details below and confirm to hire this provider for your job.
          </Text>

          {/* Job Details Card */}
          <Box
            w="full"
            bg="#1a1f3a"
            p={6}
            borderRadius="md"
            border="1px solid #3a4456"
          >
            <Heading as="h2" size="lg" color="white" mb={4}>
              Job Details
            </Heading>
            <VStack align="start" spacing={3}>
              <HStack spacing={4} w="full">
                <Text fontSize="sm" color="#aaa" minW="120px">Title:</Text>
                <Text color="white" fontWeight="bold">{job.title}</Text>
              </HStack>
              <HStack spacing={4} w="full">
                <Text fontSize="sm" color="#aaa" minW="120px">Description:</Text>
                <Text color="#aaa" whiteSpace="pre-wrap">{job.description}</Text>
              </HStack>
              <HStack spacing={4} w="full">
                <Text fontSize="sm" color="#aaa" minW="120px">Budget:</Text>
                <Text color="#d97baa" fontWeight="bold" fontSize="lg">
                  ${job.budget} {job.budgetType === 'hourly' ? '/hr' : ''}
                </Text>
              </HStack>
              <HStack spacing={4} w="full">
                <Text fontSize="sm" color="#aaa" minW="120px">Category:</Text>
                <Badge bg="#3a3f5e" color="white" px={3} py={1} borderRadius="full">
                  {job.category}
                </Badge>
              </HStack>
              <HStack spacing={4} w="full">
                <Text fontSize="sm" color="#aaa" minW="120px">Duration:</Text>
                <Text color="#aaa">{job.estimatedDuration}</Text>
              </HStack>
            </VStack>
          </Box>

          {/* Provider Details Card */}
          <Box
            w="full"
            bg="#1a1f3a"
            p={6}
            borderRadius="md"
            border="1px solid #3a4456"
          >
            <Heading as="h2" size="lg" color="white" mb={4}>
              Provider Details
            </Heading>
            <VStack align="start" spacing={3}>
              <HStack spacing={4} w="full">
                <Text fontSize="sm" color="#aaa" minW="120px">Name:</Text>
                <Text color="white" fontWeight="bold" fontSize="lg">{provider.name}</Text>
              </HStack>
              {provider.rating > 0 && (
                <HStack spacing={4} w="full">
                  <Text fontSize="sm" color="#aaa" minW="120px">Rating:</Text>
                  <Text color="white">⭐ {provider.rating}</Text>
                </HStack>
              )}
            </VStack>
          </Box>

          <Box w="full" h="1px" bg="#3a4456" my={4} />

          {/* Action Buttons */}
          <HStack spacing={4} w="full" justify="flex-end">
            <Button
              variant="ghost"
              color="white"
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              onClick={() => navigate('/dashboard-seeker')}
              isDisabled={hiring}
            >
              Cancel
            </Button>
            <Button
              bg="#d97baa"
              color="white"
              _hover={{ bg: '#c55a8f' }}
              size="lg"
              px={8}
              onClick={handleConfirmHire}
              isLoading={hiring}
              loadingText="Hiring..."
            >
              Confirm Hire
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}

