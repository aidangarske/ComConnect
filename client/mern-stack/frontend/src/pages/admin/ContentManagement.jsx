import { useState, useEffect } from 'react';
import {
  Box, Flex, Badge, Button, Text, Spinner, Heading
  // REMOVED: Grid, GridItem, HStack, VStack, Tooltip (causing crash)
} from '@chakra-ui/react';
import { toast } from 'react-toastify'; 
import { apiFetch } from '../../utils/tokenUtils'; 

// Simple SVG Icon
const AlertIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ color: "#fc8181" }} 
  >
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

export default function ContentManagement() {
  const [reportedJobs, setReportedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchReportedContent();
  }, []);

  const fetchReportedContent = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/content/reported');
      const data = await res.json();
      
      if (res.ok) {
        setReportedJobs(data.jobs || []);
      } else {
        toast.error("Failed to load reported content");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (jobId, action) => {
    if (!window.confirm(action === 'delete' ? "Delete this job permanently?" : "Dismiss all reports?")) return;

    setActionLoading(jobId);
    try {
      let endpoint = '';
      let method = '';

      if (action === 'delete') {
        endpoint = `/admin/content/${jobId}`;
        method = 'DELETE';
      } else if (action === 'dismiss') {
        endpoint = `/admin/content/${jobId}/dismiss`;
        method = 'PUT';
      }

      const res = await apiFetch(endpoint, { method });
      
      if (res.ok) {
        toast.success(action === 'delete' ? "Content Removed" : "Reports Dismissed");
        setReportedJobs(prev => prev.filter(job => job._id !== jobId));
      } else {
        toast.error("Action failed");
      }
    } catch (err) {
      toast.error("Server Error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Box bg="#1a1f3a" p={6} borderRadius="xl" border="1px solid rgba(255,255,255,0.05)" minH="400px" w="full">
      
      {/* Header Section */}
      <Flex mb={6} align="center" gap={3} borderBottom="1px solid rgba(255,255,255,0.1)" pb={4}>
        <AlertIcon />
        <Heading as="h3" size="lg" color="white">Moderation Queue</Heading>
        {reportedJobs.length > 0 && (
          <Badge colorScheme="red" borderRadius="full" px={2} fontSize="0.9em">
            {reportedJobs.length} Pending
          </Badge>
        )}
      </Flex>

      {/* Main Content Area */}
      {loading ? (
        <Flex justify="center" py={10}><Spinner color="#d97baa" size="xl" /></Flex>
      ) : reportedJobs.length === 0 ? (
        <Box p={10} textAlign="center" border="1px dashed" borderColor="gray.700" borderRadius="lg" bg="rgba(0,0,0,0.2)">
          <Text fontSize="2xl" mb={2}>🛡️</Text>
          <Text color="gray.300" fontWeight="bold">All Clean!</Text>
          <Text color="gray.500" fontSize="sm">There are no flagged job postings at this time.</Text>
        </Box>
      ) : (
        <Box>
          
          {/* Table Header Row */}
          <Flex bg="whiteAlpha.100" p={3} borderRadius="top-lg" mb={2}>
            <Text flex="2" color="gray.400" fontWeight="bold" fontSize="sm">JOB DETAILS</Text>
            <Text flex="1.5" color="gray.400" fontWeight="bold" fontSize="sm">POSTED BY</Text>
            <Text flex="1.5" color="gray.400" fontWeight="bold" fontSize="sm">REASON</Text>
            <Text flex="1" color="gray.400" fontWeight="bold" fontSize="sm" textAlign="right">ACTIONS</Text>
          </Flex>

          {/* List Items */}
          <Box as="div"> 
            {reportedJobs.map((job) => (
              <Flex 
                key={job._id} 
                p={4} 
                mb={2}
                bg="whiteAlpha.50"
                borderRadius="md"
                align="center"
                _hover={{ bg: 'whiteAlpha.100' }}
              >
                
                {/* Job Title & Category */}
                <Box flex="2">
                  <Flex direction="column" gap={1}>
                    <Text fontWeight="bold" color="white" fontSize="md">{job.title}</Text>
                    <Box>
                      <Badge colorScheme="purple" fontSize="xs">{job.category}</Badge>
                    </Box>
                    <Text fontSize="xs" color="gray.500">ID: {job._id.slice(-6)}</Text>
                  </Flex>
                </Box>

                {/* Provider Info */}
                <Box flex="1.5">
                  <Text color="#d97baa" fontWeight="medium">
                    {job.postedBy?.firstName} {job.postedBy?.lastName}
                  </Text>
                  <Text fontSize="xs" color="gray.500">{job.postedBy?.email}</Text>
                </Box>

                {/* Report Details */}
                <Box flex="1.5">
                   <Flex direction="column" gap={1}>
                     <Box>
                        <Badge colorScheme="orange" variant="solid">
                          {job.reports.length} Flag{job.reports.length !== 1 ? 's' : ''}
                        </Badge>
                     </Box>
                     <Text fontSize="sm" color="gray.300" fontStyle="italic" noOfLines={2}>
                       "{job.reports[job.reports.length - 1]?.reason}"
                     </Text>
                   </Flex>
                </Box>

                {/* Action Buttons */}
                <Box flex="1" textAlign="right">
                  <Flex justify="flex-end" gap={2}>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      colorScheme="green"
                      borderColor="green.600"
                      color="green.400"
                      _hover={{ bg: 'green.900' }}
                      onClick={() => handleAction(job._id, 'dismiss')}
                      isLoading={actionLoading === job._id}
                    >
                      ✓
                    </Button>

                    <Button 
                      size="sm" 
                      bg="red.500" 
                      color="white"
                      _hover={{ bg: 'red.600' }}
                      onClick={() => handleAction(job._id, 'delete')}
                      isLoading={actionLoading === job._id}
                    >
                      ✕
                    </Button>
                  </Flex>
                </Box>
              </Flex>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}