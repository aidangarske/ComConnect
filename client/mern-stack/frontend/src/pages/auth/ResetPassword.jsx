import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, HStack, VStack, Input, Button, Text, Heading, Image } from '@chakra-ui/react'

import comconnectLogo from "../../logo/COMCONNECT_Logo.png";

export default function ResetPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleReset = () => {
    if (email) {
      setSubmitted(true)
    }
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
              No worries - It happens.
            </Text>
          </Box>
        </VStack>

        {/* Right Section - Reset Form */}
        <VStack spacing={6} flex={1} align="stretch" w={["100%", "100%", "auto"]} maxW="380px" py={8}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Heading as="h2" size={["sm", "md"]} color="white">
              {submitted ? 'Check Your Email' : 'Reset Password'}
            </Heading>
          </Box>

          {!submitted ? (
            <>
              {/* Email Input */}
              <VStack align="start" w="full" spacing={2}>
                <Text color="#999" fontSize="sm" fontWeight="bold">
                  Email Address
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

              {/* Reset Button */}
              <Button
                w="full"
                bg="#d97baa"
                color="white"
                _hover={{ bg: '#c55a8f', transform: 'translateY(-2px)' }}
                onClick={handleReset}
                py={6}
                borderRadius="md"
                fontWeight="bold"
                fontSize="md"
                transition="all 0.2s"
                mt={4}
              >
                Send Reset Link
              </Button>

              {/* Footer Links */}
              <HStack spacing={1} justify="center" w="full" mt={4} fontSize={["xs", "sm"]}>
                <Text color="#888">
                  Remember your password?
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
            </>
          ) : (
            <>
              <VStack spacing={4} align="center" textAlign="center">
                <Text color="#aaa" fontSize="md">
                  We've sent a password reset link to:
                </Text>
                <Text color="#d97baa" fontSize="sm" fontWeight="bold">
                  {email}
                </Text>
                <Text color="#888" fontSize="sm">
                  Please check your inbox and follow the link to reset your password. If you don't see the email, check your spam folder.
                </Text>
              </VStack>

              {/* Back to Login */}
              <Button
                w="full"
                bg="#3a3f5e"
                color="white"
                _hover={{ bg: '#4a4f6e' }}
                onClick={() => navigate('/login')}
                py={6}
                borderRadius="md"
                fontWeight="bold"
                fontSize="md"
                transition="all 0.2s"
                mt={4}
              >
                Back to Sign In
              </Button>
            </>
          )}
        </VStack>
      </HStack>
    </Box>
  )
}

