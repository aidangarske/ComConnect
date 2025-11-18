import { useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Grid,
  Text,
  Badge,
  Button,
} from '@chakra-ui/react';
import { mockServices } from './mockData';

const ServiceList = ({ items, showActions, onUpdateStatus }) => (
  <VStack w="full" minW="700px">
    <Grid
      w="full"
      templateColumns={showActions ? '2fr 1fr 1fr 2fr' : '2fr 1fr 1fr 1fr'}
      gap={4}
      px={4}
      py={3}
      borderBottom="2px solid"
      borderColor="gray.600"
    >
      <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Service Title</Text>
      <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Provider</Text>
      <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Category</Text>
      {showActions && <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Actions</Text>}
    </Grid>

    {items.length === 0 && <Text p={4} color="gray.400">No services in this list.</Text>}

    {items.map((service) => (
      <Grid
        key={service.id}
        w="full"
        templateColumns={showActions ? '2fr 1fr 1fr 2fr' : '2fr 1fr 1fr 1fr'}
        gap={4}
        px={4}
        py={4}
        borderRadius="md"
        _hover={{ bg: '#2a2f4a' }}
        color="white"
        borderBottom="1px solid"
        borderColor="gray.700"
        alignItems="center" 
      >
        <Text fontWeight="medium">{service.title}</Text>
        <Text color="gray.300">{service.providerName}</Text>
        <Text color="gray.300">{service.category}</Text>
        {showActions && (
          <HStack spacing={2}>
            <Button
              size="xs"
              bg="green.500"
              color="white"
              _hover={{ bg: 'green.600' }}
              onClick={() => onUpdateStatus(service.id, 'approved')}
            >
              Approve
            </Button>
            <Button
              size="xs"
              bg="red.600"
              color="white"
              _hover={{ bg: 'red.700' }}
              onClick={() => onUpdateStatus(service.id, 'rejected')}
            >
              Reject
            </Button>
          </HStack>
        )}
      </Grid>
    ))}
  </VStack>
);

export default function ContentManagement() {
  const [services, setServices] = useState(mockServices);
  const [activeTab, setActiveTab] = useState('pending');

  const pendingServices = services.filter(s => s.status === 'pending');
  const approvedServices = services.filter(s => s.status === 'approved');

  const handleUpdateStatus = (id, newStatus) => {
    setServices(currentServices =>
      currentServices.map(service =>
        service.id === id ? { ...service, status: newStatus } : service
      )
    );
  };

  return (
    <Box bg="#1a1f3a" p={6} borderRadius="lg" w="full">
      <VStack align="start" spacing={6}>
        <Heading as="h3" size="lg" color="white">
          Content Management
        </Heading>

        <HStack spacing={4}>
          <Button
            bg={activeTab === 'pending' ? '#d97baa' : '#2a2f4a'}
            color="white"
            _hover={{ bg: activeTab === 'pending' ? '#c55a8f' : '#3a3f5a' }}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approval ({pendingServices.length})
          </Button>
          <Button
            bg={activeTab === 'approved' ? '#d97baa' : '#2a2f4a'}
            color="white"
            _hover={{ bg: activeTab === 'approved' ? '#c55a8f' : '#3a3f5a' }}
            onClick={() => setActiveTab('approved')}
          >
            All Approved ({approvedServices.length})
          </Button>
        </HStack>

        <Box w="full" pt={4}>
          {activeTab === 'pending' && (
            <ServiceList
              items={pendingServices}
              showActions={true}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
          {activeTab === 'approved' && (
            <ServiceList
              items={approvedServices}
              showActions={false}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </Box>
      </VStack>
    </Box>
  );
}