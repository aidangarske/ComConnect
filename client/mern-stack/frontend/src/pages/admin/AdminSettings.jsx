import { useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Input,
  Button,
  HStack,
  Text,
  Icon, 
} from '@chakra-ui/react';
import { mockSettingsData } from './mockData';

const CustomCheckbox = ({ id, isChecked, onChange, children }) => {
  return (
    <HStack
      as="label"
      htmlFor={id}
      spacing={4}
      cursor="pointer"
      w="full"
      p={4} 
      borderRadius="md" 
      bg="#2a2f4a"
      _hover={{ bg: '#3a3f5a' }} 
    >
      <Box
        w="20px"
        h="20px"
        border="2px solid"
        borderColor="#d97baa"
        borderRadius="md"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={isChecked ? '#d97baa' : 'transparent'}
        transition="all 0.2s"
      >
        {isChecked && (
          <Icon viewBox="0 0 14 11" color="white" w="12px" h="12px">
            <path
              fill="currentColor"
              d="M11.6.3c-.4-.4-1-.4-1.4 0L4.8 5.7 3.8 4.7c-.4-.4-1-.4-1.4 0-.4.4-.4 1 0 1.4l1.7 1.7c.4.4 1 .4 1.4 0L11.6 1.7c.4-.4.4-1 0-1.4z"
            />
          </Icon>
        )}
      </Box>
      <Text>{children}</Text>
      <input
        type="checkbox"
        id={id}
        checked={isChecked}
        onChange={onChange}
        style={{ display: 'none' }} 
      />
    </HStack>
  );
};


export default function AdminSettings() {
  const [siteName, setSiteName] = useState(mockSettingsData.siteName);
  const [maintenanceMode, setMaintenanceMode] = useState(
    mockSettingsData.maintenanceMode
  );
  const [commissionRate, setCommissionRate] = useState(
    mockSettingsData.commissionRate
  );
  const [registrations, setRegistrations] = useState(
    mockSettingsData.newRegistrations
  );

  const handleSaveChanges = () => {
    console.log('Saving settings:', { siteName, maintenanceMode, commissionRate, registrations });
    alert('Settings Saved!');
  };

  return (
    <Box bg="#1a1f3a" p={6} borderRadius="lg" w="full" maxW="xl">
      <VStack align="start" spacing={6}>
        <Heading as="h3" size="lg" color="white">
          Platform Settings
        </Heading>

        <VStack align="start" spacing={5} color="white" w="full">
          
          <Box w="full">
            <Text mb={2} fontWeight="bold" color="gray.300">Site Name</Text>
            <Input
              id="site-name"
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              bg="#0a0e27" 
              borderColor="gray.600"
            />
          </Box>

          <Box w="full">
            <Text mb={2} fontWeight="bold" color="gray.300">
              Commission Rate (e.g., 0.15 for 15%)
            </Text>
            <Input
              id="commission-rate"
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
              bg="#0a0e27"
              borderColor="gray.600"
            />
          </Box>

          <CustomCheckbox
            id="maintenance-mode"
            isChecked={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.checked)}
          >
            Enable Maintenance Mode
          </CustomCheckbox>

          <CustomCheckbox
            id="new-registrations"
            isChecked={registrations}
            onChange={(e) => setRegistrations(e.target.checked)}
          >
            Allow New User Registrations
          </CustomCheckbox>
        </VStack>

        <Button
          bg="#d97baa"
          color="white"
          _hover={{ bg: '#c55a8f' }}
          onClick={handleSaveChanges}
          pt={1} 
          size="lg" 
          mt={4} 
        >
          Save Settings
        </Button>
      </VStack>
    </Box>
  );
}