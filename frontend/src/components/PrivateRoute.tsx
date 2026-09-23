import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.tsx'

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const auth = useAuth()
  if (!auth.isAuthenticated) return <Navigate to="/login" replace />
  return children
}
