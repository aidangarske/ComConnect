import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, VStack, HStack, Input, Button, Text, Heading, Image } from '@chakra-ui/react'

export default function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  const handleRegister = () => {
    navigate('/login')
  }

  return (
    <Box minH="100vh" bg="#0a0e27" display="flex" alignItems="center" justifyContent="center" px={[4, 8]}>
      <HStack spacing={[0, 16, 24]} w="full" maxW="1400px" h="100vh" align="center" justify="center">
        {/* Left Section - Logo */}
        <VStack spacing={6} flex={[1, 1, 1.2]} align="center" justify="center" py={8}>
          <Box textAlign="center" w="100%" cursor="pointer" onClick={() => navigate('/')}>
            <Image 
              src="/logo.png" 
              alt="ComConnect" 
              h={["140px", "180px", "220px"]}
              w="auto"
              objectFit="contain"
              mx="auto"
              maxW="100%"
            />
            </Box>
          <Text 
            color="#999" 
            fontSize={["sm", "md", "lg"]} 
            textAlign="center" 
            px={4}
            maxW="300px"
            lineHeight="1.6"
            >
            Join our community and find trusted services
              </Text>
          </VStack>

          {/* Right Section - Register Form */}
        <VStack spacing={6} flex={1} align="stretch" w={["100%", "100%", "auto"]} maxW="380px" py={8}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Heading as="h2" size={["sm", "md"]} color="white">
              Create Account
            </Heading>
            <Text
              fontSize="xs"
                color="#d97baa"
                fontWeight="bold"
                onClick={() => navigate('/')}
                cursor="pointer"
              >
                Home
            </Text>
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
              borderRadius="md"
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
              Sign In
            </Text>
              </HStack>
          </VStack>
        </HStack>
    </Box>
  )
}
