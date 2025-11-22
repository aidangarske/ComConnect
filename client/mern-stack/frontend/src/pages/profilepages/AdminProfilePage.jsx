import { useNavigate } from "react-router-dom";
import { Box, VStack, HStack, Text, Input, Button, Heading, Image } from "@chakra-ui/react";
import comconnectLogo from "../logo/COMCONNECT_Logo.png";

export default function AdminProfile() {
  const navigate = useNavigate();

  const handleSave = () => {
    alert("Profile saved (placeholder). Backend connection coming soon.");
  };

  const handleDelete = () => {
    alert("Delete Admin account (placeholder). Backend connection coming soon.");
  };

  return (
    <Box minH="100vh" bg="#0a0e27" py={8} px={8}>
      {/* Header */}
      <Box bg="white" borderBottom="1px solid #1a1f3a" py={4} px={8}>
        <HStack justify="space-between" align="center">
          <Image 
            src={comconnectLogo} 
            alt="ComConnect" 
            h="80px"
            w="auto"
            objectFit="contain"
            cursor="pointer"
            onClick={() => navigate("/admin")}
          />
          <HStack spacing={6}>
            <Text color="#d97baa" fontSize="md" fontWeight="bold" cursor="pointer" onClick={() => navigate('/profile')}>
              Profile
            </Text>
            <Text color="black" fontSize="md" cursor="pointer" onClick={() => navigate('/messages')}>
              Messages
            </Text>
          </HStack>
        </HStack>
      </Box>

      {/* Main Content */}
      <Box py={8}>
        <VStack align="start" spacing={8} w="full" maxW="600px">
          <Heading as="h1" size="2xl" color="white">
            Admin Profile
          </Heading>

          <VStack spacing={6} w="full" align="stretch">
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">Name</Text>
              <Input placeholder="Admin Name" bg="#1a1f3a" border="1px solid #3a4456" color="white" />
            </VStack>

            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">Email</Text>
              <Input placeholder="admin@example.com" type="email" bg="#1a1f3a" border="1px solid #3a4456" color="white" />
            </VStack>

            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">Role</Text>
              <Input placeholder="System Administrator" bg="#1a1f3a" border="1px solid #3a4456" color="white" />
            </VStack>

            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">Permissions</Text>
              <Input placeholder="Full Access" bg="#1a1f3a" border="1px solid #3a4456" color="white" />
            </VStack>

            <HStack spacing={4} w="full" pt={4}>
              <Button flex={1} bg="#d97baa" color="white" _hover={{ bg: '#c55a8f' }} py={6} borderRadius="md" fontWeight="bold" fontSize="md" onClick={handleSave}>
                Save Profile
              </Button>
              <Button flex={1} bg="#ff4d4d" color="white" _hover={{ bg: '#cc0000' }} py={6} borderRadius="md" fontWeight="bold" fontSize="md" onClick={handleDelete}>
                Delete Account
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
}
