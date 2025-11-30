import { useState, useRef, useEffect } from 'react';
import {
  Button,
  VStack,
  Textarea,
  Text,
  Box,
  HStack
} from '@chakra-ui/react';
import { toast } from 'react-toastify'; 
import { apiFetch } from '../utils/tokenUtils';

// Simple SVG Icon
const FlagIcon = () => (
  <svg 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
  </svg>
);

export default function ReportJobButton({ jobId }) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleReport = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/jobs/${jobId}/report`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Job reported successfully");
        setIsOpen(false);
        setReason(''); 
      } else {
        toast.error(data.error || "Failed to report job");
      }
    } catch (err) {
      toast.error("Server Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box position="relative" ref={containerRef}>
      <Button 
        size="sm" 
        bg="rgba(245, 101, 101, 0.2)" 
        border="1px solid"
        borderColor="red.500"
        color="red.300"
        leftIcon={<FlagIcon />}
        onClick={() => setIsOpen(!isOpen)}
        _hover={{ bg: 'red.500', color: 'white' }}
        mr={2}
      >
        Report
      </Button>

      {isOpen && (
        <Box 
          position="absolute"
          top="100%"
          right="0"
          mt={2}
          w="300px"
          bg="#1a1f3a"
          border="1px solid"
          borderColor="gray.600"
          borderRadius="md"
          boxShadow="2xl"
          p={4}
          zIndex={2000}
        >
          <HStack justify="space-between" mb={3}>
            <Text fontWeight="bold" color="white" fontSize="sm">Report listing</Text>
            <Button 
                size="sm" 
                bg="rgba(245, 101, 101, 0.2)" 
                border="1px solid"
                borderColor="red.500"
                color="red.300"
                leftIcon={<FlagIcon />}
                onClick={() => setIsOpen(!isOpen)}
                _hover={{ bg: 'red.500', color: 'white' }}
                mr={2}
            >
            ✕
            </Button>
          </HStack>

          <VStack spacing={3}>
            <Text fontSize="xs" color="gray.400">
              Why are you reporting this job?
            </Text>
            <Textarea 
              placeholder="e.g. Scam, Spam, Offensive..." 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              bg="2d3748"
              borderColor="gray.500"
              color="white"
              size="sm"
              rows={3}
              _focus={{ borderColor: "red.400", bg: 'rgba(0,0,0,0.3)' }}
              _hover={{ borderColor: "gray.400" }}
            />
            <Button 
              w="full" 
              colorScheme="red" 
              size="sm" 
              isLoading={isSubmitting}
              onClick={handleReport}
            >
              Submit Report
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  );
}