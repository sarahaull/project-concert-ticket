// lib/events.js
const STORAGE_KEY = 'events_data';

const defaultEvents = [
  {
    id: 1,
    name: 'Coldplay - Music of The Spheres',
    category: 'Konser',
    date: '2026-10-15',
    location: 'Gelora Bung Karno, Jakarta',
    price: 1500000,
    sold: 4860,
    capacity: 5000,
    status: 'Aktif',
  },
  {
    id: 2,
    name: 'BLACKPINK - Born Pink World Tour',
    category: 'Konser',
    date: '2026-11-20',
    location: 'ICE BSD, Tangerang',
    price: 2200000,
    sold: 3945,
    capacity: 4000,
    status: 'Aktif',
  },
  // ... tambahkan data lain sesuai kebutuhan
];

const loadEvents = () => {
  if (typeof window === 'undefined') return defaultEvents;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultEvents;
    }
  }
  return defaultEvents;
};

const saveEvents = (events) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }
};

export const getEvents = () => loadEvents();

export const getEventById = (id) => {
  const events = loadEvents();
  return events.find((e) => e.id === parseInt(id)) || null;
};

export const createEvent = (eventData) => {
  const events = loadEvents();
  const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
  const newEvent = {
    ...eventData,
    id: newId,
    sold: 0,
    price: Number(eventData.price),
    capacity: Number(eventData.capacity),
  };
  events.push(newEvent);
  saveEvents(events);
  return newEvent;
};

export const updateEvent = (id, updatedData) => {
  const events = loadEvents();
  const index = events.findIndex((e) => e.id === parseInt(id));
  if (index === -1) return null;
  const updatedEvent = {
    ...events[index],
    ...updatedData,
    price: Number(updatedData.price),
    capacity: Number(updatedData.capacity),
  };
  events[index] = updatedEvent;
  saveEvents(events);
  return updatedEvent;
};

export const deleteEvent = (id) => {
  const events = loadEvents();
  const filtered = events.filter((e) => e.id !== parseInt(id));
  saveEvents(filtered);
  return filtered;
};