// app/(user)/dashboard/page.js
import { getDashboardStats, getUpcomingEvents, getUserProfile } from '@/lib/api';
import { formatRupiah, formatDate } from '@/lib/format';

export default async function DashboardPage() {
  const userId = 1; 
  
  const stats = await getDashboardStats(userId);
  const events = await getUpcomingEvents(userId);
  const user = await getUserProfile(userId);
  
  
}