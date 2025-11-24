import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Spinner
} from '@chakra-ui/react';
import { useRole } from './RoleContext';
import { toast } from 'react-toastify';
import { startChatWithRecipient } from '../utils/chatUtils.js';
import CompleteJobModal from './CompleteJobModal';
import { getSocket } from '../utils/socket';

const API_URL = 'http://localhost:8080/api';

export default function JobDetailModal({ isOpen, onClose, jobId }) {
  const navigate = useNavigate();
  const { role, user } = useRole();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applications, setApplications] = useState([]);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchJob();
    }
  }, [isOpen, jobId]);

  useEffect(() => {
    if (isOpen) {
      const socket = getSocket();
      // Listen for real-time job updates
      socket.on('jobApplication', handleJobApplication);
      socket.on('jobUpdated', handleJobUpdated);
      socket.on('jobProviderSelected', handleJobProviderSelected);
      socket.on('jobCompleted', handleJobCompleted);

      return () => {
        socket.off('jobApplication', handleJobApplication);
        socket.off('jobUpdated', handleJobUpdated);
        socket.off('jobProviderSelected', handleJobProviderSelected);
        socket.off('jobCompleted', handleJobCompleted);
      };
    }
  }, [isOpen, jobId]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`);
      const data = await response.json();
      if (response.ok && data.job) {
        setJob(data.job);
        setApplications(data.job.applications || []);
      } else {
        toast.error(data.error || 'Failed to load job details');
        onClose();
      }
    } catch (err) {
      console.error('Failed to fetch job:', err);
      toast.error('Failed to load job details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleJobApplication = (data) => {
    if (data.jobId === jobId) {
      setJob(data.job);
      setApplications(data.job.applications || []);
    }
  };

  const handleJobUpdated = (data) => {
    if (data.jobId === jobId) {
      setJob(data.job);
      setApplications(data.job.applications || []);
    }
  };

  const handleJobProviderSelected = (data) => {
    if (data.jobId === jobId) {
      setJob(data.job);
      setApplications(data.job.applications || []);
    }
  };

  const handleJobCompleted = (data) => {
    if (data.jobId === jobId) {
      setJob(data.job);
      setApplications(data.job.applications || []);
    }
  };

  const handleCompleteJob = () => {
    setIsCompleteModalOpen(true);
  };

  const handleJobCompleteSuccess = () => {
    fetchJob(); // Refresh job data
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please log in to apply');
      return;
    }

    setApplying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Application submitted successfully!');
        fetchJob(); // Refresh job data
      } else {
        toast.error(data.error || 'Failed to apply');
      }
    } catch (err) {
      console.error('Failed to apply:', err);
      toast.error('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleHire = (providerId) => {
    navigate(`/hire/${jobId}/${providerId}`);
    onClose();
  };

  const isJobOwner = job && user && (
    (typeof job.postedBy === 'object' ? job.postedBy._id : job.postedBy) === user.id
  );

  const hasApplied = user && applications.some(
    app => (app.providerId?._id || app.providerId) === user.id
  );

  const isHiredProvider = job && user && job.selectedProvider && 
    (job.selectedProvider._id || job.selectedProvider).toString() === user.id.toString();
  
  const isHiredProviderInProgress = isHiredProvider && job.status === 'in-progress';
  const isHiredProviderCompleted = isHiredProvider && job.status === 'completed';

  if (!isOpen) {
    return null;
  }

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Overlay */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="blackAlpha.600"
        backdropFilter="blur(4px)"
      />

      {/* Modal Content */}
      <Box
        position="relative"
        bg="#1a1f3a"
        color="white"
        borderRadius="lg"
        maxW="800px"
        w="90%"
        maxH="90vh"
        overflowY="auto"
        boxShadow="2xl"
        zIndex={1001}
      >
        {/* Header */}
        <Box
          p={6}
          borderBottom="1px solid #3a4456"
          position="sticky"
          top="0"
          bg="#1a1f3a"
          zIndex={10}
        >
          <HStack justify="space-between" align="center" mb={2}>
            {loading ? (
              <VStack spacing={4} py={8} w="full">
                <Spinner size="xl" color="#d97baa" />
                <Text>Loading job details...</Text>
              </VStack>
            ) : job ? (
              <>
                <Text fontSize="2xl" fontWeight="bold">{job.title}</Text>
                <HStack spacing={2}>
                  <Badge
                    bg={
                      job.status === 'open' ? '#d97baa' :
                      job.status === 'in-progress' ? '#4CAF50' :
                      job.status === 'completed' ? '#2196F3' : '#999'
                    }
                    color="white"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {job.status}
                  </Badge>
                  {!isJobOwner && role === 'provider' && hasApplied && (
                    <Badge
                      bg="#4CAF50"
                      color="white"
                      px={3}
                      py={1}
                      borderRadius="full"
                    >
                      Applied
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    ✕
                  </Button>
                </HStack>
              </>
            ) : null}
          </HStack>
        </Box>

        {/* Body */}
        {!loading && job && (
          <Box p={6}>
            <VStack align="start" spacing={6}>
              {/* Job Details */}
              <Box w="full">
                <Text fontSize="lg" fontWeight="bold" mb={2}>Description</Text>
                <Text color="#aaa" whiteSpace="pre-wrap">{job.description}</Text>
              </Box>

              <Box w="full" h="1px" bg="#3a4456" my={4} />

              {/* Job Info */}
              <HStack spacing={8} flexWrap="wrap">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="#aaa">Budget</Text>
                  <Text fontSize="lg" fontWeight="bold" color="#d97baa">
                    ${job.budget} {job.budgetType === 'hourly' ? '/hr' : ''}
                  </Text>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="#aaa">Category</Text>
                  <Badge bg="#3a3f5e" color="white" px={3} py={1} borderRadius="full">
                    {job.category}
                  </Badge>
                </VStack>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="#aaa">Duration</Text>
                  <Text fontSize="md">{job.estimatedDuration}</Text>
                </VStack>
              </HStack>

              {/* Poster Info */}
              {job.postedBy && (
                <>
                  <Box w="full" h="1px" bg="#3a4456" my={4} />
                  <Box w="full">
                    <Text fontSize="sm" color="#aaa" mb={2}>Posted by</Text>
                    <HStack spacing={2}>
                      <Text fontWeight="bold">
                        {job.posterName || 
                         (typeof job.postedBy === 'object' 
                           ? `${job.postedBy.firstName} ${job.postedBy.lastName}`.trim()
                           : 'Unknown')}
                      </Text>
                      {job.posterRating > 0 && (
                        <Text color="#aaa">⭐ {job.posterRating}</Text>
                      )}
                    </HStack>
                  </Box>
                </>
              )}

              {/* Applicants Section (for job owner) */}
              {isJobOwner && applications.length > 0 && (
                <>
                  <Box w="full" h="1px" bg="#3a4456" my={4} />
                  <Box w="full">
                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                      Applicants ({applications.length})
                    </Text>
                    <VStack spacing={3} align="start" w="full">
                      {applications.map((app, idx) => {
                        const providerId = app.providerId?._id || app.providerId;
                        const providerName = app.providerName || 
                          (app.providerId?.firstName && app.providerId?.lastName
                            ? `${app.providerId.firstName} ${app.providerId.lastName}`.trim()
                            : 'Unknown Provider');
                        const providerRating = app.providerRating || app.providerId?.rating || 0;
                        const isSelected = job.selectedProvider && 
                          (job.selectedProvider._id || job.selectedProvider).toString() === providerId.toString();

                        return (
                          <Box
                            key={idx}
                            w="full"
                            p={4}
                            bg="#0a0e27"
                            borderRadius="md"
                            border="1px solid #3a4456"
                          >
                            <HStack justify="space-between" align="center" w="full">
                              <VStack align="start" spacing={1} flex={1}>
                                <Text fontWeight="bold">{providerName}</Text>
                                {providerRating > 0 && (
                                  <Text fontSize="sm" color="#aaa">⭐ {providerRating}</Text>
                                )}
                                {isSelected && (
                                  <Badge bg="#4CAF50" color="white" fontSize="xs">Selected</Badge>
                                )}
                              </VStack>
                              <HStack spacing={2}>
                                {!isSelected && job.status === 'open' && (
                                  <>
                                    <Button
                                      size="sm"
                                      bg="transparent"
                                      border="1px solid #d97baa"
                                      color="#d97baa"
                                      _hover={{ bg: 'rgba(217, 123, 170, 0.1)' }}
                                      onClick={() => {
                                        startChatWithRecipient(providerId, navigate);
                                        onClose();
                                      }}
                                    >
                                      Message
                                    </Button>
                                    <Button
                                      size="sm"
                                      bg="#d97baa"
                                      color="white"
                                      _hover={{ bg: '#c55a8f' }}
                                      onClick={() => handleHire(providerId)}
                                    >
                                      Accept & Hire
                                    </Button>
                                  </>
                                )}
                              </HStack>
                            </HStack>
                          </Box>
                        );
                      })}
                    </VStack>
                  </Box>
                </>
              )}

              {/* Selected Provider (for job owner) */}
              {isJobOwner && job.selectedProvider && (
                <>
                  <Box w="full" h="1px" bg="#3a4456" my={4} />
                  <Box w="full" p={4} bg="#0a0e27" borderRadius="md" border="1px solid #4CAF50">
                    <Text fontSize="sm" color="#aaa" mb={2}>Selected Provider</Text>
                    <Text fontWeight="bold">
                      {typeof job.selectedProvider === 'object'
                        ? `${job.selectedProvider.firstName} ${job.selectedProvider.lastName}`.trim()
                        : 'Provider'}
                    </Text>
                  </Box>
                </>
              )}

              {/* Completion Notes (if job is completed) */}
              {job.completed && job.completionNotes && (
                <>
                  <Box w="full" h="1px" bg="#3a4456" my={4} />
                  <Box w="full" p={4} bg="#0a0e27" borderRadius="md" border="1px solid #2196F3">
                    <Text fontSize="sm" color="#aaa" mb={2}>Completion Notes</Text>
                    <Text color="white">{job.completionNotes}</Text>
                    {job.completedAt && (
                      <Text fontSize="xs" color="#999" mt={2}>
                        Completed on: {new Date(job.completedAt).toLocaleDateString()}
                      </Text>
                    )}
                  </Box>
                </>
              )}
            </VStack>
          </Box>
        )}

        {/* Footer */}
        {!loading && job && (
          <Box
            p={6}
            borderTop="1px solid #3a4456"
            position="sticky"
            bottom="0"
            bg="#1a1f3a"
          >
            <HStack spacing={3} justify="flex-end">
              {!isJobOwner && role === 'provider' && job.status === 'open' && (
                <Button
                  bg="#d97baa"
                  color="white"
                  _hover={{ bg: '#c55a8f' }}
                  onClick={handleApply}
                  isDisabled={applying || hasApplied}
                  isLoading={applying}
                >
                  {hasApplied ? 'Already Applied' : 'Apply Now'}
                </Button>
              )}
              {isHiredProviderInProgress && (
                <Button
                  bg="#4CAF50"
                  color="white"
                  _hover={{ bg: '#45a049' }}
                  onClick={handleCompleteJob}
                >
                  Complete Job
                </Button>
              )}
              {isHiredProviderCompleted && job.postedBy && (
                <Button
                  bg="#d97baa"
                  color="white"
                  _hover={{ bg: '#c55a8f' }}
                  onClick={() => {
                    const seekerId = typeof job.postedBy === 'object'
                      ? job.postedBy._id || job.postedBy
                      : job.postedBy;
                    navigate(`/ratings/submit/${job._id}/${seekerId}`);
                    onClose();
                  }}
                >
                  Rate Seeker
                </Button>
              )}
              {isJobOwner && job.status === 'completed' && job.selectedProvider && (
                <Button
                  bg="#d97baa"
                  color="white"
                  _hover={{ bg: '#c55a8f' }}
                  onClick={() => {
                    const providerId = typeof job.selectedProvider === 'object'
                      ? job.selectedProvider._id || job.selectedProvider
                      : job.selectedProvider;
                    navigate(`/ratings/submit/${job._id}/${providerId}`);
                    onClose();
                  }}
                >
                  Rate Provider
                </Button>
              )}
              <Button variant="ghost" onClick={onClose}>
                Close
              </Button>
            </HStack>
          </Box>
        )}
      </Box>

      {/* Complete Job Modal */}
      <CompleteJobModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        jobId={jobId}
        onComplete={handleJobCompleteSuccess}
      />
    </Box>
  );
}
