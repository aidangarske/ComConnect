import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Textarea,
  Spinner
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { getToken } from '../utils/tokenUtils';

import { API_URL } from '../config/api.js';

export default function CompleteJobModal({ isOpen, onClose, jobId, onComplete }) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast.error('Please enter completion notes');
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/jobs/${jobId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ completionNotes: notes.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Job completed successfully!');
        setNotes('');
        onComplete && onComplete();
        onClose();
      } else {
        toast.error(data.error || 'Failed to complete job');
      }
    } catch (err) {
      console.error('Failed to complete job:', err);
      toast.error('Failed to complete job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      zIndex={2000}
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
        bg="blackAlpha.700"
        backdropFilter="blur(4px)"
      />

      {/* Modal Content */}
      <Box
        position="relative"
        bg="#1a1f3a"
        color="white"
        borderRadius="lg"
        maxW="600px"
        w="90%"
        p={6}
        boxShadow="2xl"
        zIndex={2001}
      >
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center">
            <Text fontSize="2xl" fontWeight="bold">Complete Job</Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              isDisabled={submitting}
            >
              ✕
            </Button>
          </HStack>

          <Text color="#aaa" fontSize="sm">
            Please provide notes about the completed work. This will be sent to the job seeker.
          </Text>

          <VStack align="stretch" spacing={2}>
            <Text fontSize="sm" color="#999" fontWeight="bold">
              Completion Notes *
            </Text>
            <Textarea
              placeholder="Describe the work that was completed, any issues encountered, materials used, etc..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              bg="#0a0e27"
              border="1px solid #3a4456"
              borderRadius="md"
              color="white"
              _placeholder={{ color: '#666' }}
              _focus={{ borderColor: '#d97baa' }}
              minH="150px"
              resize="vertical"
              isDisabled={submitting}
            />
          </VStack>

          <HStack spacing={3} justify="flex-end" pt={2}>
            <Button
              variant="ghost"
              onClick={onClose}
              isDisabled={submitting}
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
            >
              Cancel
            </Button>
            <Button
              bg="#4CAF50"
              color="white"
              _hover={{ bg: '#45a049' }}
              onClick={handleSubmit}
              isDisabled={submitting || !notes.trim()}
              isLoading={submitting}
              loadingText="Completing..."
            >
              Complete Job
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}

