import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Link,
  Heading,
  Image,
} from '@chakra-ui/react'

import comconnectLogo from "../../logo/COMCONNECT_Logo.png";

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    // Store user info and navigate to proper dashboard NEEDS BACKEND LOGIC
    navigate('/admin'); // tempoarily navigate to seeker dashboard
  }

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
                Stay connected. Stay verified. Stay ahead.
              </Text>
            </Box>
          </VStack>

          {/* Right Section - Login Form */}
        <VStack spacing={6} flex={1} align="stretch" w={["100%", "100%", "auto"]} maxW="380px" py={8}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Heading as="h2" size={["sm", "md"]} color="white">
              Login
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

            {/* Login Button */}
            <Button
              w="full"
            bg="#d97baa"
              color="white"
            _hover={{ bg: '#c55a8f', transform: 'translateY(-2px)' }}
              onClick={handleLogin}
              py={6}
              borderRadius="md"
              fontWeight="bold"
              fontSize="md"
            transition="all 0.2s"
            mt={4}
            >
              Login
            </Button>

            {/* Footer Links */}
          <HStack spacing={4} justify="space-between" w="full" mt={6} fontSize={["xs", "sm"]}>
              <HStack spacing={1}>
              <Text color="#888">
                  Don't have an account?
                </Text>
                <Link
                  color="#d97baa"
                  fontWeight="bold"
                  onClick={() => navigate('/register')}
                _hover={{ textDecoration: 'underline' }}
                  cursor="pointer"
                >
                  Sign Up
                </Link>
              </HStack>
              <Link
                color="#d97baa"
                fontWeight="bold"
              onClick={() => navigate('/reset-password')}
              _hover={{ textDecoration: 'underline' }}
                cursor="pointer"
              >
              Forgot Password
              </Link>
            </HStack>
          </VStack>
        </HStack>
    </Box>
  )
}

