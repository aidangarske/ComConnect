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
import { mockTickets } from './mockData';

const getTicketStatusStyles = (status) => {
  if (status === 'open') {
    return { bg: 'green.500', color: 'white' };
  }
  return { bg: 'gray.600', color: 'white' };
};

function TicketDetails({ ticket, onBack, onResolve }) {
  return (
    <Box bg="#1a1f3a" p={6} borderRadius="lg" w="full">
      <VStack align="start" spacing={6}>
        <Button onClick={onBack} bg="#d97baa" color="white" _hover={{ bg: '#c55a8f' }}>
          &larr; Back to Ticket List
        </Button>

        <Heading as="h3" size="lg" color="white">{ticket.subject}</Heading>
        <HStack>
          <Text color="gray.300">From: {ticket.userName}</Text>
          <Badge
            {...getTicketStatusStyles(ticket.status)}
            py={1}
            px={2}
            borderRadius="md"
            textTransform="capitalize"
          >
            {ticket.status}
          </Badge>
        </HStack>

        <Box bg="#0a0e27" p={4} borderRadius="md" w="full" color="gray.300">
          <Text>{ticket.message}</Text>
        </Box>

        {ticket.status === 'open' && (
          <HStack spacing={4} pt={4}>
            <Button
              bg="green.500"
              color="white"
              _hover={{ bg: 'green.600' }}
              onClick={() => onResolve(ticket.id)}
            >
              Mark as Resolved
            </Button>
            <Button
              bg="blue.500"
              color="white"
              _hover={{ bg: 'blue.600' }}
            >
              Reply to User
            </Button>
          </HStack>
        )}
      </VStack>
    </Box>
  );
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState(mockTickets);
  const [activeTab, setActiveTab] = useState('open');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const openTickets = tickets.filter(t => t.status === 'open');
  const closedTickets = tickets.filter(t => t.status === 'closed');

  const handleResolveTicket = (id) => {
    setTickets(currentTickets =>
      currentTickets.map(ticket =>
        ticket.id === id ? { ...ticket, status: 'closed' } : ticket
      )
    );
    setSelectedTicket(null);
  };

  if (selectedTicket) {
    return (
      <TicketDetails
        ticket={selectedTicket}
        onBack={() => setSelectedTicket(null)}
        onResolve={handleResolveTicket}
      />
    );
  }

  const ticketsToShow = activeTab === 'open' ? openTickets : closedTickets;

  return (
    <Box bg="#1a1f3a" p={6} borderRadius="lg" w="full">
      <VStack align="start" spacing={6}>
        <Heading as="h3" size="lg" color="white">
          Support Tickets
        </Heading>
        <HStack spacing={4}>
          <Button
            bg={activeTab === 'open' ? '#d97baa' : '#2a2f4a'}
            color="white"
            _hover={{ bg: activeTab === 'open' ? '#c55a8f' : '#3a3f5a' }}
            onClick={() => setActiveTab('open')}
          >
            Open Tickets ({openTickets.length})
          </Button>
          <Button
            bg={activeTab === 'closed' ? '#d97baa' : '#2a2f4a'}
            color="white"
            _hover={{ bg: activeTab === 'closed' ? '#c55a8f' : '#3a3f5a' }}
            onClick={() => setActiveTab('closed')}
          >
            Closed Tickets ({closedTickets.length})
          </Button>
        </HStack>

        <VStack w="full" minW="600px">
          <Grid
            w="full"
            templateColumns="2fr 1fr 1fr 1fr"
            gap={4}
            px={4}
            py={3}
            borderBottom="2px solid"
            borderColor="gray.600"
          >
            <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Subject</Text>
            <Text fontWeight="bold" color="gray.400" textTransform="uppercase">User</Text>
            <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Status</Text>
            <Text fontWeight="bold" color="gray.400" textTransform="uppercase">Date</Text>
          </Grid>

          {ticketsToShow.length === 0 && <Text p={4} color="gray.400">No tickets in this list.</Text>}

          {ticketsToShow.map((ticket) => (
            <Grid
              key={ticket.id}
              w="full"
              templateColumns="2fr 1fr 1fr 1fr"
              gap={4}
              px={4}
              py={4}
              borderRadius="md"
              _hover={{ bg: '#2a2f4a' }}
              color="white"
              borderBottom="1px solid"
              borderColor="gray.700"
              cursor="pointer"
              onClick={() => setSelectedTicket(ticket)}
              alignItems="center" 
            >
              <Text fontWeight="medium">{ticket.subject}</Text>
              <Text color="gray.300">{ticket.userName}</Text>
              <Text>
                <Badge
                  {...getTicketStatusStyles(ticket.status)}
                  py={1}
                  px={2}
                  borderRadius="md"
                  textTransform="capitalize"
                >
                  {ticket.status}
                </Badge>
              </Text>
              <Text color="gray.300">{new Date(ticket.submittedDate).toLocaleDateString()}</Text>
            </Grid>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}