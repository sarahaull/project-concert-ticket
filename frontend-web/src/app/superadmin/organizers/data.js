// lib/organizers.js
const STORAGE_KEY = 'organizers_data';

const defaultOrganizers = [
  {
    id: 1,
    name: 'PT Eventnesia',
    email: 'info@eventnesia.com',
    phone: '021-555-1234',
    company: 'Eventnesia',
    address: 'Jl. Sudirman No. 45, Jakarta',
    city: 'Jakarta',
    status: 'Aktif',
    verified: true,
    joinDate: '2025-11-01',
    totalEvents: 12,
    totalTicketsSold: 45678,
  },
  {
    id: 2,
    name: 'Harmoni Production',
    email: 'harmoni@produksi.com',
    phone: '021-555-5678',
    company: 'Harmoni Production',
    address: 'Jl. Gatot Subroto No. 12, Bandung',
    city: 'Bandung',
    status: 'Aktif',
    verified: true,
    joinDate: '2026-02-14',
    totalEvents: 8,
    totalTicketsSold: 23450,
  },
  {
    id: 3,
    name: 'Citra Kreasi',
    email: 'citra@kreasi.co.id',
    phone: '0812-3456-7890',
    company: 'Citra Kreasi',
    address: 'Jl. Merdeka No. 8, Yogyakarta',
    city: 'Yogyakarta',
    status: 'Tidak Aktif',
    verified: false,
    joinDate: '2026-03-20',
    totalEvents: 3,
    totalTicketsSold: 5678,
  },
];

const load = () => {
  if (typeof window === 'undefined') return defaultOrganizers;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultOrganizers;
    }
  }
  return defaultOrganizers;
};

const save = (data) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const getOrganizers = () => load();

export const getOrganizerById = (id) => {
  const items = load();
  return items.find((item) => item.id === parseInt(id)) || null;
};

export const createOrganizer = (data) => {
  const items = load();
  const newId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
  const newItem = {
    ...data,
    id: newId,
    totalEvents: 0,
    totalTicketsSold: 0,
  };
  items.push(newItem);
  save(items);
  return newItem;
};

export const updateOrganizer = (id, data) => {
  const items = load();
  const index = items.findIndex((i) => i.id === parseInt(id));
  if (index === -1) return null;
  items[index] = { ...items[index], ...data };
  save(items);
  return items[index];
};

export const deleteOrganizer = (id) => {
  const items = load().filter((i) => i.id !== parseInt(id));
  save(items);
  return items;
};

export const toggleOrganizerStatus = (id) => {
  const items = load();
  const index = items.findIndex((i) => i.id === parseInt(id));
  if (index === -1) return null;
  const newStatus = items[index].status === 'Aktif' ? 'Tidak Aktif' : 'Aktif';
  items[index].status = newStatus;
  save(items);
  return items[index];
};