import { Routes, Route } from 'react-router-dom'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ResetPassword from './pages/auth/ResetPassword'
import RoleSelection from './pages/RoleSelection'
import ServiceSeekerDashboard from './pages/dashboards/ServiceSeekerDashboard'
import ServiceProviderDashboard from './pages/dashboards/ServiceProviderDashboard'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import AdminDashboard from './pages/dashboards/AdminDashboard'

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/dashboard-seeker" element={<ServiceSeekerDashboard />} />
        <Route path="/dashboard-provider" element={<ServiceProviderDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </ChakraProvider>
  )
}

export default App
