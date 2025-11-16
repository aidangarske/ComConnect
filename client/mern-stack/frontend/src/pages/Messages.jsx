import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../components/RoleContext';
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
} from '@chakra-ui/react';
import comconnectLogo from "../logo/COMCONNECT_Logo.png";
import { 
  myUserId, 
  mockConversations, 
  mockMessages 
} from './admin/mockData';

function SendIconButton({ onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const style = {
    backgroundColor: isHovered ? '#c55a8f' : '#d97baa',
    height: '42px',
    width: '42px',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease',
  };
  return (
    <button
      style={style}
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      onClick={onClick}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
      </svg>
    </button>
  );
}

export default function Messages() {
  const navigate = useNavigate();
  const { role } = useRole();
  const [selectedConversationId, setSelectedConversationId] = useState('c1');
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(true); 

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const activeMessages = messages[selectedConversationId] || [];

  const getDashboardPath = () => {
    switch(role) {
      case 'seeker': return '/dashboard-seeker';
      case 'admin': return '/admin';
      default: return '/dashboard-provider';
    }
  };

  const filteredConversations = conversations.filter(convo =>
    convo.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box minH="100vh" bg="#0a0e27" color="white">
      {/* Header */}
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

          {filteredConversations.map((convo) => (
            <HStack
              key={convo.id}
              w="full"
              p={3}
              borderRadius="md"
              cursor="pointer"
              bg={selectedConversationId === convo.id ? '#d97baa' : 'transparent'}
              _hover={{ bg: selectedConversationId === convo.id ? '#d97baa' : '#2a2f4a' }}
              onClick={() => setSelectedConversationId(convo.id)}
            >
              <VStack align="start" spacing={0} w="full">
                <Text fontWeight="bold">{convo.userName}</Text>
                <Text fontSize="sm" color="gray.300" noOfLines={1}> 
                  {convo.lastMessage}
                </Text>
              </VStack>
              <Spacer />
              {convo.id === 'c1' && (
                <Box w="10px" h="10px" bg="#d97baa" borderRadius="full" />
              )}
            </HStack>
          ))}
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
                  onClick={() => navigate(`/profile/${selectedConversation.userId}`)}
                >
                  Chat with {selectedConversation.userName}
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
                  const isMe = msg.senderId === myUserId;
                  return (
                    <Flex 
                      key={msg.id} 
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
                          10:31 AM
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
                />
                <SendIconButton onClick={() => alert('Sending message...')} />
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