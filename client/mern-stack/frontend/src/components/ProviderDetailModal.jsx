import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Heading,
  Badge,
  Spinner
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { startChatWithRecipient } from '../utils/chatUtils';
import exampleProfilepic from "../profile_picture/OIP.jpg";

const API_URL = 'http://localhost:8080/api';

// Specialty icons mapping (must match Profile.jsx)
const SPECIALTY_ICONS = {
  'manual labor': '🔨',
  'tutoring': '📚',
  'painting': '🎨',
  'cleaning': '🧹',
  'gardening': '🌱',
  'automotive': '🚗',
  'design': '🎨',
  'assembly': '🔧',
  'plumbing': '🚿',
  'electrical': '⚡',
  'photography': '📷',
  'music': '🎵',
  'writing': '✍️',
  'construction': '🏗️',
  'carpentry': '🪵',
  'other': '⭐'
};

export default function ProviderDetailModal({ isOpen, onClose, provider, onHire }) {
  const navigate = useNavigate();
  const [fullProviderData, setFullProviderData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && provider) {
      // If we already have full data, use it; otherwise fetch it
      if (provider.bio || provider.email || provider.phone) {
        setFullProviderData(provider);
      } else {
        fetchProviderDetails();
      }
    } else {
      setFullProviderData(null);
    }
  }, [isOpen, provider]);

  const fetchProviderDetails = async () => {
    if (!provider?._id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/${provider._id}`);
      const data = await response.json();
      if (response.ok && data.user) {
        setFullProviderData(data.user);
      } else {
        // Fallback to provided provider data
        setFullProviderData(provider);
      }
    } catch (err) {
      console.error('Failed to fetch provider details:', err);
      setFullProviderData(provider);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = () => {
    if (provider?._id) {
      startChatWithRecipient(provider._id, navigate);
      onClose();
    }
  };

  const handleHire = () => {
    if (onHire) {
      onHire(provider);
    }
    onClose();
  };

  if (!isOpen || !provider) return null;

  const displayProvider = fullProviderData || provider;
  const name = displayProvider.name || `${displayProvider.firstName || ''} ${displayProvider.lastName || ''}`.trim() || 'Service Provider';
  const username = displayProvider.username || `@${displayProvider.firstName?.toLowerCase() || 'user'}`;
  const rating = displayProvider.rating || 0;
  const reviewCount = displayProvider.reviewCount || 0;
  const hourlyRate = displayProvider.hourlyRate || 0;
  const distance = displayProvider.distance || 0;
  const specialties = displayProvider.specialties || [];
  const bio = displayProvider.bio || displayProvider.description || 'No bio available.';
  const email = displayProvider.email;
  const phone = displayProvider.phone;
  const location = displayProvider.location;

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
        bg="blackAlpha.600"
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
        boxShadow="2xl"
        zIndex={2001}
      >
        {loading ? (
          <Box p={8} textAlign="center">
            <Spinner size="xl" color="#d97baa" />
            <Text mt={4} color="#aaa">Loading provider details...</Text>
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box
              p={6}
              borderBottom="1px solid #3a4456"
              position="sticky"
              top="0"
              bg="#1a1f3a"
              zIndex={10}
            >
              <HStack justify="space-between" align="start" mb={2}>
                <HStack spacing={4} align="center">
                  <Box
                    as="img"
                    src={displayProvider.profilePicture || displayProvider.image || exampleProfilepic}
                    alt={name}
                    borderRadius="full"
                    boxSize="80px"
                    border="2px solid #3a4456"
                    style={{ objectFit: 'cover' }}
                  />
                  <VStack align="start" spacing={1}>
                    <Heading as="h2" size="lg">{name}</Heading>
                    <Text color="#d97baa" fontSize="sm">{username}</Text>
                    <HStack 
                      spacing={2} 
                      cursor={reviewCount > 0 ? "pointer" : "default"}
                      onClick={reviewCount > 0 ? () => {
                        navigate(`/ratings/${displayProvider._id || provider._id}`);
                        onClose();
                      } : undefined}
                      _hover={reviewCount > 0 ? { opacity: 0.8 } : {}}
                      transition="opacity 0.2s"
                    >
                      <Text color="white" fontSize="md">{rating}⭐</Text>
                      {reviewCount > 0 && (
                        <Text color="#aaa" fontSize="sm">({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</Text>
                      )}
                    </HStack>
                  </VStack>
                </HStack>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                >
                  ✕
                </Button>
              </HStack>
            </Box>

            {/* Content */}
            <VStack spacing={6} align="stretch" p={6}>

            {/* Bio/Description */}
            <Box bg="#0a0e27" p={4} borderRadius="md" border="1px solid #3a4456">
              <Text color="#aaa" fontSize="xs" fontWeight="bold" mb={2}>ABOUT</Text>
              <Text color="white" fontSize="md" whiteSpace="pre-wrap">{bio}</Text>
            </Box>

            {/* Specialties */}
            {specialties.length > 0 && (
              <Box>
                <Text color="#aaa" fontSize="xs" fontWeight="bold" mb={2}>SPECIALTIES</Text>
                <HStack spacing={2} flexWrap="wrap">
                  {specialties.map((specialty, idx) => (
                    <Badge 
                      key={idx} 
                      bg="#d97baa" 
                      color="white" 
                      px={3} 
                      py={2} 
                      borderRadius="full"
                      fontSize="sm"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <Text fontSize="md">{SPECIALTY_ICONS[specialty.toLowerCase()] || SPECIALTY_ICONS[specialty] || '⭐'}</Text>
                      <Text textTransform="capitalize">{specialty}</Text>
                    </Badge>
                  ))}
                </HStack>
              </Box>
            )}

            {/* Contact Information */}
            <VStack align="stretch" spacing={3}>
              <Text color="#aaa" fontSize="xs" fontWeight="bold">CONTACT INFORMATION</Text>
              
              {email && (
                <Box bg="#0a0e27" p={3} borderRadius="md" border="1px solid #3a4456">
                  <HStack spacing={2}>
                    <Text color="#d97baa" fontSize="md">📧</Text>
                    <Text color="white" fontSize="sm">{email}</Text>
                  </HStack>
                </Box>
              )}
              
              {phone && (
                <Box bg="#0a0e27" p={3} borderRadius="md" border="1px solid #3a4456">
                  <HStack spacing={2}>
                    <Text color="#d97baa" fontSize="md">📞</Text>
                    <Text color="white" fontSize="sm">{phone}</Text>
                  </HStack>
                </Box>
              )}
            </VStack>

            {/* Location and Rate */}
            <HStack spacing={4} justify="space-between" bg="#0a0e27" p={4} borderRadius="md" border="1px solid #3a4456">
              <VStack align="start" spacing={1}>
                <Text color="#aaa" fontSize="xs" fontWeight="bold">DISTANCE</Text>
                <Text color="white" fontSize="lg">📍 {distance}mi away</Text>
              </VStack>
              <VStack align="end" spacing={1}>
                <Text color="#aaa" fontSize="xs" fontWeight="bold">HOURLY RATE</Text>
                <Text color="#d97baa" fontSize="lg" fontWeight="bold">${hourlyRate}/hr</Text>
              </VStack>
            </HStack>

            {/* Action Buttons */}
            <HStack spacing={3} pt={4} borderTop="1px solid #3a4456">
              <Button
                flex={1}
                bg="transparent"
                border="1px solid #3a4456"
                color="white"
                _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                onClick={handleMessage}
              >
                Message
              </Button>
              <Button
                flex={1}
                bg="#d97baa"
                color="white"
                _hover={{ bg: '#c55a8f' }}
                onClick={handleHire}
              >
                Hire
              </Button>
            </HStack>
          </VStack>
          </>
        )}
      </Box>
    </Box>
  );
}

