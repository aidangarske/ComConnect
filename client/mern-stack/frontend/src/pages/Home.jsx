import { useNavigate } from 'react-router-dom'
import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Link,
  Image,
  Heading,
} from '@chakra-ui/react'

export default function Home() {
  const navigate = useNavigate()

  return (
    <Box minH="100vh" bg="#0a0e27" display="flex" alignItems="center" justifyContent="center" px={[4, 8]}>
      {/* Top Navigation */}
      <Box position="absolute" top={0} left={0} right={0} p={6} display="flex" justifyContent="space-between" alignItems="center">
        <HStack spacing={2}>
          <Image 
            src="/logo.png" 
            alt="ComConnect" 
            h="50px"
            w="auto"
            objectFit="contain"
          />
        </HStack>
        <Link
          fontSize="sm"
          color="#d97baa"
          fontWeight="bold"
          onClick={() => navigate('/login')}
          _hover={{ textDecoration: 'underline' }}
          cursor="pointer"
        >
          Sign In
        </Link>
      </Box>

      {/* Main Content */}
      <HStack spacing={[0, 12, 20]} w="full" maxW="1400px" align="center" justify="center" py={12}>
        {/* Left Section - Logo & Branding */}
        <VStack spacing={8} flex={1} align={["center", "flex-start"]} justify="center">
          <Box textAlign={["center", "left"]}>
            <Image 
              src="/logo.png" 
              alt="ComConnect" 
              h={["120px", "140px", "160px"]}
              w="auto"
              objectFit="contain"
              mb={4}
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
              Connecting communities through trusted services
            </Text>
          </Box>
        </VStack>

        {/* Right Section - Description & CTA */}
        <VStack spacing={8} flex={1} align="stretch">
          <Box
            bg="linear-gradient(135deg, rgba(217, 123, 170, 0.15) 0%, rgba(255, 107, 157, 0.1) 100%)"
            border="2px solid #d97baa"
            borderRadius="2xl"
            p={[6, 8]}
            backdropFilter="blur(10px)"
          >
            <Heading 
              as="h2" 
              size={["md", "lg"]} 
              color="white"
              mb={6}
            >
              Welcome to ComConnect
            </Heading>
            <Text 
              color="#ddd" 
              fontSize={["sm", "md"]} 
              lineHeight="1.8"
              mb={6}
            >
              ComConnect is a web-based platform that bridges the gap between individuals seeking services and those offering them, ensuring safety, efficiency, and transparency.
            </Text>
            <Text 
              color="#bbb" 
              fontSize={["xs", "sm"]} 
              lineHeight="1.7"
            >
              We aim to overcome the shortcomings of existing options like Craigslist and Facebook Marketplace by introducing built-in safety measures, verified trust systems, and clear service categorization, fostering a secure and reliable community marketplace.
            </Text>
          </Box>

          {/* CTA Buttons */}
          <HStack spacing={4} w="full">
            <Button
              flex={1}
              bg="#d97baa"
              color="white"
              size={["sm", "md"]}
              _hover={{ bg: '#c55a8f', transform: 'translateY(-2px)' }}
              onClick={() => navigate('/login')}
              borderRadius="md"
              fontWeight="bold"
              transition="all 0.2s"
            >
              Sign In
            </Button>
            <Button
              flex={1}
              bg="transparent"
              color="#d97baa"
              border="2px solid #d97baa"
              size={["sm", "md"]}
              _hover={{ bg: 'rgba(217, 123, 170, 0.1)', transform: 'translateY(-2px)' }}
              onClick={() => navigate('/register')}
              borderRadius="md"
              fontWeight="bold"
              transition="all 0.2s"
            >
              Create Account
            </Button>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  )
}
