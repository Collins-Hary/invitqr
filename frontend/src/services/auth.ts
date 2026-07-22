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

export async function getEvent(eventId: string, config?: any) {
  const res = await api.get(`/events/${eventId}`, config)
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

// Table management
export interface TablePayload {
  name: string
  capacity: number
}

export async function listTables(eventId: string) {
  const res = await api.get(`/events/${eventId}/tables`)
  return res.data
}

export async function createTable(eventId: string, payload: TablePayload) {
  const res = await api.post(`/events/${eventId}/tables`, payload)
  return res.data
}

export async function updateTable(eventId: string, tableId: string, payload: Partial<TablePayload>) {
  const res = await api.patch(`/events/${eventId}/tables/${tableId}`, payload)
  return res.data
}

export async function deleteTable(eventId: string, tableId: string) {
  const res = await api.delete(`/events/${eventId}/tables/${tableId}`)
  return res.data
}

export async function assignGuestToTable(eventId: string, guestId: string, tableId: string | null) {
  const res = await api.patch(`/events/${eventId}/guests/${guestId}/assign-table`, { table_id: tableId })
  return res.data
}

// ─── Invite (Email) ──────────────────────────────────────────────────────────

export async function sendInvite(eventId: string, guestId: string) {
  const res = await api.post(`/events/${eventId}/guests/${guestId}/send-invite`)
  return res.data
}

export async function sendAllInvites(eventId: string) {
  const res = await api.post(`/events/${eventId}/send-all-invites`)
  return res.data
}

export async function getGuest(eventId: string, guestId: string) {
  const res = await api.get(`/events/${eventId}/guests/${guestId}`)
  return res.data
}
