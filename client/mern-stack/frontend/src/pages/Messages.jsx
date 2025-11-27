import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRole } from '../components/RoleContext';
import { getToken } from '../utils/tokenUtils';
import { jwtDecode } from 'jwt-decode';
import { getSocket } from '../utils/socket'; 
import { 
  Box, 
  HStack, 
  VStack, 
  Text, 
  Heading, 
  Image, 
  Grid,
  Flex,
  Input,
  Spacer,
  Spinner,
} from '@chakra-ui/react';
import comconnectLogo from "../logo/COMCONNECT_Logo.png";

function SendIconButton({ onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const style = {
    backgroundColor: isHovered ? '#c55a8f' : '#d97baa',
    height: '42px', width: '42px', borderRadius: '6px',
    border: 'none', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    transition: 'background-color 0.2s ease',
  };
  return (
    <button style={style} onMouseOver={() => setIsHovered(true)} onMouseOut={() => setIsHovered(false)} onClick={onClick}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
      </svg>
    </button>
  );
}

export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, user } = useRole(); 
  
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false); 
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Helper to safely get full name
  const getFullName = (userObj) => {
    if (!userObj) return 'Unknown User';
    return `${userObj.firstName || ''} ${userObj.lastName || ''}`.trim() || 'Unknown User';
  };

  // 1. Fetch Conversations
  useEffect(() => {
    const token = getToken(); 
    const passedConvoId = location.state?.newConvoId;

    if (!token) {
       navigate('/login');
       return;
    }

    if (!user) return; 

    setIsLoading(true);

    fetch('http://localhost:8080/api/messages/conversations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        // --- BAN CHECK ---
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem('token');
            navigate('/login');
            throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) {
          setConversations(data);
          
          if (passedConvoId) {
             setSelectedConversationId(passedConvoId);
             navigate(location.pathname, { replace: true, state: {} }); 
          } else if (data.length > 0 && !selectedConversationId) {
             setSelectedConversationId(data[0]._id);
          }
        }
      })
      .catch(err => {
         if (err.message !== "Unauthorized") console.error("Failed to fetch conversations:", err);
      })
      .finally(() => setIsLoading(false));
      
  }, [navigate, user, location.state]);

  // 2. Fetch Messages
  useEffect(() => {
    if (!selectedConversationId) return;
    if (messages[selectedConversationId]) return;

    const token = getToken();
    fetch(`http://localhost:8080/api/messages/${selectedConversationId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        // --- BAN CHECK ---
        if (res.status === 401 || res.status === 403) {
            navigate('/login');
            throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then(data => {
        setMessages(prev => ({ ...prev, [selectedConversationId]: data }));
      })
      .catch(err => console.error("Failed to fetch messages:", err));
  }, [selectedConversationId, messages, navigate]);

  // 3. Socket Listener (FIXED)
  useEffect(() => {
    // --- FIX START: We must initialize socket here ---
    const socket = getSocket(); 
    if (!socket) return;
    // --- FIX END ---

    socket.on('receiveMessage', (messageData) => {
      setMessages(prevMessages => {
        const newMessages = { ...prevMessages };
        const convoId = messageData.conversationId;
        if (!newMessages[convoId]) newMessages[convoId] = [];
        
        if (!newMessages[convoId].find(msg => msg._id === messageData.message._id)) {
            newMessages[convoId].push(messageData.message);
        }
        return newMessages;
      });
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const getDashboardPath = () => {
    const token = getToken();
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        const currentRole = decodedUser.role;
        switch(currentRole) {
          case 'seeker': return '/dashboard-seeker';
          case 'admin': return '/admin';
          default: return '/dashboard-provider';
        }
      } catch (e) {
        return '/login';
      }
    }
    return '/login';
  };
  
  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !user) return;
    
    const socket = getSocket();
    const messageData = {
      conversationId: selectedConversationId,
      message: {
        id: `temp_${Date.now()}`,
        senderId: user.id, 
        text: newMessage,
      }
    };
    
    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };
  
  const filteredConversations = conversations.filter(convo => {
    const otherUser = convo.participants.find(p => p._id !== user?.id);
    if (!otherUser) return false;
    const fullName = getFullName(otherUser);
    return fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  const selectedConversation = conversations.find(c => c._id === selectedConversationId);
  const activeMessages = messages[selectedConversationId] || [];

  if (!user && getToken()) {
      return (
          <Box minH="100vh" bg="#0a0e27" display="flex" alignItems="center" justifyContent="center">
              <Spinner color="white" size="xl" />
          </Box>
      )
  }

  return (
    <Box minH="100vh" bg="#0a0e27" color="white">
      <Box bg="white" borderBottom="1px solid #1a1f3a" py={4} px={8}>
        <HStack justify="space-between" align="center">
          <Image 
            src={comconnectLogo} 
            alt="ComConnect" 
            h={["80px", "80px", "80px"]}
            w="auto"
            objectFit="contain"
            maxW="100%"
            cursor="pointer"
            onClick={() => navigate(getDashboardPath())}
          />
          <HStack spacing={6}>
            <Text color="black" fontSize="md" cursor="pointer" onClick={() => navigate('/profile')}>
              Profile
            </Text>
            <Text color="#d97baa" fontSize="md" fontWeight="bold" cursor="pointer" onClick={() => navigate('/messages')}>
              Messages
            </Text>
          </HStack>
        </HStack>
      </Box>

      <Grid 
        templateColumns={{ base: "1fr", md: "350px 1fr" }}
        minH="calc(100vh - 112px)" 
      >
        <VStack
          align="start"
          bg="#1a1f3a"
          p={4}
          spacing={4}
          borderRight="1px solid"
          borderColor="gray.700"
        >
          <Heading as="h1" size="xl" color="white" mb={2}>
            Messages
          </Heading>
          <Input 
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="#0a0e27"
            borderColor="gray.600"
            mb={2}
            _placeholder={{ color: 'gray.400' }}
          />
          {filteredConversations.map((convo) => {
            const otherUser = convo.participants.find(p => p._id !== user?.id);
            const fullName = getFullName(otherUser);
            return (
              <HStack
                key={convo._id}
                w="full"
                p={3}
                borderRadius="md"
                cursor="pointer"
                bg={selectedConversationId === convo._id ? '#d97baa' : 'transparent'}
                _hover={{ bg: selectedConversationId === convo._id ? '#d97baa' : '#2a2f4a' }}
                onClick={() => setSelectedConversationId(convo._id)}
              >
                <VStack align="start" spacing={0} w="full">
                  <Text fontWeight="bold">{fullName}</Text>
                </VStack>
                <Spacer />
              </HStack>
            )
          })}
        </VStack>

        <VStack
          align="stretch"
          p={4}
          spacing={4}
        >
          {selectedConversation ? (
            <>
              <VStack align="start" spacing={0} w="full" pb={4} borderBottom="1px solid" borderColor="gray.700">
                <Heading 
                  as="h3" 
                  size="md" 
                  cursor="pointer" 
                  _hover={{ textDecoration: 'underline' }}
                  onClick={() => {
                      const otherUser = selectedConversation.participants.find(p => p._id !== user.id);
                      if(otherUser) navigate(`/profile/${otherUser._id}`);
                  }}
                >
                  Chat with {getFullName(selectedConversation.participants.find(p => p._id !== user.id))}
                </Heading>
                {isTyping && (
                  <Text fontSize="sm" color="gray.300">is typing...</Text> 
                )}
              </VStack>
              
              <VStack 
                flex={1} 
                align="start" 
                w="full" 
                spacing={1}
                overflowY="auto"
                pr={2}
              >
                {activeMessages.map((msg) => {
                  const senderId = msg.senderId?._id || msg.senderId;
                  const isMe = senderId === user?.id;
                  
                  return (
                    <Flex 
                      key={msg._id || msg.id}
                      w="full" 
                      justify={isMe ? 'flex-end' : 'flex-start'}
                      mb={2}
                    >
                      <VStack align={isMe ? 'flex-end' : 'flex-start'} spacing={1}>
                        <Box
                          bg={isMe ? '#d97baa' : '#3d4461'}
                          color='white'
                          px={4}
                          py={2}
                          borderRadius="lg"
                          maxW="100%"
                        >
                          <Text>{msg.text}</Text>
                        </Box>
                        <Text fontSize="xs" color="gray.400" px={2}>
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </VStack>
                    </Flex>
                  );
                })}
              </VStack>

              <HStack w="full" pt={4} borderTop="1px solid" borderColor="gray.700">
                <Input
                  placeholder="Type a message..."
                  bg="#1a1f3a"
                  borderColor="gray.600"
                  _hover={{ borderColor: 'gray.500' }}
                  h="42px"
                  _placeholder={{ color: 'gray.400' }}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <SendIconButton onClick={handleSendMessage} />
              </HStack>
            </>
          ) : (
            <Text color="gray.400">Select a conversation to start chatting.</Text>
          )}
        </VStack>
      </Grid>
    </Box>
  );
}