import api from './api'

export interface AuthResponse {
  token: string
  user: any
}

export async function register(payload: { name: string; email: string; password: string }) {
  const res = await api.post('/auth/register', payload, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  return res.data as AuthResponse
}

export async function login(payload: { email: string; password: string }) {
  const res = await api.post('/auth/login', payload, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  return res.data as AuthResponse
}

export interface EventPayload {
  name: string
  date: string
  location: string
  max_guests: number
}

export async function listEvents() {
  const res = await api.get('/events')
  return res.data
}

export async function createEvent(payload: EventPayload) {
  const res = await api.post('/events', payload)
  return res.data
}

export async function getEvent(eventId: string) {
  const res = await api.get(`/events/${eventId}`)
  return res.data
}

export async function updateEvent(eventId: string, payload: Partial<EventPayload>) {
  const res = await api.patch(`/events/${eventId}`, payload)
  return res.data
}

export async function deleteEvent(eventId: string) {
  const res = await api.delete(`/events/${eventId}`)
  return res.data
}

export interface GuestPayload {
  name: string
  phone?: string
  email?: string
}

export async function listGuests(eventId: string) {
  const res = await api.get(`/events/${eventId}/guests`)
  return res.data
}

export async function createGuest(eventId: string, payload: GuestPayload) {
  const res = await api.post(`/events/${eventId}/guests`, payload)
  return res.data
}

export async function deleteGuest(eventId: string, guestId: string) {
  const res = await api.delete(`/events/${eventId}/guests/${guestId}`)
  return res.data
}
