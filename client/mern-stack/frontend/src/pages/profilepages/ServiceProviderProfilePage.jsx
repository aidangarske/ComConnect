import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, VStack, HStack, Text, Input, Button, Heading, Image } from "@chakra-ui/react";
import comconnectLogo from "../logo/COMCONNECT_Logo.png";

export default function ServiceProviderProfile() {
  const navigate = useNavigate();
  const [bio, setBio] = useState("");
  const [services, setServices] = useState("");
  const [experience, setExperience] = useState("");
  const [location, setLocation] = useState("");

  const handleSave = () => {
    alert("Profile saved (placeholder). Backend connection coming soon.");
  };

  const handleDeleteAccount = () => {
    alert("Feature not active yet, backend delete API in progress.");
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
            onClick={() => navigate("/dashboard-provider")}
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
            Service Provider Profile
          </Heading>

          <VStack spacing={6} w="full" align="stretch">
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">Bio</Text>
              <Input placeholder="Tell us about yourself" bg="#1a1f3a" border="1px solid #3a4456" color="white" value={bio} onChange={(e) => setBio(e.target.value)} />
            </VStack>

            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">Services</Text>
              <Input placeholder="Services you provide" bg="#1a1f3a" border="1px solid #3a4456" color="white" value={services} onChange={(e) => setServices(e.target.value)} />
            </VStack>

            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">Experience</Text>
              <Input placeholder="Your experience" bg="#1a1f3a" border="1px solid #3a4456" color="white" value={experience} onChange={(e) => setExperience(e.target.value)} />
            </VStack>

            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">Location</Text>
              <Input placeholder="City, State" bg="#1a1f3a" border="1px solid #3a4456" color="white" value={location} onChange={(e) => setLocation(e.target.value)} />
            </VStack>

            <HStack spacing={4} w="full" pt={4}>
              <Button flex={1} bg="#d97baa" color="white" _hover={{ bg: '#c55a8f' }} py={6} borderRadius="md" fontWeight="bold" fontSize="md" onClick={handleSave}>
                Save Profile
              </Button>
              <Button flex={1} bg="red.500" color="white" _hover={{ bg: 'red.600' }} py={6} borderRadius="md" fontWeight="bold" fontSize="md" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </Box>
  );
}

