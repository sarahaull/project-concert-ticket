// app/(user)/dashboard/layout.js
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function Layout({ children }) {
  // Ambil user dari session/cookies nanti, sekarang dummy
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://picsum.photos/seed/john/200/200',
  };

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}