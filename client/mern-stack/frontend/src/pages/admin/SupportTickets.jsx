import { useState, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, Heading, Badge, 
  Select, Textarea, Spinner
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { getToken, apiFetch } from '../../utils/tokenUtils';
function TicketDetailModal({ isOpen, onClose, ticket, onResolve, updating, responseText, setResponseText }) {
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
          <VStack align="start" spacing={4}>
            <Box w="full" p={3} bg="rgba(255,255,255,0.05)" borderRadius="md" border="1px solid #3a4456">
                <Text fontSize="xs" color="gray.400" fontWeight="bold" mb={1}>USER ISSUE</Text>
                <Text>{ticket.message}</Text>
            </Box>
            
            {ticket.adminResponse && (
                <Box w="full" p={3} bg="rgba(72, 187, 120, 0.1)" borderRadius="md" border="1px solid #48bb78">
                <Text fontSize="xs" color="#48bb78" fontWeight="bold" mb={1}>PREVIOUS RESPONSE</Text>
                <Text>{ticket.adminResponse}</Text>
                </Box>
            )}

            <Box w="full">
                <Text mb={2} fontWeight="bold">Reply / Resolution:</Text>
                <Textarea 
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Type your response to the user here..."
                    bg="#0a0e27"
                    border="1px solid #3a4456"
                    _focus={{ borderColor: '#d97baa' }}
                    rows={4}
                />
            </Box>
          </VStack>
        </Box>

        <Box p={6} borderTop="1px solid #3a4456" bg="#1a1f3a">
          <HStack justify="flex-end" spacing={3}>
             <Button variant="ghost" onClick={onClose} color="white" _hover={{ bg: 'whiteAlpha.100' }}>Cancel</Button>
             <Button 
               bg="blue.600" 
               color="white" 
               _hover={{ bg: 'blue.700' }}
               onClick={() => onResolve('in_progress')} 
               isLoading={updating}
             >
               Reply (Keep Open)
             </Button>
             <Button 
               bg="green.600" 
               color="white" 
               _hover={{ bg: 'green.700' }}
               onClick={() => onResolve('resolved')} 
               isLoading={updating}
             >
               Resolve & Close
             </Button>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, open, resolved
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/tickets/admin');
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (status) => {
    if (!selectedTicket) return;
    setUpdating(true);
    try {
      const res = await apiFetch(`/tickets/admin/${selectedTicket._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: status,
          adminResponse: responseText || undefined
        })
      });
      
      if (res.ok) {
        toast.success(`Ticket marked as ${status}`);
        fetchTickets();
        setSelectedTicket(null);
        setResponseText('');
      } else {
        toast.error("Update failed");
      }
    } catch (err) {
      toast.error("Error updating ticket");
    } finally {
      setUpdating(false);
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'open') return t.status !== 'resolved' && t.status !== 'closed';
    if (filter === 'resolved') return t.status === 'resolved' || t.status === 'closed';
    return true;
  });

  return (
    <Box bg="#1a1f3a" p={6} borderRadius="lg" w="full">
      <VStack align="start" spacing={6}>
        <HStack justify="space-between" w="full">
          <Heading size="lg" color="white">Support Tickets</Heading>
          
          {/* Custom Styled Select */}
          <Box 
            as="select"
            w="200px" 
            bg="#0a0e27" 
            color="white" 
            border="1px solid #3a4456"
            borderRadius="md"
            p={2}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ outline: 'none' }}
          >
            <option value="all">All Tickets</option>
            <option value="open">Open / Pending</option>
            <option value="resolved">Resolved / Closed</option>
          </Box>
        </HStack>

        {loading ? (
          <Spinner color="#d97baa" />
        ) : filteredTickets.length === 0 ? (
          <Text color="gray.400">No tickets found.</Text>
        ) : (
          <VStack w="full" spacing={3}>
            {filteredTickets.map(ticket => (
              <Box 
                key={ticket._id} 
                w="full" 
                bg="#0a0e27" 
                p={4} 
                borderRadius="md" 
                borderLeft="4px solid"
                borderColor={ticket.status === 'resolved' ? '#48bb78' : '#d97baa'}
                border="1px solid #3a4456" // Added border for definition
                cursor="pointer"
                onClick={() => {
                    setSelectedTicket(ticket);
                    setResponseText(ticket.adminResponse || '');
                }}
                _hover={{ bg: '#11152f', borderColor: '#d97baa' }}
                transition="all 0.2s"
              >
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <HStack>
                      <Badge 
                        bg={ticket.priority === 'high' ? 'red.600' : 'blue.600'} 
                        color="white"
                      >
                        {ticket.priority}
                      </Badge>
                      <Text fontWeight="bold" color="white">{ticket.subject}</Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.400">
                      From: {ticket.user?.username || 'Unknown'} • {new Date(ticket.createdAt).toLocaleDateString()}
                    </Text>
                  </VStack>
                  <Badge 
                    bg={ticket.status === 'resolved' ? 'green.600' : 'yellow.600'} 
                    color="white"
                  >
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </VStack>
      <TicketDetailModal 
        isOpen={!!selectedTicket} 
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
        onResolve={handleResolve}
        updating={updating}
        responseText={responseText}
        setResponseText={setResponseText}
      />
    </Box>
  );
}