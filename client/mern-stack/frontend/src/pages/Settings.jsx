import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRole } from '../components/RoleContext'
import { Box, HStack, VStack, Text, Button, Heading, Input } from '@chakra-ui/react'
import { toast } from 'react-toastify'
import { getToken } from '../utils/tokenUtils'
import { jwtDecode } from 'jwt-decode'
import comconnectLogo from "../logo/COMCONNECT_Logo.png"

import { API_URL } from '../config/api.js';

export default function Settings() {
  const navigate = useNavigate()
  const { role } = useRole()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Notification preferences state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [jobAlerts, setJobAlerts] = useState(true)
  const [messageNotifications, setMessageNotifications] = useState(true)

  // Privacy settings state
  const [profileVisibility, setProfileVisibility] = useState('public')
  const [showEmail, setShowEmail] = useState(false)
  const [showPhone, setShowPhone] = useState(false)

  // Account deletion
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = getToken()
      if (!token) {
        navigate('/login')
        return
      }

      const response = await fetch(`${API_URL}/users/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.notificationPreferences) {
          setEmailNotifications(data.notificationPreferences.emailNotifications ?? true)
          setJobAlerts(data.notificationPreferences.jobAlerts ?? true)
          setMessageNotifications(data.notificationPreferences.messageNotifications ?? true)
        }
        if (data.privacySettings) {
          setProfileVisibility(data.privacySettings.profileVisibility || 'public')
          setShowEmail(data.privacySettings.showEmail ?? false)
          setShowPhone(data.privacySettings.showPhone ?? false)
        }
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    }
  }

  const getDashboardPath = () => {
    const token = getToken()
    if (token) {
      try {
        const decodedUser = jwtDecode(token)
        const currentRole = decodedUser.role
        switch(currentRole) {
          case 'seeker': return '/dashboard-seeker'
          case 'admin': return '/admin'
          default: return '/dashboard-provider'
        }
      } catch (e) {
        return '/login'
      }
    }
    return '/login'
  }

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields')
      return
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/users/settings/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Password changed successfully!')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to change password')
      }
    } catch (err) {
      setError('Connection error')
      console.error('Change password error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/users/settings/notifications`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          emailNotifications,
          jobAlerts,
          messageNotifications
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Notification preferences saved!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to save notification preferences')
      }
    } catch (err) {
      setError('Connection error')
      console.error('Save notifications error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePrivacySave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/users/settings/privacy`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profileVisibility,
          showEmail,
          showPhone
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('Privacy settings saved!')
        setTimeout(() => setSuccess(''), 3000)
        // Update local state with the saved values to keep UI in sync
        if (data.privacySettings) {
          setProfileVisibility(data.privacySettings.profileVisibility || 'public')
          setShowEmail(data.privacySettings.showEmail ?? false)
          setShowPhone(data.privacySettings.showPhone ?? false)
        }
      } else {
        setError(data.error || 'Failed to save privacy settings')
      }
    } catch (err) {
      setError('Connection error')
      console.error('Save privacy error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError('Please enter your password to confirm account deletion')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = getToken()
      const response = await fetch(`${API_URL}/users/account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          password: deletePassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Account deleted successfully')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        setError(data.error || 'Failed to delete account')
        setIsDeleteModalOpen(false)
      }
    } catch (err) {
      setError('Connection error')
      console.error('Delete account error:', err)
      setIsDeleteModalOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="#0a0e27">
      {/* Header */}
      <Box bg="white" borderBottom="1px solid #1a1f3a" py={4} px={8}>
        <HStack justify="space-between" align="center">
          <Box
            as="img"
            src={comconnectLogo}
            alt="ComConnect"
            h="80px"
            w="auto"
            maxW="100%"
            cursor="pointer"
            onClick={() => navigate(getDashboardPath())}
            style={{ objectFit: 'contain' }}
          />
          <HStack spacing={6}>
            <Text color="#d97baa" fontSize="md" fontWeight="bold" cursor="pointer" onClick={() => navigate('/profile')}>
              Profile
            </Text>
            <Text color="#d97baa" fontSize="md" fontWeight="bold" cursor="pointer" onClick={() => navigate('/settings')}>
              Settings
            </Text>
            <Text color="black" fontSize="md" cursor="pointer" onClick={() => navigate('/messages')}>
              Messages
            </Text>
          </HStack>
        </HStack>
      </Box>

      {/* Main Content */}
      <Box py={8} px={8} maxW="800px" mx="auto">
        <VStack align="start" spacing={8} w="full">
          <VStack align="start" spacing={2}>
            <Heading as="h1" size="2xl" color="white">
              Settings
            </Heading>
            <Text color="#aaa" fontSize="md">
              Manage your account settings and preferences
            </Text>
          </VStack>

          {error && (
            <Box bg="red.900" color="red.200" p={3} borderRadius="md" w="full">
              <Text fontSize="sm">{error}</Text>
            </Box>
          )}

          {success && (
            <Box bg="green.900" color="green.200" p={3} borderRadius="md" w="full">
              <Text fontSize="sm">{success}</Text>
            </Box>
          )}

          {/* Password Change Section */}
          <Box w="full" bg="#1a1f3a" p={6} borderRadius="md" border="1px solid #3a4456">
            <VStack align="start" spacing={4} w="full">
              <Heading as="h2" size="lg" color="white">
                Change Password
              </Heading>
              <VStack align="start" w="full" spacing={3}>
                <VStack align="start" w="full" spacing={2}>
                  <Text color="#999" fontSize="sm" fontWeight="bold">Current Password</Text>
                  <Input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    bg="#0a0e27"
                    border="1px solid #3a4456"
                    borderRadius="md"
                    color="white"
                    _placeholder={{ color: '#666' }}
                    _focus={{ borderColor: '#d97baa' }}
                  />
                </VStack>
                <VStack align="start" w="full" spacing={2}>
                  <Text color="#999" fontSize="sm" fontWeight="bold">New Password</Text>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    bg="#0a0e27"
                    border="1px solid #3a4456"
                    borderRadius="md"
                    color="white"
                    _placeholder={{ color: '#666' }}
                    _focus={{ borderColor: '#d97baa' }}
                  />
                </VStack>
                <VStack align="start" w="full" spacing={2}>
                  <Text color="#999" fontSize="sm" fontWeight="bold">Confirm New Password</Text>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    bg="#0a0e27"
                    border="1px solid #3a4456"
                    borderRadius="md"
                    color="white"
                    _placeholder={{ color: '#666' }}
                    _focus={{ borderColor: '#d97baa' }}
                  />
                </VStack>
                <Button
                  bg="#d97baa"
                  color="white"
                  _hover={{ bg: '#c55a8f' }}
                  onClick={handlePasswordChange}
                  isDisabled={loading}
                  isLoading={loading}
                >
                  Change Password
                </Button>
              </VStack>
            </VStack>
          </Box>

          {/* Notification Preferences Section */}
          <Box w="full" bg="#1a1f3a" p={6} borderRadius="md" border="1px solid #3a4456">
            <VStack align="start" spacing={4} w="full">
              <Heading as="h2" size="lg" color="white">
                Notification Preferences
              </Heading>
              <VStack align="start" w="full" spacing={4}>
                <HStack justify="space-between" w="full">
                  <VStack align="start" spacing={1}>
                    <Text color="white" fontSize="md">Email Notifications</Text>
                    <Text color="#aaa" fontSize="sm">Receive email updates about your account</Text>
                  </VStack>
                  <Box
                    as="button"
                    type="button"
                    w="44px"
                    h="24px"
                    bg={emailNotifications ? '#d97baa' : '#3a4456'}
                    borderRadius="full"
                    position="relative"
                    cursor="pointer"
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    transition="background-color 0.2s"
                    _hover={{ opacity: 0.8 }}
                  >
                    <Box
                      position="absolute"
                      top="2px"
                      left={emailNotifications ? '22px' : '2px'}
                      w="20px"
                      h="20px"
                      bg="white"
                      borderRadius="full"
                      transition="left 0.2s"
                    />
                  </Box>
                </HStack>
                <HStack justify="space-between" w="full">
                  <VStack align="start" spacing={1}>
                    <Text color="white" fontSize="md">Job Alerts</Text>
                    <Text color="#aaa" fontSize="sm">Get notified about new job opportunities</Text>
                  </VStack>
                  <Box
                    as="button"
                    type="button"
                    w="44px"
                    h="24px"
                    bg={jobAlerts ? '#d97baa' : '#3a4456'}
                    borderRadius="full"
                    position="relative"
                    cursor="pointer"
                    onClick={() => setJobAlerts(!jobAlerts)}
                    transition="background-color 0.2s"
                    _hover={{ opacity: 0.8 }}
                  >
                    <Box
                      position="absolute"
                      top="2px"
                      left={jobAlerts ? '22px' : '2px'}
                      w="20px"
                      h="20px"
                      bg="white"
                      borderRadius="full"
                      transition="left 0.2s"
                    />
                  </Box>
                </HStack>
                <HStack justify="space-between" w="full">
                  <VStack align="start" spacing={1}>
                    <Text color="white" fontSize="md">Message Notifications</Text>
                    <Text color="#aaa" fontSize="sm">Receive notifications for new messages</Text>
                  </VStack>
                  <Box
                    as="button"
                    type="button"
                    w="44px"
                    h="24px"
                    bg={messageNotifications ? '#d97baa' : '#3a4456'}
                    borderRadius="full"
                    position="relative"
                    cursor="pointer"
                    onClick={() => setMessageNotifications(!messageNotifications)}
                    transition="background-color 0.2s"
                    _hover={{ opacity: 0.8 }}
                  >
                    <Box
                      position="absolute"
                      top="2px"
                      left={messageNotifications ? '22px' : '2px'}
                      w="20px"
                      h="20px"
                      bg="white"
                      borderRadius="full"
                      transition="left 0.2s"
                    />
                  </Box>
                </HStack>
                <Button
                  bg="#d97baa"
                  color="white"
                  _hover={{ bg: '#c55a8f' }}
                  onClick={handleNotificationSave}
                  isDisabled={loading}
                  isLoading={loading}
                >
                  Save Notification Preferences
                </Button>
              </VStack>
            </VStack>
          </Box>

          {/* Privacy Settings Section */}
          <Box w="full" bg="#1a1f3a" p={6} borderRadius="md" border="1px solid #3a4456">
            <VStack align="start" spacing={4} w="full">
              <Heading as="h2" size="lg" color="white">
                Privacy Settings
              </Heading>
              <VStack align="start" w="full" spacing={4}>
                <VStack align="start" w="full" spacing={2}>
                  <Text color="white" fontSize="md">Profile Visibility</Text>
                  <HStack spacing={4}>
                    <Button
                      size="sm"
                      bg={profileVisibility === 'public' ? '#d97baa' : 'transparent'}
                      color={profileVisibility === 'public' ? 'white' : '#d97baa'}
                      border="1px solid #d97baa"
                      _hover={{ bg: profileVisibility === 'public' ? '#c55a8f' : 'rgba(217, 123, 170, 0.1)' }}
                      onClick={() => setProfileVisibility('public')}
                    >
                      Public
                    </Button>
                    <Button
                      size="sm"
                      bg={profileVisibility === 'private' ? '#d97baa' : 'transparent'}
                      color={profileVisibility === 'private' ? 'white' : '#d97baa'}
                      border="1px solid #d97baa"
                      _hover={{ bg: profileVisibility === 'private' ? '#c55a8f' : 'rgba(217, 123, 170, 0.1)' }}
                      onClick={() => setProfileVisibility('private')}
                    >
                      Private
                    </Button>
                  </HStack>
                </VStack>
                <HStack justify="space-between" w="full">
                  <VStack align="start" spacing={1}>
                    <Text color="white" fontSize="md">Show Email</Text>
                    <Text color="#aaa" fontSize="sm">Display your email on your profile</Text>
                  </VStack>
                  <Box
                    as="button"
                    type="button"
                    w="44px"
                    h="24px"
                    bg={showEmail ? '#d97baa' : '#3a4456'}
                    borderRadius="full"
                    position="relative"
                    cursor="pointer"
                    onClick={() => setShowEmail(!showEmail)}
                    transition="background-color 0.2s"
                    _hover={{ opacity: 0.8 }}
                  >
                    <Box
                      position="absolute"
                      top="2px"
                      left={showEmail ? '22px' : '2px'}
                      w="20px"
                      h="20px"
                      bg="white"
                      borderRadius="full"
                      transition="left 0.2s"
                    />
                  </Box>
                </HStack>
                <HStack justify="space-between" w="full">
                  <VStack align="start" spacing={1}>
                    <Text color="white" fontSize="md">Show Phone</Text>
                    <Text color="#aaa" fontSize="sm">Display your phone number on your profile</Text>
                  </VStack>
                  <Box
                    as="button"
                    type="button"
                    w="44px"
                    h="24px"
                    bg={showPhone ? '#d97baa' : '#3a4456'}
                    borderRadius="full"
                    position="relative"
                    cursor="pointer"
                    onClick={() => setShowPhone(!showPhone)}
                    transition="background-color 0.2s"
                    _hover={{ opacity: 0.8 }}
                  >
                    <Box
                      position="absolute"
                      top="2px"
                      left={showPhone ? '22px' : '2px'}
                      w="20px"
                      h="20px"
                      bg="white"
                      borderRadius="full"
                      transition="left 0.2s"
                    />
                  </Box>
                </HStack>
                <Button
                  bg="#d97baa"
                  color="white"
                  _hover={{ bg: '#c55a8f' }}
                  onClick={handlePrivacySave}
                  isDisabled={loading}
                  isLoading={loading}
                >
                  Save Privacy Settings
                </Button>
              </VStack>
            </VStack>
          </Box>

          {/* Account Management Section */}
          <Box w="full" bg="#1a1f3a" p={6} borderRadius="md" border="1px solid #dc3545">
            <VStack align="start" spacing={4} w="full">
              <Heading as="h2" size="lg" color="white">
                Account Management
              </Heading>
              <VStack align="start" w="full" spacing={4}>
                <Text color="#aaa" fontSize="sm">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </Text>
                <Button
                  bg="#dc3545"
                  color="white"
                  _hover={{ bg: '#c82333' }}
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  Delete Account
                </Button>
              </VStack>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          zIndex={2000}
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsDeleteModalOpen(false)
            }
          }}
        >
          {/* Overlay */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(0, 0, 0, 0.7)"
            style={{ backdropFilter: 'blur(4px)' }}
          />

          {/* Modal Content */}
          <Box
            position="relative"
            bg="#1a1f3a"
            color="white"
            borderRadius="lg"
            maxW="500px"
            w="90%"
            p={6}
            boxShadow="2xl"
            zIndex={2001}
            border="1px solid #3a4456"
          >
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between" align="center">
                <Heading as="h2" size="lg" color="white">Delete Account</Heading>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDeleteModalOpen(false)}
                  _hover={{ bg: 'rgba(255, 255, 255, 0.1)' }}
                  isDisabled={loading}
                >
                  ✕
                </Button>
              </HStack>

              <VStack align="start" spacing={4}>
                <Text color="#aaa">
                  Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.
                </Text>
                <VStack align="start" w="full" spacing={2}>
                  <Text color="white" fontSize="sm" fontWeight="bold">Enter your password to confirm:</Text>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    bg="#0a0e27"
                    border="1px solid #3a4456"
                    borderRadius="md"
                    color="white"
                    _placeholder={{ color: '#666' }}
                    _focus={{ borderColor: '#dc3545' }}
                  />
                </VStack>
              </VStack>

              <HStack spacing={3} justify="flex-end">
                <Button
                  onClick={() => setIsDeleteModalOpen(false)}
                  bg="transparent"
                  color="white"
                  border="1px solid #3a4456"
                  _hover={{ bg: '#3a4456' }}
                  isDisabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  bg="#dc3545"
                  color="white"
                  _hover={{ bg: '#c82333' }}
                  onClick={handleDeleteAccount}
                  isDisabled={loading}
                  isLoading={loading}
                >
                  Delete Account
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  )
}

