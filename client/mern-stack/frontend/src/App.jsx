import { Routes, Route } from 'react-router-dom'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ResetPassword from './pages/auth/ResetPassword'
import ServiceSeekerDashboard from './pages/dashboards/ServiceSeekerDashboard'
import ServiceProviderDashboard from './pages/dashboards/ServiceProviderDashboard'
import Profile from './pages/Profile'
import Messages from './pages/Messages'
import CreateJob from './pages/CreateJob'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import AdminSettings from './pages/admin/AdminSettings' 
import ReportsView from './pages/admin/ReportsView'
import UserManagement from './pages/admin/UserManagement'
import ContentManagement from './pages/admin/ContentManagement'
import SupportTickets from './pages/admin/SupportTickets'


function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard-seeker" element={<ServiceSeekerDashboard />} />
        <Route path="/dashboard-provider" element={<ServiceProviderDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/create-job" element={<CreateJob />} />

        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="users" element={<UserManagement />} />
          <Route path="reports" element={<ReportsView />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="content" element={<ContentManagement />} />
          <Route path="support" element={<SupportTickets />} />
        </Route>
      </Routes>
    </ChakraProvider>
  )
}

export default App