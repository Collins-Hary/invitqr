import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/login/Login'
import Register from './pages/register/Register'
import Dashboard from './pages/dashboard/Dashboard'
import LandingPage from './pages/landing/LandingPage'
import PrivateRoute from './components/PrivateRoute'
import ScannerPage from './pages/scanner/ScannerPage'
import EventPage from './pages/dashboard/EventPage'
import InvitePage from './invite/InvitePage'

function App() {
  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/dashboard' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path='/my-invites' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path='/events' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path='/events/new' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path='/events/:eventId' element={<PrivateRoute><EventPage /></PrivateRoute>} />
      <Route path='/guests' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path='/stats' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path='/settings' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path='/scanner' element={<ScannerPage />} />
      <Route path='/invite/:qrToken' element={<InvitePage />} />
      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  )
}

export default App
