export const initialUsers = [
  {
    id: 1,
    username: 'aisyahputri',
    name: 'Aisyah Putri',
    email: 'aisyahp@gmail.com',
    phone: '081234567890',
    role: 'Super Admin',
    status: 'Aktif',
    joinDate: '2026-01-15',
    birthDate: '2000-04-12',
    gender: 'Perempuan',
    address: 'Jl. Merdeka No. 10',
    city: 'Jakarta',
    postalCode: '10110',
    avatar: 'https://i.pravatar.cc/150?img=1',
    emailVerified: true,
    eventsAttended: 12,
    totalTickets: 18,
    totalSpent: 3450000,
    lastLogin: '04 Sep 2026, 19:42',
  },
  {
    id: 2,
    username: 'alifmuhammad',
    name: 'Muhammad Alif',
    email: 'alif.muhammad@gmail.com',
    phone: '081298765432',
    role: 'Admin',
    status: 'Aktif',
    joinDate: '2026-02-20',
    birthDate: '1999-08-21',
    gender: 'Laki-laki',
    address: 'Jl. Sudirman No. 22',
    city: 'Jakarta',
    postalCode: '10210',
    avatar: 'https://i.pravatar.cc/150?img=2',
    emailVerified: true,
    eventsAttended: 8,
    totalTickets: 11,
    totalSpent: 2100000,
    lastLogin: '04 Sep 2026, 18:30',
  },
  {
    id: 3,
    username: 'jonathanlee',
    name: 'Jonathan Lee',
    email: 'jonathanlee@gmail.com',
    phone: '081356789012',
    role: 'User',
    status: 'Aktif',
    joinDate: '2026-03-10',
    birthDate: '2002-02-17',
    gender: 'Laki-laki',
    address: 'Jl. Kemang Raya No. 8',
    city: 'Jakarta',
    postalCode: '12730',
    avatar: 'https://i.pravatar.cc/150?img=3',
    emailVerified: true,
    eventsAttended: 5,
    totalTickets: 7,
    totalSpent: 850000,
    lastLogin: '03 Sep 2026, 21:12',
  },
  {
    id: 4,
    username: 'nadiarahma',
    name: 'Nadia Rahma',
    email: 'nadirahma@gmail.com',
    phone: '081345678901',
    role: 'User',
    status: 'Tidak Aktif',
    joinDate: '2026-04-05',
    birthDate: '2001-11-03',
    gender: 'Perempuan',
    address: 'Jl. Gatot Subroto No. 4',
    city: 'Bandung',
    postalCode: '40111',
    avatar: 'https://i.pravatar.cc/150?img=4',
    emailVerified: false,
    eventsAttended: 3,
    totalTickets: 4,
    totalSpent: 450000,
    lastLogin: '20 Aug 2026, 13:15',
  },
  {
    id: 5,
    username: 'davidsetiawan',
    name: 'David Setiawan',
    email: 'davidsetiawan@gmail.com',
    phone: '081367890123',
    role: 'Organizer',
    status: 'Aktif',
    joinDate: '2026-05-12',
    birthDate: '1998-06-15',
    gender: 'Laki-laki',
    address: 'Jl. Diponegoro No. 18',
    city: 'Surabaya',
    postalCode: '60241',
    avatar: 'https://i.pravatar.cc/150?img=5',
    emailVerified: true,
    eventsAttended: 0,
    totalTickets: 0,
    totalSpent: 0,
    lastLogin: '04 Sep 2026, 17:25',
  },
  {
    id: 6,
    username: 'sarahnurbiqis',
    name: 'Sarah NurBiqis',
    email: 'sarah.nb@ticketverse.com',
    phone: '081378901234',
    role: 'Super Admin',
    status: 'Aktif',
    joinDate: '2026-01-01',
    birthDate: '1999-01-20',
    gender: 'Perempuan',
    address: 'Jl. Thamrin No. 5',
    city: 'Jakarta',
    postalCode: '10350',
    avatar: 'https://i.pravatar.cc/150?img=6',
    emailVerified: true,
    eventsAttended: 25,
    totalTickets: 42,
    totalSpent: 12500000,
    lastLogin: '04 Sep 2026, 20:10',
  },
  {
    id: 7,
    username: 'rizkyfebrian',
    name: 'Rizky Febrian',
    email: 'rizkyfebrian@gmail.com',
    phone: '081389012345',
    role: 'User',
    status: 'Aktif',
    joinDate: '2026-06-20',
    birthDate: '2003-09-12',
    gender: 'Laki-laki',
    address: 'Jl. Asia Afrika No. 11',
    city: 'Bandung',
    postalCode: '40112',
    avatar: 'https://i.pravatar.cc/150?img=7',
    emailVerified: true,
    eventsAttended: 2,
    totalTickets: 3,
    totalSpent: 300000,
    lastLogin: '02 Sep 2026, 16:20',
  },
  {
    id: 8,
    username: 'mayasari',
    name: 'Maya Sari',
    email: 'mayasari@gmail.com',
    phone: '081390123456',
    role: 'Organizer',
    status: 'Tidak Aktif',
    joinDate: '2026-04-18',
    birthDate: '1997-12-09',
    gender: 'Perempuan',
    address: 'Jl. Malioboro No. 30',
    city: 'Yogyakarta',
    postalCode: '55271',
    avatar: 'https://i.pravatar.cc/150?img=8',
    emailVerified: true,
    eventsAttended: 0,
    totalTickets: 0,
    totalSpent: 0,
    lastLogin: '28 Aug 2026, 11:05',
  },
];

const STORAGE_KEY = 'ticketverse_users';

export function getUsers() {
  if (typeof window === 'undefined') {
    return initialUsers;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(initialUsers)
      );

      return initialUsers;
    }

    return JSON.parse(stored);
  } catch {
    return initialUsers;
  }
}

export function saveUsers(users) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(users)
    );
  }
}

export function getUserById(id) {
  const users = getUsers();

  return users.find(
    (user) => String(user.id) === String(id)
  );
}

export function createUser(userData) {
  const users = getUsers();

  const newId =
    users.length > 0
      ? Math.max(...users.map((user) => Number(user.id))) + 1
      : 1;

  const newUser = {
    ...userData,
    id: newId,
    joinDate: new Date()
      .toISOString()
      .split('T')[0],
    eventsAttended: 0,
    totalTickets: 0,
    totalSpent: 0,
    lastLogin: '-',
    avatar:
      userData.avatar ||
      `https://i.pravatar.cc/150?img=${newId}`,
  };

  const updatedUsers = [...users, newUser];

  saveUsers(updatedUsers);

  return newUser;
}

export function updateUser(id, userData) {
  const users = getUsers();

  const updatedUsers = users.map((user) =>
    String(user.id) === String(id)
      ? {
          ...user,
          ...userData,
          id: user.id,
        }
      : user
  );

  saveUsers(updatedUsers);

  return updatedUsers.find(
    (user) => String(user.id) === String(id)
  );
}

export function deleteUser(id) {
  const users = getUsers();

  const updatedUsers = users.filter(
    (user) => String(user.id) !== String(id)
  );

  saveUsers(updatedUsers);

  return updatedUsers;
}