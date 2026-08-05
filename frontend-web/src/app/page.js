'use client';

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Concerts from '@/components/Concerts';
import Testimonials from '@/components/Testimonials';
import Stats from '@/components/Stats';
import HowToBook from "@/components/HowToBook";
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <Concerts />
      <Features />
      <Testimonials />
      <HowToBook />
      <CTA />
      <Footer />
    </main>
  );
}