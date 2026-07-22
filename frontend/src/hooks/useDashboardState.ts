import { useState } from 'react';

// Define interfaces for forms and entities for better type safety
interface EventFormState {
  name: string;
  date: string;
  location: string;
  max_guests: string;
}

interface GuestFormState {
  name: string;
  email: string;
  phone: string;
}

interface TableFormState {
  name: string;
  capacity: string;
}

export const useDashboardState = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'guests' | 'tables'>('events');
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);

  const [eventForm, setEventForm] = useState<EventFormState>({
    name: '',
    date: '',
    location: '',
    max_guests: '100',
  });

  const [guestForm, setGuestForm] = useState<GuestFormState>({
    name: '',
    email: '',
    phone: '',
  });

  const [tableForm, setTableForm] = useState<TableFormState>({
    name: '',
    capacity: '8',
  });

  const [editTableId, setEditTableId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sendingGuestId, setSendingGuestId] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const showSuccess = (message: string, duration: number = 3000) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), duration);
  };

  const showError = (message: string, duration: number = 5000) => {
    setError(message);
    setTimeout(() => setError(null), duration);
  };


  return {
    activeTab, setActiveTab,
    events, setEvents,
    selectedEventId, setSelectedEventId,
    selectedEvent, setSelectedEvent,
    guests, setGuests,
    tables, setTables,
    eventForm, setEventForm,
    guestForm, setGuestForm,
    tableForm, setTableForm,
    editTableId, setEditTableId,
    error, setError,
    success, setSuccess,
    loading, setLoading,
    sendingGuestId, setSendingGuestId,
    sendingAll, setSendingAll,
    clearMessages,
    showSuccess,
    showError,
  };
};