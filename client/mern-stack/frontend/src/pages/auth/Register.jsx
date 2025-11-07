import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, VStack, HStack, Input, Button, Text, Heading, Image } from '@chakra-ui/react'

import comconnectLogo from "../../logo/COMCONNECT_Logo.png";


export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [roleIsSeeker, setRoleIsSeeker] = useState(false);

  const handleRoleSelect = (role) => {
    setRoleIsSeeker(role === 'seeker');
  };

const handleRegister = () => {
  if (roleIsSeeker) {
    navigate('/dashboard-seeker');
  } else {
    navigate('/dashboard-provider');
  }
};

  return (
    <Box minH="100vh" bg="#0a0e27" display="flex" alignItems="center" justifyContent="center" px={[4, 8]}>
      <HStack spacing={[0, 16, 24]} w="full" maxW="1400px" h="100vh" align="center" justify="center">
        {/* Left Section - Logo */}
        <VStack spacing={8} flex={1} align={["center", "flex-start"]} justify="center">
          <Box textAlign={["center", "left"]}>
            <Image 
              src={comconnectLogo} 
              alt="ComConnect" 
              h={["120px", "140px", "160px"]}
              w="auto"
              objectFit="contain"
              mb={4}
              cursor="pointer"
              onClick={() => navigate('/')}
            />
            <Heading 
              as="h1" 
              size={["lg", "2xl", "3xl"]} 
              color="#d97baa" 
              fontWeight="bold"
              mt={4}
            >
              ComConnect
            </Heading>
            <Text 
              color="#999" 
              fontSize={["sm", "md"]} 
              mt={4}
              maxW="300px"
            >
              Sign up. Get verified. Get connected.
            </Text>
          </Box>
        </VStack>


          {/* Right Section - Register Form */}
        <VStack spacing={6} flex={1} align="stretch" w={["100%", "100%", "auto"]} maxW="380px" py={8}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Heading as="h2" size={["sm", "md"]} color="white">
              Create Account
            </Heading>
            </Box>

            {/* Email Input */}
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">
                Email
              </Text>
              <Input
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg="#1a1f3a"
                border="1px solid #3a4456"
                borderRadius="md"
                color="white"
                _placeholder={{ color: '#666' }}
                _focus={{ borderColor: '#d97baa', boxShadow: '0 0 0 3px rgba(217, 123, 170, 0.1)' }}
                py={3}
              fontSize="sm"
              />
            </VStack>

            {/* Username Input */}
            <VStack align="start" w="full" spacing={2}>
              <Text color="#999" fontSize="sm" fontWeight="bold">
                Username
              </Text>
              <Input
                placeholder="Enter a username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                bg="#1a1f3a"
                border="1px solid #3a4456"
                borderRadius="md"
                color="white"
                _placeholder={{ color: '#666' }}
                _focus={{ borderColor: '#d97baa', boxShadow: '0 0 0 3px rgba(217, 123, 170, 0.1)' }}
                py={3}
              fontSize="sm"
              />
            </VStack>

          {/* Password Input */}
          <VStack align="start" w="full" spacing={2}>
            <Text color="#999" fontSize="sm" fontWeight="bold">
              Password
            </Text>
            <Input
              placeholder="Enter a strong password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg="#1a1f3a"
              border="1px solid #3a4456"
              borderRadius="md"
              color="white"
              _placeholder={{ color: '#666' }}
              _focus={{ borderColor: '#d97baa', boxShadow: '0 0 0 3px rgba(217, 123, 170, 0.1)' }}
              py={3}
              fontSize="sm"
            />
          </VStack>
        {/* Role Selection */}
        <Heading as="h1" size="2xl" color="#d97baa">
          Select Your Role
        </Heading>
          <HStack spacing={4} w="full" mt={2}>
            <Button
              w="half"
              bg="#3a3f5e"
              color="white"
              _hover={{ bg: '#4a4f6e' }}
              py={3}
              borderRadius="lg"
              fontSize="md"
              onClick={() => handleRoleSelect("provider")}
            >
              ⭐ Service Provider
            </Button>

            <Button
              w="half"
              bg="#3a3f5e"
              color="white"
              _hover={{ bg: '#4a4f6e' }}
              py={3}
              borderRadius="lg"
              fontSize="md"
              onClick={() => handleRoleSelect("seeker")}
            >
              🔍 Service Seeker
            </Button>
          </HStack>

          {/* Terms Message */}
          <Text fontSize="xs" color="#999" lineHeight="1.4">
            By creating an account, you accept our Terms and Conditions
              </Text>

            {/* Register Button */}
            <Button
              w="full"
            bg="#d97baa"
              color="white"
            _hover={{ bg: '#c55a8f', transform: 'translateY(-2px)' }}
              onClick={handleRegister}
              py={6}
              borderRadius="lg"
              fontWeight="bold"
              fontSize="md"
            transition="all 0.2s"
            mt={4}
            >
            Create Account
            </Button>

            {/* Footer Links */}
          <HStack spacing={1} justify="center" w="full" mt={4} fontSize={["xs", "sm"]}>
            <Text color="#888">
                  Already have an account?
                </Text>
            <Text
                  color="#d97baa"
                  fontWeight="bold"
              onClick={() => navigate('/login')}
                  cursor="pointer"
                >
              Login
            </Text>
              </HStack>
          </VStack>
        </HStack>
    </Box>
  )
}
