'use client';

import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Concerts from '@/components/Concerts';
import Testimonials from '@/components/Testimonials';
import Stats from '@/components/Stats';
import HowToBook from "@/components/HowToBook";
import LandingPage from '@/components/LandingPage';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <AuthGuard fallback={() => <LandingPage />}>
      {({ user }) => (
        <main className="min-h-screen bg-[#0a0e1a] text-white">
          <Navbar user={user} />
          <Hero />
          <Stats />
          <Concerts />
          <Features />
          <Testimonials />
          <HowToBook />
          <CTA />
          <Footer />
        </main>
      )}
    </AuthGuard>
  );
}