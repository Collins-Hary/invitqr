// User/Authentication types
export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

// Event types
export interface Event {
  id: string;
  user_id: string;
  name: string;
  date: string;
  location: string;
  max_guests: number;
  scanner_pin: string;
  created_at: string;
}

// Guest types
export interface Guest {
  id: string;
  event_id: string;
  table_id?: string;
  name: string;
  phone?: string;
  email?: string;
  qr_token: string;
  backup_code: string;
  checked_in: boolean;
  checked_in_at?: string;
  invite_sent: boolean;
  rsvp_status: 'pending' | 'confirmed' | 'declined';
}

// Table types
export interface Table {
  id: string;
  event_id: string;
  name: string;
  capacity: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Form types
export interface CreateEventForm {
  name: string;
  date: string;
  location: string;
  max_guests: number;
}

export interface CreateGuestForm {
  name: string;
  phone?: string;
  email?: string;
  table_id?: string;
}

export interface RSVPPayload {
  status: 'confirmed' | 'declined';
}

// Scanner types
export interface CheckInPayload {
  qr_token?: string;
  backup_code?: string;
  scanner_pin: string;
}

export interface CheckInResponse {
  success: boolean;
  status: 'success' | 'already_checked' | 'invalid';
  guest: Guest;
  message: string;
}

// Statistics types
export interface EventStats {
  total_guests: number;
  confirmed: number;
  checked_in: number;
  absent: number;
  pending: number;
  arrival_rate: number;
}
