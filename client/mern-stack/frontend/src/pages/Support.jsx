import { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, Heading, Input, 
  Textarea, Badge, Spinner, Image
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
// 1. Ensure this path is correct based on your folder structure
import { getToken } from '../utils/tokenUtils'; 
import { useNavigate } from 'react-router-dom';
import comconnectLogo from "../logo/COMCONNECT_Logo.png";

// ... (TicketDetailModal code remains exactly the same) ...
function TicketDetailModal({ isOpen, onClose, ticket }) {
  if (!isOpen || !ticket) return null;

  return (
    <Box
      position="fixed"
      top="0" left="0" right="0" bottom="0"
      zIndex={2000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
      <Box position="absolute" inset="0" bg="blackAlpha.600" backdropFilter="blur(4px)" />
      <Box
        position="relative"
        bg="#1a1f3a"
        color="white"
        borderRadius="lg"
        maxW="600px"
        w="90%"
        maxH="90vh"
        overflowY="auto"
        boxShadow="2xl"
        border="1px solid #3a4456"
        zIndex={2001}
      >
        <Box p={6} borderBottom="1px solid #3a4456">
          <HStack justify="space-between">
            <Heading size="md">Ticket Details</Heading>
            <Button variant="ghost" size="sm" onClick={onClose} _hover={{ bg: 'whiteAlpha.100' }}>✕</Button>
          </HStack>
        </Box>

        <Box p={6}>
          <VStack align="start" spacing={5}>
            <HStack w="full" justify="space-between">
               <Badge colorScheme="purple" fontSize="sm" px={2} py={1} borderRadius="md">
                 {ticket.category}
               </Badge>
               <Text fontSize="xs" color="gray.400">ID: {ticket._id.slice(-6)}</Text>
            </HStack>

            <Box w="full" p={4} bg="#0a0e27" borderRadius="md" border="1px solid #3a4456">
              <Text color="#aaa" fontSize="xs" fontWeight="bold" mb={1}>ISSUE</Text>
              <Text fontWeight="bold" fontSize="lg" mb={2} color="white">{ticket.subject}</Text>
              <Text color="gray.300">{ticket.message}</Text>
            </Box>

            {ticket.adminResponse ? (
               <Box w="full" p={4} bg="rgba(72, 187, 120, 0.1)" borderRadius="md" border="1px solid #48bb78">
                 <Text color="#48bb78" fontWeight="bold" mb={2} fontSize="sm">ADMIN RESPONSE:</Text>
                 <Text color="white">{ticket.adminResponse}</Text>
                 {ticket.resolvedAt && (
                    <Text fontSize="xs" color="#48bb78" mt={3}>
                       Resolved on {new Date(ticket.resolvedAt).toLocaleDateString()}
                    </Text>
                 )}
               </Box>
            ) : (
               <Box w="full" p={4} bg="rgba(255, 255, 255, 0.05)" borderRadius="md" border="1px dashed #555">
                 <Text fontSize="sm" color="gray.400" fontStyle="italic" textAlign="center">
                   Your ticket has been received. An admin will review it shortly.
                 </Text>
               </Box>
            )}
          </VStack>
        </Box>

        <Box p={6} borderTop="1px solid #3a4456" bg="#1a1f3a">
          <HStack justify="flex-end">
            <Button onClick={onClose} bg="transparent" border="1px solid #3a4456" color="white" _hover={{ bg: 'whiteAlpha.100' }}>
              Close
            </Button>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
}

export default function Support() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('technical');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const apiFetch = async (endpoint, options = {}) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });
    if (response.status === 401) {
       toast.error("Session expired. Please login again.");
       navigate('/login'); 
    }

    return response;
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    setLoading(true);
    try {
      // Now this calls the function defined above
      const res = await apiFetch('/tickets/my');
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!subject || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      // Using the helper here too
      const res = await apiFetch('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject,
          category,
          message,
          priority
        })
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Ticket submitted successfully!");
        setSubject('');
        setMessage('');
        setCategory('technical');
        setPriority('medium');
        fetchMyTickets(); 
      } else {
        toast.error(data.error || "Failed to submit ticket");
      }
    } catch (err) {
      toast.error("Server error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  // ... (Return statement / JSX remains exactly the same as your code) ...
  return (
    <Box minH="100vh" bg="#0a0e27" color="white">
      <Box bg="white" borderBottom="1px solid #1a1f3a" py={4} px={8}>
          <HStack justify="space-between" align="center">
            <Image 
              src={comconnectLogo} 
              h="80px" 
              cursor="pointer" 
              objectFit="contain"
              onClick={() => navigate(-1)} 
            />
            <HStack spacing={6}>
              <Text color="black" fontSize="md" cursor="pointer" onClick={() => navigate('/profile')}>
                Profile
              </Text>
              <Text color="black" fontSize="md" cursor="pointer" onClick={() => navigate('/messages')}>
                Messages
              </Text>
              <Text color="black" fontSize="md" cursor="pointer" onClick={() => navigate('/support')}>
                Support
              </Text>
            </HStack>
            </HStack>
      </Box>

      <Box p={[4, 8]} maxW="1200px" mx="auto">
        <VStack spacing={8} align="start">
          
          <VStack align="start" spacing={2}>
            <Heading as="h1" size="xl">Support Center</Heading>
            <Text color="gray.400">Need help? Submit a ticket or view your history below.</Text>
          </VStack>

          <HStack w="full" spacing={8} align="start" flexDirection={['column', 'column', 'row']}>
            
            <Box 
              flex={1} 
              w="full" 
              bg="#1a1f3a" 
              p={6} 
              borderRadius="lg" 
              border="1px solid #3a4456"
            >
              <Heading size="md" mb={6} color="#d97baa">Submit a Request</Heading>
              
              <VStack spacing={5} align="start">
                <Box w="full">
                  <Text mb={2} fontSize="sm" fontWeight="bold" color="gray.300">Subject</Text>
                  <Input 
                    placeholder="Brief summary of the issue" 
                    bg="#0a0e27" 
                    border="1px solid #3a4456"
                    value={subject}
                    color="white"
                    _focus={{ borderColor: '#d97baa' }}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </Box>

                <HStack w="full" spacing={4}>
                  <Box flex={1}>
                    <Text mb={2} fontSize="sm" fontWeight="bold" color="gray.300">Category</Text>
                    <Box 
                      as="select"
                      bg="#0a0e27" 
                      border="1px solid #3a4456"
                      borderRadius="md"
                      w="full"
                      p={2}
                      color="white"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      sx={{ outline: 'none', '&:focus': { borderColor: '#d97baa' } }}
                    >
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing / Payment</option>
                      <option value="account">Account Issue</option>
                      <option value="report_user">Report a User</option>
                      <option value="other">Other</option>
                    </Box>
                  </Box>
                  <Box flex={1}>
                      <Text mb={2} fontSize="sm" fontWeight="bold" color="gray.300">Priority</Text>
                      <Box 
                      as="select"
                      bg="#0a0e27" 
                      border="1px solid #3a4456"
                      borderRadius="md"
                      w="full"
                      p={2}
                      color="white"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      sx={{ outline: 'none', '&:focus': { borderColor: '#d97baa' } }}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </Box>
                  </Box>
                </HStack>

                <Box w="full">
                  <Text mb={2} fontSize="sm" fontWeight="bold" color="gray.300">Description</Text>
                  <Textarea 
                    placeholder="Describe your issue in detail..." 
                    rows={6}
                    bg="#0a0e27" 
                    border="1px solid #3a4456"
                    value={message}
                    color="white"
                    _focus={{ borderColor: '#d97baa' }}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </Box>

                <Button 
                  w="full" 
                  bg="#d97baa" 
                  color="white" 
                  _hover={{ bg: '#c55a8f' }}
                  isLoading={submitting}
                  onClick={handleSubmit}
                  mt={2}
                >
                  Submit Ticket
                </Button>
              </VStack>
            </Box>
            <Box 
              flex={1} 
              w="full" 
              h="fit-content"
            >
              <Heading size="md" mb={6} color="#d97baa">Your Ticket History</Heading>
              
              {loading ? (
                <Spinner color="#d97baa" />
              ) : tickets.length === 0 ? (
                <Box p={6} bg="#1a1f3a" borderRadius="lg" border="1px solid #3a4456" textAlign="center">
                  <Text color="gray.400">You haven't submitted any tickets yet.</Text>
                </Box>
              ) : (
                <VStack spacing={3} w="full">
                  {tickets.map(ticket => (
                    <Box 
                      key={ticket._id} 
                      w="full" 
                      bg="#1a1f3a" 
                      p={4} 
                      borderRadius="md" 
                      border="1px solid #3a4456"
                      borderLeft="4px solid"
                      borderLeftColor={
                        ticket.status === 'resolved' ? '#48bb78' : 
                        ticket.status === 'closed' ? '#718096' :   
                        '#d97baa'                                 
                      }
                      cursor="pointer"
                      onClick={() => handleViewTicket(ticket)}
                      _hover={{ bg: '#232946' }}
                      transition="all 0.2s"
                    >
                      <HStack justify="space-between" mb={1}>
                        <Badge 
                          bg={
                            ticket.status === 'resolved' ? 'green.500' : 
                            ticket.status === 'in_progress' ? 'blue.500' : 
                            ticket.status === 'closed' ? 'gray.500' :
                            'yellow.500'
                          } 
                          color="white"
                          fontSize="xs"
                        >
                          {ticket.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Text fontSize="xs" color="gray.400">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </Text>
                      </HStack>
                      <Text fontWeight="bold" fontSize="md" mb={1}>{ticket.subject}</Text>
                      <Text fontSize="xs" color="gray.400" noOfLines={1}>{ticket.message}</Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>

          </HStack>
        </VStack>
      </Box>
      <TicketDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        ticket={selectedTicket} 
      />
    </Box>
  );
}