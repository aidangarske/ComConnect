import { useNavigate } from 'react-router-dom'
import { useRole } from '../components/RoleContext'
import {
  Box,
  VStack,
  Button,
  Text,
  Heading,
} from '@chakra-ui/react'

export default function RoleSelection() {
  const navigate = useNavigate()
  const { setRole } = useRole()

  const handleRoleSelect = (selectedRole, dashboardPath) => {
    setRole(selectedRole)
    navigate(dashboardPath)
  }

  return (
    <Box minH="100vh" bg="#0a0e27" display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={8} align="center" justify="center">
        <Heading as="h1" size="2xl" color="#d97baa">
          Select Your Role
        </Heading>
        
        <VStack spacing={4} w="full" maxW="300px">
          <Button
            w="full"
            bg="#3a3f5e"
            color="white"
            _hover={{ bg: '#4a4f6e' }}
            py={6}
            borderRadius="full"
            fontWeight="bold"
            fontSize="lg"
            onClick={() => handleRoleSelect('provider', '/dashboard-provider')}
          >
            ⭐ Service Provider
          </Button>

          <Button
            w="full"
            bg="#3a3f5e"
            color="white"
            _hover={{ bg: '#4a4f6e' }}
            py={6}
            borderRadius="full"
            fontWeight="bold"
            fontSize="lg"
            onClick={() => handleRoleSelect('seeker', '/dashboard-seeker')}
          >
            🔍 Service Seeker
          </Button>

          <Button
            w="full"
            bg="#3a3f5e"
            color="white"
            _hover={{ bg: '#4a4f6e' }}
            py={6}
            borderRadius="full"
            fontWeight="bold"
            fontSize="lg"
            onClick={() => handleRoleSelect('admin', '/admin')}
          >
            👨‍💼 Admin
          </Button>
        </VStack>

        <Text color="#888" fontSize="sm" mt={8}>
          You can change your role anytime in settings
        </Text>
      </VStack>
    </Box>
  )
}

