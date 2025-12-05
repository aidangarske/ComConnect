import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Input,
  Textarea,
  Spinner
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { getToken } from '../utils/tokenUtils';

import { API_URL } from '../config/api.js';

const categories = [
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
  'other'
];

export default function DirectHireModal({ isOpen, onClose, provider, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [category, setCategory] = useState('other');
  const [estimatedDuration, setEstimatedDuration] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Debug: Log when modal opens
  useEffect(() => {
    if (isOpen && provider) {
      console.log('DirectHireModal opened with provider:', provider);
    }
  }, [isOpen, provider]);

  if (!isOpen || !provider) return null;

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('handleSubmit called', { 
      title, 
      description, 
      budget, 
      category, 
      provider: provider?._id || provider?.id 
    });
    
    if (!title.trim() || !description.trim() || !budget.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isNaN(budget) || parseFloat(budget) <= 0) {
      toast.error('Budget must be a valid positive number');
      return;
    }

    if (!provider || (!provider._id && !provider.id)) {
      toast.error('Provider information is missing');
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error('Please log in to hire a provider');
        onClose();
        return;
      }

      const providerId = provider._id || provider.id;
      const requestBody = {
        title: title.trim(),
        description: description.trim(),
        budget: parseFloat(budget),
        category,
        estimatedDuration: estimatedDuration.trim() || '1-2 weeks',
        providerId: providerId
      };

      console.log('Sending direct hire request:', requestBody);

      // Create job and immediately hire the provider
      const response = await fetch(`${API_URL}/jobs/direct-hire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('Direct hire response:', response.status, data);

      if (response.ok) {
        toast.success(`Hire request sent to ${provider.name || provider.firstName || 'provider'}! They will need to accept it.`);
        // Reset form
        setTitle('');
        setDescription('');
        setBudget('');
        setCategory('other');
        setEstimatedDuration('');
        onSuccess && onSuccess();
        onClose();
      } else {
        console.error('Direct hire failed:', data);
        toast.error(data.error || 'Failed to hire provider');
      }
    } catch (err) {
      console.error('Failed to hire provider:', err);
      toast.error('Failed to complete hiring process. Check console for details.');
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
        maxW="700px"
        w="90%"
        maxH="90vh"
        overflowY="auto"
        p={6}
        boxShadow="2xl"
        zIndex={2001}
      >
        <VStack spacing={6} align="stretch" as="form" onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Heading as="h2" size="lg">Hire {provider.name || provider.firstName || 'Provider'}</Heading>
              <Text color="#aaa" fontSize="sm">Create a job and hire this provider directly</Text>
            </VStack>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              isDisabled={submitting}
              type="button"
            >
              ✕
            </Button>
          </HStack>

          <VStack spacing={4} align="stretch">
            {/* Job Title */}
            <VStack align="stretch" spacing={2}>
              <Text fontSize="sm" color="#999" fontWeight="bold">
                Job Title *
              </Text>
              <Input
                placeholder="e.g., Need help with plumbing repair"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                bg="#0a0e27"
                border="1px solid #3a4456"
                borderRadius="md"
                color="white"
                _placeholder={{ color: '#666' }}
                _focus={{ borderColor: '#d97baa' }}
                disabled={submitting}
              />
            </VStack>

            {/* Description */}
            <VStack align="stretch" spacing={2}>
              <Text fontSize="sm" color="#999" fontWeight="bold">
                Description *
              </Text>
              <Textarea
                placeholder="Describe what you need help with..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                bg="#0a0e27"
                border="1px solid #3a4456"
                borderRadius="md"
                color="white"
                _placeholder={{ color: '#666' }}
                _focus={{ borderColor: '#d97baa' }}
                minH="120px"
                resize="vertical"
                disabled={submitting}
              />
            </VStack>

            {/* Budget and Category */}
            <HStack spacing={4} align="start">
              <VStack align="stretch" spacing={2} flex={1}>
                <Text fontSize="sm" color="#999" fontWeight="bold">
                  Budget ($) *
                </Text>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  bg="#0a0e27"
                  border="1px solid #3a4456"
                  borderRadius="md"
                  color="white"
                  _placeholder={{ color: '#666' }}
                  _focus={{ borderColor: '#d97baa' }}
                  disabled={submitting}
                />
              </VStack>

              <VStack align="stretch" spacing={2} flex={1}>
                <Text fontSize="sm" color="#999" fontWeight="bold">
                  Category
                </Text>
                <Box
                  as="select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  bg="#0a0e27"
                  border="1px solid #3a4456"
                  borderRadius="md"
                  color="white"
                  p={2}
                  fontSize="sm"
                  disabled={submitting}
                  _focus={{ borderColor: '#d97baa', outline: 'none' }}
                  _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
                  sx={{
                    '& option': {
                      background: '#0a0e27',
                      color: 'white'
                    }
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </Box>
              </VStack>
            </HStack>

            {/* Estimated Duration */}
            <VStack align="stretch" spacing={2}>
              <Text fontSize="sm" color="#999" fontWeight="bold">
                Estimated Duration
              </Text>
              <Input
                placeholder="e.g., 1-2 weeks, 3 days, 2 hours"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                bg="#0a0e27"
                border="1px solid #3a4456"
                borderRadius="md"
                color="white"
                _placeholder={{ color: '#666' }}
                _focus={{ borderColor: '#d97baa' }}
                disabled={submitting}
              />
            </VStack>
          </VStack>

          <HStack spacing={3} justify="flex-end" pt={2}>
            <Button
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              isDisabled={submitting}
              _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
              type="button"
            >
              Cancel
            </Button>
            <Button
              bg="#d97baa"
              color="white"
              _hover={{ bg: '#c55a8f' }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit(e);
              }}
              isDisabled={submitting || !title.trim() || !description.trim() || !budget.trim()}
              isLoading={submitting}
              loadingText="Hiring..."
              type="submit"
            >
              Hire Provider
            </Button>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}

