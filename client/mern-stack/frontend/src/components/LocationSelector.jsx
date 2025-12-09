import { useState, useMemo, useEffect } from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { GoogleMap, Marker } from '@react-google-maps/api';
import {
  Box,
  Input,
  Text,
  VStack,
  Spinner,
  HStack
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { API_URL } from '../config/api.js';

// --- CUSTOM MAP STYLE (Dark Mode to match ComConnect) ---
const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1a1f3a" }] }, // Match card bg
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d97baa" }], // Pink text for cities
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0a0e27" }], // Match app background
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const mapContainerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '8px',
  border: '1px solid #3a4456'
};

export default function LocationSelector({ onLocationSave }) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null); // { lat, lng }

  // Google Places Hook
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    debounce: 300,
  });

  // Initial load: Try to center map on something relevant? 
  // For now, default to center of US or 0,0 until user types.
  const defaultCenter = useMemo(() => ({ lat: 37.0902, lng: -95.7129 }), []);

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      setIsSaving(true);
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      const formattedAddress = results[0].formatted_address;

      // Update local map view immediately
      setSelectedLocation({ lat, lng });

      await updateBackendLocation(lat, lng, formattedAddress);
    } catch (error) {
      console.error("Error: ", error);
      toast.error("Error finding location");
    } finally {
      setIsSaving(false);
    }
  };

  const updateBackendLocation = async (lat, lng, address) => {
    try {
      const token = localStorage.getItem('token'); 
      const response = await fetch(`${API_URL}/users/profile/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ coordinates: [lng, lat], address: address })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Location updated!`);
        if (onLocationSave) onLocationSave(data.user);
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      toast.error("Server error");
    }
  };

  return (
    <Box position="relative" w="full">
      <VStack align="start" spacing={4}>
        
        {/* Search Box */}
        <Box w="full" position="relative">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={!ready || isSaving}
            placeholder={isSaving ? "Saving location..." : "Search city to pin on map"}
            
            bg="#1a1f3a"
            border="1px solid #3a4456"
            borderRadius="md"
            color="white"
            _placeholder={{ color: '#666' }}
            _focus={{ borderColor: '#d97baa', outline: 'none' }}
            _hover={{ borderColor: '#d97baa' }}
            py={3}
            fontSize="sm"
          />
          
          {isSaving && (
            <Spinner size="sm" position="absolute" right={3} top={3} color="#d97baa" />
          )}

          {/* Dropdown Suggestions */}
          {status === "OK" && (
            <Box 
              position="absolute" 
              zIndex={1000} 
              bg="#1a1f3a" 
              w="full" 
              boxShadow="dark-lg" 
              borderRadius="md" 
              mt={1}
              border="1px solid #d97baa"
              maxH="200px"
              overflowY="auto"
            >
              {data.map(({ place_id, description }) => (
                <Box
                  key={place_id}
                  p={3}
                  cursor="pointer"
                  color="white"
                  fontSize="sm"
                  _hover={{ bg: "#2a2f4a" }}
                  borderBottom="1px solid #3a4456"
                  onClick={() => handleSelect(description)}
                >
                  <Text>{description}</Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* THE MAP VISUALIZATION */}
        <Box w="full" h="250px" borderRadius="lg" overflow="hidden" border="1px solid #3a4456">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={selectedLocation || defaultCenter}
              zoom={selectedLocation ? 13 : 3} // Zoom in if selected, zoom out if default
              options={{
                disableDefaultUI: true, // Hides the yellow street guy and satellite buttons for a clean look
                styles: darkMapStyle,   // Applies the ComConnect Dark Theme
              }}
            >
              {selectedLocation && (
                <Marker position={selectedLocation} />
              )}
            </GoogleMap>
        </Box>

      </VStack>
    </Box>
  );
}