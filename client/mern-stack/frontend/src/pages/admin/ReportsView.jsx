import {
  Box,
  Heading,
  Text,
  VStack,
  SimpleGrid,
} from '@chakra-ui/react';
import { mockReportsData } from './mockData';

const StatCard = ({ title, value, helperText }) => (
  <Box p={5} bg="#2a2f4a" borderRadius="lg" w="full">
    <VStack align="start" spacing={1}>
      <Text fontSize="sm" color="gray.400">
        {title}
      </Text>
      <Heading as="h3" size="lg" color="white">
        {value}
      </Heading>
      {helperText && <Text fontSize="sm">{helperText}</Text>}
    </VStack>
  </Box>
);

export default function ReportsView() {
  const { keyMetrics, usersPerDay } = mockReportsData;

  const formattedRevenue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(keyMetrics.totalRevenue);

  return (
    <VStack align="start" spacing={8} w="full">
      <Box w="full">
        <Heading as="h3" size="lg" color="white" mb={4}>
          Key Metrics
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6}>
          <StatCard title="Total Revenue" value={formattedRevenue} />
          <StatCard title="Total Users" value={keyMetrics.totalUsers} />
          <StatCard title="Total Providers" value={keyMetrics.totalProviders} />
          <StatCard title="Total Transactions" value={keyMetrics.totalTransactions} />
        </SimpleGrid>
      </Box>

      <Box w="full">
        <Heading as="h3" size="lg" color="white" mb={4}>
          User Registrations (Last 7 Days)
        </Heading>

        <Box bg="#1a1f3a" p={6} borderRadius="lg" w="full" minH="300px">
          <Text color="gray.300">
            This is where a chart (e.g., from Recharts or Chart.js) would go,
            using the `usersPerDay` data.
          </Text>
        </Box>
      </Box>
    </VStack>
  );
}